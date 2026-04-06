import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop()
  job_id: string;

  @Prop({ required: true })
  job_title: string;

  @Prop({ required: true })
  employer_name: string;

  @Prop()
  job_city: string;

  @Prop()
  job_country: string;

  @Prop()
  job_description: string;

  @Prop([String])
  job_required_skills: string[];

  @Prop()
  job_min_salary: number;

  @Prop()
  job_max_salary: number;

  @Prop()
  job_salary_currency: string;

  @Prop()
  job_employment_type: string;

  @Prop()
  job_publisher: string;

  @Prop()
  job_google_link: string;

  @Prop()
  employer_logo: string;

  @Prop()
  job_posted_at_datetime_utc: Date;

  @Prop({ default: false })
  job_is_remote: boolean;

  @Prop()
  company_website: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
