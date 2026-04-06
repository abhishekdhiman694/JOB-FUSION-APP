import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Anthropic } from '@anthropic-ai/sdk';

@Injectable()
export class AiService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateMockJobs(query: string, location?: string): Promise<any[]> {
    const prompt = `You are a professional job search assistant. 
    Generate 5 realistic, high-quality job listings for the search query: "${query}" ${location ? `in location: "${location}"` : ''}.
    
    Respond ONLY with a raw JSON array of objects. Each object must follow this structure exactly:
    {
      "job_id": "mock_123",
      "job_title": "Full Job Title",
      "employer_name": "Company Name",
      "job_city": "City",
      "job_country": "Country",
      "job_description": "Short, professional job description (2-3 sentences)",
      "job_required_skills": ["Skill1", "Skill2", "Skill3"],
      "job_min_salary": 60000,
      "job_max_salary": 90000,
      "job_salary_currency": "USD",
      "job_employment_type": "FULLTIME",
      "job_publisher": "JobFusion AI",
      "job_google_link": "https://example.com/job/link",
      "employer_logo": "https://logo.clearbit.com/google.com",
      "job_is_remote": true
    }

    Return NO other text, just the JSON array.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Claude API Error:', error);
      return [];
    }
  }
}
