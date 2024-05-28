import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { FolderStrucService } from './folder-struc.service';
import { Request } from 'express';

@Controller('folder-struc')
export class FolderStrucController {
  constructor(private readonly folderStrucService: FolderStrucService) {}

  @Post('folder-set')
  async uploadFolder(
    @Body('folder') folder: Record<string, any>,@Req() req) {
    const userId = req.user._id;
    return this.folderStrucService.createFolder(folder, userId);
  }

  @Get('folder-get')
  async getFolder(@Req() req) {
    const userId = req.user._id;
    const folders = await this.folderStrucService.getFolderByUserId(userId);
    return folders;
  }
}
