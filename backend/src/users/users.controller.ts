import { Controller, Get, Patch, Body, UseGuards, Request, Post, UseInterceptors, UploadedFile, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePreferencesDto } from './users.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Patch('preferences')
  async updatePreferences(@Request() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(req.user.userId, dto);
  }

  @Patch('fcm-token')
  async updateFcmToken(@Request() req: any, @Body() body: { token: string }) {
    await this.usersService.updateFcmToken(req.user.userId, body.token);
    return { success: true };
  }

  @Post('avatar-base64')
  async uploadAvatarBase64(@Request() req: any, @Body() body: { base64: string, extension: string }) {
    console.log(`[UsersController] Received Base64 avatar upload for user: ${req.user.userId}`);
    if (!body.base64) throw new Error('No base64 data provided');
    
    // Ensure uploads directory exists
    const fs = require('fs');
    if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `avatar-${uniqueSuffix}.${body.extension || 'jpg'}`;
    const filePath = `./uploads/${filename}`;
    
    fs.writeFileSync(filePath, Buffer.from(body.base64, 'base64'));
    
    const avatarUrl = `/uploads/${filename}`;
    return this.usersService.updateAvatar(req.user.userId, avatarUrl);
  }

  @Post('resume-base64')
  async uploadResumeBase64(@Request() req: any, @Body() body: { base64: string, extension: string }) {
    console.log(`[UsersController] Received Base64 resume upload for user: ${req.user.userId}`);
    if (!body.base64) throw new Error('No base64 data provided');
    
    const fs = require('fs');
    if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `resume-${uniqueSuffix}.${body.extension || 'pdf'}`;
    const filePath = `./uploads/${filename}`;
    
    fs.writeFileSync(filePath, Buffer.from(body.base64, 'base64'));
    
    const resumeUrl = `/uploads/${filename}`;
    return this.usersService.updateResume(req.user.userId, resumeUrl);
  }

  @Post('resume')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        console.log(`[UsersController] Multer generating name for: ${file.originalname}`);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `resume-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadResume(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    console.log(`[UsersController] Received resume upload request for user: ${req.user?.userId}`);
    if (!file) {
      console.error('[UsersController] No file received in resume upload!');
      throw new Error('No file uploaded');
    }
    const resumeUrl = `/uploads/${file.filename}`;
    return this.usersService.updateResume(req.user.userId, resumeUrl);
  }

  @Delete('resume')
  async deleteResume(@Request() req: any, @Body() body: { resumeUrl: string }) {
    if (!body.resumeUrl) throw new Error('No resumeUrl provided');
    return this.usersService.deleteResume(req.user.userId, body.resumeUrl);
  }

  @Put('profile')
  async updateProfile(@Request() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.userId, body);
  }
}
