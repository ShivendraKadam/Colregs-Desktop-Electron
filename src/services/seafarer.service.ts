import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, of, Subject, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { VideoplayerComponent } from 'src/app/video-player/videoplayer.component';

const BACKEND_URL: any = environment.apiUrl;
@Injectable({
  providedIn: 'root',
})
export class SeafarerService {
  constructor(private http: HttpClient, private auth: AuthService) { }

  private isScroll = new BehaviorSubject<boolean>(false);

  get isScroll$() {
    return this.isScroll.asObservable();
  }
  private isScroll1 = new BehaviorSubject<boolean>(false);

  get isScroll1$() {
    return this.isScroll1.asObservable();
  }

  private photoUploadedSubject = new Subject<void>();

  photoUploaded$ = this.photoUploadedSubject.asObservable();

  private rewatchVideoSubject = new Subject<void>();
  rewatchVideo$ = this.rewatchVideoSubject.asObservable();

  rewatchVideo() {
    this.rewatchVideoSubject.next();
  }

  private closeHelpModalSubject = new Subject<void>();
  closeHelpModal$ = this.closeHelpModalSubject.asObservable();

  closeHelpModal() {
    this.closeHelpModalSubject.next();
  }

  private saveProgressSubject = new Subject<void>();
  saveProgress$ = this.saveProgressSubject.asObservable();

  saveVideoProgress() {
    this.saveProgressSubject.next();
  }

  private saveDashProgressSubject = new Subject<void>();
  saveDashProgress$ = this.saveDashProgressSubject.asObservable();

  saveDashProgress() {
    this.saveDashProgressSubject.next();
  }

  private videoPlayerComponent!: VideoplayerComponent

  public registerVideoPlayer(component: VideoplayerComponent) {
    this.videoPlayerComponent = component;
  }

  public getVideoPlayer(): VideoplayerComponent | null {
    return this.videoPlayerComponent;
  }

  private pauseVideoSubject = new BehaviorSubject<boolean>(false);

  // Observable to be used by the VideoPlayerComponent
  public pauseVideoObservable = this.pauseVideoSubject.asObservable();

  // Method to trigger video pause
  public pauseVideo() {
    this.pauseVideoSubject.next(true);
  }

  // Method to reset the pause state
  public resumeVideo() {
    this.pauseVideoSubject.next(false);
  }

  triggerPhotoUploaded() {
    this.photoUploadedSubject.next();
  }

  setIsScroll(value: boolean) {
    this.isScroll.next(value);
  }
  setIsScroll1(value: boolean) {
    this.isScroll1.next(value);
  }

  fetchAllCourses(email: string) {
    return this.http.get(BACKEND_URL + `/sea-farer/courses/${email}`);
  }

  fetchCourses(courseId: number, userId: any) {
    return this.http.get(
      BACKEND_URL + `/sea-farer/course/${courseId}/${userId}`
    );
  }

  fetchCourseContent(courseId: number, userId: any) {
    return this.http.get(
      BACKEND_URL + `/sea-farer/courseContent/${courseId}/${userId}`
    );
  }

  fetchVideoThumbnails(id: number) {
    return this.http.get(BACKEND_URL + `/sea-farer/fetchVideoThumbnails/${id}`);
  }

  courseThumbnail(courseId: number) {
    return this.http.get(
      BACKEND_URL + `/sea-farer/courseThumbnail/${courseId}`
    );
  }

  fetchPostsOfCourse(courseId: any, id: any) {
    return this.http.get(BACKEND_URL + `/sea-farer/posts/${courseId}/${id}`);
  }

  getQuestsionByVideoId(id: any, userId: any, type: any, companyId: any) {
    return this.http.get(
      BACKEND_URL + `/sea-farer/questions/${id}/${userId}/${type}/${companyId}`
    );
  }

  saveAssessmentData(data: any) {
    return this.http.post(BACKEND_URL + `/sea-farer/Assessment`, data);
  }

  getAssesmentData(id: any) {
    return this.http.get(BACKEND_URL + `/sea-farer/Assessment/${id}`);
  }

  savePosts(data: any) {
    return this.http.post(BACKEND_URL + `/sea-farer/posts`, data);
  }

  saveComment(data: any) {
    return this.http.post(BACKEND_URL + `/sea-farer/comment`, data);
  }
  postLikeCounts(data: any) {
    return this.http.post(BACKEND_URL + `/sea-farer/likedbyuser`, data);
  }

