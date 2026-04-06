import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedJobsService } from './saved-jobs.service';
import { SavedJobsController } from './saved-jobs.controller';
import { SavedJob, SavedJobSchema } from './saved-job.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: SavedJob.name, schema: SavedJobSchema }])],
  controllers: [SavedJobsController],
  providers: [SavedJobsService],
})
export class SavedJobsModule {}
