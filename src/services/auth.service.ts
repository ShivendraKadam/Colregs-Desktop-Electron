import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, pipe, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as CryptoJS from 'crypto-js';

const BACKEND_URL: any = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userPayload: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private modalService: NzModalService
  ) {
    this.userPayload = [];
  }

  login(data: any, companyName: any) {
    return this.http
      .post(BACKEND_URL + `/users/login/${companyName}`, data, {
        withCredentials: true,
      })
      .pipe(
        tap(async (res: any) => {
          if (data.remember === true) {
            this.cookieService.set('_Remember_me', JSON.stringify(data));
          }
          this.setSession(res);
        })
      );
  }
  getIsTermsRead(userId: any) {
    return this.http.get(BACKEND_URL + `/users/isTermsRead/${userId}`);
  }
  private async setSession(authResult: any) {
    const expiresAt = moment().add(authResult.sessionExpireIn, 'second');
    if (authResult.success !== true) {
      this.userPayload = '';
      return;
    }
    const expirydate = new Date();
    expirydate.setDate(expirydate.getDate() + 15);
    // await this.cookieService.set(
    //   'jwt',
    //   authResult.token,
    //   expirydate,
    //   '/',
    //   '',
    //   false,
    //   'Lax'
    // );

    const encryptedToken = CryptoJS.AES.encrypt(
      authResult.token.toString(),
      'encryptionKey'
    ).toString();

    localStorage.setItem('jwt', encryptedToken);
    console.log('cookies', authResult.cookie);
    localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
    this.userPayload = await this.decodedToken();
    localStorage.setItem('name', this.userPayload.name);
  }

  async logout() {
    // localStorage.removeItem("id_token");
    const companyName = await this.getCompanyNameFromTOken();

    // await this.cookieService.delete('jwt', '/');

    // await this.cookieService.delete('CloudFront-Key-Pair-Id', '/');
    // await this.cookieService.delete('CloudFront-Policy', '/');
    // await this.cookieService.delete('CloudFront-Signature', '/');

    localStorage.removeItem('expires_at');
    localStorage.removeItem('jwt');

    await this.cookieService.delete('_Remember_me', '/');
    localStorage.removeItem('IsLoggedIn');
    this.router.navigate([`${companyName}/login`]);
    this.userPayload = '';
  }

  public isLoggedIn() {
    return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }

  getExpiration() {
    const expiration: any = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }
  async getphoneNoFromToken() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.phoneNo;
  }
  async decodedToken() {
    const encryptedtoken: any = localStorage.getItem('jwt');
    const decryptedToken = CryptoJS.AES.decrypt(
      encryptedtoken,
      'encryptionKey'
    ).toString(CryptoJS.enc.Utf8);

    console.log(decryptedToken);
    const jwtHelper = new JwtHelperService();
    const decodeToken = JSON.stringify(jwtHelper.decodeToken(decryptedToken));
    return jwtHelper.decodeToken(decryptedToken);
  }

  async getToken() {
    this.userPayload = await this.decodedToken();
    return this.userPayload;
  }

  checkIsLoggedIn(): boolean {
    const encryptedtoken: any = localStorage.getItem('jwt');
    let decryptedToken;
    if (encryptedtoken) {
      decryptedToken = CryptoJS.AES.decrypt(
        encryptedtoken,
        'encryptionKey'
      ).toString(CryptoJS.enc.Utf8);
    }
    if (decryptedToken) {
      return true;
    } else {
      return false;
    }
  }

  isTokenPresent(): boolean {
    const encryptedtoken: any = localStorage.getItem('jwt');
    const decryptedToken = CryptoJS.AES.decrypt(
      encryptedtoken,
      'encryptionKey'
    ).toString(CryptoJS.enc.Utf8);
    return !!decryptedToken;
  }

  async getRoleFromTOken() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.role;
  }

  async getNameFromTOken() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.username;
  }

  async getCompanyNameFromTOken() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.companyName;
  }

  async getCompanyIdFromToken() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.companyId;
    // return this.userPayload.companyId;
  }

  async getIdFromToken() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.id;
  }

  async getEmailFromToken() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.email;
  }

  async getisCreateCourse() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.CreateCourse;
  }

  async getisCustomCourseAccess() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.isCustomCourseAccess;
  }

  async getisAssignSubCourses() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.AssignSubCourses;
  }

  async getisEditStaff() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.EditStaff;
  }

  async getisEditFarer() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.EditFarer;
  }

  async getisCreateFarer() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.CreateFarer;
  }

  async getisCreateStaff() {
    this.userPayload = await this.decodedToken();
    return this.userPayload.CreateStaff;
  }

  async saveAndVerify(data: any) {
    return await this.http.post(BACKEND_URL + '/verify/:secretToken', data);
  }

  createCompanyAndUser(file: File, data: any) {
    const formData = new FormData();
    formData.append('companyLogo', file);
    formData.append('data', JSON.stringify(data));
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    return this.http
      .post(BACKEND_URL + '/users/company', formData, { headers: headers })
      .pipe(map((res: any) => res));
  }

  getSuperAdminComponentList(): string[] {
    // Return a list of component names
    return [
      'Add New Company',
      'Manage Companies',
      'Manage Categories',
      'Role and Permissions',
      'Manage Sub Categories',
      'My Courses',
      'Custom Courses',
    ];
  }

  search(query: string): string[] {
    // Perform search logic (e.g., filter components based on the query)
    const componentList = this.getSuperAdminComponentList();
    return componentList.filter((component) =>
      component.toLowerCase().includes(query.toLowerCase())
    );
  }

  toggleIsTermsRead(userId: any) {
    return this.http.get(BACKEND_URL + `/users/toggleIsTermsRead/${userId}`);
  }
}
