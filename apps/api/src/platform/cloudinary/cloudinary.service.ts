import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName?.trim() && apiKey?.trim() && apiSecret?.trim()) {
      cloudinary.config({
        cloud_name: cloudName.trim(),
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary đã được cấu hình thành công.');
    } else {
      this.logger.warn('Chưa cấu hình CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET trong .env.');
    }
  }

  async uploadAvatar(file: Express.Multer.File, publicId: string): Promise<string> {
    if (!this.isConfigured) {
      throw new BadRequestException(
        'Hệ thống lưu trữ ảnh Cloudinary chưa được cấu hình. Vui lòng thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào file .env.',
      );
    }

    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh để tải lên.');
    }

    // Kiểm tra định dạng ảnh
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc WEBP.');
    }

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Kích thước ảnh tối đa là 5MB.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'commerce_os/avatars',
          public_id: `avatar_${publicId}`,
          overwrite: true,
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'webp' },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Lỗi upload Cloudinary:', error);
            return reject(new BadRequestException(`Lỗi upload ảnh lên Cloudinary: ${error.message}`));
          }
          if (!result) {
            return reject(new BadRequestException('Không nhận được phản hồi từ Cloudinary.'));
          }
          resolve(result.secure_url);
        },
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  async uploadProductImage(file: Express.Multer.File, shopSlug = 'general'): Promise<string> {
    if (!this.isConfigured) {
      throw new BadRequestException(
        'Hệ thống lưu trữ ảnh Cloudinary chưa được cấu hình. Vui lòng thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào file .env.',
      );
    }

    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh để tải lên.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc WEBP.');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Kích thước ảnh sản phẩm tối đa là 10MB.');
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `commerce_os/products/${shopSlug}`,
          public_id: `prod_${timestamp}_${randomSuffix}`,
          overwrite: false,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'webp' },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Lỗi upload ảnh sản phẩm Cloudinary:', error);
            return reject(new BadRequestException(`Lỗi upload ảnh lên Cloudinary: ${error.message}`));
          }
          if (!result) {
            return reject(new BadRequestException('Không nhận được phản hồi từ Cloudinary.'));
          }
          resolve(result.secure_url);
        },
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }
}
