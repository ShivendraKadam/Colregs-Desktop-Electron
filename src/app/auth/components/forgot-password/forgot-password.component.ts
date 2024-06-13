import { Component } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from 'src/services/theme.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'et-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  validateForm!: UntypedFormGroup;
  isDarkTheme!: boolean;
  private themeSubscription!: Subscription;
  companyName: any;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private url: ActivatedRoute
  ) { }

  forgotpassword(): void {
    if (this.validateForm.valid) {
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
  goTologin() {
    this.router.navigate([`${this.companyName}/login`]);
  }
  isEmailValid(): boolean {
    const emailControl = this.validateForm.get('email');
    return emailControl ? emailControl.valid : false;
  }

  async ngOnInit(): Promise<void> {
    this.companyName = this.router.url.split('/')[1];
    console.log(this.companyName);
    this.validateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    const currentTheme = this.themeService.getSavedTheme();
    this.themeSubscription = this.themeService
      .isDarkThemeObservable()
      .subscribe((isDark: boolean) => {
        this.isDarkTheme = isDark;
      });
  }
}
