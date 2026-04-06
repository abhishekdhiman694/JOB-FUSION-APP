import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('saved-jobs')
@UseGuards(JwtAuthGuard)
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @Post()
  async saveJob(@Request() req: any, @Body() body: any) {
    return this.savedJobsService.saveJob(req.user.userId, body);
  }

  @Get()
  async getSavedJobs(@Request() req: any) {
    return this.savedJobsService.getSavedJobs(req.user.userId);
  }

  @Delete(':externalJobId')
  async removeSavedJob(@Request() req: any, @Param('externalJobId') externalJobId: string) {
    await this.savedJobsService.removeSavedJob(req.user.userId, externalJobId);
    return { success: true };
  }

  @Get('is-saved/:externalJobId')
  async isJobSaved(@Request() req: any, @Param('externalJobId') externalJobId: string) {
    return { saved: await this.savedJobsService.isJobSaved(req.user.userId, externalJobId) };
  }
}
