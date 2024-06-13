import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { EndUserService } from 'src/services/end-user.service';
import { OwnerService } from 'src/services/owner.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as CryptoJS from 'crypto-js';
import { Subscription } from 'rxjs';

import { ThemeService } from 'src/services/theme.service';
import { HostListener } from '@angular/core';
import { MediaService } from 'src/services/media.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('rotate', [
      state('0', style({ transform: 'rotate(0deg)' })),
      state('1', style({ transform: 'rotate(360deg)' })),
      transition('0 <=> 1', animate('0.3s ease')),
    ]),
  ],
})
@HostListener('document:keydown', ['$event'])
export class DashboardComponent {
  isDarkTheme!: boolean;
  private themeSubscription!: Subscription;
  isHoveredMap: { [courseId: string]: boolean } = {};

  learnercomment =
    'Lacus vestibulum ultricies mi risus, duisaaaaaaaaaaaaaaaaas non, volsdssssssssssssssssssssssssssutpat nullam non. Magna congue nisi maecenas elit aliquet eu sed consectetur. Vitae quis cras vitae praesent morbi adipiscing purus consectetur mi.';
  allFeedbacks: any;
  isLoggedIn!: boolean;

  constructor(
    private ownerService: OwnerService,
    public endservice: EndUserService,
    private router: Router,
    private authService: AuthService,
    private message: NzMessageService,
    private themeService: ThemeService,
    private mediaService: MediaService
  ) {}
  companyEmail = 'Navigation under the Sea';
  @ViewChild('widgetsContent', { read: ElementRef })
  widgetsContent!: ElementRef<any>;
  scrollButtonDisabled = { left: true, right: false };
  @ViewChild('widgetsContent2', { read: ElementRef })
  widgetsContent2!: ElementRef<any>;
  scrollButtonDisabled2 = { left2: true, right2: false };

  @ViewChild('widgetsContent3', { read: ElementRef })
  widgetsContent3!: ElementRef<any>;
  scrollButtonDisabled3 = { left3: true, right3: false };
  assignCourses!: any[];

  @ViewChild('allAssignedCourses') allAssignedCourses!: ElementRef;
  @ViewChild('allAssignedCourses1') allAssignedCourses1!: ElementRef;

  videoUrl!: any;
  @ViewChild('videoPlayer')
  videoPlayer!: ElementRef;

