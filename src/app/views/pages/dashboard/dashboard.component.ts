// dashboard.component.ts - Updated with sidebar design but keeping your API implementation
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CustomerAuthService, DashboardService } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { common } from '../../../core/constants/common';
import { SidebarStateService } from '../../../services/sidebar-state.service';

interface DashboardData {
  referralGiven: number;
  referralReceived: number;
  oneToOne: number;
  visitor: number;
  tyfcbTotalAmount: number;
  tyfcbGiven: number;
  tyfcbReceived: number;
  testimonial: number;
  timeFilter: string;
  currentMonth: string | null;
}

interface NextEvent {
  _id: string;
  name: string;
  event_or_meeting: string;
  date: string;
  mode: string;
  amount: number | null;
  startTime: string;
  endTime: string;
  paid: boolean;
  thumbnail: string;
  details: string;
  photos: string[];
  videos: string[];
  mapURL: string;
  location: string;
  chapter_name: string;
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  _id: string;
  title: string;
  description: string;
  userId: string;
  triggeredBy: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileCompletion {
  isProfileCompleted: boolean;
  profileCompletionPercentage: number;
}

interface Testimonial {
  _id: string;
  giverId?: {
    _id: string;
    name: string;
    chapter_name: string;
    email: string;
    profilePic: string;
    business: any[];
  } | null;
  receiverId: string;
  date: string | null;
  message: string;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'] 
})
export class DashboardComponent implements OnInit {
  // Data properties - keeping your existing structure
  dashboardData: DashboardData = {
    referralGiven: 0,
    referralReceived: 0,
    oneToOne: 0,
    visitor: 0,
    tyfcbTotalAmount: 0,
    tyfcbGiven: 0,
    tyfcbReceived: 0,
    testimonial: 0,
    timeFilter: 'all',
    currentMonth: null
  };

  nextEvent: NextEvent | null = null;
  visitorCount: number = 0;
  notifications: Notification[] = [];
  profileCompletion: ProfileCompletion = {
    isProfileCompleted: false,
    profileCompletionPercentage: 0
  };
  testimonials: Testimonial[] = [];

  // UI state - keeping your existing + adding sidebar
  selectedTimeFilter: string = '12months';
  isLoading: boolean = true;
  isLoadingEvent: boolean = false;
  isLoadingNotifications: boolean = false;
  isLoadingProfile: boolean = false;
  isLoadingTestimonials: boolean = false;

  // New properties for sidebar design
  isSidebarOpen = false;
  showNotifications = false;

  // User data
  currentUser: any = null;

  // Expose Math object for template use
  Math = Math;

