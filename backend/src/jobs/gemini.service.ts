import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY') || '',
    );
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateJobs(query: string, location?: string): Promise<any[]> {
    const prompt = `You are a professional job search assistant. 
    Generate 10 realistic, high-quality job listings for the search query: "${query}" ${location ? `in location: "${location}"` : ''}.
    
    Respond ONLY with a raw JSON array of objects. Each object must follow this structure exactly:
    {
      "job_id": "gemini_123",
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
      "job_publisher": "JobFusion Gemini",
      "job_google_link": "https://example.com/job/link",
      "employer_logo": "https://logo.clearbit.com/google.com",
      "job_is_remote": true
    }

    Return NO other text, just the JSON array.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini API Error:', error);
      return [];
    }
  }

  async parseSearchResults(results: any[]): Promise<any[]> {
    if (!results || results.length === 0) return [];

    const prompt = `You are a professional job data extractor. 
    Below is a list of search results for job postings. 
    Transform these into a clean JSON array of job objects.
    
    Raw Search Results:
    ${JSON.stringify(results.map(r => ({ title: r.title, link: r.link, snippet: r.snippet })))}

    Format each object as:
    {
      "job_id": "web_ [slug-of-title-and-company]",
      "job_title": "Cleaned Job Title",
      "employer_name": "Company Name",
      "job_city": "City",
      "job_country": "Country",
      "job_description": "Short summary from snippet",
      "job_required_skills": [],
      "job_min_salary": null,
      "job_max_salary": null,
      "job_salary_currency": "USD",
      "job_employment_type": "FULLTIME",
      "job_publisher": "Web Search",
      "job_google_link": "The actual link from search results",
      "employer_logo": "https://logo.clearbit.com/google.com",
      "job_is_remote": false
    }

    Return ONLY the JSON array. If a field isn't clear, use sensible defaults.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini Parsing Error:', error);
      return [];
    }
  }
}
