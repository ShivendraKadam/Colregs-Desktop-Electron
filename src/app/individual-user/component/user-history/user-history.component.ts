import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeafarerService } from 'src/services/seafarer.service';
import { AuthService } from 'src/services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from 'src/services/theme.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
@Component({
  selector: 'app-user-history',
  templateUrl: './user-history.component.html',
  styleUrls: ['./user-history.component.css'],
})
export class UserHistoryComponent implements OnInit, OnDestroy {
  userId: any;
  truncateLength = 60;

  assementRecord: any;
  groupedQuestions: Map<number, any[]> = new Map();
  totalQuestions!: number;
  resultForm!: FormGroup;
  totalQuestion: any;
  responseArray!: any[];
  assignCourses: any;
  isModalVisible = false;
  levelArray: any[] = [];
  companyName: any;
  payLoad: any;
  isDarkTheme!: boolean;
  themeSubscription!: Subscription;
  breadcrumbs: string[] = [];
  Username = '';
  subscriptions = new Subscription();

  constructor(
    private seaService: SeafarerService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private themeService: ThemeService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.resultForm = this.formBuilder.group({});
  }

  async getAssignedCourse() {
    this.subscriptions.add(
      await this.seaService
        .getAssignedCourse(this.userId)
        .subscribe((res: any) => {
          console.log(res);
          this.assignCourses = res;
        })
    );
  }
  expandSet = false;

  openCourseLevels(videos: any, document: any) {
    let allItems = [...videos, ...document];
    // Sort allItems array based on the 'order' property
    allItems.sort((a, b) => a.order - b.order);
    // Clear levelArray and push sorted items
    this.levelArray = [];
    for (let item of allItems) {
      this.levelArray.push(item);
    }
    // this.isModalVisible = true;
    console.log('levelArray', this.levelArray);
    this.expandSet = true;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isModalVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isModalVisible = false;
  }

  getAssessments(item: any) {
    console.log('getAssessments', item);
    if (item.documentId) {
      console.log('Document');
      this.router.navigate([`individual-user/user/assessment-history`], {
        queryParams: {
          id: item.documentId,
          type: 'Document',
        },
      });
    } else if (item.videoId) {
      console.log('Video');
      this.router.navigate([`individual-user/user/assessment-history`], {
        queryParams: {
          id: item.videoId,
          type: 'Video',
        },
      });
    }
  }
  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }
  async ngOnInit() {
    const currentTheme = this.themeService.getSavedTheme();
    this.subscriptions.add(
      (this.themeSubscription = this.themeService
        .isDarkThemeObservable()
        .subscribe((isDark: boolean) => {
          this.isDarkTheme = isDark;
        }))
    );

    this.userId = await this.authService.getIdFromToken();
    this.companyName = await this.authService.getCompanyNameFromTOken();
    this.payLoad = await this.authService.getToken();
    this.subscriptions.add(
      this.breakpointObserver
        .observe([
          Breakpoints.Small,
          Breakpoints.Medium,
          Breakpoints.Large,
          Breakpoints.XLarge,
        ])
        .subscribe((result) => {
          if (result.matches) {
            if (
              result.breakpoints[Breakpoints.XLarge] ||
              result.breakpoints[Breakpoints.Large]
            ) {
              this.truncateLength = 150;
            } else {
              this.truncateLength = 60;
            }
          }
        })
    );

    console.log('payLoad', this.payLoad);
    this.getAssignedCourse();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
