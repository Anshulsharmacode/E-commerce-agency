import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getRuntimeConfig } from 'src/common/config/app-config';

type S3Stage = 'dev' | 'prod';

interface S3BucketConfig {
  bucket?: string;
  region?: string;
}

interface S3BucketsFileConfig {
  dev?: S3BucketConfig;
  prod?: S3BucketConfig;
}

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

const runtimeConfig = getRuntimeConfig();

@Injectable()
export class S3Service {
  private readonly stage = this.resolveStage();
  private readonly activeConfig = this.resolveActiveConfig();
  private readonly region = this.activeConfig.region;
  private readonly bucket = this.activeConfig.bucket;

  private s3 = new S3Client({
    region: this.region,
    // Avoid optional checksum headers in presigned PUT URLs for browser uploads.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            ...(process.env.AWS_SESSION_TOKEN
              ? { sessionToken: process.env.AWS_SESSION_TOKEN }
              : {}),
          }
        : undefined,
  });

  async getUploadUrl(fileType: string) {
    const normalizedFileType = fileType.trim().toLowerCase();
    if (!this.isSupportedImageType(normalizedFileType)) {
      throw new BadRequestException(
        'Only one image MIME type is allowed (example: image/png).',
      );
    }

    const key = `images/${Date.now()}.${this.getFileExtension(normalizedFileType)}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: normalizedFileType,
      // ACL: 'public-read',
    });

    let uploadUrl = '';
    try {
      uploadUrl = await getSignedUrl(this.s3, command, {
        expiresIn: 300,
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'CredentialsProviderError'
      ) {
        throw new InternalServerErrorException(
          'AWS credentials missing. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Backend/.env',
        );
      }
      throw error;
    }

    return {
      uploadUrl,
      key,
      viewUrl: await this.getImageUrl(key),
      bucket: this.bucket,
    };
  }

  async getImageUrl(key: string) {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      throw new BadRequestException('key is required');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: normalizedKey,
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await getSignedUrl(this.s3, command, {
        expiresIn: 3600,
      });
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'CredentialsProviderError'
      ) {
        throw new InternalServerErrorException(
          'AWS credentials missing. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Backend/.env',
        );
      }
      throw error;
    }
  }

  isSupportedImageType(fileType: string) {
    return SUPPORTED_IMAGE_MIME_TYPES.has(fileType.trim().toLowerCase());
  }

  private getFileExtension(fileType: string) {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/avif': 'avif',
    };

    if (mimeToExt[fileType]) return mimeToExt[fileType];

    const fallback = fileType.split('/')[1]?.toLowerCase();
    if (!fallback) return 'bin';
    return fallback.split('+')[0];
  }

  private resolveStage(): S3Stage {
    const explicitStage = process.env.S3_ENV?.trim().toLowerCase();
    if (explicitStage === 'dev' || explicitStage === 'prod') {
      return explicitStage;
    }
    return runtimeConfig.aws.s3Env;
  }

  private resolveActiveConfig() {
    const jsonConfig = this.loadS3ConfigFile();
    const jsonStageConfig = jsonConfig?.[this.stage];

    const envBucket =
      this.stage === 'prod'
        ? process.env.AWS_S3_BUCKET_PROD
        : process.env.AWS_S3_BUCKET_DEV;

    const bucket = jsonStageConfig?.bucket ?? envBucket ?? process.env.AWS_S3_BUCKET;
    if (!bucket) {
      throw new InternalServerErrorException(
        'S3 bucket not configured. Add config/s3-buckets.json or AWS_S3_BUCKET_DEV/AWS_S3_BUCKET_PROD.',
      );
    }

    const region = jsonStageConfig?.region ?? process.env.AWS_REGION ?? runtimeConfig.aws.region;
    if (!region) {
      throw new InternalServerErrorException(
        'AWS region not configured. Add region in config/s3-buckets.json or AWS_REGION.',
      );
    }

    return {
      bucket,
      region,
    };
  }

  private loadS3ConfigFile(): S3BucketsFileConfig | null {
    const configPath = join(process.cwd(), 'config', 's3-buckets.json');
    if (!existsSync(configPath)) {
      return null;
    }

    try {
      return JSON.parse(readFileSync(configPath, 'utf8')) as S3BucketsFileConfig;
    } catch {
      throw new InternalServerErrorException(
        `Invalid JSON in ${configPath}.`,
      );
    }
  }
}
