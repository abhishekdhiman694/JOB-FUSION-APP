import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Job, JobDocument } from './job.schema';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { SerperService } from './serper.service';

@Injectable()
export class JobsService {
  private readonly apiKey: string;
  private readonly apiHost: string;
  private webJobsCache = new Map<string, Partial<Job>>();

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private configService: ConfigService,
    private aiService: AiService,
    private geminiService: GeminiService,
    private serperService: SerperService,
  ) {
    this.apiKey = this.configService.get<string>('RAPID_API_KEY') || '';
    this.apiHost = this.configService.get<string>('JSEARCH_API_HOST') || '';
  }

  private mapJsearchJob(job: any): any {
    return {
      job_id: job.job_id,
      job_title: job.job_title,
      employer_name: job.employer_name,
      job_city: job.job_city || '',
      job_country: job.job_country || '',
      job_description: job.job_description,
      job_required_skills: job.job_required_skills || [],
      job_min_salary: job.job_min_salary,
      job_max_salary: job.job_max_salary,
      job_salary_currency: job.job_salary_currency,
      job_employment_type: job.job_employment_type,
      job_publisher: job.job_publisher || 'JSearch',
      job_google_link: job.job_apply_link,
      employer_logo: job.employer_logo,
      job_posted_at_datetime_utc: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : undefined,
      job_is_remote: job.job_is_remote || false,
    };
  }

  async searchJobs(params: {
    query?: string;
    location?: string;
    radius?: string;
    jobType?: string;
    experienceLevel?: string;
    datePosted?: string;
    page?: number;
    numPages?: number;
  }): Promise<{ data: Partial<Job>[]; total: number }> {
    const {
      query = 'software developer',
      location,
      radius,
      jobType,
      datePosted,
      page = 1,
      numPages = 2,
    } = params;

    let q = query;
    if (location) q += ` in ${location}`;

    try {
      console.log(`[JobsService] Searching for "${q}" via JSearch w/ radius: ${radius || 'default'}...`);
      const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
        params: {
          query: q,
          page: page.toString(),
          num_pages: numPages.toString(),
          employment_types: jobType?.toUpperCase(),
          date_posted: datePosted || 'all',
          ...(radius ? { radius } : {}),
        },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost,
        },
      });

      const jobs = (response.data?.data || []).map(this.mapJsearchJob);
      console.log(`[JobsService] JSearch returned ${jobs.length} jobs.`);
      return { data: jobs, total: response.data?.parameters?.total_results || jobs.length };
    } catch (error) {
      console.log(`[JobsService] JSearch failed (${error.message}). Trying Live Web Search (Serper + Gemini)...`);
      try {
        const webResults = await this.serperService.searchWeb(query, location);
        console.log(`[JobsService] Serper found ${webResults.length} organic results.`);
        if (webResults.length > 0) {
          const liveJobs = await this.geminiService.parseSearchResults(webResults);
          if (liveJobs.length > 0) {
            // Cache these results for later retrieval by ID
            liveJobs.forEach(job => {
              if (job.job_id) this.webJobsCache.set(job.job_id, job);
            });
            return { data: liveJobs, total: liveJobs.length };
          }
        }
      } catch (err) {
        console.error('[JobsService] Live Search Exception:', err.message);
      }

      console.log('[JobsService] All search methods failed. Final fallback to AI Generation...');
      const geminiJobs = await this.geminiService.generateJobs(query, location);
      if (geminiJobs.length > 0) {
        console.log(`[JobsService] Gemini generated ${geminiJobs.length} realistic jobs.`);
        return { data: geminiJobs, total: geminiJobs.length };
      }
      
      const aiJobs = await this.aiService.generateMockJobs(query, location);
      console.log(`[JobsService] Claude generated ${aiJobs.length} realistic jobs.`);
      return { data: aiJobs, total: aiJobs.length };
    }
  }

  async getJobDetails(jobId: string): Promise<any> {
    // Check local cache for web-based jobs first
    if (this.webJobsCache.has(jobId)) {
      console.log(`[JobsService] Returning cached web job details for ${jobId}`);
      return this.webJobsCache.get(jobId);
    }

    try {
      const response = await axios.get('https://jsearch.p.rapidapi.com/job-details', {
        params: { job_id: jobId, extended_publisher_details: 'false' },
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': this.apiHost,
        },
      });
      return response.data?.data?.[0] || null;
    } catch (error) {
      console.error('JSearch job details error:', error?.response?.data || error.message);
      return null;
    }
  }

  async getTrendingJobs(): Promise<Partial<Job>[]> {
    const { data } = await this.searchJobs({ query: 'software developer', numPages: 1 });
    return data.slice(0, 10);
  }

  async getRecommendedJobs(preferences: {
    roles: string[];
    locations: string[];
    jobType: string[];
  }): Promise<Partial<Job>[]> {
    const query = preferences.roles?.length ? preferences.roles[0] : 'developer';
    const location = preferences.locations?.length ? preferences.locations[0] : undefined;
    const jobType = preferences.jobType?.length ? preferences.jobType[0] : undefined;
    const { data } = await this.searchJobs({ query, location, jobType });
    return data;
  }

  async saveJobToDb(jobData: Partial<Job>): Promise<JobDocument> {
    const existing = await this.jobModel.findOne({ job_google_link: jobData.job_google_link });
    if (existing) return existing;
    return new this.jobModel(jobData).save();
  }
}
