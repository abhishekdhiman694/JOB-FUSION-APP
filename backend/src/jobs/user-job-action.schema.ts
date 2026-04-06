import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserJobActionDocument = UserJobAction & Document;

@Schema({ timestamps: true })
export class UserJobAction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  jobId: string;

  @Prop({ required: true })
  jobTitle: string;

  @Prop({ required: true })
  employerName: string;

  @Prop()
  employerLogo: string;

  @Prop()
  jobCity: string;

  @Prop()
  jobCountry: string;

  @Prop({ required: true, enum: ['apply', 'view'] })
  actionType: string;

  @Prop({ type: Number })
  salaryMax: number;

  @Prop()
  salaryCurrency: string;
}

export const UserJobActionSchema = SchemaFactory.createForClass(UserJobAction);
