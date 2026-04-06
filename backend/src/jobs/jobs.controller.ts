import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('search')
  async search(
    @Query('query') query: string,
    @Query('location') location: string,
    @Query('radius') radius: string,
    @Query('jobType') jobType: string,
    @Query('datePosted') datePosted: string,
    @Query('page') page: string,
  ) {
    return this.jobsService.searchJobs({ query, location, radius, jobType, datePosted, page: parseInt(page) || 1 });
  }

  @Get('trending')
  async trending() {
    console.log('[JobsController] Trending endpoint requested');
    return this.jobsService.getTrendingJobs();
  }

  @Get('details/:jobId')
  @UseGuards(JwtAuthGuard)
  async details(@Param('jobId') jobId: string) {
    return this.jobsService.getJobDetails(jobId);
  }
}
