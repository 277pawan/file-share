import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
import { SharedFile, SharedFileDocument } from './share-file.model';
import { transporter,mailOptions } from './share-mail';
import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class SharedFileService {
  constructor(
    @InjectModel(SharedFile.name) private sharedFileModel: Model<SharedFileDocument>,
  ) {}
  async shareFile(fileId: string, userArray: string[], emails: string[], userId: string): Promise<SharedFile> {
    const existingFile = await this.sharedFileModel.findOne({ fileId, userId }).exec();

    if (existingFile) {
      const newUserArray = userArray.filter((data) => !existingFile.userArray.includes(data));

      newUserArray.forEach((data) => {
        existingFile.userArray.push(data);
      });

      const savedFile = await existingFile.save();

      if (emails.length > 0) {
        await this.sendEmails(emails);
      }

      return savedFile;
    } else {
      const newSharedFile = new this.sharedFileModel({ fileId, userArray, userId });

      const savedFile = await newSharedFile.save();

      if (emails.length > 0) {
        await this.sendEmails(emails);
      }
      return savedFile;
    }
  }

  private async sendEmails(emails: string[]): Promise<void> {
    const promises = emails.map(email => {
      const mailOptionsWithRecipient = {
        ...mailOptions,
        to: email,
        subject: 'Invitation to File Sharing',
        html: `
          <h2>File Sharing Invitation</h2>
          <p>Your friends are looking for you in file sharing and want to share something with you.</p>
          <p>Click <a href="http://localhost:4000/users/google/callback">here</a> to login and start storing and sharing your files.</p>
        `,
          };
      return transporter.sendMail(mailOptionsWithRecipient);
    });
    await Promise.all(promises);
  }
  async checkAccess(userId: string): Promise<string[]> {
    const accessibleFiles = await this.sharedFileModel.find({ userId }).exec();
    return accessibleFiles.map(file => file.fileId.toString()); // Convert ObjectId to string
  }
  
  async getFileData(userId: string): Promise<any[]> {
    const sharedFiles = await this.sharedFileModel.find({ userArray: userId }).exec();
    const fileIds = sharedFiles.map(file => file.fileId.toString()); // Convert ObjectId to string
    const filesInfo = fileIds.map((fileName) => {
      const filePath = path.join(__dirname, '..', '..', 'upload', fileName);
      const stats = fs.statSync(filePath);
      return {
        fileName,
        size: stats.size,
        lastModified: stats.mtime,
        url: `/upload/${fileName}`,
      };
    });
    filesInfo.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  
    return filesInfo;
}
}
