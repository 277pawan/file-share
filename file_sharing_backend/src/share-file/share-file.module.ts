import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShareFileController } from './share-file.controller';
import { SharedFileService } from './share-file.service';
import { SharedFile, SharedFileSchema } from './share-file.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SharedFile.name, schema: SharedFileSchema }]),
  ],
  controllers: [ShareFileController],
  providers: [SharedFileService],
})
export class ShareFileModule {}
