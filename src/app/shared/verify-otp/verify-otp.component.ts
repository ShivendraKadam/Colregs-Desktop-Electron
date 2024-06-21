import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemeService } from 'src/services/theme.service';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { EndUserService } from 'src/services/end-user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css'],
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  @Input() email: string | undefined;
  isDarkTheme!: boolean;
  otpForm!: FormGroup;
  private themeSubscription!: Subscription;

  isResendDisabled = true;
  resendCountdown = 60;
  private initialResendCountdown = 60;
  private resendInterval = 30;

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private endService: EndUserService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.otpForm = this.fb.group({
      otp1: ['', [Validators.required, Validators.maxLength(1)]],
      otp2: ['', [Validators.required, Validators.maxLength(1)]],
      otp3: ['', [Validators.required, Validators.maxLength(1)]],
      otp4: ['', [Validators.required, Validators.maxLength(1)]],
    });

    this.themeSubscription = this.themeService
      .isDarkThemeObservable()
      .subscribe((isDark: boolean) => {
        this.isDarkTheme = isDark;
      });

    // Initialize the countdown timer
    this.startResendCountdown(this.initialResendCountdown);
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  onKeyUp(
    event: KeyboardEvent,
    nextInput: HTMLInputElement | null,
    prevInput?: HTMLInputElement,
    isLastInput?: boolean
  ): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value && value.length === 1) {
      if (nextInput) {
        nextInput.focus();
      } else if (isLastInput && this.otpForm.valid) {
        this.onSubmit();
      }
    } else if (value === '' && prevInput) {
      prevInput.focus();
    }
  }
  errorMessage: any;
  @Output() otpVerified: EventEmitter<void> = new EventEmitter<void>();
  @Input() action: string = ''; // Default action is 'createUser'

  onSubmit() {
    if (this.otpForm.valid) {
      const otp = Object.values(this.otpForm.value).join('');
      const data = { email: this.email, otp: otp, action: this.action };
      console.log('OTP Entered:', otp);
      this.endService.verifyOtp(data).subscribe((response: any) => {
        if (response.success) {
          if (response.action === 'forgotPasswordotpverified') {
            this.message.success(response.message);
          } else {
            this.message.success('User created Successfully!');
            this.otpVerified.emit();
          }
        } else {
          // Display error message
          this.message.error(response.message);
        }
        // Handle response from backend
      });
    }
    (error: any) => {
      // Handle error response
      this.errorMessage = 'An error occurred. Please try again.';
      console.error(error);
    };
  }

  onResendCode() {
    const data = { email: this.email };

    if (data) {
      this.endService.resendOtp(data).subscribe((response: any) => {
        if (response.success) {
          this.message.success('A new OTP has been sent to your email!');
        } else {
          this.message.error('Failed to send a new OTP. Please try again.');
        }
      });
    }

    this.isResendDisabled = true;
    this.startResendCountdown(60); // Disable button for another 20 seconds after clicking
  }

  private startResendCountdown(seconds: number) {
    this.resendCountdown = seconds;
    this.isResendDisabled = true;

    const countdown$ = interval(1000).pipe(take(seconds + 1));
    countdown$.subscribe((count) => {
      this.resendCountdown = seconds - count;
      if (this.resendCountdown === 0) {
        this.isResendDisabled = false;
      }
    });
  }
}