  scrollToDiv() {
    const allAssignedCoursesElement = this.allAssignedCourses.nativeElement;
    if (allAssignedCoursesElement) {
      allAssignedCoursesElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToDiv1() {
    const allAssignedCoursesElement1 = this.allAssignedCourses1.nativeElement;
    if (allAssignedCoursesElement1) {
      allAssignedCoursesElement1.scrollIntoView({ behavior: 'smooth' });
    }
  }
  resumeCourse: any;
  fetchcourses() {
    this.endservice.fetchAllCourses(this.userId).subscribe((res: any) => {
      console.log('courses', res);
      this.assignCourses = res;

      this.resumeCourse = this.assignCourses
        .filter((item: any) => item.courseStatus === 'In-Progress')
        .reduce((latest, current) => {
          return !latest ||
            new Date(current.updatedAt) > new Date(latest.updatedAt)
            ? current
            : latest;
        }, null);

      console.log(this.assignCourses);
      console.log('resumeCourse', this.resumeCourse);
    });
  }

  categories: any;
  async fetchcategories() {
    await this.endservice.getDashboardData().subscribe((res: any) => {
      console.log(res);
      this.categories = res.categories;
      this.cacheCategoryThumbnails();
    });
  }

  cacheCategoryThumbnails(): void {
    this.categories.forEach((category: any) => {
      if (category.categoryThumbnail) {
        this.endservice.cacheThumbnailUrl(category.categoryThumbnail);
      }
    });
  }

  deletefromToWishList(data: any) {
    console.log(data);
    this.endservice
      .deleteFromWishlist(data.courseId, this.userId)
      .subscribe(async (res: any) => {
        console.log(res);
        this.fetchcourses();
      });
  }
  async goToCategoryCourses(name: any) {
    await this.router.navigate([`courses/${name}`]);
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
  userId: any;

  async addToWishList(course: any) {
    const isLoggedIn = localStorage.getItem('IsLoggedIn');

    if (isLoggedIn) {
      console.log(course);
      const userId = await this.authService.getIdFromToken();

      await this.endservice
        .addToWishlist(course.courseId, userId)
        .subscribe((res: any) => {
          console.log(res);
          if (res) {
            // this.router.navigate(['user/wishlist']);
            this.message.success('Course added to wishlist');
            this.fetchcourses();
          }
          // window.alert("error adding item , please try again after some time")
        });
    } else {
      this.message.error('Login or Signup then Try again!');
      this.endservice.triggerLogin();
    }
  }
  generateCompanyLogoUrl(data: any): string {
    //console.log(data);
    //console.log(data.type);
    //console.log(data.data);
    if (data) {
      // Assuming data.data contains the logo data
      const base64Logo = this.arrayBufferToBase64(data.data);
      return `data:image/jpeg;base64,${base64Logo}`;
    } else {
      // Return a placeholder URL or handle cases where there's no logo
      return 'path/to/placeholder-image.jpg';
    }
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binaryArray = new Uint8Array(buffer);
    const binaryString = Array.from(binaryArray)
      .map((byte) => String.fromCharCode(byte))
      .join('');
    const btoaa = btoa(binaryString);
    return btoaa;
  }

  ngAfterViewInit() {
    this.endservice.isScroll1$.subscribe(async (isScroll1: boolean) => {
      if (isScroll1) {
        this.scrollToDiv1();
      }
    });
    // Add an event listener to handle scroll events
    this.widgetsContent.nativeElement.addEventListener(
      'scroll',
      this.handleScroll.bind(this)
    );
    this.widgetsContent2.nativeElement.addEventListener(
      'scroll',
      this.handleScroll2.bind(this)
    );
    this.widgetsContent3.nativeElement.addEventListener(
      'scroll',
      this.handleScroll3.bind(this)
    );
    this.endservice.isScroll$.subscribe(async (isScroll: boolean) => {
      if (isScroll) {
        this.scrollToDiv();
      }
    });
  }

  handleScroll() {
    const scrollContainer = this.widgetsContent.nativeElement;
    const maxScrollLeft =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;

    // Check if the scroll position is at the extreme left or right
    this.scrollButtonDisabled.left = scrollContainer.scrollLeft === 0;
    this.scrollButtonDisabled.right =
      scrollContainer.scrollLeft >= maxScrollLeft;

    // You can use these flags to enable/disable the buttons in your HTML
  }
  handleScroll2() {
    const scrollContainer = this.widgetsContent2.nativeElement;
    const maxScrollLeft =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;

    // Check if the scroll position is at the extreme left or right
    this.scrollButtonDisabled2.left2 = scrollContainer.scrollLeft === 0;
    this.scrollButtonDisabled2.right2 =
      scrollContainer.scrollLeft >= maxScrollLeft;

    // You can use these flags to enable/disable the buttons in your HTML
  }

  handleScroll3() {
    const scrollContainer = this.widgetsContent3.nativeElement;
    const maxScrollLeft =
      scrollContainer.scrollWidth - scrollContainer.clientWidth;

    // Check if the scroll position is at the extreme left or right
    this.scrollButtonDisabled3.left3 = scrollContainer.scrollLeft === 0;
    this.scrollButtonDisabled3.right3 =
      scrollContainer.scrollLeft >= maxScrollLeft;

    // You can use these flags to enable/disable the buttons in your HTML
  }

  scrollRight(): void {
    if (!this.scrollButtonDisabled.right) {
      this.widgetsContent.nativeElement.scrollTo({
        left: this.widgetsContent.nativeElement.scrollLeft + 350,
        behavior: 'smooth',
      });
    }
  }
  scrollRight2(): void {
    if (!this.scrollButtonDisabled2.right2) {
      this.widgetsContent2.nativeElement.scrollTo({
        left: this.widgetsContent2.nativeElement.scrollLeft + 350,
        behavior: 'smooth',
      });
    }
  }

  scrollRight3(): void {
    if (!this.scrollButtonDisabled3.right3) {
      this.widgetsContent3.nativeElement.scrollTo({
        left: this.widgetsContent3.nativeElement.scrollLeft + 350,
        behavior: 'smooth',
      });
    }
  }

  scrollLeft(): void {
    if (!this.scrollButtonDisabled.left) {
      this.widgetsContent.nativeElement.scrollTo({
        left: this.widgetsContent.nativeElement.scrollLeft - 350,
        behavior: 'smooth',
      });
    }
  }
  scrollLeft2(): void {
    if (!this.scrollButtonDisabled2.left2) {
      this.widgetsContent2.nativeElement.scrollTo({
        left: this.widgetsContent2.nativeElement.scrollLeft - 350,
        behavior: 'smooth',
      });
    }
  }

  scrollLeft3(): void {
    if (!this.scrollButtonDisabled3.left3) {
      this.widgetsContent3.nativeElement.scrollTo({
        left: this.widgetsContent3.nativeElement.scrollLeft - 350,
        behavior: 'smooth',
      });
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (text?.length <= maxLength) {
      return text;
    } else {
      return text?.slice(0, maxLength) + '...';
    }
  }
  courseTitle: any;
  async goToCourseDetails() {
    (this.courseTitle = '3D COLREGS Training - Basic'),
      this.router.navigate([
        `individual-user/course-details/${this.courseTitle}`,
      ]);
  }

  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${Math.floor(seconds)} sec${seconds !== 1 ? 's' : ''}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  }

  async addToCart(course: any) {
    const isLoggedIn = await localStorage.getItem('IsLoggedIn');
    if (isLoggedIn) {
      await this.endservice
        .addToCart(course.courseId, this.userId)
        .subscribe((res: any) => {
          console.log(res);
          course.addedToCart = true;
        });
    } else {
      this.message.error('Login or Signup then Try again!');

      this.endservice.triggerLogin();
    }
  }

  async goToCart() {
    this.router.navigate(['user/cart']);
  }

  panels = [
    {
      active: false,
      name: 'What is the purpose of the 3D COLREGS course?',
      content:
        'The course is designed to provide a real-world experience in understanding and implementing COLREGS (International Regulations for Preventing Collisions at Sea).',
      customStyle: {
        background: 'white',
        'border-radius': '10px',
        'margin-bottom': '24px',
        padding: '6px 0px',
      },
    },

    {
      active: false,
      name: 'What should users note about the toolbar videos?',
      content:
        'When a user clicks on any toolbar icon, the main video is paused and will resume only when the user clicks on the Bridge view icon again. This ensures users do not miss any information.',
      customStyle: {
        background: 'white',
        'border-radius': '10px',
        'margin-bottom': '24px',
        padding: '6px 0px',
      },
    },
    {
      active: false,
      name: 'What is the time limit for each question?',
      content:
        'Each question is allotted 1 minute, failing which it will be considered a failed attempt.',
      customStyle: {
        background: 'white',
        'border-radius': '10px',
        'margin-bottom': '24px',
        padding: '6px 0px',
      },
    },
    {
      active: false,
      name: 'How is the scoring structured?',
      content:
        'Each level is worth 100 points, divided equally by the number of questions.',
      customStyle: {
        background: 'white',
        'border-radius': '10px',
        'margin-bottom': '24px',
        padding: '6px 0px',
      },
    },
    {
      active: false,
      name: 'What happens if a candidate answers incorrectly on multiple attempts?',
      content:
        'After 4 incorrect attempts, the candidate is redirected to watch the level video, and the assessment resets with a new set of questions.',
      customStyle: {
        background: 'white',
        'border-radius': '10px',
        'margin-bottom': '24px',
        padding: '6px 0px',
      },
    },
  ];
  togglePanel(panel: any): void {
    this.panels.forEach((p) => {
      p.active = p === panel;
    });
  }

  getPanelHeader(panel: any) {
    return panel.name;
  }
  removeHtmlTags(text: string) {
    var plainText = text.replace(/<[^>]*>/g, '');
    return plainText;
  }

  getAllFeedbacks() {
    this.endservice.getAllFeedbacks().subscribe({
      next: async (res: any) => {
        this.allFeedbacks = res;
        console.log('allFeedbacks', this.allFeedbacks);
      },
      error: (Error) => {},
    });
  }

  signup() {
    this.endservice.triggerSignUp();
  }
  courseTrailerUrl: any;
  courseParamsId: any = '1';

  async getTrailer() {
    this.courseTrailerUrl = await this.mediaService.fetchCourseTrailer(
      this.courseParamsId
    );
  }
  async ngOnInit() {
    // this.disableInspectElementFeature();
    // document.addEventListener(
    //   'keydown',
    //   function (event) {
    //     if (event.keyCode == 123) {
    //       event.preventDefault();

    //       alert(
    //         'Inspect element feature is disabled on this website for security reasons.'
    //       );
    //       return false;
    //     } else if (
    //       (event.ctrlKey && event.shiftKey && event.key == 'J') ||
    //       event.key == 'j'
    //     ) {
    //       alert(
    //         'Inspect element feature is disabled on this website for security reasons.'
    //       );
    //       event.preventDefault();
    //       return false;
    //     } else if (
    //       (event.ctrlKey && event.shiftKey && event.key == 'C') ||
    //       event.key == 'c'
    //     ) {
    //       alert(
    //         'Inspect element feature is disabled on this website for security reasons.'
    //       );
    //       event.preventDefault();

    //       return false;
    //     } else if (
    //       (event.ctrlKey && event.shiftKey && event.key == 'I') ||
    //       event.key == 'i'
    //     ) {
    //       alert(
    //         'Inspect element feature is disabled on this website for security reasons.'
    //       );
    //       event.preventDefault();

    //       return false;
    //     } else if (event.ctrlKey && event.shiftKey && event.keyCode == 74) {
    //       event.preventDefault();

    //       alert(
    //         'Inspect element feature is disabled on this website for security reasons.'
    //       );
    //       return false;
    //     } else if (event.ctrlKey && event.keyCode == 85) {
    //       event.preventDefault();

    //       alert(
    //         'Inspect element feature is disabled on this website for security reasons.'
    //       );
    //       return false;
    //     }
    //     return false;
    //   },
    //   false
    // );

    // document.addEventListener(
    //   'contextmenu',
    //   function (e) {
    //     alert(
    //       'Inspect element feature is disabled on this website for security reasons.'
    //     );
    //     e.preventDefault();
    //     return false;
    //   },
    //   false
    // );

    const currentTheme = this.themeService.getSavedTheme();
    this.themeSubscription = this.themeService
      .isDarkThemeObservable()
      .subscribe((isDark: boolean) => {
        this.isDarkTheme = isDark;
      });
    this.endservice.isScroll$.subscribe(async (isScroll: boolean) => {
      if (isScroll) {
        this.scrollToDiv();
      }
    });
    this.endservice.isScroll1$.subscribe(async (isScroll1: boolean) => {
      if (isScroll1) {
        this.scrollToDiv1();
      }
    });
    this.getTrailer();

    this.isLoggedIn = await this.authService.checkIsLoggedIn();
    try {
      this.userId = await this.authService.getIdFromToken();
      console.log('userid', this.userId);
    } finally {
      this.fetchcourses();
      this.fetchcategories();
      this.getAllFeedbacks();
      this.resumeCourse = [] || undefined;
    }
  }
}
