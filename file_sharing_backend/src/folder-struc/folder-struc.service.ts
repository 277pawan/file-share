import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FolderStruc, FolderStrucDocument } from './folder-struc.model';

@Injectable()
export class FolderStrucService {
  constructor(
    @InjectModel(FolderStruc.name) private readonly folderStrucModel: Model<FolderStrucDocument>
  ) {}

  async createFolder(folder: Record<string, any>, userId: string): Promise<FolderStruc> {
    const updatedFolder = await this.folderStrucModel.findOneAndUpdate(
      { userId },
      { $set: { folder: folder } },
      { new: true, upsert: true }
    ).exec();
    return updatedFolder;
  }

  async getFolderByUserId(userId: string): Promise<Record<string, any> | null> {
    const folderdata = await this.folderStrucModel.findOne({ userId }).select('+folder').exec();
    if (!folderdata) {
      return null;
    }
    return folderdata.folder;
  }
  
}  
