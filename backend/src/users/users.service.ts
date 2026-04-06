import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { UpdatePreferencesDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const created = new this.userModel(data);
    return created.save();
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<UserDocument> {
    const update: any = {};
    if (dto.roles !== undefined) update['preferences.roles'] = dto.roles;
    if (dto.locations !== undefined) update['preferences.locations'] = dto.locations;
    if (dto.jobType !== undefined) update['preferences.jobType'] = dto.jobType;
    if (dto.salaryMin !== undefined) update['preferences.salaryMin'] = dto.salaryMin;
    if (dto.salaryMax !== undefined) update['preferences.salaryMax'] = dto.salaryMax;
    if (dto.skills !== undefined) update.skills = dto.skills;
    if (dto.experienceLevel !== undefined) update.experienceLevel = dto.experienceLevel;

    const user = await this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateFcmToken(userId: string, token: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { fcmToken: token }).exec();
  }

  async getProfile(userId: string): Promise<UserDocument> {
    return this.findById(userId);
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, { avatarUrl }, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateResume(userId: string, resumeUrl: string): Promise<UserDocument> {
    const userState = await this.userModel.findById(userId).exec();
    if (!userState) throw new NotFoundException('User not found');
    
    if (userState.resumeUrls && userState.resumeUrls.length >= 2) {
        throw new Error('Maximum of 2 resumes allowed.');
    }

    const user = await this.userModel.findByIdAndUpdate(userId, { $push: { resumeUrls: resumeUrl } }, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteResume(userId: string, resumeUrl: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(userId, { $pull: { resumeUrls: resumeUrl } }, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    
    // Optionally delete from filesystem if required
    try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '../../..', resumeUrl); // resolving to project root/uploads
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch(e) { console.error('Failed to clear file system resume', e) }

    return user;
  }

  async updateProfile(userId: string, data: any): Promise<UserDocument> {
    console.log(`[UsersService] Updating profile for ${userId}`, JSON.stringify(data, null, 2));
    const update: any = {};
    if (data.name) update.name = data.name;
    if (data.experienceLevel) update.experienceLevel = data.experienceLevel;
    if (data.connectedAccounts) update.connectedAccounts = data.connectedAccounts;
    
    // Process nested preferences
    if (data.preferences) {
        if (data.preferences.locations) update['preferences.locations'] = data.preferences.locations;
        if (data.preferences.roles) update['preferences.roles'] = data.preferences.roles;
        if (data.preferences.jobType) update['preferences.jobType'] = data.preferences.jobType;
        if (data.preferences.salaryMin) update['preferences.salaryMin'] = data.preferences.salaryMin;
        if (data.preferences.salaryMax) update['preferences.salaryMax'] = data.preferences.salaryMax;
    }
    
    console.log(`[UsersService] Final Update Object:`, JSON.stringify(update, null, 2));
    const user = await this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
