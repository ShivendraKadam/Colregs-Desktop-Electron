import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { SeafarerService } from 'src/services/seafarer.service';
import { AuthService } from 'src/services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { jsPDF } from 'jspdf';

import { VgApiService } from '@videogular/ngx-videogular/core';
import { VgFullscreenApiService } from '@videogular/ngx-videogular/core';

import { MediaService } from 'src/services/media.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';

import { UserService } from 'src/services/user.service';
import { MediaConstants } from 'src/utils/constants';
import { CookieService } from 'ngx-cookie-service';

import Hls from 'hls.js';
import * as Plyr from 'plyr';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { ThemeService } from 'src/services/theme.service';
import { Subscription } from 'rxjs';
import { query, stagger } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';

interface VideoSource {
  src: string;
  type: string;
}
@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css'],
  animations: [
    trigger('fadeInOut', [
      state(
        'in',
        style({
          opacity: 1,
          color: 'white', // Change to the desired color
        })
      ),
      state(
        'out',
        style({
          opacity: 0,
          color: 'transparent', // Change to the desired color
        })
      ),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('100ms ease-in-out', style({ opacity: 0 })),
      ]),
    ]),
    trigger('fadeIn', [
      transition('* => *', [
        // each time the binding value changes
        query(
          ':enter',
          [
            style({ opacity: 0 }),
            stagger('100ms', [animate('10s', style({ opacity: 1 }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class CourseDetailsComponent implements OnInit, OnDestroy {
  course: any;
  videos: any;
  Doc: any;
  posts: any;
  isRed: boolean = false;
  documents: any;
  videoStream!: Blob;
  contentDisposition!: string;
  downloadProgress!: number;
  videoUrl!: any;
  bridgeVideoSrc!: any;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('videoPlayer1') videoPlayer1!: ElementRef;

  @ViewChild('pdfViewer') pdfViewer!: ElementRef;
  pdfPreviewModalVisible = false;
  pdfPreviewUrl: string | null = null;

  switchValue = false;
  elementActive = true;
  showVideo: Boolean = false;
  isAssessment!: Boolean;
  videoFinished: Boolean = false;
  showDocument: Boolean = false;
  onPageLoaded: Boolean = true;

  commentForm!: FormGroup<{
    postValue: FormControl<string>;
    commentValue: FormControl<string>;
  }>;
  totalRatings: number = 0;
  sumOfRatings: number = 0;
  averageRating: number = 0;
  totalReview: number = 0;
  isVisibleMiddle: boolean = false;
  totalOneStar: number = 0;
  totalTwoStar: number = 0;
  totalThreeStar: number = 0;
  totalFourStar: number = 0;
  totalFiveStar: number = 0;
  totalStar: number = 0;
  isCertificateDisabled: Boolean = false;
  private inactivityTimer: any; // Timer to track inactivity

  formatOne = (totalOneStar: number): string =>
    `${((totalOneStar * this.totalStar) / 100).toFixed(0)}`;
  formatTwo = (totalTwoStar: number): string =>
    `${((totalTwoStar * this.totalStar) / 100).toFixed(0)}`;
  formatThree = (totalThreeStar: number): string =>
    `${((totalThreeStar * this.totalStar) / 100).toFixed(0)}`;
  formatFour = (totalFourStar: number): string =>
    `${((totalFourStar * this.totalStar) / 100).toFixed(0)}`;
  formatFive = (totalFiveStar: number): string =>
    `${((totalFiveStar * this.totalStar) / 100).toFixed(0)}`;
  userId: any;
  courseUser: any;
  items: any;
  courseThumbnail: any;
  videoThumb!: any;
  videoId: any;
  isVideoPlaying: boolean = false;
  rewatchClicked: boolean = false;
  showRewatchandAssessment: boolean = false;
  currentVideoThumbnail: any;
  currentVideoIndex!: number;
  isPlayNext: boolean = false;
  isRatingVisible: boolean = false;
  courseCompleted: boolean = false;
  companyId: any;
  mappedItems: any;
  currentOrder: any;
  lastRenderedPage: any;
  totalPages: any;
  companyName: any;
  courseThumbnailCache: string | null = null;
  assessmentrecord: any = '';
  isPDFVisible: Boolean = false;
  isHovered = false;
  noOfVideos!: number;
  noOfDocuments!: number;
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  templateContent!: any;
  htmlContent: any;
  name!: string;
  date!: string;
  currentTime: any = 0;
  isDarkTheme!: boolean;
  private themeSubscription!: Subscription;
  isToolbar: any;
  currentBridgeVideoTIme!: any;
  toolbarObjectives: any;
  playerViewTime: number = 0;
  PlayerInterval: any;
  isPlayerPlaying: boolean = false;
  remainingSections!: number;
  goBackDisabled: Boolean = false;
  lastWatchOrder: any;
  currentVideoPlaylist: any;
  currentVideoProgress: any;
  currentVideoDuration!: any;
  courseTitle: any;
  isImagePlaying: boolean = false;
  videoData: any;
  isCOlREGS: any;
  orderArray: any;
  videoTitle: any;

  subcriptions = new Subscription();

  constructor(
    private url: ActivatedRoute,
    private seaService: SeafarerService,
    private router: Router,
    private auth: AuthService,
    private fb: UntypedFormBuilder,
    private api: VgApiService,
    private videoFullScreenApi: VgFullscreenApiService,
    private mediaService: MediaService,
    private message: NzMessageService,
    private el: ElementRef,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private modal: NzModalService,
    private http: HttpClient,
    private userService: UserService,
    private themeService: ThemeService,
    private cookieService: CookieService,
    private sanitizer: DomSanitizer
  ) {
    this.commentForm = this.fb.group({
      postValue: [''],
      commentValue: [''],
    });

    this.buttonClickSound.src =
      'assets/sounds/Smart_UI_Interface_Melodic_Bass_Tonal_03_Stock_Sine_Blimp.wav';
  }

  allPanelsExpanded: boolean = false;

  toggleAllPanels() {
    this.allPanelsExpanded = !this.allPanelsExpanded;
    this.loadMoreCourses();
  }

  async getUserDetails(id: any) {
    this.subcriptions.add(
      await this.seaService
        .fetchCourses(id, this.userId)
        .subscribe((res: any) => {
          console.log('course', res);

          this.course = res.course;
          this.isCOlREGS = res.course.isCOLREGS;

          this.courseUser = res.courseUser;
          this.courseTitle = this.course.courseTitle;
          this.noOfVideos = res.course.noOfVideos;
          this.noOfDocuments = res.course.noOfDocuments;
        })
    );

    await this.fetchCourseContent(id).then(async (res: any) => {
      // this.fetchCourseAssests()

      await this.mappedItems.map((item: any) => {
        if (item.order == this.currentOrder) {
          const currentVideoId = item.videoId;
          this.fetchBestAssessmentRecord(currentVideoId);
        }
      });
    });

    this.fetchCourseThumbnail(id);
  }

  async fetchCourseThumbnail(id: any) {
    if (this.courseThumbnailCache) {
      // Use the cached courseThumbnail URL
      this.courseThumbnail = this.courseThumbnailCache;
    } else {
      // Fetch the courseThumbnail from the server
      this.subcriptions.add(
        this.mediaService
          .fetchCourseThumbnail(id)
          .subscribe(async (res: any) => {
            this.courseThumbnail = res;

            // Cache the fetched courseThumbnail
            this.courseThumbnailCache = this.courseThumbnail;
          })
      );
    }
  }

  fetchCourseContent(id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.seaService
        .fetchCourseContent(id, this.userId)
        .subscribe(async (res: any) => {
          console.log('course content', res);
          this.lastWatchOrder = res.lastWatchOrder;
          this.orderArray = res.orderArray;

          this.videos = res.video;
          this.documents = res.document;
          resolve(res); // Resolve the promise with the response

          if (this.videos) {
            this.videos = res.video.map((video: any) => ({
              ...video,
              type: 'Video',
            }));
          }

          if (this.documents) {
            this.documents = res.document.map((document: any) => ({
              ...document,
              type: 'Document',
            }));
          }
          console.log('videos', this.videos);
          console.log(this.documents);

          if (this.videos && this.documents) {
            this.items = this.videos.concat(this.documents);
          } else if (this.videos) {
            this.items = this.videos;
          } else if (this.documents) {
            this.items = this.documents;
          }
          const sortByOrder = (a: any, b: any) => a.order - b.order;

          //  Sort the items array
          if (this.isCOlREGS) {
            const orderMap: Map<number, number> = new Map(
              this.orderArray.map((order: any, index: any) => [order, index])
            );
            const sortedItems = this.items.sort((a: any, b: any) => {
              const orderA = orderMap.get(a.order) ?? Number.MAX_SAFE_INTEGER; // Fallback to a large number if order not found
              const orderB = orderMap.get(b.order) ?? Number.MAX_SAFE_INTEGER; // Fallback to a large number if order not found
              return orderA - orderB;
            });

            this.items = sortedItems.map((item: any, index: any) => {
              return {
                ...item,
                tempVideoTitle: `Scenario ${String(index + 1).padStart(
                  2,
                  '0'
                )}`,
              };
            });

            this.mappedItems = this.items.map(
              (item: any, index: any, array: any) => {
                // Check the type of the item and map accordingly
                let isDisabled = true;

                if (index === 0) {
                  isDisabled = false;
                } else {
                  const previousItem = array[index - 1];
                  if (
                    previousItem.isQuestionnaire === 'Yes' &&
                    previousItem.progress.isAssessmentCompleted
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.progress.progressPercentage === 100 &&
                    previousItem.isQuestionnaire === 'Yes' &&
                    previousItem.progress.isAssessmentCompleted
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.progress.progressPercentage === 100 &&
                    previousItem.isQuestionnaire === 'No'
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.isDocumentQuestionnaire === 'Yes' &&
                    previousItem.progress.isAssessmentCompleted
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.progress.progressPercentage === 100 &&
                    previousItem.isDocumentQuestionnaire === 'Yes' &&
                    previousItem.progress.isAssessmentCompleted
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.progress.progressPercentage === 100 &&
                    previousItem.isDocumentQuestionnaire === 'No'
                  ) {
                    isDisabled = false;
                  }
                }

                if (item.type === 'Video') {
                  return {
                    videoUniqueId: item.videoUniqueId,
                    type: item.type,
                    videoId: item.videoId,
                    videoTitle: item.videoTitle,
                    tempVideoTitle: item.tempVideoTitle,
                    videoThumb: item.videoThumb,
                    order: item.order,
                    isQuestionnaire: item.isQuestionnaire,
                    progress: item.progress?.progress,
                    status: item.progress?.status,
                    progressPercentage: item.progress?.progressPercentage,
                    isAssessmentCompleted: item.progress?.isAssessmentCompleted,
                    isVideoWatchAfterFailedAssesment:
                      item.progress?.isVideoWatchAfterFailedAssesment,
                    bestAssessmentScore: item.progress?.bestAssessmentScore,
                    videoDuration: item.videoDuration,
                    isDisabled,
                    isToolbarAdded: item.isToolbarAdded,
                    toolbarObjectives: item.toolbarObjectives,
                  };
                } else if (item.type === 'Document') {
                  return {
                    documentId: item.documentId,
                    type: item.type,
                    order: item.order,
                    isQuestionnaire: item.isDocumentQuestionnaire,
                    progress: item.progress?.progress,
                    status: item.progress?.status,
                    progressPercentage: item.progress?.progressPercentage,
                    isAssessmentCompleted: item.progress?.isAssessmentCompleted,
                    documentDuration: item.documentDuration,
                    documentPath: item.documentPath,
                    documentTitle: item.documentTitle,
                    isDisabled,
                    // Add other Document-specific properties if necessary
                  };
                } else {
                  return;
                }

                // Optionally handle other item types or return a default structure
              }
            );
          } else {
            this.items = this.items.sort(sortByOrder);

            this.mappedItems = this.items.map(
              (item: any, index: any, array: any) => {
                // Check the type of the item and map accordingly
                let isDisabled = true;

                if (item.order === '1') {
                  isDisabled = false;
                } else {
                  const previousItem = array[index - 1];
                  if (
                    previousItem.isQuestionnaire === 'Yes' &&
                    previousItem.progress.isAssessmentCompleted
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.progress.progressPercentage === 100 &&
                    previousItem.isQuestionnaire === 'Yes' &&
                    previousItem.progress.isAssessmentCompleted
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.progress.progressPercentage === 100 &&
                    previousItem.isQuestionnaire === 'No'
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.isDocumentQuestionnaire === 'Yes' &&
                    previousItem.progress.isAssessmentCompleted
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.progress.progressPercentage === 100 &&
                    previousItem.isDocumentQuestionnaire === 'Yes' &&
                    previousItem.progress.isAssessmentCompleted
                  ) {
                    isDisabled = false;
                  } else if (
                    previousItem.progress.progressPercentage === 100 &&
                    previousItem.isDocumentQuestionnaire === 'No'
                  ) {
                    isDisabled = false;
                  }
                }

                if (item.type === 'Video') {
                  return {
                    videoUniqueId: item.videoUniqueId,
                    type: item.type,
                    videoId: item.videoId,
                    videoTitle: item.videoTitle,
                    tempVideoTitle: item.tempVideoTitle,
                    videoThumb: item.videoThumb,
                    order: item.order,
                    isQuestionnaire: item.isQuestionnaire,
                    progress: item.progress?.progress,
                    status: item.progress?.status,
                    progressPercentage: item.progress?.progressPercentage,
                    isAssessmentCompleted: item.progress?.isAssessmentCompleted,
                    isVideoWatchAfterFailedAssesment:
                      item.progress?.isVideoWatchAfterFailedAssesment,
                    bestAssessmentScore: item.progress?.bestAssessmentScore,
                    videoDuration: item.videoDuration,
                    isDisabled,
                    isToolbarAdded: item.isToolbarAdded,
                    toolbarObjectives: item.toolbarObjectives,
                  };
                } else if (item.type === 'Document') {
                  return {
                    documentId: item.documentId,
                    type: item.type,
                    order: item.order,
                    isQuestionnaire: item.isDocumentQuestionnaire,
                    progress: item.progress?.progress,
                    status: item.progress?.status,
                    progressPercentage: item.progress?.progressPercentage,
                    isAssessmentCompleted: item.progress?.isAssessmentCompleted,
                    documentDuration: item.documentDuration,
                    documentPath: item.documentPath,
                    documentTitle: item.documentTitle,
                    isDisabled,
                    // Add other Document-specific properties if necessary
                  };
                } else {
                  return;
                }

                // Optionally handle other item types or return a default structure
              }
            );
          }
          this.coursesToShowIncrement = this.items.length;
          this.remainingSections =
            this.items.length - this.coursesToShowIncrement;
          console.log('items', this.items);

          this.Doc = JSON.stringify(res.Doc);

          this.mappedItems = this.items.map(
            (item: any, index: any, array: any) => {
              // Check the type of the item and map accordingly
              let isDisabled = true;

              if (index === 0) {
                isDisabled = false;
              } else {
                const previousItem = array[index - 1];
                if (
                  previousItem.isQuestionnaire === 'Yes' &&
                  previousItem.progress.isAssessmentCompleted
                ) {
                  isDisabled = false;
                } else if (
                  previousItem.progress.progressPercentage === 100 &&
                  previousItem.isQuestionnaire === 'Yes' &&
                  previousItem.progress.isAssessmentCompleted
                ) {
                  isDisabled = false;
                } else if (
                  previousItem.progress.progressPercentage === 100 &&
                  previousItem.isQuestionnaire === 'No'
                ) {
                  isDisabled = false;
                } else if (
                  previousItem.isDocumentQuestionnaire === 'Yes' &&
                  previousItem.progress.isAssessmentCompleted
                ) {
                  isDisabled = false;
                } else if (
                  previousItem.progress.progressPercentage === 100 &&
                  previousItem.isDocumentQuestionnaire === 'Yes' &&
                  previousItem.progress.isAssessmentCompleted
                ) {
                  isDisabled = false;
                } else if (
                  previousItem.progress.progressPercentage === 100 &&
                  previousItem.isDocumentQuestionnaire === 'No'
                ) {
                  isDisabled = false;
                }
              }

              if (item.type === 'Video') {
                return {
                  videoUniqueId: item.videoUniqueId,
                  type: item.type,
                  videoId: item.videoId,
                  videoTitle: item.videoTitle,
                  tempVideoTitle: item.tempVideoTitle,
                  videoThumb: item.videoThumb,
                  order: item.order,
                  isQuestionnaire: item.isQuestionnaire,
                  progress: item.progress?.progress,
                  status: item.progress?.status,
                  progressPercentage: item.progress?.progressPercentage,
                  isAssessmentCompleted: item.progress?.isAssessmentCompleted,
                  isVideoWatchAfterFailedAssesment:
                    item.progress?.isVideoWatchAfterFailedAssesment,
                  bestAssessmentScore: item.progress?.bestAssessmentScore,
                  videoDuration: item.videoDuration,
                  isDisabled,
                  isToolbarAdded: item.isToolbarAdded,
                  toolbarObjectives: item.toolbarObjectives,
                };
              } else if (item.type === 'Document') {
                return {
                  documentId: item.documentId,
                  type: item.type,
                  order: item.order,
                  isQuestionnaire: item.isDocumentQuestionnaire,
                  progress: item.progress?.progress,
                  status: item.progress?.status,
                  progressPercentage: item.progress?.progressPercentage,
                  isAssessmentCompleted: item.progress?.isAssessmentCompleted,
                  documentDuration: item.documentDuration,
                  documentPath: item.documentPath,
                  documentTitle: item.documentTitle,
                  isDisabled,
                  // Add other Document-specific properties if necessary
                };
              } else {
                return;
              }

              // Optionally handle other item types or return a default structure
            }
          );

          const currentItem = this.mappedItems.find(
            (item: { order: number }) => item.order == this.lastWatchOrder
          );

          console.log('currentItem', currentItem);

          if (this.onPageLoaded) {
            let itemFound = false; // Initialize a flag to track if an item is found
            console.log('mappedItems', this.mappedItems);
            this.mappedItems.some((item: any, index: any) => {
              if (item.isQuestionnaire === 'Yes' && item.videoId) {
                if (item.progressPercentage !== 100) {
                  this.videoId = item.videoId;
                  this.currentOrder = item.order;
                  this.isToolbar = item.isToolbarAdded;
                  // this.handleVideoSelection(item, index);
                  this.handleVideoSelection(item, index);
                  itemFound = true;
                  return true; // Exit the loop when an item is found
                } else if (
                  item.progressPercentage === 100 &&
                  !item.isAssessmentCompleted &&
                  item.isVideoWatchAfterFailedAssesment
                ) {
                  this.videoId = item.videoId;
                  this.currentOrder = item.order;
                  this.setVideoFinishedState(item);
                  this.showRewatchandAssessment = true;
                  this.isPlayNext = true;
                  itemFound = true;
                  // this.afterfailedassessment()
                  // this.fetchCOLREGSPlaylist(item, index);
                  return true; // Exit the loop when an item is found
                } else if (
                  item.progressPercentage === 100 &&
                  !item.isAssessmentCompleted &&
                  !item.isVideoWatchAfterFailedAssesment
                ) {
                  this.videoId = item.videoId;
                  this.currentOrder = item.order;
                  this.isToolbar = item.isToolbarAdded;
                  // this.handleVideoSelection(item, index);
                  this.handleVideoSelection(item, index);
                  itemFound = true;
                  return true; // Exit the loop when an item is found
                } else if (
                  item.progressPercentage === 100 &&
                  !item.isAssessmentCompleted
                ) {
                  this.currentOrder = item.order;
                  return false; // Continue the loop
                } else {
                  this.currentOrder = item.order;
                  return false; // Continue the loop
                }
              } else if (item.videoId) {
                if (item.progressPercentage !== 100) {
                  this.isToolbar = item.isToolbarAdded;

                  this.handleVideoSelection(item, index);
                  this.currentOrder = item.order;
                  itemFound = true;
                  return true; // Exit the loop when an item is found
                } else if (item.progressPercentage === 100) {
                  this.currentOrder = item.order;
                  return false; // Continue the loop
                } else {
                  this.currentOrder = item.order;
                  return true;
                }
              } else if (item.isQuestionnaire === 'Yes' && item.documentId) {
                if (item.isAssessmentCompleted) {
                  return false; // Continue the loop
                } else {
                  this.showDocument = true;
                  this.currentOrder = item.order;
                  this.readFile(item);
                  itemFound = true;
                  return true; // Exit the loop when an item is found
                }
              } else if (item.documentId && item.progressPercentage !== 100) {
                this.currentOrder = item.order;
                this.showDocument = true;
                this.readFile(item);
                itemFound = true;
                return true; // Exit the loop when an item is found
              } else if (item.progressPercentage === 100) {
                this.currentOrder = item.order;
                return false; // Continue the loop
              } else {
                this.currentOrder = item.order;
                return false; // Continue the loop
              }
            });

            if (!itemFound) {
              this.courseCompleted = true;
              await this.seaService
                .updateCourseTotal(this.userId, this.courseParamsId)
                .subscribe((res: any) => {
                  console.log(res);
                });

              const data = {
                userId: this.userId,
                courseId: this.courseParamsId,
                status: 'Completed',
              };
              this.seaService.changeCourseStatus(data).subscribe((res: any) => {
                if (res) {
                }
              });

              const isFeedBackGiven = this.feedbacks.some(
                (item: any) => this.userId === item.userId
              );
              if (!isFeedBackGiven) {
                this.message.success(
                  'We will love your feedback of this course!'
                );
                this.gotoRatings();
              }
            }

            this.onPageLoaded = false;
          }
        });
    });
  }

  // Create an object to cache thumbnail URLs
  thumbnailCache: { [key: string]: string } = {};
  getThumbnailUrl(item: any): string {
    if (item.type === 'Video' && item.videoThumb) {
      // Check if the thumbnail URL is already cached
      if (this.thumbnailCache[item.videoThumb]) {
        return this.thumbnailCache[item.videoThumb];
      } else {
        // If not cached, fetch and cache the thumbnail URL
        const thumbnailUrl = item.videoThumb;
        this.thumbnailCache[item.videoThumb] = thumbnailUrl;

        return thumbnailUrl;
      }
    } else {
      // Handle other item types or return a default URL if necessary
      return ''; // Replace with the default URL if needed
    }
  }

  async playNext() {
    const nextOrder = parseInt(this.currentOrder) + 1;
    const nextItem = this.mappedItems.find(
      (item: { order: number }) => item.order == nextOrder
    );

    if (nextItem) {
      console.log('nextItem', nextItem);
      if (nextItem.type === 'Document') {
        this.readFile(nextItem);
        this.showRewatchandAssessment = false;

        this.showDocument = true;
        this.currentOrder = nextItem.order;
      } else if (nextItem.type === 'Video') {
        this.isToolbar = nextItem.isToolbarAdded;

        this.handleVideoSelection(nextItem, this.currentVideoIndex + 1);
      }
      // Add logic here to play or display the next item
    } else {
      console.log('No next item found');
      this.showDocument = false;
      this.courseCompleted = true;

      this.subcriptions.add(
        await this.seaService
          .updateCourseTotal(this.userId, this.courseParamsId)
          .subscribe((res: any) => {
            console.log(res);
          })
      );
      // Change Status to Course Completed
      const data = {
        userId: this.userId,
        courseId: this.courseParamsId,
        status: 'Completed',
      };

      this.subcriptions.add(
        this.seaService.changeCourseStatus(data).subscribe((res: any) => {
          if (res) {
            this.message.success(
              'You have completed this Course Successfully!'
            );
            this.router.navigate([`${this.companyName}/dashboard`]);
          }
        })
      );
    }
  }

  async playNextForDocument() {
    const currentItem = this.mappedItems.find(
      (item: { order: number }) => item.order == this.currentOrder
    );

    const nextOrder = parseInt(this.currentOrder) + 1;
    const nextItem = this.mappedItems.find(
      (item: { order: number }) => item.order == nextOrder
    );

    console.log('currentItem', currentItem);

    const data = {
      userId: this.userId,
      courseId: this.courseParamsId,
      documentId: currentItem.documentId,
      progress: 100,
      progressPercentage: 100,
      lastWatchOrder: this.currentOrder,
    };

    this.subcriptions.add(
      this.mediaService.saveDocumentProgress(data).subscribe((res: any) => {
        console.log(res);
        const itemIndex = this.mappedItems.findIndex(
          (item: any) => item.documentId === currentItem.documentId
        );
        this.fetchCourseContent(this.courseParamsId);

        if (itemIndex !== -1) {
          this.mappedItems[itemIndex].isDisabled = false;

          this.mappedItems[itemIndex].progressPercentage = 100;
        }
      })
    );

    if (
      currentItem.isQuestionnaire === 'Yes' &&
      !currentItem.isAssessmentCompleted
    ) {
      this.showRewatchandAssessment = true;
      this.showDocument = false;
      this.isAssessment = true;
    } else {
      if (nextItem) {
        console.log('nextItem', nextItem);
        if (nextItem.type === 'Document') {
          this.readFile(nextItem);
          this.showRewatchandAssessment = false;

          this.showDocument = true;
          this.currentOrder = nextItem.order;
        } else if (nextItem.type === 'Video') {
          this.isToolbar = nextItem.isToolbarAdded;

          this.handleVideoSelection(nextItem, nextItem - 1);
          this.showDocument = false;

          // Handle the case when there is no next item
        }
        // Add logic here to play or display the next item
      } else {
        console.log('No next item found');
        this.courseCompleted = true;
        this.showDocument = false;
        this.showVideo = false;

        this.subcriptions.add(
          await this.seaService
            .updateCourseTotal(this.userId, this.courseParamsId)
            .subscribe((res: any) => {
              console.log(res);
            })
        );

        const data = {
          userId: this.userId,
          courseId: this.courseParamsId,
          status: 'Completed',
        };

        this.subcriptions.add(
          this.seaService.changeCourseStatus(data).subscribe((res: any) => {
            if (res) {
              this.message.success(
                'You have completed this Course Successfully!'
              );
              this.router.navigate([`${this.companyName}/dashboard`]);
            }
          })
        );
        // Handle the case when there is no next item
      }
    }
  }

  onTimeUpdate() {
    if (this.currentVideoIndex !== null) {
      const videoElement = this.videoPlayer.nativeElement;
      const duration = videoElement.duration;
      const currentTime = videoElement.currentTime;
      const progressPercentage = (currentTime / duration) * 100;

      // Update the progress of the current playing video
      console.log('videoId', this.videoId);
      console.log('items', this.items);
      console.log('items2', this.items[this.currentVideoIndex]);
      this.items[this.currentVideoIndex].progressPercentage =
        progressPercentage;
      this.cdRef.detectChanges(); // Trigger change detection
    }
  }

  attachEndedEventListener(videoPlayer: HTMLVideoElement) {
    console.log("Attaching 'ended' event listener");
    // Remove any existing 'ended' event listeners to avoid duplicates
    videoPlayer.removeEventListener('ended', this.onVideoEnded);

    // Attach a new 'ended' event listener
    videoPlayer.addEventListener('ended', this.onVideoEnded);
  }

  onVideoEnded = () => {
    if (this.isMainVideoPlaying) {
      this.showVideo = false;
      this.showRewatchandAssessment = true;
      this.isVideoPlaying = false;
      this.saveVideoProgress();
    } else {
      this.goback();
    }
  };

  private videoElement!: HTMLVideoElement;
  hls = new Hls();

  rewindByTenSeconds() {
    if (this.api) {
      const currentTime = this.api.getDefaultMedia().currentTime;
      this.api.getDefaultMedia().currentTime = Math.max(0, currentTime - 10);
    }
  }

  sources!: VideoSource[];

  async handleVideoSelection(data: any, index: number) {
    this.currentVideoIndex = index + 1;
    this.isToolbar = data.isToolbarAdded;
    this.toolbarObjectives = data.toolbarObjectives;
    this.showVideo = true;
    this.courseCompleted = false;
    this.showDocument = false;
    this.showRewatchandAssessment = false;
    this.currentOrder = data.order;

    if (data.isQuestionnaire === 'Yes') {
      this.isAssessment = true;
    } else if (data.isQuestionnaire === 'No') {
      this.isAssessment = false;
    }

    if (this.isToolbar) {
      this.subcriptions.add(
        await this.mediaService
          .fetchColregsPlaylist(this.courseParamsId, data.videoId)
          .subscribe({
            next: async (res: any) => {
              this.currentBridgeVideoTIme = undefined;
              this.isMainVideoPlaying = true;

              this.isradarvisible = false;
              this.currentVideoPlaylist = res.sources;

              this.sources = [
                {
                  src: this.currentVideoPlaylist[0].src,
                  type: this.currentVideoPlaylist[0].type,
                },
              ];

              console.log(this.currentVideoPlaylist);

              setTimeout(() => {
                const videoPlayer: HTMLVideoElement =
                  this.videoPlayer?.nativeElement;
                const savedVolume = parseFloat(
                  localStorage.getItem('volume') ?? '1'
                );

                videoPlayer.volume = isNaN(savedVolume) ? 1 : savedVolume;
              });
            },
          })
      );
    } else {
      console.log('selected video', data);
      this.videoUrl = '';

      setTimeout(async () => {
        if (this.showVideo) {
          this.videoId = data.videoId;
          this.videoData = data;
          this.videoUrl = await this.mediaService.fetchVideoById(
            this.courseParamsId,
            data.videoId
          );
          this.bridgeVideoSrc = this.videoUrl;
        }
      }, 100);
    }
  }

  setVideoSources(videoUrls: string[]) {
    this.currentVideoPlaylist = videoUrls.map((url) => ({
      src: this.sanitizer.bypassSecurityTrustResourceUrl(url),
      type: `video/${url.split('.').pop()}`, // Assuming the type can be inferred from the URL
    }));
  }

  availableQualities: Array<{ id: number; label: string }> = [];
  currentQuality: string | number = 'Auto'; // Default to 'Auto'

  defaultOptions: Plyr.Options = {
    controls: [
      'play-large',
      'play',
      'current-time',
      'duration',
      'mute',
      'volume',
      'settings',
      'fullscreen',
    ],
    settings: ['quality'],
    ratio: '16:9',
  };

  updateQuality(newQuality: any) {
    if (newQuality === 'Auto') {
      this.hls.currentLevel = -1;
    } else {
      (window as any).hls.levels.forEach((level: any, levelIndex: any) => {
        if (level.height === newQuality) {
          (window as any).hls.currentLevel = levelIndex;
        }
      });
    }
  }

  // @HostListener('document:visibilitychange', ['$event'])
  // handleVisibilityChange(event: Event) {
  //   if (document.hidden) {
  //     // Page is hidden, pause the video
  //     const videoElement: HTMLVideoElement = this.videoPlayer?.nativeElement;

  //     videoElement.pause();
  //   } else {
  //     // Page is visible, resume playing if needed
  //     // You may implement further logic here if necessary
  //   }
  // }

  isScrubBarVisible: boolean = false;

  showScrubBar() {
    this.isScrubBarVisible = true;
  }

  // Function to hide the scrub bar
  hideScrubBar() {
    this.isScrubBarVisible = false;
  }

  // Extracted the logic into a method to handle the state when video is finished
  setVideoFinishedState(item: any): void {
    this.videoFinished = true;
    this.showVideo = false;
    this.isVideoPlaying = false;
    // this.currentVideoThumbnail = item.videoThumb;
    this.isAssessment = item.isQuestionnaire;
  }

  async fetchCourseAssests() {
    console.log(this.items);
    const videoPromises = this.items.map(async (video: any, index: any) => {
      if (video.type === 'Video') {
        console.log(video.videoThumb);
        const res = await this.seaService
          .fetchVideoThumbnails(video.videoThumb)
          .toPromise();
        console.log(res);
        if (res) {
          // const videoThumb = await this.generateCompanyLogoUrl(res);
          return { ...video, index };
        } else {
          // Handle the case where the response is falsy or not as expected
          return video;
        }
      } else {
        return video;
      }
    });

    this.items = await Promise.all(videoPromises);
    for (const item of this.items) {
      if (item.order == this.currentVideoIndex) {
        this.currentVideoThumbnail = item.videoThumb;
        break;
      }
    }
    console.log('videos with thumb', this.items);
    console.log('currentVideoThumbnail', this.currentVideoThumbnail);

    this.elementActive = false;
  }

  imageLoaded = false;

  onImageLoad(event: Event): void {
    this.imageLoaded = true;
  }

  onImageError(event: Event): void {
    // Image load has encountered an error
    this.imageLoaded = false; // You can set this to false if you want to keep showing the placeholder on error

    const placeholder = this.el.nativeElement.querySelector('.placeholder');

    if (placeholder && event.target) {
      // Hide the placeholder
      this.renderer.setStyle(placeholder, 'display', 'none');

      // Extract the dominant color from the loaded image
      const image = event.target as HTMLImageElement;
      this.getDominantColor(image.src).then((color) => {
        if (placeholder) {
          // Set the extracted dominant color as the background color of the placeholder
          this.renderer.setStyle(placeholder, 'background-color', color);
        }
      });
    }
  }

  async getDominantColor(imageUrl: string): Promise<string> {
    return new Promise<string>((resolve) => {
      const image = new Image();
      image.src = imageUrl;
      image.crossOrigin = 'Anonymous';

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(image, 0, 0, 1, 1);
        const dominantColor = ctx?.getImageData(0, 0, 1, 1).data;
        const color = `rgb(${dominantColor![0]}, ${dominantColor![1]}, ${
          dominantColor![2]
        })`;
        resolve(color);
      };
    });
  }

  getFeedbackStyle(rating: number): any {
    let backgroundColor;

    if (rating >= 4) {
      backgroundColor = '#219653'; // Green for 4 and 5
    } else if (rating == 3) {
      backgroundColor = '#F2994A'; // Yellow for 3
    } else {
      backgroundColor = '#EB5757'; // Red for 1 and 2
    }

    return {
      padding: '4px',
      background: backgroundColor,
      borderRadius: '5px',
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      // Add other styles as needed
    };
  }

  truncateText(text: string, maxLength: number): string {
    if (text?.length <= maxLength) {
      return text;
    } else {
      return text?.slice(0, maxLength) + '...';
    }
  }

  setCommentReplyInput(userName: string, commentInput: HTMLInputElement) {
    // Insert the username with "@" in the input field
    // commentInput.value = `@${userName} `;

    // Focus on the input field
    // commentInput.focus();
    this.commentForm.get('commentValue')?.setValue(`@${userName} `);
    commentInput.focus();
  }

  stripHtmlTags(html: any) {
    let tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  isVideoThumbArrayBuffer(data: any): boolean {
    return data.startsWith('data:image/');
  }

  async generateCompanyLogoUrl(data: any): Promise<string> {
    const start = performance.now();

    try {
      console.log(data);
      if (data && data.type === 'Buffer' && data.data) {
        const base64Logo = this.arrayBufferToBase64(data.data);
        const mimeType = this.detectMimeType(data.data);
        const end = performance.now();
        console.log(`Time taken: ${end - start} milliseconds`);
        return `data:${mimeType};base64,${base64Logo}`;
      } else {
        // Return a placeholder URL or handle cases where there's no logo
        const end = performance.now();
        console.log(`Time taken: ${end - start} milliseconds`);
        return 'path/to/placeholder-image.jpg';
      }
    } catch (error) {
      console.error('Error generating logo URL:', error);
      const end = performance.now();
      console.log(`Time taken: ${end - start} milliseconds`);
      return 'path/to/error-image.jpg'; // Placeholder for error case
    }
  }

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const chunkSize = 8192; // Adjust the chunk size as needed
    const binaryArray = new Uint8Array(buffer);
    let base64String = '';

    for (let i = 0; i < binaryArray.length; i += chunkSize) {
      const chunk = binaryArray.subarray(i, i + chunkSize);
      base64String += String.fromCharCode(...chunk);
    }

    return btoa(base64String);
  }

  detectMimeType(buffer: any): string {
    // Implement logic to dynamically determine MIME type based on buffer content
    // Example: return 'image/jpeg' or 'image/png' based on the buffer content
    return 'image/jpeg'; // Placeholder, replace with actual implementation
  }

  getVideoProgress() {
    const videoElement = this.videoPlayer.nativeElement;
    const currentTime = videoElement.currentTime;
    const duration = videoElement.duration;

    if (!isNaN(duration)) {
      const progressPercentage = (currentTime / duration) * 100;
      console.log(
        'Current Video Progress:',
        progressPercentage.toFixed() + '%'
      );
    }
  }

  async rewatchVideo() {
    const currentItem = this.mappedItems.find(
      (item: { order: number }) => item.order == this.currentOrder
    );
    console.log(currentItem);
    console.log(this.videoUrl);
    if (currentItem.type === 'Video') {
      this.showRewatchandAssessment = false;
      this.showVideo = true;
      this.rewatchClicked = true;
      this.isVideoPlaying = true;
      this.isToolbar = currentItem.isToolbarAdded;

      if (this.isToolbar) {
        this.subcriptions.add(
          await this.mediaService
            .fetchColregsPlaylist(this.courseParamsId, currentItem.videoId)
            .subscribe({
              next: async (res: any) => {
                console.log('colregs video playlist', res);
                this.currentVideoPlaylist = res.sources;

                this.sources = [];
                this.sources.push({
                  src: this.currentVideoPlaylist[0].src,
                  type: this.currentVideoPlaylist[0].type,
                });

                console.log(this.currentVideoPlaylist);
                // this.currentVideoIndex = index + 1;
                this.isToolbar = currentItem.isToolbarAdded;
                this.toolbarObjectives = currentItem.toolbarObjectives;
                this.showVideo = true;
                this.courseCompleted = false;
                this.showDocument = false;
                this.showRewatchandAssessment = false;
                this.isMainVideoPlaying = true;

                this.currentOrder = currentItem.order;
                if (currentItem.isQuestionnaire === 'Yes') {
                  this.isAssessment = true;
                } else if (currentItem.isQuestionnaire === 'No') {
                  this.isAssessment = false;
                }

                const videoDurationInt = Math.round(currentItem.videoDuration);

                const videoDurationStr = videoDurationInt.toFixed(0);
                const videoProgress = currentItem.progress.toFixed(0);
                this.currentVideoProgress = videoProgress;
                this.currentVideoDuration = videoDurationStr;
                console.log(videoProgress);
                if (this.api && this.api.getDefaultMedia()) {
                  const media = this.api.getDefaultMedia();
                  // Now you can safely access properties
                  media.currentTime = 0;
                } else {
                  console.warn('Videogular API or media not ready');
                }

                setTimeout(() => {
                  const videoPlayer: HTMLVideoElement =
                    this.videoPlayer?.nativeElement;
                  const savedVolume = parseFloat(
                    localStorage.getItem('volume') ?? '1'
                  );

                  videoPlayer.volume = isNaN(savedVolume) ? 1 : savedVolume;
                });
              },
            })
        );
      } else {
        this.videoUrl = await this.mediaService.fetchVideoById(
          this.courseParamsId,
          currentItem.videoId
        );
      }
    } else if (currentItem.type === 'Document') {
      this.showRewatchandAssessment = false;
      this.showDocument = true;
    }
  }

  saveVideoProgress() {
    const videoElement = this.videoPlayer.nativeElement;
    const currentTime = videoElement.currentTime;
    const duration = videoElement.duration;

    if (!isNaN(duration)) {
      const progressPercentage = ((currentTime / duration) * 100).toFixed();

      const data = {
        userId: this.userId,
        courseId: this.courseParamsId,
        videoId: this.videoId,
        progress: currentTime,
        videoDuration: duration,
        progressPercentage: progressPercentage,
        playerViewTime: this.playerViewTime,
        lastWatchOrder: this.currentOrder,
      };

      console.log(data);
      this.subcriptions.add(
        this.mediaService.saveVideoProgress(data).subscribe((res: any) => {
          this.fetchCourseContent(this.courseParamsId);
          const itemIndex = this.mappedItems.findIndex(
            (item: any) => item.videoId === this.videoId
          );
          console.log(itemIndex);
          if (itemIndex !== -1) {
            this.mappedItems[itemIndex].progressPercentage = progressPercentage;

            this.mappedItems[itemIndex].isDisabled = false;
          }
          if (res.success === true) {
            this.message.success('Video Progress Saved Successfully!');
          }
        })
      );
    }
  }

  videoFinishedFunction() {
    this.fetchCourseContent(this.courseParamsId);
    const itemIndex = this.mappedItems.findIndex(
      (item: any) => item.videoId === this.videoId
    );

    const videoElement = this.videoPlayer.nativeElement;
    const currentTime = videoElement.currentTime;
    const duration = videoElement.duration;
    const progressPercentage = ((currentTime / duration) * 100).toFixed();

    if (itemIndex !== -1) {
      this.mappedItems[itemIndex].progressPercentage = progressPercentage;
      this.mappedItems[itemIndex].isDisabled = false;
    }
  }

  formatTime(seconds: number): string {
    const pad = (num: number) => num.toString().padStart(2, '0');

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    } else {
      return `${pad(minutes)}:${pad(remainingSeconds)}`;
    }
  }

  formatTimeInWords(seconds: number): string {
    if (seconds < 60) {
      return `${Math.floor(seconds)} second${seconds !== 1 ? 's' : ''}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  }

  secondsToMinutes(seconds: number): any {
    const minutes = seconds / 60;
    return minutes;
  }

  async savePosts() {
    const courseId = this.courseParamsId;
    const userId = await this.auth.getIdFromToken();
    const postData = this.getPostValue();
    const postTime = moment.utc().format();

    const Data = { courseId, userId, postData, postTime };

    this.subcriptions.add(
      this.seaService.savePosts(Data).subscribe(async (res: any) => {
        this.commentForm.reset();
        await this.fetchPosts();
      })
    );
  }

  async fetchPosts() {
    this.subcriptions.add(
      this.seaService
        .fetchPostsOfCourse(this.courseParamsId, this.userId)
        .subscribe((res: any) => {
          console.log('posts', res);
          res.sort((a: any, b: any) => {
            const dateA = new Date(a.postTime);
            const dateB = new Date(b.postTime);
            return dateB.getTime() - dateA.getTime();
          });

          this.posts = res.map((post: any) => ({
            ...post,
            isLiked: post.filterPostLikes.some(
              (like: any) => like.userId === this.userId
            ),
          }));

          this.posts.forEach((post: any) => {
            post.comments = post.comments.map((comment: any) => ({
              ...comment,
              isLiked: comment.filterCommentLike.some(
                (like: any) => like.userId === this.userId
              ),
            }));
          });

          console.log('posts after sorting', this.posts);

          // this.posts = res;

          // Sort the posts based on postTime
        })
    );
  }

  async saveComments(data: any) {
    const courseId = data.courseId;
    const userId = await this.auth.getIdFromToken();
    const postId = data.postId;
    const commentData = this.getCommentValue();
    const commentTime = moment.utc().format();

    const Data = { courseId, userId, commentData, postId, commentTime };
    this.subcriptions.add(
      await this.seaService.saveComment(Data).subscribe(async (res: any) => {
        await this.fetchPosts();
      })
    );
  }

  async postLikes(likedata: any) {
    const data = { likedata, type: 'post', userId: this.userId };

    this.subcriptions.add(
      await this.seaService.postLikeCounts(data).subscribe((res: any) => {
        this.fetchPosts();
      })
    );
  }

  async commentLikes(likedata: any) {
    const data = { likedata, type: 'comment', userId: this.userId };

    this.subcriptions.add(
      await this.seaService.postLikeCounts(data).subscribe((res: any) => {
        this.fetchPosts();
      })
    );
  }

  StartAssesment() {
    const currentItem = this.mappedItems.find(
      (item: { order: number }) => item.order == this.currentOrder
    );
    console.log('currentItem', currentItem);

    if (currentItem.type === 'Video') {
      const encryptedVideoId = CryptoJS.AES.encrypt(
        currentItem.videoId.toString(),
        'encryptionKey'
      ).toString();

      const encryptedType = CryptoJS.AES.encrypt(
        currentItem.type,
        'encryptionKey'
      ).toString();

      const encryptedCourseId = CryptoJS.AES.encrypt(
        this.courseParamsId,
        'encryptionKey'
      ).toString();

      const queryParams = {
        vid: encryptedVideoId,
        typ: encryptedType,
        id: encryptedCourseId,
      };

      this.router.navigate(['individual-user/user/assesments'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else if (currentItem.type === 'Document') {
      const encryptedVideoId = CryptoJS.AES.encrypt(
        currentItem.documentId.toString(),
        'encryptionKey'
      ).toString();
      const encryptedType = CryptoJS.AES.encrypt(
        currentItem.type,
        'encryptionKey'
      ).toString();
      const encryptedCourseId = CryptoJS.AES.encrypt(
        this.courseParamsId,
        'encryptionKey'
      ).toString();
      const queryParams = {
        vid: encryptedVideoId,
        typ: encryptedType,
        id: encryptedCourseId,
      };

      this.router.navigate(['user/assesments'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  showcomments: boolean = false;
  showCommentSection(item: any) {
    item.isExpanded = !item.isExpanded;
  }
  getPostValue() {
    return this.commentForm.get('postValue')?.value;
  }

  getCommentValue() {
    const comment = this.commentForm.get('commentValue')?.value;
    const formattedComment = comment!.replace(/(@\w+\s\w+)/g, '<b>$1</b>');
    return formattedComment;
  }

  currentPage = 1;
  itemsPerPage = 2;
  getRatingAndReviews() {
    this.subcriptions.add(
      this.seaService
        .getFeedBackByCourseId(this.courseParamsId)
        .subscribe((res: any) => {
          console.log('feedbacks', res);
          if (res) {
            this.sumOfRatings = 0;
            this.totalReview = 0;
            this.feedbacks = res;
            this.totalRatings = 0;
            this.feedbacks.forEach((element: any) => {
              if (element.review) {
                this.totalReview = this.totalReview + 1;
              }
              const rating = parseInt(element.rating);
              if (rating === 1) {
                this.totalOneStar = this.totalOneStar + 1;
              } else if (rating === 2) {
                this.totalTwoStar = this.totalTwoStar + 1;
              } else if (rating === 3) {
                this.totalThreeStar = this.totalThreeStar + 1;
              } else if (rating === 4) {
                this.totalFourStar = this.totalFourStar + 1;
              } else if (rating === 5) {
                this.totalFiveStar = this.totalFiveStar + 1;
              }

              this.sumOfRatings = this.sumOfRatings + parseInt(element.rating);
            });
            this.totalRatings = res.length;

            this.averageRating =
              res.length > 0 ? this.sumOfRatings / res.length : 0;

            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            this.feedbacks = this.feedbacks.slice(startIndex, endIndex);
            this.totalStar =
              this.totalOneStar +
              this.totalTwoStar +
              this.totalThreeStar +
              this.totalFourStar +
              this.totalFiveStar;
          }
        })
    );
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getRatingAndReviews(); // Call the method again to fetch and display the updated paginated feedbacks
  }

  showModalMiddle() {
    this.isVisibleMiddle = true;
  }

  handleCancel() {
    this.isVisibleMiddle = false;
  }

  isHelpModalVisible = false;
  openHelpModal() {
    this.buttonClickSound.play();
    this.api.pause();
    this.isHelpModalVisible = true;
    let docElement = document.documentElement;

    docElement.requestFullscreen();
  }

  closeHelpmodal() {
    this.isHelpModalVisible = false;
    this.api.play();
    document.exitFullscreen();
  }

  feedbacks: any;
  percentValue: number = 10; // Set your actual percentage value here

  getStatus(): string {
    if (this.percentValue < 10 || this.percentValue > 20) {
      return 'exception';
    } else if (this.percentValue >= 30 && this.percentValue <= 60) {
      return 'active';
    } else {
      return 'normal'; // Adjust this based on your needs
    }
  }

  getStrokeColor(value: number, total: number): { [key: string]: string } {
    const percent = (value / total) * 100;

    if (percent < 20) {
      return { '0%': '#ff0000' };
    } else if (percent >= 20 && percent < 60) {
      return { '0%': '#F2994A', '100%': '#F2994A' };
    } else {
      return { '0%': '#219653', '100%': '#219653' };
    }
  }

  gotoRatings(): void {
    this.isRatingVisible = true;
  }

  ratingmodalclose(): void {
    this.isRatingVisible = false;
  }

  ratingValue: number = 0; // Set the initial value here
  feedValue: string | undefined;

  async submitFeedback() {
    const userId = await this.auth.getIdFromToken();
    const rating = this.ratingValue;
    const review = this.feedValue;
    const courseId = this.courseParamsId;

    console.log(rating);
    console.log(review);
    const data = { rating, review, userId, courseId };
    console.log('feedback ==>', data);

    this.subcriptions.add(
      this.seaService.saveFeedback(data).subscribe(async (res: any) => {
        console.log('feedback sent', res);
        await this.getRatingAndReviews();
      })
    );
    this.isRatingVisible = false;
  }

  convertKbToGb(courseSizeInKb: number): string {
    const fileSizeInGb = courseSizeInKb / (1024 * 1024); // Convert KB to GB
    const roundedSizeInGb = fileSizeInGb.toFixed(2); // Round to 2 decimal places

    return `${roundedSizeInGb} MB`;
  }

  removeHtmlTags(text: string) {
    var plainText = text.replace(/<[^>]*>/g, '');
    return plainText;
  }

  viewAssessments() {}

  addRipple(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const newRound = document.createElement('div');
    const x = event.pageX - target.offsetLeft;
    const y = event.pageY - target.offsetTop;

    newRound.className = 'cercle';
    target.appendChild(newRound);

    newRound.style.left = x + 'px';
    newRound.style.top = y + 'px';
    newRound.className += ' anim';

    setTimeout(() => {
      newRound.remove();
    }, 1000);
  }

  courseParamsId: any = '1';

  fileContent: any;
  pdfSrc: any;
  sanitizedPdfSrc: any;
  isContentText: boolean = false;
  async readFile(data: any) {
    this.isContentText = true;
    this.showDocument = true;
    this.showVideo = false;
    this.isVideoPlaying = false;
    this.currentOrder = data.order;
    this.pdfSrc = '';

    console.log(data);
    const documentId = data.documentPath.split('.');
    const splitText = documentId[1];
    console.log(splitText);
    this.subcriptions.add(
      await this.mediaService
        .getDocument(this.courseParamsId, data.documentId)
        .subscribe(async (res: any) => {
          console.log(typeof res);
          this.pdfSrc = res;
        })
    );
  }

  generatePdf(textData: string): void {
    const pdf = new jsPDF();

    // Set font size and style
    pdf.setFontSize(12);
    pdf.setFont('times', 'normal');

    // Set text color
    pdf.setTextColor(0, 0, 0);

    // Set page size (adjust as needed)
    const pageSize = {
      width: pdf.internal.pageSize.getWidth(),
      height: pdf.internal.pageSize.getHeight(),
    };

    // Split text into chunks
    const maxCharactersPerChunk = 1000; // Adjust as needed
    const chunks = this.splitTextIntoChunks(textData, maxCharactersPerChunk);

    // Set initial coordinates
    let x = 10;
    let y = 10;

    // Add each chunk to a new page
    chunks.forEach((chunk, index) => {
      if (index > 0) {
        pdf.addPage();
      }
      pdf.text(chunk, x, y);
    });

    // Convert the PDF document to a data URL
    this.pdfSrc = pdf.output('datauristring');
    this.isContentText = true;
  }

  splitTextIntoLines(text: string, maxCharactersPerLine: number): string[] {
    const lines = [];
    const words = text.split(' ');
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxCharactersPerLine) {
        currentLine += (currentLine === '' ? '' : ' ') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine !== '') {
      lines.push(currentLine);
    }

    return lines;
  }

  splitTextIntoChunks(text: string, maxCharactersPerChunk: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxCharactersPerChunk) {
      chunks.push(text.substring(i, i + maxCharactersPerChunk));
    }
    return chunks;
  }

  onPageRendered(event: any) {
    this.currentPage = event.pageNumber;
    console.log('currentPage', this.currentPage);
    if (this.currentPage === this.totalPages) {
      setTimeout(() => {
        // Timeout to ensure UI is updated
        // alert('You have reached the end of the document.');
      }, 0);
    }
  }

  onPdfLoadComplete(event: any) {
    this.totalPages = event.numPages;
  }

  checkIfEndOfPdf() {
    // Ensure that the pdfViewer is defined
    if (this.pdfViewer && this.pdfViewer.nativeElement) {
      const pdfViewerElement = this.pdfViewer.nativeElement;

      // Delay the scroll check to ensure the DOM has updated
      setTimeout(() => {
        const currentScroll =
          pdfViewerElement.scrollTop + pdfViewerElement.clientHeight;
        const maxScroll = pdfViewerElement.scrollHeight;

        if (
          this.lastRenderedPage === this.totalPages &&
          currentScroll >= maxScroll
        ) {
        }
      });
    }
  }

  isFullScreen: boolean = false;
  toggleFullScreen() {
    const element = this.el.nativeElement;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err: any) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  }

  // VideoGular

  preload: string = 'auto';

  onPlayerReady(source: VgApiService) {
    this.api = source;
    this.rewatchClicked = false; // Reset the flag after handling

    this.api
      .getDefaultMedia()
      .subscriptions.loadedMetadata.subscribe(this.autoplay.bind(this));

    this.api.getDefaultMedia().subscriptions.playing.subscribe(() => {
      this.isVideoPlaying = true;
    });

    this.api.getDefaultMedia().subscriptions.ended.subscribe(() => {
      if (this.isMainVideoPlaying) {
        this.isPlayNext = true;
        this.showVideo = false;
        this.isVideoPlaying = false;
        this.showRewatchandAssessment = true;
        this.saveVideoProgress();
      } else {
        this.goback();
      }
    });

    this.api.getDefaultMedia().subscriptions.pause.subscribe(() => {
      this.isVideoPlaying = false;
    });

    this.api.getDefaultMedia().subscriptions.volumeChange.subscribe(() => {
      const volume = this.api.volume;
      localStorage.setItem('volume', volume);
    });
  }

  autoplay() {
    console.log('play');
    this.api.play();
    if (this.isMainVideoPlaying) {
      if (this.api && this.api.getDefaultMedia()) {
        const media = this.api.getDefaultMedia();
        // Now you can safely access properties
        if (this.currentBridgeVideoTIme) {
          if (this.currentBridgeVideoTIme === this.currentVideoDuration) {
            media.currentTime = 0;
          } else {
            media.currentTime = this.currentBridgeVideoTIme;
          }
        } else {
          if (this.currentVideoProgress === this.currentVideoDuration) {
            media.currentTime = 0;
          } else {
            media.currentTime = this.currentVideoProgress;
          }
        }
      } else {
        console.warn('Videogular API or media not ready');
      }
    }
  }

  // Rating
  showalert(): void {
    this.message.warning(
      `There are no Ratings and Reviews for this course. Please complete the course and add reviews`
    );
  }

  async fetchBestAssessmentRecord(videoId: any) {
    this.subcriptions.add(
      await this.seaService
        .bestAssessment(this.userId, videoId)
        .subscribe((res: any) => {
          this.assessmentrecord = [res];
          console.log('assessment record', this.assessmentrecord);
        })
    );
  }

  retakeAssessment(data: any) {
    console.log(data);

    if (data.assessmentFor === 'Video') {
      const encryptedVideoId = CryptoJS.AES.encrypt(
        data.courseContentId.toString(),
        'encryptionKey'
      ).toString();
      const encryptedType = CryptoJS.AES.encrypt(
        data.assessmentFor,
        'encryptionKey'
      ).toString();
      const encryptedCourseId = CryptoJS.AES.encrypt(
        this.courseParamsId,
        'encryptionKey'
      ).toString();
      const queryParams = {
        vid: encryptedVideoId,
        typ: encryptedType,
        id: encryptedCourseId,
      };

      this.router.navigate(['user/assesments'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else if (data.assessmentFor === 'Document') {
      const encryptedVideoId = CryptoJS.AES.encrypt(
        data.courseContentId.toString(),
        'encryptionKey'
      ).toString();
      const encryptedType = CryptoJS.AES.encrypt(
        data.assessmentFor,
        'encryptionKey'
      ).toString();

      const encryptedCourseId = CryptoJS.AES.encrypt(
        this.courseParamsId,
        'encryptionKey'
      ).toString();
      const queryParams = {
        vid: encryptedVideoId,
        typ: encryptedType,
        id: encryptedCourseId,
      };

      this.router.navigate(['user/assesments'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  async generatePDF() {
    this.subcriptions.add(
      (await this.seaService.generatedPdf(Date.now())).subscribe({
        next: (pdfBlob: any) => {
          console.log(pdfBlob);
        },
        error: (Error) => {
          console.error(Error);
        },
      })
    );
  }

  loadHtmlTemplate() {
    this.subcriptions.add(
      this.http
        .get('assets/template.html', { responseType: 'text' })
        .subscribe((data) => {
          this.htmlContent = data;
        })
    );
  }

  downloadCertificate() {
    const id = this.message.loading('Download Started...', {
      nzDuration: 0,
    }).messageId;
    this.isCertificateDisabled = true;
    this.subcriptions.add(
      this.seaService
        .fetchCourseUser(this.courseParamsId, this.userId)
        .subscribe({
          next: async (res: any) => {
            const firstName = res.firstName;
            const lastName = res.lastName;
            const completedData = res.completedData;
            console.log(firstName);
            console.log(lastName);

            const doc = new jsPDF({
              orientation: 'landscape',
            });

            const oldLondonFont = MediaConstants.oldLondonFont;
            doc.addFileToVFS('OldLondon.ttf', oldLondonFont);
            doc.addFont('OldLondon.ttf', 'OldLondon', 'normal');

            const itallianoFont = MediaConstants.itallianoFont;
            doc.addFileToVFS('Italliano.ttf', itallianoFont);
            doc.addFont('Italliano.ttf', 'Italliano', 'normal');

            const robotoFont = MediaConstants.robotoFont;
            doc.addFileToVFS('Roboto-Regular.ttf', robotoFont);
            doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');

            const robotoBoldFont = MediaConstants.robotoBoldFont;
            doc.addFileToVFS('Roboto-Bold.ttf', robotoBoldFont);
            doc.addFont('Roboto-Bold.ttf', 'Roboto-Bold', 'normal');

            this.date = this.formatDateWithOrdinal(completedData);
            let imgData = 'assets/images/certificate-template.png'; // URL of your image
            let xhr = new XMLHttpRequest();
            xhr.open('GET', imgData, true);
            xhr.responseType = 'blob';
            xhr.onload = () => {
              let reader = new FileReader();
              reader.onloadend = () => {
                imgData = reader.result as string;
                doc.setTextColor(241, 240, 228, 255); // RGB for black

                // Set the background image
                // doc.addImage(imgData, 'PNG', 0, 0, 297, 210);
                doc.addImage(
                  imgData,
                  'PNG',
                  -28,
                  -38,
                  352,
                  283,
                  undefined,
                  'FAST'
                );

                // Add text
                doc.setTextColor('#4b4c50');
                doc.setFont('Roboto-Regular');
                doc.setFontSize(22);
                doc.text(`This certifies that`, 145, 80, { align: 'center' });

                doc.setFont('Roboto-Bold');
                doc.setFontSize(36);
                doc.text(`${firstName} ${lastName}`, 145, 95, {
                  align: 'center',
                });
                doc.setFont('Italliano');
                doc.setFontSize(24);
                doc.text(`has successfully completed`, 145, 112, {
                  align: 'center',
                });
                doc.setTextColor('#869d9e');
                doc.setFont('Roboto-Bold');
                doc.setFontSize(32);
                doc.text(`"${this.courseTitle}"`, 150, 128, {
                  align: 'center',
                });
                // doc.text(`with amazing activity`, 145, 130, { align: 'center' });
                doc.setTextColor('#4b4c50');
                doc.setFont('Roboto-Bold');
                doc.setFontSize(22);
                doc.text(`Awarded on the`, 145, 172, { align: 'center' });
                doc.text(`${this.date}`, 147, 182, { align: 'center' });

                // Save the PDF
                doc.save('certificate.pdf');
                this.message.remove(id);
              };
              reader.readAsDataURL(xhr.response);
            };
            xhr.send();
          },
        })
    );
  }

  formatDateWithOrdinal(dateInput: string): string {
    const date = new Date(dateInput);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const suffixes = ['th', 'st', 'nd', 'rd'];
    const relevantDigits = day < 30 ? day % 20 : day % 30;
    const suffix = relevantDigits <= 3 ? suffixes[relevantDigits] : suffixes[0];

    return `${day}${suffix} Day of ${month}, ${year}`;
  }
  isVideomodalVisible: boolean = false;
  courseTrailerUrl!: any;
  @ViewChild('reviewPlayer') reviewPlayer!: ElementRef;

  async getTrailer() {
    this.courseTrailerUrl = await this.mediaService.fetchCourseTrailer(
      this.courseParamsId
    );
    if (this.courseTrailerUrl) {
      this.isVideomodalVisible = true;
      this.seaService.pauseVideo();
    }
    if (this.isToolbar) {
      this.api.pause();
    }
  }

  handleVideomodalCancel() {
    this.courseTrailerUrl = '';
    this.isVideomodalVisible = false;
    this.seaService.resumeVideo();
    if (this.isToolbar) {
      this.api.play();
    }
  }

  // Function to handle mouse enter event
  onMouseEnter() {
    this.isHovered = true;
    this.resetInactivityTimer();
  }

  coursesToShowInitially: number = 4; // Number of courses to show initially
  coursesToShowIncrement!: number; // Number of additional courses to show when "load more" is clicked
  showAllCourses: boolean = false; // Flag to track if all courses should be shown
  loadMoreCourses() {
    // Increase the number of courses to show
    this.coursesToShowInitially += this.coursesToShowIncrement;
    this.showAllCourses = true; // Reset to show only one course initially
  }

  showLessCourses() {
    // Show fewer courses by resetting the number to show
    this.coursesToShowInitially = 4;
    this.showAllCourses = false; // Reset to show only one course initially
  }
  // Function to handle mouse leave event
  onMouseLeave() {
    this.isHovered = false;
    this.resetInactivityTimer();
  }

  // Function to reset the inactivity timer
  resetInactivityTimer() {
    clearTimeout(this.inactivityTimer);

    // Set a timeout to hide controls after 4 seconds of inactivity
    this.inactivityTimer = setTimeout(() => {
      this.isHovered = false;
    }, 1000);
  }

  //  Listen to mousemove event to reset hover state
  @HostListener('document:mousemove', ['$event'])
  handleMouseMove(event: MouseEvent) {
    this.onMouseEnter();
  }

  // COLREGS
  isToolbarVideo = true;
  isToolbarVideoPlaying = false;
  isgoback = false;
  isradarvisible = false;
  isMainVideoPlaying: Boolean = true;

  radarImage: any;
  buttonClickSound = new Audio();

  isScreenWidthBelow1200px: boolean = window.innerWidth < 1400;
  isScreenWidthBelow550px: boolean = window.innerWidth < 550;
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isScreenWidthBelow1200px = window.innerWidth < 1400;
  }

  handleVideoLoaded() {
    const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;

    // Now that the video is loaded, set the currentTime
    videoElement.currentTime = this.currentBridgeVideoTIme;

    // Try playing the video
    videoElement
      .play()
      .then(() => {
        console.log('Video playback started');
      })
      .catch((error) => {
        console.error('Error trying to play the video', error);
      });
  }

  goback() {
    this.buttonClickSound.play();
    console.log(this.currentBridgeVideoTIme);

    this.isToolbarVideo = true;
    this.isToolbarVideoPlaying = false;
    this.isgoback = false;
    this.isradarvisible = false;
    this.isMainVideoPlaying = true;
    this.sources = [];
    this.sources.push({
      src: this.currentVideoPlaylist[0].src,
      type: this.currentVideoPlaylist[0].type,
    });
  }

  async showToolBarViewVideo(videoIndex: number) {
    this.buttonClickSound.play();
    this.isToolbarVideo = false;
    this.isToolbarVideoPlaying = true;
    this.isgoback = true;
    this.isMainVideoPlaying = false;

    const selectedMedia = this.currentVideoPlaylist[videoIndex];

    const videoPlayer: HTMLVideoElement = this.videoPlayer?.nativeElement;

    if (selectedMedia.type.startsWith('image/')) {
      this.isradarvisible = true;
      this.sources = [];
      this.videoPlayer.nativeElement.poster = selectedMedia.src;
      this.currentBridgeVideoTIme = videoPlayer.currentTime;
    } else {
      this.videoPlayer.nativeElement.poster = '';
      this.sources = [];
      this.sources.push({
        src: this.currentVideoPlaylist[videoIndex].src,
        type: this.currentVideoPlaylist[videoIndex].type,
      });
      this.currentBridgeVideoTIme = videoPlayer.currentTime;
    }

    console.log(this.currentBridgeVideoTIme);
  }

  isObjectiveVisible = false;
  async showObjectiveModal() {
    this.buttonClickSound.play();
    this.isObjectiveVisible = true;

    this.api.pause();
    // const videoPlayer: HTMLVideoElement = this.videoPlayer?.nativeElement;
    // this.currentBridgeVideoTIme = videoPlayer.currentTime;

    // videoPlayer.pause();
    let docElement = document.documentElement;

    docElement.requestFullscreen();
  }

  closeobjectivemodal() {
    this.isObjectiveVisible = false;
    document.exitFullscreen();
    this.buttonClickSound.play();
    this.api.play();
    // const videoElement: HTMLVideoElement = this.videoPlayer.nativeElement;
    // videoElement.play();

    // videoElement.addEventListener('loadeddata', () => {
    //   videoElement.currentTime = this.currentBridgeVideoTIme;
    //   videoElement.play(); // Start playing from the stored currentTime
    // });
  }

  countPlayerViewTime() {
    this.isPlayerPlaying = !this.isPlayerPlaying;
    this.isPlayerPlaying
      ? (this.PlayerInterval = setInterval(() => {
          this.playerViewTime++;
        }, 1000))
      : clearInterval(this.PlayerInterval);
  }

  scrollToCurrentOrder() {
    setTimeout(() => {
      const container = document.getElementById('scrollableContainer');
      const element = document.getElementById(
        `course-card-${this.currentOrder}`
      );
      if (container && element) {
        const containerTop = container.offsetTop;
        const elementTop = element.offsetTop;
        const scrollPosition = elementTop - containerTop;

        container.scrollTop = scrollPosition;
      }
    }, 0);
  }

  afterfailedassessment() {
    let videoSource = '';
    // this.dayVideoArray.map((item: any) => {
    //   if (this.currentVideoIndex === item.index) {
    //     videoSource = item.src;
    //   }
    // });
    setTimeout(() => {
      const rewatchButton = document.querySelector(
        '.start-button3'
      ) as HTMLButtonElement;
      if (rewatchButton) {
        rewatchButton.click();
      }
    }, 1000);
  }

  isFullDescriptionShown = false;

  toggleDescription() {
    this.isFullDescriptionShown = !this.isFullDescriptionShown;
  }

  updateStatus(eventData: {
    showVideo: boolean;
    showRewatchandAssessment: boolean;
    isVideoPlaying: boolean;
  }) {
    this.showVideo = eventData.showVideo;
    this.showRewatchandAssessment = eventData.showRewatchandAssessment;
    this.isVideoPlaying = eventData.isVideoPlaying;
    this.saveVideoProgress();
  }
  getPlayIcon(item: any): string {
    if (
      item.isQuestionnaire === 'Yes' &&
      item.isAssessmentCompleted &&
      item.progressPercentage === 100
    ) {
      return 'assets/icons/tick-circle.svg';
    } else if (this.currentOrder !== item.order || !this.isVideoPlaying) {
      return 'assets/icons/play-circle.svg';
    } else if (this.currentOrder === item.order && this.isVideoPlaying) {
      return 'assets/icons/pause.svg';
    }
    return '';
  }

  getPlayIconLightTheme(item: any): string {
    if (
      item.isQuestionnaire === 'Yes' &&
      item.isAssessmentCompleted &&
      item.progressPercentage === 100
    ) {
      return 'assets/icons/tick-circle.svg';
    } else if (this.currentOrder !== item.order || !this.isVideoPlaying) {
      return 'assets/icons/play-circle-gray.svg';
    } else if (this.currentOrder === item.order && this.isVideoPlaying) {
      return 'assets/icons/pause-dark.svg';
    }
    return '';
  }

  isSpecialCase(item: any): boolean {
    return (
      item.isQuestionnaire === 'Yes' &&
      item.isAssessmentCompleted &&
      item.progressPercentage === 100
    );
  }

  async ngOnInit(): Promise<void> {
    const currentTheme = this.themeService.getSavedTheme();

    this.subcriptions.add(
      (this.themeSubscription = this.themeService
        .isDarkThemeObservable()
        .subscribe((isDark: boolean) => {
          this.isDarkTheme = isDark;
        }))
    );

    this.seaService.rewatchVideo$.subscribe(() => {
      this.afterfailedassessment();
    });

    this.seaService.closeHelpModal$.subscribe(() => {
      this.closeHelpmodal();
    });

    this.seaService.saveProgress$.subscribe(() => {
      this.videoFinishedFunction();
    });

    // this.companyId = await this.auth.getCompanyIdFromToken();
    // this.companyName = await this.auth.getCompanyNameFromTOken();
    // this.name = await this.auth.getNameFromTOken();

    this.userId = await this.auth.getIdFromToken();
    await this.getRatingAndReviews();

    await this.fetchPosts();
    await this.getUserDetails(this.courseParamsId);
    this.loadHtmlTemplate();
    this.scrollToCurrentOrder();
  }

  ngOnDestroy(): void {
    if (this.isVideoPlaying && this.isToolbar) {
      const videoPlayer: HTMLVideoElement = this.videoPlayer.nativeElement;

      // Stop video playback
      videoPlayer.pause();

      // Reset the video source or set it to an empty string to ensure it stops downloading
      videoPlayer.src = '';
      videoPlayer.load();
    }
    this.subcriptions.unsubscribe();
  }
}
