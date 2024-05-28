import { Controller, Post, Get, Body, Req, NotFoundException } from '@nestjs/common';
import { SharedFileService } from './share-file.service';
import { ShareFileDto } from './share-file.dto';

@Controller('share-file')
export class ShareFileController {
  constructor(private readonly shareFileService: SharedFileService) {}

  @Post('share')
  async shareFile(@Req() req, @Body() shareFileDto: ShareFileDto) {
    const userId = req.user._id;
    const { fileId, userArray, emails } = shareFileDto;
    return this.shareFileService.shareFile(fileId, userArray, emails, userId);
  }

  @Get('access')
  async checkAccess(@Req() req) {
    const userId = req.user._id;
    return this.shareFileService.checkAccess(userId);
  }
  @Get()
  async getFileData(@Req() req){
    const userId=req.user._id;
    const fileInfo= await this.shareFileService.getFileData(userId);
    if (fileInfo) {
      const fileUrls = fileInfo.map(file => ({
        ...file,
        url: `${req.protocol}://${req.get('host')}/upload/${file.fileName}`
      }));
      return fileUrls;
    }else {
      throw new NotFoundException('File not found');
    }
  }
}
