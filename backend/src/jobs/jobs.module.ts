import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsService } from './jobs.service';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { SerperService } from './serper.service';
import { JobsController } from './jobs.controller';
import { Job, JobSchema } from './job.schema';
import { UserJobAction, UserJobActionSchema } from './user-job-action.schema';
import { DashboardController } from './dashboard.controller';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: UserJobAction.name, schema: UserJobActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [JobsController, DashboardController],
  providers: [JobsService, AiService, GeminiService, SerperService],
  exports: [JobsService],
})
export class JobsModule {}
