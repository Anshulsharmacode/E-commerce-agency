import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly region = process.env.AWS_REGION;
  private readonly bucket = process.env.AWS_S3_BUCKET;

  private s3 = new S3Client({
    region: this.region,
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
    const key = `images/${Date.now()}.${this.getFileExtension(fileType)}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: fileType,
      // ACL: 'public-read',
    });
    console.log('command', command);

    let uploadUrl = '';
    try {
      uploadUrl = await getSignedUrl(this.s3, command, {
        expiresIn: 60,
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
      publicUrl: this.getPublicUrl(key),
      viewUrl: await this.getImageUrl(key),
    };
  }

  async getImageUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
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

  private getPublicUrl(key: string) {
    const safeKey = key
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/');
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${safeKey}`;
  }
}