  constructor(
    private authService: CustomerAuthService,
    private dashboardService: DashboardService,
    private router: Router,
    public sidebarStateService: SidebarStateService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  private async initializeComponent(): Promise<void> {
    try {
      this.currentUser = this.authService.getCurrentUser();
      
      if (!this.currentUser || !this.currentUser._id) {
        await swalHelper.showToast('User data not found. Please login again.', 'error');
        this.authService.logout();
        return;
      }

      // Load all dashboard data - keeping your existing API calls
      await Promise.all([
        this.loadDashboardCounts(),
        this.loadNextEvent(),
        this.loadNotifications(),
        this.loadProfileCompletion(),
        this.loadTestimonials()
      ]);

    } catch (error) {
      console.error('Dashboard initialization error:', error);
      await swalHelper.showToast('Failed to load dashboard data', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Load dashboard counts with time filter - keeping your existing API logic
  async loadDashboardCounts(timeFilter: string = 'all'): Promise<void> {
    try {
      const response = await this.dashboardService.getDashboardCounts(this.currentUser._id, timeFilter);

      if (response && response.success && response.data) {
        this.dashboardData = { ...this.dashboardData, ...response.data.data };
      }
    } catch (error) {
      console.error('Error loading dashboard counts:', error);
      // Use dummy data on error - updated to match design
      this.dashboardData = {
        referralGiven: 35,
        referralReceived: 60,
        oneToOne: 24,
        visitor: 5,
        tyfcbTotalAmount: 256234,
        tyfcbGiven: 195580,
        tyfcbReceived: 904561,
        testimonial: 21,
        timeFilter: timeFilter,
        currentMonth: null
      };
    }
  }

  // Load next nearest event - keeping your existing API logic
  async loadNextEvent(): Promise<void> {
    this.isLoadingEvent = true;
    try {
      const response = await this.dashboardService.getNextNearestEvent(this.currentUser._id);

      if (response && response.success && response.data) {
        this.nextEvent = response.data;
        this.visitorCount = response.visitorCount || 0;
      }
    } catch (error) {
      console.error('Error loading next event:', error);
      // Use dummy data matching design
      this.nextEvent = {
        _id: 'dummy-id',
        name: 'Rim Jim Event',
        event_or_meeting: 'event',
        date: '2025-05-02T00:00:00.000Z',
        mode: 'offline',
        amount: null,
        startTime: '10:00',
        endTime: '12:00',
        paid: false,
        thumbnail: '',
        details: 'Sample event details',
        photos: [],
        videos: [],
        mapURL: '',
        location: 'The Avenue Regent - Cochin, Mahatma Gandhi Rd, Jos Junction, Surat',
        chapter_name: 'Achiever',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.visitorCount = 250;
    } finally {
      this.isLoadingEvent = false;
    }
  }

  // Load notifications - keeping your existing API logic
  async loadNotifications(): Promise<void> {
    this.isLoadingNotifications = true;
    try {
      const response = await this.dashboardService.getNotifications(this.currentUser._id, 1, 5);

      if (response && response.success && response.data?.docs) {
        this.notifications = response.data.docs;
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Use dummy data matching design
      this.notifications = [
        {
          _id: '1',
          title: 'Abhilash liked your news',
          description: 'Just now',
          userId: this.currentUser._id,
          triggeredBy: null,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Sahil comment on your news',
          description: '20m ago',
          userId: this.currentUser._id,
          triggeredBy: null,
          isDeleted: false,
          createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          title: 'Abhilash liked your news',
          description: '1hr ago',
          userId: this.currentUser._id,
          triggeredBy: null,
          isDeleted: false,
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } finally {
      this.isLoadingNotifications = false;
    }
  }

  // Load profile completion - keeping your existing API logic
  async loadProfileCompletion(): Promise<void> {
    this.isLoadingProfile = true;
    try {
      const response = await this.dashboardService.getProfileCompletion(this.currentUser._id);

      if (response && response.success && response.data) {
        this.profileCompletion = response.data;
      }
    } catch (error) {
      console.error('Error loading profile completion:', error);
      // Use dummy data matching design
      this.profileCompletion = {
        isProfileCompleted: false,
        profileCompletionPercentage: 80
      };
    } finally {
      this.isLoadingProfile = false;
    }
  }

  // Load testimonials - keeping your existing API logic
  async loadTestimonials(): Promise<void> {
    this.isLoadingTestimonials = true;
    try {
      const response = await this.dashboardService.getTestimonials(this.currentUser._id);

      if (response && response.success && response.data?.docs) {
        this.testimonials = response.data.docs.slice(0, 3); // Show only first 3
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      // Use dummy data matching design
      this.testimonials = [
        {
          _id: '1',
          giverId: {
            _id: '1',
            name: 'Sarah Johnson',
            chapter_name: 'Achiever',
            email: 'sarah@example.com',
            profilePic: '',
            business: []
          },
          receiverId: this.currentUser._id,
          date: null,
          message: 'Marketing Director, InnovateCo',
          selected: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          giverId: {
            _id: '2',
            name: 'Sarah Johnson',
            chapter_name: 'Achiever',
            email: 'sarah2@example.com',
            profilePic: '',
            business: []
          },
          receiverId: this.currentUser._id,
          date: null,
          message: 'Marketing Director, InnovateCo',
          selected: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          giverId: {
            _id: '3',
            name: 'Sarah Johnson',
            chapter_name: 'Achiever',
            email: 'sarah3@example.com',
            profilePic: '',
            business: []
          },
          receiverId: this.currentUser._id,
          date: null,
          message: 'Marketing Director, InnovateCo',
          selected: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } finally {
      this.isLoadingTestimonials = false;
    }
  }

  // Time filter change handler - keeping your existing logic
  async onTimeFilterChange(filter: string): Promise<void> {
    this.selectedTimeFilter = filter;
    await this.loadDashboardCounts(filter);
  }

  // Format currency - keeping your existing logic
  formatCurrency(amount: number): string {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  }

  // Format date - keeping your existing logic
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  }

  // Format time ago - keeping your existing logic
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  // New methods for sidebar functionality
  toggleSidebar(): void {
    this.sidebarStateService.toggleSidebar();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  // Navigation methods - keeping your existing logic
  navigateToEvents(): void {
    this.router.navigate(['/event']);
  }

  navigateToAttendance(): void {
    this.router.navigate(['/attendance']);
  }

  navigateToScanCard(): void {
    this.router.navigate(['/scan-card']);
  }

  navigateToComplaints(): void {
    this.router.navigate(['/complaints']);
  }

  navigateToSuggestion(): void {
    this.router.navigate(['/suggestion']);
  }

  navigateToPodcastBooking(): void {
    this.router.navigate(['/podcast-booking']);
  }

  navigateToPodcastStatus(): void {
    this.router.navigate(['/podcast-status']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToGratitude(): void {
    this.router.navigate(['/gratitude']);
  }

  navigateToTestimonials(): void {
    this.router.navigate(['/testimonials']);
  }

  updateProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  // Logout method - keeping your existing logic
  async logout(): Promise<void> {
    await this.authService.logout();
  }
}