import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  Pipe,
  PipeTransform,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { EndUserService } from 'src/services/end-user.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MediaMatcher } from '@angular/cdk/layout';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UserStoreService } from 'src/services/user-store.service';
import { CookieService } from 'ngx-cookie-service';
import { NzMenuItemDirective } from 'ng-zorro-antd/menu';
import { Observable, Subscribable } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from 'src/services/theme.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/services/user.service';
import { nationalities } from 'src/app/nationalities';
import * as CryptoJS from 'crypto-js';
import { NzSelectComponent } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-individual-user',
  templateUrl: './individual-user.component.html',
  styleUrls: ['./individual-user.component.css'],
})
export class IndividualUserComponent implements OnDestroy {
  validateForm!: UntypedFormGroup;
  LoginForm!: UntypedFormGroup;
  isCollapsed = false;
  userdata: any;

  openSubmenu: any;
  selectedItem: string | null = null;
  resStatus = '';
  resMessage = '';
  selectedNavItem: any;
  showSidebar: boolean = true;
  isSearchBarVisible = false;
  cartlength: any;
  isDarkTheme!: boolean;
  private themeSubscription!: Subscription;
  nationalities = nationalities;
  suggestions: any;
  tempSearchResults: any;
  showLoginModal: Boolean = true;
  selectNavItem(item: string): void {
    this.selectedItem = item;
  }

  scrollTo() {
    this.visible = false;
    this.router.navigate(['']);
    setTimeout(() => {
      this.endService.setIsScroll(true);
    }, 400);
  }

  scrollTo1() {
    this.visible = false;
    this.router.navigate(['']);
    setTimeout(() => {
      this.endService.setIsScroll1(true);
    }, 400);
  }

  // New properties for responsive design
  mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;
  isMobile$:
    | Observable<unknown>
    | Subscribable<unknown>
    | Promise<unknown>
    | undefined;

  constructor(
    private fb: UntypedFormBuilder,
    private auth: AuthService,
    private router: Router,
    private endService: EndUserService,
    private userStore: UserStoreService,
    private cookieService: CookieService,
    private media: MediaMatcher,
    private message: NzMessageService,
    private themeService: ThemeService,
    private userService: UserService,
    private url: ActivatedRoute,
    private authService: AuthService
  ) {
    this.endService.loginEvent$.subscribe(() => {
      this.goToLogin();
    });

    this.endService.signUpEvent$.subscribe(() => {
      this.goToSignup();
    });

    this.validateForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [''],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      nationality: ['', [Validators.required]],

      userDob: ['', [Validators.required]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      confirmpassword: ['', [Validators.required, this.confirmationValidator]],
    });
    this.LoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    // Set up the mobile query listener
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => {
      this.showSidebar = this.mobileQuery.matches;
    };
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  isEmailValid(): boolean {
    const emailControl = this.validateForm.get('email');
    return emailControl ? emailControl.valid : false;
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
    // this.photoUploadSubscription.unsubscribe();
  }

  toggleSubmenu(submenuName: string) {
    this.openSubmenu = this.openSubmenu === submenuName ? null : submenuName;
  }

  breadcrumbs: string[] = [];
  Username = '';
  userId: any;

  isVisibleMiddle: boolean = false;
  passwordVisible = false;
  isVisibleSignup: boolean = false;
  isLoggedIn!: any;
  cartLength$!: Observable<number>;

  async logout() {
    this.router.navigate([`login`]);

    localStorage.removeItem('jwt');
    // await this.cookieService.delete('jwt', '/');
    localStorage.removeItem('expires_at');
    await this.cookieService.delete('_Remember_me');
    localStorage.removeItem('IsLoggedIn');
    this.isLoggedIn = false;
    this.visible = false;
  }

  goToForgotPassword() {
    this.showLoginModal = false;
  }

  categories: any;

  categorycourses: any;
  fetchcourses() {
    this.endService.fetchAllCourses(this.userId).subscribe((res: any) => {
      console.log('courses', res);
      this.categorycourses = res;
      console.log(this.categorycourses);
    });
  }

