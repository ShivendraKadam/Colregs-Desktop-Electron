import { Component } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { UserStoreService } from 'src/services/user-store.service';
import { CookieService } from 'ngx-cookie-service';
import { OwnerService } from 'src/services/owner.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ThemeService } from 'src/services/theme.service';
import { Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EndUserService } from 'src/services/end-user.service';
import { nationalities } from 'src/app/nationalities';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
export const flipAnimation = [
  trigger('flipState', [
    state(
      'login',
      style({
        transform: 'rotateY(0)',
      })
    ),
    state(
      'signup',
      style({
        transform: 'rotateY(180deg)',
      })
    ),
    transition('login => signup', animate('600ms ease-out')),
    transition('signup => login', animate('600ms ease-in')),
  ]),
];
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  validateForm!: UntypedFormGroup;
  passwordVisible = false;
  disabled = true;
  nationalities = nationalities;
  signupForm!: UntypedFormGroup;
  isFlipped = false;

  resStatus = '';
  resMessage = '';
  password?: string;
  companyName?: any;
  imageUrl: SafeUrl | null = null; // Safe URL for the image
  loginDisabled: Boolean = false;
  isDarkTheme!: boolean;
  private themeSubscription!: Subscription;
  userId: any;
  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private userStore: UserStoreService,
    private cookieService: CookieService,
    private router: Router,
    private url: ActivatedRoute,
    private ownerService: OwnerService,
    private sanitizer: DomSanitizer,
    private themeService: ThemeService,
    private message: NzMessageService,
    private endService: EndUserService
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      // remember: [false],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      nationality: ['', [Validators.required]],

      userDob: ['', [Validators.required]],
      phone: [
        '',
        [
          Validators.pattern(/^\+?\d{0,4}[0-9]{10}$/),
          Validators.minLength(10),
          Validators.maxLength(13),
        ],
      ],
      confirmpassword: ['', [Validators.required, this.confirmationValidator]],
    });
    this.validateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false],
    });
  }
  confirmationValidator: ValidatorFn = (
    control: AbstractControl
  ): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.signupForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  isEmailValid(): boolean {
    const emailControl = this.signupForm.get('email');
    return emailControl ? emailControl.valid : false;
  }

  submitsignup() {
    if (this.signupForm.valid) {
      this.endService
        .createIndividualUser(this.signupForm.value)
        .subscribe((res: any) => {
          if (res.success === true) {
            this.message.success(
              'Your Account has been created successfully, Please Login !'
            );

            this.signupForm.reset();

            this.endService
              .mapAppUsersTOCOLREGS(res.data)
              .subscribe({ next: async (res: any) => {} });

            this.flipToLogin();
            this.signupForm.get('password')?.reset();
          } else {
            this.message.error('Email already exists !');
          }
        });
      console.log(this.signupForm.value);
    } else {
      Object.values(this.signupForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  fetchCompanyByCompanyName() {
    this.ownerService.fetchCompanyByCompanyName(this.companyName).subscribe({
      next: (res: any) => {
        console.log(res);
        this.imageUrl = res.companyLogo;
      },
      error: (e: any) => {
        this.imageUrl =
          'assets/images/Logo with Name to right - Full Colour.png';
      },
    });
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() =>
      this.validateForm.controls['confirmpassword'].updateValueAndValidity()
    );
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binaryArray = new Uint8Array(buffer);
    const binaryString = Array.from(binaryArray)
      .map((byte) => String.fromCharCode(byte))
      .join('');
    const btoaa = btoa(binaryString);
    return btoaa;
  }

  async login() {
    if (this.validateForm.valid) {
      this.loginDisabled = true;
      await this.endService.login(this.validateForm.value).subscribe({
        next: async (res) => {
          console.log(res);

          if (res.success === true) {
            this.loginDisabled = false;
            localStorage.setItem('IsLoggedIn', 'true');
            if (res.isTermsRead) {
              this.router.navigate([`individual-user/dashboard`]);
            } else {
              this.router.navigate([`privacy-policy`]);
            }
          } else {
            this.loginDisabled = false;
            this.resStatus = res.success.toString();
            this.resMessage = res.message;
          }
        },
        error: (Error) => {
          this.message.error(
            'We are currently experiencing server issues,Please try again after some time!'
          );
          // alert(JSON.stringify(Error));
          this.loginDisabled = false;
        },
      });
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  signup() {}

  goToForgotPassword() {
    this.router.navigate([`${this.companyName}/forgotpassword`]);
  }

  savedOBJ: any;
  async autoLogin() {
    const isLoggedIn = localStorage.getItem('IsLoggedIn');
    this.savedOBJ = await localStorage.getItem('_Remember_me');
    const parsedOBJ = JSON.parse(this.savedOBJ);
    if (parsedOBJ) {
      console.log('savedOBJ', this.savedOBJ);
      console.log('parsedOBJ', parsedOBJ);
      this.validateForm.get('email')?.patchValue(parsedOBJ.email);
      this.validateForm.get('password')?.patchValue(parsedOBJ.password);
      this.validateForm.get('remember')?.patchValue(parsedOBJ.remember);
      if (isLoggedIn === 'true' && parsedOBJ.remember) {
        await this.endService.login(this.validateForm.value).subscribe({
          next: async (res) => {
            console.log(res);
            if (res.success === true) {
              localStorage.setItem('IsLoggedIn', 'true');
              if (res.isTermsRead) {
                this.router.navigate([`individual-user/dashboard`]);
              } else {
                this.router.navigate([`privacy-policy`]);
              }
            } else {
              this.resStatus = res.success.toString();
              this.resMessage = res.message;
            }
          },
          error: (Error) => {
            this.message.error(
              'We are currently experiencing server issues,Please try again after some time!'
            );
            // alert(JSON.stringify(Error));
          },
        });
      }
    }

    this.validateForm.get('email')?.setValue(parsedOBJ.email);
    this.validateForm.get('password')?.setValue(parsedOBJ.password);
  }

  flipToSignup() {
    this.isFlipped = true;
  }

  flipToLogin() {
    this.isFlipped = false;
  }

  ngOnInit(): void {
    this.autoLogin();

    const currentTheme = this.themeService.getSavedTheme();
    const path = window.location.pathname;
    this.companyName = path.split('/')[1];
    console.log(this.companyName);
    this.themeSubscription = this.themeService
      .isDarkThemeObservable()
      .subscribe((isDark: boolean) => {
        this.isDarkTheme = isDark;
      });
    this.fetchCompanyByCompanyName();
  }
}
