import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserJobAction, UserJobActionDocument } from './user-job-action.schema';
import { User, UserDocument } from '../users/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    @InjectModel(UserJobAction.name) private jobActionModel: Model<UserJobActionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  @Get('stats')
  async getStats(@Req() req: any) {
    const userId = new Types.ObjectId(req.user.id);
    
    // 1. Get Application Count
    const appliedCount = await this.jobActionModel.countDocuments({ userId, actionType: 'apply' });
    
    // 2. Get Potential Income
    const actions = await this.jobActionModel.find({ userId, actionType: 'apply' }).exec();
    const totalPotentialIncome = actions.reduce((acc, curr) => acc + (curr.salaryMax || 2500), 0);

    // 3. Calculate Profile Completion
    const user = await this.userModel.findById(userId).exec();
    let score = 0;
    if (user) {
      if (user.avatarUrl) score += 20;
      if (user.resumeUrls?.length > 0) score += 40;
      if (user.preferences?.roles?.length > 0) score += 20;
      if (user.skills?.length > 0) score += 20;
    }

    return {
      appliedCount,
      totalPotentialIncome,
      profileCompletion: score,
      avgRating: 4.8,
    };
  }

  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = new Types.ObjectId(req.user.id);
    return this.jobActionModel.find({ userId }).sort({ createdAt: -1 }).limit(10).exec();
  }

  @Post('record-action')
  async recordAction(@Req() req: any, @Body() body: any) {
    const userId = new Types.ObjectId(req.user.id);
    const { jobId, jobTitle, employerName, actionType, salaryMax, salaryCurrency, employerLogo, jobCity, jobCountry } = body;
    
    // Avoid duplicates for the same job and action
    const existing = await this.jobActionModel.findOne({ userId, jobId, actionType }).exec();
    if (existing) return existing;

    const newAction = new this.jobActionModel({
      userId,
      jobId,
      jobTitle,
      employerName,
      employerLogo,
      jobCity,
      jobCountry,
      actionType,
      salaryMax,
      salaryCurrency
    });

    return newAction.save();
  }
}
