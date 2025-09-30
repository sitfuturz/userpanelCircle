import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from 'src/env/env.local';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileService, UserProfile, BusinessDetails, BioDetails, GrowthSheet, SocialMedia } from '../../../services/profile.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // User data
  userProfile: UserProfile | null = null;
  
  // Accordion states
  expandedSection: string | null = null;
  
  // Loading states
  isLoading = false;
  isUpdatingProfile = false;
   imageurl = environment.imageUrl;
  
  // Edit states
  isEditMode = false;
  editingSection: string | null = null;
  editableData: any = {};
  editablePersonalData: any = {};

  constructor(
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Load user profile data
   */
  loadUserProfile(): void {
    this.isLoading = true;
    
    try {
      // First try to get from localStorage
      this.userProfile = this.profileService.getUserProfileFromStorage();
      
      if (!this.userProfile) {
        // If not in localStorage, fetch from API
        this.fetchProfileFromAPI();
      } else {
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.isLoading = false;
    }
  }

  /**
   * Fetch profile from API
   */
  private async fetchProfileFromAPI(): Promise<void> {
    try {
      this.userProfile = await this.profileService.getUserProfile();
    } catch (error) {
      console.error('Error fetching profile from API:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Toggle accordion section
   */
  toggleSection(section: string): void {
    this.expandedSection = this.expandedSection === section ? null : section;
  }

  /**
   * Check if section is expanded
   */
  isSectionExpanded(section: string): boolean {
    return this.expandedSection === section;
  }

  /**
   * Get user's profile picture URL
   */
  getProfilePictureUrl(): string {
    if (this.userProfile?.profilePic && this.userProfile.profilePic.trim() !== '') {
      return this.userProfile.profilePic;
    }
    return this.profileService.getDefaultAvatar();
  }

  /**
   * Get user's primary business
   */
  getPrimaryBusiness(): BusinessDetails | null {
    if (!this.userProfile) return null;
    return this.profileService.getPrimaryBusiness(this.userProfile);
  }

  /**
   * Get user's full address
   */
  getFullAddress(): string {
    if (!this.userProfile) return '';
    return this.profileService.formatFullAddress(this.userProfile);
  }

  /**
   * Get active social media links
   */
  getActiveSocialMediaLinks(): Array<{platform: string, url: string}> {
    if (!this.userProfile?.SocialMedia) return [];
    return this.profileService.getActiveSocialMediaLinks(this.userProfile.SocialMedia);
  }

  /**
   * Handle profile picture error
   */
  onProfilePictureError(event: any): void {
    event.target.src = this.profileService.getDefaultAvatar();
  }

  /**
   * Format date for display
   */
  formatDate(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return 'Not provided';
    
    try {
      let date: Date;
      
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return 'Not provided';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  /**
   * Get bio details value or default
   */
  getBioValue(key: keyof BioDetails): string {
    if (!this.userProfile?.bioDetails) return 'Not provided';
    const value = this.userProfile.bioDetails[key];
    return value && value.trim() !== '' ? value : 'Not provided';
  }

  /**
   * Get growth sheet value or default
   */
  getGrowthSheetValue(key: keyof GrowthSheet): string {
    if (!this.userProfile?.growthSheet) return 'Not provided';
    const value = this.userProfile.growthSheet[key];
    return value && value.trim() !== '' ? value : 'Not provided';
  }

  /**
   * Get social media icon class
   */
  getSocialMediaIcon(platform: string): string {
    const iconMap: {[key: string]: string} = {
      'Facebook': 'fab fa-facebook-f',
      'Instagram': 'fab fa-instagram',
      'LinkedIn': 'fab fa-linkedin-in',
      'Twitter': 'fab fa-twitter',
      'YouTube': 'fab fa-youtube',
      'WhatsApp': 'fab fa-whatsapp'
    };
    
    return iconMap[platform] || 'fas fa-link';
  }

  /**
   * Open social media link
   */
  openSocialMediaLink(url: string): void {
    if (url && url.trim() !== '') {
      // Ensure URL has protocol
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Handle edit profile action
   */
  onEditProfile(): void {
    this.isEditMode = true;
    // Initialize editable data with current profile data
    this.editableData = { ...this.userProfile };
  }

  /**
   * Handle edit personal details action
   */
  onEditPersonalDetails(): void {
    this.isEditMode = true;
    this.editingSection = 'personal';
    // Initialize editable personal data with current profile data
    this.editablePersonalData = {
      name: this.userProfile?.name || '',
      email: this.userProfile?.email || '',
      emergency_contact: this.userProfile?.emergency_contact || '',
      introduction_details: this.userProfile?.introduction_details || '',
      address: this.userProfile?.address || ''
    };
  }

  /**
   * Handle cancel edit action
   */
  onCancelEdit(): void {
    this.isEditMode = false;
    this.editingSection = null;
    this.editableData = {};
    this.editablePersonalData = {};
  }

  /**
   * Handle cancel personal details edit action
   */
  onCancelPersonalDetails(): void {
    this.isEditMode = false;
    this.editingSection = null;
    this.editablePersonalData = {};
  }

  /**
   * Handle save profile action
   */
  async onSaveProfile(): Promise<void> {
    if (!this.editableData || !this.userProfile) return;

    this.isUpdatingProfile = true;
    
    try {
      const updatedProfile = await this.profileService.updateUserProfile(this.editableData);
      this.userProfile = updatedProfile;
      this.isEditMode = false;
      this.editingSection = null;
      this.editableData = {};
      
      await swalHelper.showToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      await swalHelper.showToast('Failed to update profile', 'error');
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  /**
   * Handle save personal details action
   */
  async onSavePersonalDetails(): Promise<void> {
    if (!this.editablePersonalData || !this.userProfile) return;

    this.isUpdatingProfile = true;
    
    try {
      const updatedProfile = await this.profileService.updateUserProfile(this.editablePersonalData);
      this.userProfile = updatedProfile;
      this.isEditMode = false;
      this.editingSection = null;
      this.editablePersonalData = {};
      
      await swalHelper.showToast('Personal details updated successfully', 'success');
    } catch (error) {
      console.error('Error updating personal details:', error);
      await swalHelper.showToast('Failed to update personal details', 'error');
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  /**
   * Handle delete account action
   */
  // async onDeleteAccount(): Promise<void> {
  //   const confirmation = await swalHelper.confirmation(
  //     'Delete Account',
  //     'Are you sure you want to delete your account? This action cannot be undone.',
  //     'warning'
  //   );

  //   if (confirmation.isConfirmed) {
  //     try {
  //       await this.profileService.deleteUserAccount();
  //       // Redirect to login or home page
  //       window.location.href = '/login';
  //     } catch (error) {
  //       console.error('Error deleting account:', error);
  //     }
  //   }
  //}

  /**
   * Handle profile picture change
   */
  async onProfilePictureChange(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      await swalHelper.showToast('Please select a valid image file (JPEG, PNG, GIF)', 'error');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      await swalHelper.showToast('File size must be less than 5MB', 'error');
      return;
    }

    this.isLoading = true;
    
    try {
      const profilePicUrl = await this.profileService.uploadProfilePicture(file);
      
      if (this.userProfile && profilePicUrl) {
        this.userProfile.profilePic = profilePicUrl;
      }
      
      // Reload profile to get updated data
      await this.loadUserProfile();
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      // Don't show error toast here as the service already shows it
    } finally {
      this.isLoading = false;
      // Clear the file input
      event.target.value = '';
    }
  }
 

  /**
   * Get section header icon
   */
  getSectionIcon(section: string): string {
    const iconMap: {[key: string]: string} = {
      'personal': 'fas fa-user',
      'business': 'fas fa-briefcase',
      'bio': 'fas fa-info-circle',
      'growth': 'fas fa-chart-line',
      'social': 'fas fa-share-alt'
    };
    
    return iconMap[section] || 'fas fa-circle';
  }

  /**
   * Get business category display
   */
  getBusinessCategoryDisplay(business: BusinessDetails): string {
    if (business.category && business.sub_category) {
      return `${business.category} - ${business.sub_category}`;
    }
    return business.category || 'Not specified';
  }

  /**
   * Get business products/services display
   */
  getBusinessProductsDisplay(business: BusinessDetails): string {
    const products = business.product || '';
    const services = business.service || '';
    
    if (products && services) {
      return `${products}, ${services}`;
    }
    return products || services || 'Not specified';
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return 'Not provided';
    
    // Simple formatting for 10-digit numbers
    if (phoneNumber.length === 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    }
    
    return phoneNumber;
  }

  /**
   * Get user initials for avatar fallback
   */
  getUserInitials(): string {
    if (!this.userProfile?.name) return 'U';
    
    const nameParts = this.userProfile.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return this.userProfile.name[0].toUpperCase();
  }

  /**
   * Check if user has complete profile
   */
  isProfileComplete(): boolean {
    if (!this.userProfile) return false;
    
    const requiredFields = [
      this.userProfile.name,
      this.userProfile.email,
      this.userProfile.mobile_number,
      this.userProfile.address
    ];
    
    return requiredFields.every(field => field && field.trim() !== '');
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletionPercentage(): number {
    if (!this.userProfile) return 0;
    
    const fields = [
      this.userProfile.name,
      this.userProfile.email,
      this.userProfile.mobile_number,
      this.userProfile.address,
      this.userProfile.profilePic,
      this.userProfile.introduction_details,
      this.userProfile.date_of_birth,
      // Business fields
      this.getPrimaryBusiness()?.business_name,
      this.getPrimaryBusiness()?.category,
      // Bio fields
      this.userProfile.bioDetails?.myBurningDesire,
      this.userProfile.bioDetails?.hobbies
    ];
    
    const completedFields = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }
}