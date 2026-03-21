import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: 'ap-south-1',
  });

  private bucket = 'ecom-agency';

  async getUploadUrl(fileType: string) {
    const key = `images/${Date.now()}.${fileType.split('/')[1]}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 60,
    });

    return {
      uploadUrl,
      key,
    };
  }

  async getImageUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await getSignedUrl(this.s3, command, {
      expiresIn: 3600,
    });
  }
}
