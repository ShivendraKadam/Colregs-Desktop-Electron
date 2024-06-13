import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Observable, catchError, map, throwError, forkJoin } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Anchor } from 'chartjs-plugin-datalabels/types/options';
import { Subject } from 'rxjs';
const BACKEND_URL: any = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class CompanyAdminService {
  userArray: any;

  constructor(private http: HttpClient) { }

  fetchSubscribedCoursesByCompanyId(companyId: number) {
    return this.http.get(
      BACKEND_URL + `/company-admin/subscribedCourses-by-companyId/${companyId}`
    );
  }

  fetchCourseOnCompanyId(companyId: number, courseId: any) {
    return this.http.get(
      BACKEND_URL + `/company-admin/fetchCourseOnCompanyId/${companyId}/${courseId}`
    );
  }

  fetchCustomCoursesByCompanyId(companyId: number) {
    return this.http.get(
      BACKEND_URL + `/company-admin/customCourses-by-companyId/${companyId}`
    );
  }

  MapUsersToCourseByRank(ranks: any, courseId: number, companyId: number) {
    return this.http.post(
      BACKEND_URL +
      `/company-admin/map-users-to-course-rank/${courseId}/${companyId}`,
      ranks
    );
  }

  MapUsersToCourseByVesselType(
    vesselTypes: any,
    courseId: number,
    companyId: number
  ) {

    return this.http.post(
      BACKEND_URL +
      `/company-admin/map-users-to-course-vesselType/${courseId}/${companyId}`,
      vesselTypes
    );
  }

  fetchDesignationsOfCompany(companyId: number) {
    return this.http.get(
      BACKEND_URL + `/company-admin/designations/${companyId}`
    );
  }

  fetchAllCourses(companyId: number) {
    return this.http.get(BACKEND_URL + `/company-admin/courses/${companyId}`);
  }

  editUser(userId: number, dataToUpdate: Anchor) {
    return this.http.put(
      BACKEND_URL + `/company-admin/editUser/${userId}`,
      dataToUpdate
    );
  }

  deleteUsersBulk(userIds: any) {


    const params = new HttpParams().set('userIds', JSON.stringify(userIds)); // Assuming userIds is an array


    return this.http.delete(BACKEND_URL + `/company-admin/user`, { params });
  }

  fetchAssignedRanks(courseId: number, companyId: number) {
    return this.http.get(
      BACKEND_URL + `/company-admin/ranks/${courseId}/${companyId}`
    );
  }

  fetchAssignedVesselTypes(courseId: number, companyId: number) {
    return this.http.get(
      BACKEND_URL + `/company-admin/vesselTypes/${courseId}/${companyId}`
    );
  }

  mapSeaFarerToCourses(data: any) {
    return this.http.post(
      BACKEND_URL + `/company-admin/map-users-to-course`,
      data
    );
  }

  dashboardData(companyId: number) {
    return this.http.get(
      BACKEND_URL + `/company-admin/dashboardData/${companyId}`
    );
  }

  companyPermissions(companyId: number, permissions: any) {
    return this.http.post(
      BACKEND_URL + `/company-admin/companyPermissions/${companyId}`,
      permissions
    );
  }

  fetchCompanyPermissions(companyId: number) {
    return this.http.get(
      BACKEND_URL + `/company-admin/companyPermissions/${companyId}`
    );
  }

  fetchQuestionsOnCourseIDandCompanyId(courseId: any, companyId: any) {
    return this.http.get(
      BACKEND_URL + `/company-admin/questions/${courseId}/${companyId}`
    );
  }

  fetchQuestionsOnCourseIDCompanyIdVideoId(courseId: any, companyId: any, videoId: any, courseType: string) {
    return this.http.get(
      BACKEND_URL + `/company-admin/questions/${courseId}/${companyId}/${videoId}/${courseType}`
    );
  }

  addRoles(companyId: number, role: any) {
    const data = { companyId, role }
    return this.http.post(BACKEND_URL + `/company-admin/company-roles`, data);
  }

  updateCompanyQuestionAssessment(data: any) {
    return this.http.post(BACKEND_URL + `/company-admin/update-questions`, data);
  }

  createSubscriptionRequest(data: any) {
    return this.http.post(BACKEND_URL + `/company-admin/subscription-request`, data);
  }

  subscriptionStatus(courseId: any, companyId: any) {
    return this.http.get(BACKEND_URL + `/company-admin/subscriptionStatus/${courseId}/${companyId}`);
  }

  updateDurationaAndSize(data: any) {
    return this.http.put(BACKEND_URL + `/company-admin/course-duration-size`, data);
  }

  private photoUploadedSubject = new Subject<void>();

  photoUploaded$ = this.photoUploadedSubject.asObservable();

  triggerPhotoUploaded() {
    this.photoUploadedSubject.next();
  }



  setSelectedUsers(userArray: any) {
    this.userArray = userArray;
  }

  getSelectedUsers() {
    return this.userArray;
  }
}
