import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { swalHelper } from '../../../core/constants/swal-helper';
import { CustomerAuthService } from '../../../services/auth.service';
import { DigitOnlyDirective } from '../../../core/directives/digit-only';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-login.component.html',
  styleUrls: ['./customer-login.component.css'],
})
export class CustomerLoginComponent {
  mobileNumber: string = '';
  isLoading: boolean = false;
  
  constructor(
    private router: Router,
    private authService: CustomerAuthService
  ) {}

  async sendOtp() {
    console.log('sendOtp called with mobile number:', this.mobileNumber);
    
    if (!this.validateMobileNumber()) {
      console.log('Mobile number validation failed');
      return;
    }

    this.isLoading = true;
    try {
      console.log('Calling authService.sendLoginOtp...');
      const success = await this.authService.sendLoginOtp(this.mobileNumber);
      console.log('sendLoginOtp returned:', success);
      
      if (success) {
        console.log('OTP sent successfully, navigating to verification...');
        // Navigate to verification screen with mobile number as query param
        await this.router.navigate(['/verification'], {
          queryParams: { mobile: this.mobileNumber }
        });
        console.log('Navigation completed');
      } else {
        console.log('OTP sending failed');
        // Show error message if OTP sending failed
        swalHelper.showToast('Failed to send OTP. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      swalHelper.showToast('An error occurred. Please try again.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  validateMobileNumber(): boolean {
    if (!this.mobileNumber) {
      swalHelper.showToast('Please enter mobile number', 'warning');
      return false;
    }
    
    if (this.mobileNumber.length !== 10) {
      swalHelper.showToast('Please enter valid 10-digit mobile number', 'warning');
      return false;
    }
    
    return true;
  }
}