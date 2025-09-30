import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  EventService, 
  Event, 
  EventResponse, 
  EventGallery,
  EventGalleryResponse 
} from '../../../services/event.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

  environment = environment;

  // Tab state
  activeTab: 'upcoming' | 'recent' = 'upcoming';
  
  // Data arrays
  upcomingEvents: Event[] = [];
  recentEvents: Event[] = [];
  
  // Loading states
  isLoading = false;
  
  // Modal states
  showDetailModal = false;
  selectedEvent: Event | null = null;
  selectedEventGallery: EventGallery | null = null;
  
  // Gallery state
  selectedMediaType: 'photos' | 'videos' = 'photos';
  selectedMediaIndex = 0;
  showMediaModal = false;

  constructor(
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadActiveTabData();
  }

  // Tab switching
  switchTab(tab: 'upcoming' | 'recent'): void {
    this.activeTab = tab;
    this.loadActiveTabData();
  }

  // Load data based on active tab
  async loadActiveTabData(): Promise<void> {
    this.isLoading = true;
    try {
      if (this.activeTab === 'upcoming') {
        await this.loadUpcomingEvents();
      } else {
        await this.loadRecentEvents();
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Load upcoming events
  async loadUpcomingEvents(): Promise<void> {
    try {
      const response: EventResponse = await this.eventService.getAllUpcomingEvents();
      this.upcomingEvents = Array.isArray(response) ? response : [];
      console.log('Upcoming events loaded:', this.upcomingEvents);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
      this.upcomingEvents = [];
    }
  }

  // Load recent events
  async loadRecentEvents(): Promise<void> {
    try {
      const response: EventResponse = await this.eventService.getAllRecentEvents();
      this.recentEvents = Array.isArray(response) ? response : [];
      console.log('Recent events loaded:', this.recentEvents);
    } catch (error) {
      console.error('Error loading recent events:', error);
      this.recentEvents = [];
    }
  }

  // Get current events based on active tab
  get currentEvents(): Event[] {
    return this.activeTab === 'upcoming' ? this.upcomingEvents : this.recentEvents;
  }

  // Modal methods
  async openDetailModal(event: Event): Promise<void> {
    this.selectedEvent = event;
    this.showDetailModal = true;
    
    // Load gallery data if this is a recent event
    if (this.activeTab === 'recent') {
      await this.loadEventGallery(event._id);
    }
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEvent = null;
    this.selectedEventGallery = null;
  }

  // Load event gallery
  async loadEventGallery(eventId: string): Promise<void> {
    try {
      const response: EventGalleryResponse = await this.eventService.getEventGallery(eventId);
      this.selectedEventGallery = response.data;
      console.log('Event gallery loaded:', this.selectedEventGallery);
    } catch (error) {
      console.error('Error loading event gallery:', error);
      this.selectedEventGallery = null;
    }
  }

  // Media modal methods
  openMediaModal(type: 'photos' | 'videos', index: number = 0): void {
    this.selectedMediaType = type;
    this.selectedMediaIndex = index;
    this.showMediaModal = true;
  }

  closeMediaModal(): void {
    this.showMediaModal = false;
    this.selectedMediaIndex = 0;
  }

  // Media navigation
  previousMedia(): void {
    const mediaArray = this.selectedMediaType === 'photos' 
      ? this.selectedEventGallery?.media.photos || []
      : this.selectedEventGallery?.media.videos || [];
    
    if (this.selectedMediaIndex > 0) {
      this.selectedMediaIndex--;
    } else {
      this.selectedMediaIndex = mediaArray.length - 1;
    }
  }

  nextMedia(): void {
    const mediaArray = this.selectedMediaType === 'photos' 
      ? this.selectedEventGallery?.media.photos || []
      : this.selectedEventGallery?.media.videos || [];
    
    if (this.selectedMediaIndex < mediaArray.length - 1) {
      this.selectedMediaIndex++;
    } else {
      this.selectedMediaIndex = 0;
    }
  }

  // Get current media URL
  getCurrentMediaUrl(): string {
    if (!this.selectedEventGallery) return '';
    
    const mediaArray = this.selectedMediaType === 'photos' 
      ? this.selectedEventGallery.media.photos
      : this.selectedEventGallery.media.videos;
    
    const currentMedia = mediaArray[this.selectedMediaIndex];
    return currentMedia ? this.getGalleryImage(currentMedia) : '';
  }

  // Utility methods
  getEventImage(event: Event): string {
    return event.thumbnail 
      ? `${this.environment.imageUrl}${event.thumbnail}`
      : 'assets/images/placeholder-image.png';
  }

  getGalleryImage(imagePath: string): string {
    return imagePath 
      ? `${this.environment.imageUrl}${imagePath}`
      : 'assets/images/placeholder-image.png';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    
    // Assuming time format is HH:mm
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${period}`;
  }

  formatEventType(type: string): string {
    if (!type) return 'Event';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  formatMode(mode: string): string {
    if (!mode) return 'Offline';
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  }

  // Check if event has gallery content
  hasGalleryContent(): boolean {
    if (!this.selectedEventGallery) return false;
    return (this.selectedEventGallery.media.photos.length > 0) || 
           (this.selectedEventGallery.media.videos.length > 0);
  }

  // Track by functions for ngFor performance
  trackByEventId(index: number, event: Event): string {
    return event._id;
  }

  trackByMediaIndex(index: number, media: string): string {
    return `${index}_${media}`;
  }
}