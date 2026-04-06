import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  avatarUrl: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: 'entry' })
  experienceLevel: string;

  @Prop({ type: [String], default: [] })
  resumeUrls: string[];

  @Prop({
    type: {
      roles: [String],
      locations: [String],
      jobType: [String],
      salaryMin: Number,
      salaryMax: Number,
    },
    default: {},
  })
  preferences: {
    roles: string[];
    locations: string[];
    jobType: string[];
    salaryMin: number;
    salaryMax: number;
  };

  @Prop()
  fcmToken: string;

  @Prop({ default: 'local' })
  authProvider: string;

  @Prop({ type: [String], default: [] })
  connectedAccounts: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
