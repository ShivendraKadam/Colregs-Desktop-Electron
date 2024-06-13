import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const BACKEND_URL: any = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) { }
  createUsers(data: any) {
    return this.http.post(BACKEND_URL + '/users/comapny-users', data);
  }

  fetchUsers(type: any) {
    return this.http.get(BACKEND_URL + `/users/company-users/${type}`);
  }

  getUserDetails(email: any) {
    return this.http.get(BACKEND_URL + `/users/company-user/${email}`);
  }

  fetchShoreStaffOfCompany(companyId: any) {
    return this.http.get(BACKEND_URL + `/users/shore-staff/${companyId}`);
  }

  fetchSeaFarersOfCompany(companyId: any) {
    return this.http.get(BACKEND_URL + `/users/sea-farer/${companyId}`);
  }

  addUsersFromFile(xlsxFile: File, companyId: any) {
    const formData = new FormData();

    formData.append('xlsxFile', xlsxFile);
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(
      BACKEND_URL + `/users/addSeaFarersFromFile/${companyId}`,
      formData
    );
  }

  fetchUserByUserId(userId: any) {
    return this.http.get(BACKEND_URL + `/users/user/${userId}`);
  }

  fetchUserByUserIdForProfile(userId: any) {
    return this.http.get(BACKEND_URL + `/users/profile/${userId}`);
  }

  uploadSeaFarersInBulk(companyId: any, users: any) {
    return this.http.post(
      BACKEND_URL + `/users/uploadSeaFarersInBulk/${companyId}`,
      users
    );
  }

  uploadShoreStaffInBulk(companyId: any, users: any) {
    return this.http.post(
      BACKEND_URL + `/users/uploadShoreStaffInBulk/${companyId}`,
      users
    );
  }

  async changeUserAuthorization(userId: any, isStatus: Boolean) {
    return this.http.put(BACKEND_URL + `/users/user-status/${userId}`, {
      isStatus: isStatus,
    });
  }


  updateUserByUserId(userId: any, data: any) {
    // const formData = new FormData();
    // formData.append('data', JSON.stringify(data));
    // const headers = new HttpHeaders();
    // headers.append('Content-Type', 'multipart/form-data');

    return this.http.put(BACKEND_URL + `/users/user/${userId}`, data);
  }

  updateProfilePhoto(userId: any, file: File) {
    const formData = new FormData();
    formData.append('profile', file);
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(
      BACKEND_URL + `/media/profile-photo/${userId}`,
      formData,
      {
        headers: headers,
      }
    );
  }

  fetchProfilePhoto() {
    return this.http.get(BACKEND_URL + `/media/profile-photo/:userId`);
  }
  updatePassword(userId: any, data: any) {
    return this.http.put(BACKEND_URL + `/users/password/${userId}`, data);
  }



}
