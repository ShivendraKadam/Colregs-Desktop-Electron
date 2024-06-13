import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Observable, catchError, map, throwError, forkJoin } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { MediaConstants } from 'src/utils/constants';

const BACKEND_URL: any = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class OwnerService {
  private editCompanyDetailsForm!: FormGroup;
  public imageUrl: any;
  private editAdminDetailsForm!: FormGroup;
  private editBankDetailsForm!: FormGroup;

  constructor(private http: HttpClient) { }

  fetchAllCompanies() {
    return this.http.get(BACKEND_URL + '/owner/company');
  }

  fetchCompanyByEmail(email: any) {
    return this.http.get(BACKEND_URL + `/owner/company/${email}`);
  }

  fetchCompanyAssest(companyId: any) {
    return this.http.get(BACKEND_URL + `/owner/company-assest/${companyId}`);
  }

  fetchCompanyByCompanyName(companyName: any) {
    return this.http.get(
      BACKEND_URL + `/owner/company-by-companyName/${companyName}`
    );
  }

  editCompany(dataToUpdate: any, email: any) {
    return this.http.put(BACKEND_URL + `/owner/company/${email}`, dataToUpdate);
  }

  editCompanyPermissions(companies: any) {
    return this.http.put(
      BACKEND_URL + `/owner/edit-company-permissions`,
      companies
    );
  }

  addCategories(data: any) {
    return this.http.post(BACKEND_URL + `/owner/categories`, data);
  }

  addSubCategories(data: any) {
    return this.http.post(BACKEND_URL + `/owner/sub-categories`, data);
  }

  fetchAllCategories() {
    return this.http.get(BACKEND_URL + `/owner/categories`);
  }

  fetchAllSubCategories() {
    return this.http.get(BACKEND_URL + `/owner/sub-categories`);
  }

  createCourse(data: any, file: File, fileTrailer: File) {
    const formData = new FormData();
    formData.append('courseThumb', file);
    formData.append('courseTrailer', fileTrailer);
    formData.append('data', JSON.stringify(data));
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.post(BACKEND_URL + `/owner/courses`, formData);
  }

  addCourseDetails(data: any) {
    return this.http.post(BACKEND_URL + `/owner/addCourseDetails`, data);
  }

  async addVideoAndQuestion(
    xlsxFile: any,
    thumbNailFile: File,
    videoFile: File,
    videoData: any
  ): Promise<Observable<any>> {
    // Create a unique identifier for this upload
    const uploadId = uuidv4();
    const videoFileSize = videoFile.size;
    const videoFileName = videoFile.name;
    // Split the video file into chunks
    const fileChunks: Blob[] = [];
    const mediaChunkSize = MediaConstants.chunkSize;
    const totalChunks = Math.ceil(videoFileSize / mediaChunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * mediaChunkSize;
      const end = Math.min(start + mediaChunkSize, videoFileSize);
      const chunk = videoFile.slice(start, end);
      fileChunks.push(chunk);
    }

    // Send each chunk as a separate request
    const uploadRequests: Observable<any>[] = [];

    for (let i = 0; i < fileChunks.length; i++) {
      const chunk = fileChunks[i];

      const formData = new FormData();
      formData.append('videoChunk', chunk, 'chunk_' + i); // Use a unique name for each chunk
      formData.append('chunkIndex', 'chunk_' + i);
      formData.append('uploadId', uploadId);
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      const uploadRequest = this.http.post(
        BACKEND_URL + '/owner/uploadChunk',
        formData,
        {
          headers: headers,
        }
      );
      uploadRequests.push(uploadRequest);
    }

    // Wait for all chunk uploads to complete
    return Observable.create(
      (observer: {
        next: (arg0: Object) => void;
        complete: () => void;
        error: (arg0: any) => void;
      }) => {
        forkJoin(uploadRequests).subscribe((results: any) => {
          // All chunks have been uploaded
          // Now, send the metadata and remaining data
          const formData = new FormData();
          if (videoData.manually) {
            formData.append('xlsxFile', JSON.stringify(xlsxFile.question));
            formData.append(
              'assessmentQuestionCount',
              JSON.stringify(xlsxFile.assessmentQuestionCount)
            );
          } else {
            formData.append('xlsxFile', xlsxFile);
          }
          formData.append('videoThumb', thumbNailFile);
          const videoDetails = {
            uploadId,
            videoFileSize,
            videoFileName,
            ...videoData,
          };
          formData.append('data', JSON.stringify(videoDetails));
          formData.append('uploadId', uploadId);

          // Send the final request to the backend to complete the upload
          this.http.post(BACKEND_URL + '/owner/videos', formData).subscribe(
            (res) => {
              observer.next(res);
              observer.complete();
            },
            (err) => {
              console.error('Error:', err);
              observer.error(err);
            }
          );
        });
      }
    ).pipe(
      catchError((error: any) => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }

  async getUploadedVideo(id: any) {
    try {
      const headers = new HttpHeaders().set('Range', '10000');
      const options = {
        headers: headers,
        responseType: 'arraybuffer' as 'json', // You may need to specify the responseType correctly
      };
      const Response = await this.http
        .get(BACKEND_URL + `/owner/video-details/${id}`, options)
        .toPromise();
      return Response as ArrayBuffer;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error; // Rethrow the error if needed
    }
  }

  getDashBoardData() {
    return this.http.get(BACKEND_URL + `/owner/dashboard`);
  }

  addDocuments(documentData: any, xlsxFile: any) {
    const formData = new FormData();

    formData.append('documentData', JSON.stringify(documentData));
    if (documentData.manually) {
      formData.append('xlsxFile', JSON.stringify(xlsxFile.question));
      formData.append(
        'assessmentQuestionCount',
        JSON.stringify(xlsxFile.assessmentQuestionCount)
      );
    } else {
      formData.append('xlsxFile', xlsxFile);
    }

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.post(BACKEND_URL + `/owner/documents`, formData);
  }

  fetchVideosByCourseId(courseId: any) {
    return this.http.get(BACKEND_URL + `/owner/videos/${courseId}`);
  }

  fetchVideoByVideoId(courseId: any, videoId: any) {
    return this.http.get(
      BACKEND_URL + `/owner/fetchVideoByVideoId/${courseId}/${videoId}`
    );
  }

  fetchDocumentByDocumentId(courseId: any, documentId: any) {
    return this.http.get(
      BACKEND_URL + `/owner/documentByDocumentId/${courseId}/${documentId}`
    );
  }

  editVideoDetails(courseId: any, videoId: any, data: any, xlsxFile: any) {
    const formData = new FormData();
    formData.append('xlsxFile', xlsxFile);
    formData.append('data', JSON.stringify(data));
    console.log(formData)
    console.log(xlsxFile)
    console.log(data)

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.put(
      BACKEND_URL + `/owner/video/${courseId}/${videoId}`,
      formData
    );
  }

  deleteVideo(courseId: any, videoId: any) {
    return this.http.delete(
      BACKEND_URL + `/owner/videos/${videoId}/${courseId}`
    );
  }

  deleteDocument(courseId: any, documentId: any) {
    return this.http.delete(
      BACKEND_URL + `/owner/documents/${documentId}/${courseId}`
    );
  }

  editDocument(data: any, documentFile: File) {
    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('data', JSON.stringify(data));

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/ form-data');

    return this.http.put(BACKEND_URL + `/owner/document`, formData);
  }

  fetchQuestionByVideoId(videoId: any) {
    return this.http.get(BACKEND_URL + `/owner/questions/${videoId}`);
  }

  fetchVideoQuestionsByCourseId(courseId: any) {
    return this.http.get(
      BACKEND_URL + `/owner/fetch-video-questions/${courseId}`
    );
  }

  fetchDocumentQuestionsByCourseId(courseId: any) {
    return this.http.get(
      BACKEND_URL + `/owner/fetchDocumentQuestionsByCourseId/${courseId}`
    );
  }

  fetchQuestionByDocumentId(documentId: any) {
    return this.http.get(
      BACKEND_URL + `/owner/questions-of-documents/${documentId}`
    );
  }

  fetchDocumentsByCourseId(courseId: any) {
    return this.http.get(BACKEND_URL + `/owner/documents/${courseId}`);
  }

  fetchCourseByCourseId(courseId: any) {
    return this.http.get(BACKEND_URL + `/owner/courses/${courseId}`);
  }

  fetchCourseOnIdForEdit(courseId: any) {
    return this.http.get(BACKEND_URL + `/owner/course-for-edit/${courseId}`);
  }

  fetchCoursesByCompanyId(companyId: number) {
    return this.http.get(
      BACKEND_URL + `/owner/courses-by-companyId/${companyId}`
    );
  }

  fetchCoursesForRoles(companyId: number) {
    return this.http.get(BACKEND_URL + `/owner/company-courses/${companyId}`);
  }

  fetchAllCourses() {
    return this.http.get(BACKEND_URL + `/owner/courses`);
  }

  fetchCustomCourses() {
    return this.http.get(BACKEND_URL + `/owner//custom-courses`);
  }

  fetchCoursesByIDs(courseIDs: any) {
    const params = new HttpParams().set('courseIDs', JSON.stringify(courseIDs)); // Convert array to JSON string
    return this.http.get(BACKEND_URL + `/owner/courses-by-ids`, { params });
  }

  assignCoursesToCompany(data: any) {
    return this.http.post(BACKEND_URL + `/owner/map-courses-companies`, data);
  }

  // FORM DETAILS SETTERS AND GETTER

  setCompanyDetails(form: FormGroup, imageUrl: any) {
    this.editCompanyDetailsForm = form;
    this.imageUrl = imageUrl;
  }

  getCompanyDetails(): any {
    const companyForm = {
      imageUrl: this.imageUrl,
      editCompanyDetailsForm: this.editCompanyDetailsForm,
    };
    return companyForm;
  }

  setCompanyAdminDetails(form: FormGroup) {
    this.editAdminDetailsForm = form;
  }

  getCompanyAdminDetails(): FormGroup {
    return this.editAdminDetailsForm;
  }

  setCompanyBankDetails(form: FormGroup) {
    this.editBankDetailsForm = form;
  }

  getCompanyBankDetails(): FormGroup {
    return this.editBankDetailsForm;
  }

  editSubCategories(data: any) {
    return this.http.put(BACKEND_URL + `/owner/sub-categories`, data);
  }

  deleteSubCategories(subCategoryId: any) {
    return this.http.delete(
      BACKEND_URL + `/owner/sub-categories/${subCategoryId}`
    );
  }

  editCategories(data: any, id: any) {
    return this.http.put(BACKEND_URL + `/owner/categories/${id}`, data);
  }

  deleteategories(categoryId: any) {
    return this.http.delete(BACKEND_URL + `/owner/categories/${categoryId}`);
  }
  deleteCourses(CourseId: any) {
    return this.http.delete(BACKEND_URL + `/owner/courses/${CourseId}`);
  }

  fetchCourseonId(courseId: any) {
    return this.http.get(BACKEND_URL + `/owner/courses/${courseId}`);
  }

  editCourse(courseData: any) {
    return this.http.put(BACKEND_URL + `/owner/courses`, courseData);
  }

  changeCourseAuthStatus(data: any) {
    return this.http.put(BACKEND_URL + `/owner/changeCourseAuthStatus`, data);
  }

  sendActivationOTPEmail(data: any) {
    return this.http.post(BACKEND_URL + `/owner/sendActivationOTPEmail`, data);
  }

  getRelatedSubCategories(id: number) {
    return this.http.get(BACKEND_URL + `/owner/co-subcat/${id}`);
  }

  verifyOTP(data: any) {
    return this.http.post(BACKEND_URL + `/owner/verifyOTP`, data);
  }

  changeCompanyAuthorization(data: any) {
    return this.http.post(
      BACKEND_URL + `/owner/changeCompanyAuthorization`,
      data
    );
  }

  changeCourseAuthorization(data: any) {
    return this.http.post(
      BACKEND_URL + `/owner/changeCourseAuthorization`,
      data
    );
  }

  fetchVideosAndDocuments(courseId: any) {
    return this.http.get(
      BACKEND_URL + `/owner/fetchVideosAndDocuments/${courseId}`
    );
  }

  getSubscriptionRequests() {
    return this.http.get(BACKEND_URL + `/owner/sub-requests`);
  }

  approveSubscriptionRequest(data: any) {
    return this.http.post(
      BACKEND_URL + `/owner/approveSubscriptionRequest`,
      data
    );
  }

  rejectSubscriptionRequest(data: any) {
    return this.http.post(
      BACKEND_URL + `/owner/reject-subscription-request`,
      data
    );
  }

  courseDetails(data: any) {
    return this.http.post(BACKEND_URL + '/owner/course-details', data);
  }

  courseThumbnail(thumbnailData: any) {
    const formData = new FormData();
    formData.append('courseThumb', thumbnailData.courseThumbnailFile);
    formData.append('courseId', thumbnailData.courseId);
    formData.append('folderPath', thumbnailData.folderPath);
    formData.append('startTime', thumbnailData.startTime);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.post(BACKEND_URL + `/media/course-thumbnail`, formData);
  }

  courseTrailer(courseTrailer: File, courseId: any) {
    const formData = new FormData();
    formData.append('courseThumb', courseTrailer);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.post(
      BACKEND_URL + `/owner/course-trailer/${courseId}`,
      formData
    );
  }

  async saveVideoThumbnail(videoData: any, videoFile: File) {
    const formData = new FormData();
    formData.append('videoThumb', videoFile);
    formData.append('data', JSON.stringify(videoData));
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/ form-data');
    return this.http.post(BACKEND_URL + `/media/video-thumbnail`, formData);
  }

  async saveVideoEcdis(videoData: any, videoFile: File) {
    const formData = new FormData();
    formData.append('videoEcdis', videoFile);
    formData.append('data', JSON.stringify(videoData));
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.post(BACKEND_URL + `/media/video-ecdis`, formData);
  }

  async saveVideoRadar(videoData: any, videoFile: File) {
    const formData = new FormData();
    formData.append('videoRadar', videoFile);
    formData.append('data', JSON.stringify(videoData));
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.post(BACKEND_URL + `/media/video-radar`, formData);
  }

  videoDetails(xlsxFile: any, videoData: any) {
    const formData = new FormData();

    if (videoData.manually) {
      formData.append('xlsxFile', JSON.stringify(xlsxFile.question));
      formData.append(
        'assessmentQuestionCount',
        JSON.stringify(xlsxFile.assessmentQuestionCount)
      );
    } else {
      formData.append('xlsxFile', xlsxFile);
    }

    formData.append('data', JSON.stringify(videoData));
    return this.http.post(BACKEND_URL + '/owner/video-details', formData);
  }

  // initiateUpload(fileName: string): Observable<{ uploadId: string }> {
  //   alert(fileName)
  //   return this.http.post<{ uploadId: string }>(BACKEND_URL + '/media/initiateUpload', fileName)
  // }

  initiateUpload(fileName: string, folderPath: string, startTime: any) {
    const params = new HttpParams()
      .set('folderPath', folderPath)
      .set('startTime', startTime);
    return this.http.post(
      BACKEND_URL + '/media/initiateUpload',
      { fileName },
      { params }
    );
  }

  uploadChunk(formData: FormData, uploadId: string): Observable<void> {
    const params = new HttpParams().set('uploadId', uploadId); // Convert array to JSON string
    return this.http.post<void>(BACKEND_URL + `/media/upload`, formData, {
      params,
    });
  }

  completeUpload(
    trailerData: any
  ): Observable<{ success: boolean; data?: any }> {
    return this.http.post<{ success: boolean; data?: any }>(
      BACKEND_URL + `/media/completeUpload`,
      trailerData
    );
  }

  uploadCategoryThumbnail(data: File, categoryId: any) {
    const formData = new FormData();

    formData.append('catThumb', data);
    formData.append('categoryId', categoryId);
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http.post(BACKEND_URL + `/media/category-thumbnail`, formData, {
      headers: headers,
    });
  }

  async getLogByCompanyId(companyId: any) {
    return await this.http.get(BACKEND_URL + `/owner/logs/${companyId}`)
  }

  fetchLogFile(data: any): Observable<any> {
    const url = BACKEND_URL + `/owner/company-logs/${data}`;
    return this.http.get(url, {
      responseType: 'blob', // Set response type to blob
      headers: new HttpHeaders({
        'Content-Type': 'application/octet-stream' // Set content type to application/octet-stream
      }),
      observe: 'response' // observe full response including headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  async getNotification(userId: any) {
    return await this.http.get(BACKEND_URL + `/owner/notification/${userId}`);
  }

  updateOwnerQuestionAssessment(data: any) {
    return this.http.post(BACKEND_URL + `/owner/update-questions`, data);
  }

  async getLogByUserId(userId: any) {
    return await this.http.get(BACKEND_URL + `/owner/logs/${userId}`)
  }

  async downloadLogsByData(uniqueId: any) {
    const params = new HttpParams().set('params', uniqueId);
    return await this.http.get(BACKEND_URL + `/owner/company-logs`, { params, responseType: 'text' })
  }
}
