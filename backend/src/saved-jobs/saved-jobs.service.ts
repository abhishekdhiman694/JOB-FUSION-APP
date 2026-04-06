import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SavedJob, SavedJobDocument } from './saved-job.schema';

@Injectable()
export class SavedJobsService {
  constructor(@InjectModel(SavedJob.name) private savedJobModel: Model<SavedJobDocument>) {}

  async saveJob(userId: string, jobData: Partial<SavedJob> & { externalJobId: string }): Promise<SavedJobDocument> {
    const existing = await this.savedJobModel.findOne({
      userId: new Types.ObjectId(userId),
      externalJobId: jobData.externalJobId,
    });
    if (existing) throw new ConflictException('Job already saved');
    return new this.savedJobModel({ ...jobData, userId: new Types.ObjectId(userId) }).save();
  }

  async getSavedJobs(userId: string): Promise<SavedJobDocument[]> {
    return this.savedJobModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async removeSavedJob(userId: string, externalJobId: string): Promise<void> {
    await this.savedJobModel.deleteOne({ userId: new Types.ObjectId(userId), externalJobId }).exec();
  }

  async isJobSaved(userId: string, externalJobId: string): Promise<boolean> {
    const doc = await this.savedJobModel.findOne({ userId: new Types.ObjectId(userId), externalJobId });
    return !!doc;
  }
}