  async getDashboardData() {
    await this.endService
      .getDashboardData()
      .toPromise()
      .then((res: any) => {
        console.log('categories', res);
        this.categories = res.categories;
        console.log(this.categories);
      });

    // Wait for a short duration (e.g., 100ms) to ensure data is populated
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Assuming this.endService.fetchAllCourses returns a Promise
    const courses = await this.endService
      .fetchAllCourses(this.userId)
      .toPromise();
    this.categorycourses = courses;
    console.log('category courses', this.categorycourses);

    if (this.categories && this.categorycourses) {
      this.categories.forEach(
        (category: { courseCount: any; categoryName: any }) => {
          category.courseCount = this.categorycourses.filter(
            (course: { categories: string | any[] }) =>
              course.categories.includes(category.categoryName)
          ).length;
          console.log(
            'category',
            category.categoryName,
            'course count',
            category.courseCount
          );
        }
      );
    }
  }
  searchResults: string[] = [];

  async onSearch(value: any) {
    this.searchResults = this.tempSearchResults;
    if (value.target.value === '') {
      this.searchResults = [];
    }
  }
  @ViewChild(NzSelectComponent, { static: true })
  selectNode!: NzSelectComponent;

  searchText!: any;
  selectedComponent(value: any) {
    const matchedItem = this.suggestions.find(
      (item: any) => item.courseTitle === value
    );
    console.log('Matched item:', matchedItem);
    if (this.searchText) {
      this.searchText = null;
    }
    this.selectNode.writeValue(undefined);
    this.goToCourseDetails(matchedItem.courseId, matchedItem.courseTitle, true);
  }
  goToPrivacypolicy() {
    this.router.navigate([`privacy-policy`]);
  }
  getNameSuggestion() {
    this.endService.getNameSuggestion().subscribe(async (res: any) => {
      this.suggestions = await res; // [{courseTitle:"hello",courseId:1},{courseTitle:"gello",courseId:2},{courseTitle:"mello",courseId:3},{courseTitle:"zello",courseId:4}]
      //
      console.log('suggestions', this.suggestions);
      this.tempSearchResults = await this.suggestions.map((item: any) => {
        return item.courseTitle;
      });
    });
  }

  async addToCart(courseId: any, userId: any) {
    if (this.isLoggedIn) {
      await this.endService
        .addToCart(courseId, this.userId)
        .subscribe((res: any) => {
          console.log(res);
        });
    } else {
      alert('you have to login first');
    }
  }

  async addToWishList(courseId: any) {
    await this.endService
      .addToWishlist(courseId, this.userId)
      .subscribe((res: any) => {
        console.log(res);
      });
  }

  async deleteItemFromoCart(cartItemId: any) {
    await this.endService
      .addToCart(cartItemId, this.userId)
      .subscribe((res: any) => {
        console.log(res);
      });
  }

  async deleteItemFromWishlist(wishListId: any, userId: any) {
    await this.endService
      .addToCart(wishListId, this.userId)
      .subscribe((res: any) => {
        console.log(res);
      });
  }

