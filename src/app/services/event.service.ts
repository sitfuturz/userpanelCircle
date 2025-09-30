import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface Event {
  _id: string;
  name: string;
  event_or_meeting?: 'event' | 'meeting';
  date: string;
  mode?: 'online' | 'offline';
  amount?: number;
  startTime?: string;
  endTime?: string;
  paid?: boolean;
  thumbnail?: string;
  details?: string;
  photos?: string[];
  videos?: string[];
  mapURL?: string;
  location?: string;
  chapter_name: string;
  createdAt?: string;
}

export interface EventGallery {
  eventId: string;
  name: string;
  date: string;
  thumbnail: string;
  location: string;
  startTime: string;
  endTime: string;
  chapter: string;
  media: {
    photos: string[];
    videos: string[];
  };
}

export interface EventResponse {
  success: boolean;
  message: string;
  data: Event[];
  totalDocs?: number;
  totalPages?: number;
  page?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface EventGalleryResponse {
  success: boolean;
  message?: string;
  data: EventGallery;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
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
      return payload.userId;
    } catch (error) {
      throw new Error('Invalid authentication token');
    }
  }

  /**
   * Get all upcoming events
   */
  async getAllUpcomingEvents(): Promise<EventResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.events.getAllUpcomingEvents,
          method: 'POST',
        },
        { userId },
        this.headers
      );
      
      return response.data || response;
    } catch (error: any) {
      console.error('Get Upcoming Events Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch upcoming events', 'error');
      throw error;
    }
  }

  /**
   * Get all recent events
   */
  async getAllRecentEvents(): Promise<EventResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.events.getAllRecentEvents,
          method: 'POST',
        },
        { userId },
        this.headers
      );
      
      return response.data || response;
    } catch (error: any) {
      console.error('Get Recent Events Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch recent events', 'error');
      throw error;
    }
  }

  /**
   * Get event gallery by event ID
   */
  async getEventGallery(eventId: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.events.getEventGallery,
          method: 'POST',
        },
        { eventId },
        this.headers
      );
      
      return response;
    } catch (error: any) {
      console.error('Get Event Gallery Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch event gallery', 'error');
      throw error;
    }
  }
}