  changeCourseStatus(data: any) {
    return this.http.patch(BACKEND_URL + `/sea-farer/course`, data);
  }

  fetchCourseUser(courseId: any, userId: any) {
    return this.http.get(BACKEND_URL + `/sea-farer/fetchCourseUser/${courseId}/${userId}`)
  }

  private cachedData: any;

  getSeafarerData(id: any, companyId: any) {

    if (this.cachedData) {
      return of(this.cachedData); // Return cached data
    }
    else {
      return this.http.get(BACKEND_URL + `/sea-farer/leader-board/${id}/${companyId}`).pipe(
        tap(data => {
          this.cachedData = data
        })
      )
    }
  }

  getSeafarerDashboardData(userId: any) {
    // return this.http.get(BACKEND_URL + `/sea-farer/users/${id}/${companyId}`);
    return this.http.get(BACKEND_URL + `/sea-farer/dashboard/${userId}`);
  }

  getFeedBackByCourseId(courseId: any) {
    return this.http.get(BACKEND_URL + `/sea-farer/feedback/${courseId}`);
  }

  saveFeedback(data: any) {
    return this.http.post(BACKEND_URL + `/sea-farer/feedback`, data);
  }

  updateIsAssessment(data: any) {
    return this.http.put(BACKEND_URL + `/sea-farer/update-is-assessment`, data);
  }

  retakeAssessment(id: any) {
    return this.http.delete(BACKEND_URL + `/sea-farer/retake-assessment/${id}`);
  }

  createAssessment(
    id: any,
    userId: any,
    courseId: any,
    type: any,
    shuffleQuestions: any
  ) {
    const data = { userId, id, type, courseId, shuffleQuestions };
    return this.http.post(BACKEND_URL + `/sea-farer/new-assessment`, data);
  }

  saveQuestionProgress(data: any) {
    return this.http.post(BACKEND_URL + `/sea-farer/assessment-question`, data);
  }

  resumeAssessment(id: any) {
    return this.http.get(BACKEND_URL + `/sea-farer/resume-assessment/${id}`);
  }

  bestAssessment(userId: any, videoId: any) {
    return this.http.get(
      BACKEND_URL + `/sea-farer/assessment-record/${videoId}/${userId}`
    );
  }

  updateCourseTotal(userId: any, courseId: any) {
    return this.http.post(
      BACKEND_URL + `/sea-farer/update-course/${userId}/${courseId}`,
      {}
    );
  }

  async generatedPdf(date: any) {
    // return this.http.get('http://localhost:5500/auth/generateResponsePDF/0001/icheckvessel02@elementree.co.in', { responseType: 'blob' });
    return this.http.get(BACKEND_URL + `/sea-farer/generateResponsePDF`);
  }

  updateDiscardedAssessment(data: any) {
    return this.http.post(BACKEND_URL + `/sea-farer/update-assessment`, data);
  }

  async deleteNotification(id: any) {
    return this.http.delete(BACKEND_URL + `/sea-farer/notification/${id}`);
  }

  toggleFailedAssessment(data: any) {
    return this.http.post(BACKEND_URL + `/sea-farer/toggleFailedAssessment`, data)
  }

  clearCachedData() {
    this.cachedData = '';
  }

  retakeCourseProgress(courseId: any, userId: any) {
    return this.http.get(BACKEND_URL + `/sea-farer/retake-course/${courseId}/${userId}`);
  }

  async setReadMessage(data: any) {
    const companyId = await this.auth.getCompanyIdFromToken();
    const actorUserId = { actorUserId: data.actorUserId };
    const id = data.id;
    const userData = { actorUserId, companyId };
    return this.http.post(
      BACKEND_URL + `/sea-farer/update-notification-status/${id}`,
      userData
    );
  }

  getAssessmentRecord(
    userId: any,
    courseContentId: any,
    courseContentType: any
  ) {
    return this.http.get(
      BACKEND_URL +
      `/sea-farer/assessment-history/${userId}/${courseContentId}/${courseContentType}`
    );
  }

  getAssignedCourse(userId: any) {
    return this.http.get(BACKEND_URL + `/sea-farer/assign-course/${userId}`);
  }
  fetchAllCategories() {
    return this.http.get(BACKEND_URL + `/sea-farer/categories`);
  }
  fetchAllSubCategories() {
    return this.http.get(BACKEND_URL + `/sea-farer/sub-categories`);
  }
}