  async goToCategoryCourses(name: any) {
    await this.router.navigate([`courses/${name}`]);
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
      this.visible = false;
    });
  }
  toggleTheme(): void {
    this.themeService.toggleTheme().then();
    this.visible = false;
  }
  gotoHome() {
    this.router.navigate([`individual-user/dashboard`]);
    this.visible = false;
  }

  searchdropdown = false;
  opensearchdropdown() {
    this.searchdropdown = true;
  }
  closesearchdropdown() {
    this.searchdropdown = false;
  }

  async login() {
    if (this.LoginForm.valid) {
      await this.endService
        .login(this.LoginForm.value)
        .subscribe((res: any) => {
          console.log(res);

          if (res.success === true) {
            localStorage.setItem('IsLoggedIn', 'true');
            this.isVisibleMiddle = false;
            window.location.reload();
          } else {
            this.resStatus = res.success.toString();
            this.resMessage = res.message;
          }
        });
    } else {
      Object.values(this.LoginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() =>
      this.validateForm.controls['confirmpassword'].updateValueAndValidity()
    );
  }

  confirmationValidator: ValidatorFn = (
    control: AbstractControl
  ): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.validateForm.controls['password'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  signupform: any;
  submitsignup() {
    if (this.validateForm.valid) {
      this.endService
        .createIndividualUser(this.validateForm.value)
        .subscribe((res: any) => {
          if (res.success === true) {
            this.message.success(
              'Your Account has been created successfully, Please Login !'
            );
            this.endService
              .mapAppUsersTOCOLREGS(res.data)
              .subscribe({ next: async (res: any) => {} });
            this.isVisibleMiddle = true;
            this.isVisibleSignup = false;
            this.validateForm.get('password')?.reset();
          } else {
            this.message.error('Email already exists !');
          }
        });
      console.log(this.validateForm.value);
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  navigatedashboard() {
    this.router.navigate([``]);
  }
  goToLogin(): void {
    this.isVisibleMiddle = true;
  }

  goTologinFromForgotPassword() {
    this.showLoginModal = true;
  }
  goToLogin2(): void {
    this.isVisibleMiddle = true;
    this.isVisibleSignup = false;
  }

  handleCancel(): void {
    this.isVisibleMiddle = false;
    this.isVisibleSignup = false;
  }

  goToSignup(): void {
    this.isVisibleSignup = true;
  }

  visible = false;

  toggleSidebar() {
    this.visible = true;
  }
  close(): void {
    this.visible = false;
  }
  file: string = '';
  firstname: any;
  lastname: any;
  private photoUploadSubscription!: Subscription;
  async fetchUserByUserId() {
    await this.userService.fetchUserByUserId(this.userId).subscribe({
      next: async (res: any) => {
        this.userdata = res;
        this.file = this.userdata.profilePhoto;

        this.firstname = this.userdata.firstName;

        this.lastname = this.userdata.lastName;
      },

      error: (err) => {},
    });
  }

  toggleSearchBar() {
    console.log('Toggle Search Bar');
    this.isSearchBarVisible = !this.isSearchBarVisible;
    console.log('isSearchBarVisible:', this.isSearchBarVisible);
  }

  getCartItems(id: any) {
    this.endService.getCartItem(id).subscribe((res: any) => {
      console.log(res);
      if (res) {
        this.cartlength = res.length;
      }
    });
  }

  assignCourses: any;
  totalcountofcards: any;
  fetchMylearningcourses() {
    this.endService
      .fetchMylearningcourses(this.userId)
      .subscribe((res: any) => {
        console.log(res);
        if (res) {
          console.log('mylearningCourses', res);
          this.assignCourses = res.slice(0, 5);

          this.totalcountofcards = res.length;
        }
      });
  }

  mylearninfdropdown = false;
  coursecateoriesdropdown = false;

  async goToCourseDetails(id: any, courseTitle: any, isSubscribed: Boolean) {
    localStorage.setItem('courseTitle', courseTitle);
    const encryptedCourseId = CryptoJS.AES.encrypt(
      id.toString(),
      'encryptionKey'
    ).toString();

    if (this.authService.checkIsLoggedIn() && isSubscribed) {
      this.router.navigate([`course-details/${courseTitle}`], {
        queryParams: {
          id: encryptedCourseId,
        },
      });
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    } else {
      this.router.navigate([`preview-course/${courseTitle}`], {
        queryParams: {
          id: encryptedCourseId,
        },
      });
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }

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

  async ngOnInit() {
    this.url.url.subscribe((urlSegments) => {
      console.log('URL Segments:', urlSegments); // Log URL segments
      const path = urlSegments.map((segment) => segment.path).join('/');
      if (path === 'user-guidelines') {
        this.selectedItem = 'Home';
      } else if (path === 'mylearning') {
      }
    });
    this.isLoggedIn = localStorage.getItem('IsLoggedIn');

    if (this.isLoggedIn) {
      this.userId = await this.auth.getIdFromToken();
      await this.fetchUserByUserId();
      this.getCartItems(this.userId);
      this.endService.cartLength$.subscribe((res: any) => {
        this.cartlength = res;
      });

      this.fetchMylearningcourses();
    }
    this.fetchcourses();

    this.getDashboardData();
    this.getNameSuggestion();
    const currentTheme = this.themeService.getSavedTheme();
    this.themeSubscription = this.themeService
      .isDarkThemeObservable()
      .subscribe((isDark: boolean) => {
        this.isDarkTheme = isDark;
      });
    // Initialize showSidebar based on the initial window width
    this.showSidebar = this.mobileQuery.matches;
  }
}

@Pipe({
  name: 'LimitWords',
})
export class LimitWordsPipe implements PipeTransform {
  transform(value: string, wordLimit: number = 50): string {
    if (!value) return '';

    // Split by spaces to get words array, limit to 'wordLimit' words
    const wordsArray = value.split(/\s+/);
    const limitedWords = wordsArray.slice(0, wordLimit).join(' ');

    // Append '...' if original text had more words than the limit
    return wordsArray.length > wordLimit ? limitedWords + '...' : limitedWords;
  }
}
