import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SavedJobDocument = SavedJob & Document;

@Schema({ timestamps: true })
export class SavedJob {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  jobTitle: string;

  @Prop({ required: true })
  company: string;

  @Prop()
  location: string;

  @Prop()
  salaryMin: number;

  @Prop()
  salaryMax: number;

  @Prop()
  salaryCurrency: string;

  @Prop()
  jobType: string;

  @Prop()
  sourcePlatform: string;

  @Prop({ required: true })
  originalLink: string;

  @Prop()
  companyLogo: string;

  @Prop()
  isRemote: boolean;

  @Prop()
  externalJobId: string;
}

export const SavedJobSchema = SchemaFactory.createForClass(SavedJob);
SavedJobSchema.index({ userId: 1, externalJobId: 1 }, { unique: true });
