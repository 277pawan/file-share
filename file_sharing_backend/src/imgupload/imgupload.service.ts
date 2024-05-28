import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Upload, UploadDocument } from './imgupload.models';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class ImguploadService {
  constructor(@InjectModel(Upload.name) private uploadModel: Model<UploadDocument>) {}

  async saveFileInfo(userId: Types.ObjectId, fileName: string): Promise<Upload> {
    const existingUpload = await this.uploadModel.findOne({ userId });

    if (existingUpload) {
      existingUpload.images.push(fileName);
      return existingUpload.save();
    } else {
      const upload = new this.uploadModel({ userId, images: [fileName] });
      return upload.save();
    }
  }

  async getFiles(userId: Types.ObjectId): Promise<any[]> {
    const userdata = await this.uploadModel.findOne({ userId }).populate('userId').exec();
    if (userdata) {
      const filesInfo = userdata.images.map((fileName) => {
        const filePath = path.join(__dirname, '..', '..', 'upload', fileName);
        const stats = fs.statSync(filePath);
        return {
          fileName,
          size: stats.size, // File size in bytes
          type: path.extname(fileName).substring(1), // File extension
          lastModified: stats.mtime, // Last modified date
          url: `/upload/${fileName}`, // URL to access the file, adjusted to match the static file path
        };
      });

      filesInfo.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

      return filesInfo;
    } else {
      return [];
    }
  }
  async fileSearch(userId: string, query: string): Promise<any[]> {
    const user = await this.uploadModel.findOne({ userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const regex = new RegExp(query, 'i');
    const uploads = await this.uploadModel.find({ userId }).exec();
    const matchingImages: any[] = [];

    uploads.forEach(upload => {
      upload.images.filter(image => regex.test(image)).forEach(image => {
        const filePath = path.join(__dirname, '..', '..', 'upload', image);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          matchingImages.push({
            fileName: image,
            size: stats.size,
            type: path.extname(image).substring(1),
            lastModified: stats.mtime,
          });
        }
      });
    });

    return matchingImages;
}
async getFileData(fileName: string): Promise<any> {
  const filePath = path.join(__dirname, '..', '..', 'upload', fileName);
  const stats = fs.statSync(filePath);
  return {
    fileName: fileName,
    size: stats.size, // File size in bytes
    type: path.extname(fileName).substring(1), // File extension
    lastModified: stats.mtime, // Last modified date
    url: `/upload/${fileName}`, // URL to access the file, adjusted to match the static file path
  };
}
async deleteFile(userId: Types.ObjectId, fileName: string): Promise<void> {
  const user = await this.uploadModel.findOne({ userId });
  if (!user) {
    throw new NotFoundException('User not found');
  }
  user.images = user.images.filter(image => image !== fileName);
  await user.save();

  const filePath = path.join(__dirname, '..', '..', 'upload', fileName);
  fs.unlinkSync(filePath);
}
}
