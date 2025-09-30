import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface BusinessDetails {
  logo: string | null;
  banner_image: string;
  business_name: string;
  business_type: string;
  primary_business: boolean;
  category: string;
  sub_category: string;
  product: string;
  service: string;
  formation: string;
  establishment: Date | null;
  team_size: number;
  mobile_number: string;
  email: string;
  website: string;
  address: string;
  about_business_details: string;
  _id: string;
}

export interface BioDetails {
  yearsInBusiness: string;
  previousTypesOfBusiness: string;
  spouse: string;
  children: string;
  pets: string;
  hobbies: string;
  cityOfResidence: string;
  yearInThatCity: string;
  myBurningDesire: string;
  somethingNoOne: string;
  myKeyToSuccess: string;
}

export interface GrowthSheet {
  goals: string;
  accomplishment: string;
  interests: string;
  networks: string;
  skills: string;
}

export interface TopProfile {
  idealReferral: string;
  topProduct: string;
  topProblemSolved: string;
  favouriteLgnStory: string;
  idealReferralParter: string;
}

export interface SocialMedia {
  Facebook: string;
  Instagram: string;
  LinkedIn: string;
  Twitter: string;
  YouTube: string;
  WhatsApp: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  digitalCardLink: string;
  chapter_name: string;
  city: string;
  state: string;
  country: string;
  mobile_number: string;
  email: string;
  date_of_birth: Date | null;
  marriage_anniversary: Date | null;
  profilePic: string;
  emergency_contact: string;
  address: string;
  introduction_details: string;
  meeting_role: string;
  keywords: string;
  deviceType: string;
  latitude: string;
  longitude: string;
  acc_active: boolean;
  paid_fees: number;
  pending_fees: number;
  due_date_fees: Date | null;
  points: number;
  verified: boolean;
  verificationCode: string;
  isActive: boolean;
  deviceId: string;
  fcm: string;
  blockedUsers: any[];
  blockedByUsers: any[];
  blockCount: number;
  sponseredBy: any;
  business: BusinessDetails[];
  complains: any[];
  suggestions: any[];
  badges: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  bioDetails: BioDetails;
  growthSheet: GrowthSheet;
  topProfile: TopProfile;
  weeklyPresentation: {
    presentation1: string;
    presentation2: string;
  };
  fees: {
    total_fee: number;
    paid_fee: number;
    pending_fee: number;
    renewal_fee: number;
    end_date: Date | null;
    is_renewed: boolean;
    induction_date: string;
    fee_history: any[];
  };
  SocialMedia: SocialMedia;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private headers: any = [];

  constructor(
    private apiManager: ApiManager,
    private storage: AppStorage
  ) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token) {
      this.headers.push({ 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
  };

  private getUserIdFromToken(): string {
    const token = this.storage.get(common.TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload._id;
    } catch (error) {
      console.error('Token parsing error:', error);
      throw new Error('Invalid authentication token');
    }
  }

  /**
   * Get user profile from localStorage
   */
  getUserProfileFromStorage(): UserProfile | null {
    try {
      const userData = this.storage.get('userData');
      if (!userData) return null;
      
      // If userData is already an object, return it directly
      if (typeof userData === 'object') {
        return userData;
      }
      
      // If it's a string, try to parse it
      if (typeof userData === 'string') {
        return JSON.parse(userData);
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Clear corrupted data
      this.storage.clearKey('userData');
      return null;
    }
  }

  /**
   * Get user profile from API
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.profile.getUserProfile}/${userId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      // Update localStorage with fresh data
      this.storage.set('userData', JSON.stringify(response.data));
      
      await swalHelper.showToast(response.message || 'Profile fetched successfully', 'success');
      return response.data;
    } catch (error: any) {
      console.error('Get Profile Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch profile', 'error');
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.profile.updateUserProfile}/${userId}`,
          method: 'PUT',
        },
        profileData,
        this.headers
      );
      
      // Update localStorage with updated data
      const updatedUser = response.updatedUser || response.data;
      this.storage.set('userData', updatedUser);
      
      await swalHelper.showToast(response.message || 'Profile updated successfully', 'success');
      return updatedUser;
    } catch (error: any) {
      console.error('Update Profile Error:', error);
      await swalHelper.showToast(error.message || 'Failed to update profile', 'error');
      throw error;
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: File): Promise<string> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const formData = new FormData();
      formData.append('profilePic', file);
      
      // For FormData, we need to ensure Authorization header is included but remove Content-Type
      const headersForFile = this.headers.map((header: any) => {
        const newHeader: any = {};
        Object.keys(header).forEach(key => {
          if (key !== 'Content-Type') {
            newHeader[key] = header[key];
          }
        });
        return newHeader;
      }).filter((header: any) => Object.keys(header).length > 0);
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.profile.uploadProfilePic}/${userId}`,
          method: 'PUT',
        },
        formData,
        headersForFile
      );
      
      // Update localStorage with the updated user data
      const updatedUser = response.updatedUser || response.data;
      if (updatedUser) {
        this.storage.set('userData', updatedUser);
      }
      
      await swalHelper.showToast(response.message || 'Profile picture uploaded successfully', 'success');
      return updatedUser?.profilePic || response.data?.profilePic;
    } catch (error: any) {
      console.error('Upload Profile Picture Error:', error);
      await swalHelper.showToast(error.message || 'Failed to upload profile picture', 'error');
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteUserAccount(): Promise<boolean> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.profile.deleteAccount}/${userId}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );
      
      // // Clear localStorage
      // this.storage.remove('userData');
      // this.storage.remove(common.TOKEN);
      
      await swalHelper.showToast(response.message || 'Account deleted successfully', 'success');
      return true;
    } catch (error: any) {
      console.error('Delete Account Error:', error);
      await swalHelper.showToast(error.message || 'Failed to delete account', 'error');
      throw error;
    }
  }

  /**
   * Get default avatar URL
   */
  getDefaultAvatar(): string {
    return 'assets/images/avatar-placeholder.png';
  }

  /**
   * Format user's full address
   */
  formatFullAddress(user: UserProfile): string {
    const addressParts = [
      user.address,
      user.city,
      user.state,
      user.country
    ].filter(part => part && part.trim() !== '');
    
    return addressParts.join(', ');
  }

  /**
   * Get user's primary business
   */
  getPrimaryBusiness(user: UserProfile): BusinessDetails | null {
    if (!user.business || user.business.length === 0) {
      return null;
    }
    
    const primaryBusiness = user.business.find(business => business.primary_business);
    return primaryBusiness || user.business[0];
  }

  /**
   * Format social media links
   */
  getActiveSocialMediaLinks(socialMedia: SocialMedia): Array<{platform: string, url: string}> {
    const links: Array<{platform: string, url: string}> = [];
    
    Object.entries(socialMedia).forEach(([platform, url]) => {
      if (url && url.trim() !== '') {
        links.push({ platform, url });
      }
    });
    
    return links;
  }
}