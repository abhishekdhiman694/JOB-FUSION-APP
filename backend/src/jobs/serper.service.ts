import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SerperService {
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SERPER_API_KEY') || '';
  }

  async searchWeb(query: string, location?: string): Promise<any[]> {
    const q = `${query} ${location ? `in ${location}` : ''} jobs site:linkedin.com/jobs OR site:indeed.com/jobs OR site:glassdoor.com/job-details`;
    
    try {
      const response = await axios.post('https://google.serper.dev/search', {
        q,
        num: 15,
      }, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data.organic || [];
    } catch (error) {
      console.error('Serper API Error:', error.response?.data || error.message);
      return [];
    }
  }
}
