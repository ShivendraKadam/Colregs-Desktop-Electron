import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import * as moment from 'moment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject } from 'rxjs';
import * as CryptoJS from 'crypto-js';
const BACKEND_URL: any = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class EndUserService {
  private cartLengthSource = new BehaviorSubject<number>(0);
  cartLength$ = this.cartLengthSource.asObservable();
  private userPayload: any;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.userPayload = [];
  }

  private thumbnailCache: { [key: string]: string } = {};
  cacheThumbnailUrl(thumbnailUrl: string): void {
    // Check if the thumbnail URL is not already cached
    if (!this.thumbnailCache[thumbnailUrl]) {
      // Cache the thumbnail URL
      this.thumbnailCache[thumbnailUrl] = thumbnailUrl;
    }
  }

  getThumbnailUrl(thumbnailUrl: string): string {
    // Return the cached thumbnail URL if available
    return this.thumbnailCache[thumbnailUrl] || '';
  }

  private isScroll = new BehaviorSubject<boolean>(false);

  get isScroll$() {
    return this.isScroll.asObservable();
  }

  private isScroll1 = new BehaviorSubject<boolean>(false);

  get isScroll1$() {
    return this.isScroll1.asObservable();
  }

  setIsScroll(value: boolean) {
    this.isScroll.next(value);
  }

  setIsScroll1(value: boolean) {
    this.isScroll1.next(value);
  }

  private loginSubject = new Subject<void>();

  loginEvent$ = this.loginSubject.asObservable();

  triggerLogin() {
    this.loginSubject.next();
  }

  private signUpSubject = new Subject<void>();

  signUpEvent$ = this.signUpSubject.asObservable();

  triggerSignUp() {
    this.signUpSubject.next();
  }

  createIndividualUser(data: any) {
    return this.http.post(
      BACKEND_URL + '/individual-user/create-individual-user',
      data
    );
  }
  createotpforforgotpass(data: any) {
    return this.http.post(
      BACKEND_URL + '/individual-user/create-otp-Forgotpass',
      data
    );
  }

  getDashboardData() {
    return this.http.get(BACKEND_URL + `/individual-user/dashboard`);
  }

  mapPublicUserToCourses(data: any) {
    return this.http.post(
      BACKEND_URL + `/individual-user/map-Public-UserTo-Courses`,
      data
    );
  }

  mapAppUsersTOCOLREGS(userId: any) {
    return this.http.post(
      BACKEND_URL + `/individual-user/map-app-users-to-Courses/${userId}`,
      {}
    );
  }

  fetchMylearningcourses(userId: any) {
    return this.http.get(
      BACKEND_URL + `/individual-user/getPublicuserCourses/${userId}`
    );
  }

  fetchAllCategories() {
    return this.http.get(BACKEND_URL + `/individual-user/categories`);
  }
  fetchAllSubCategories() {
    return this.http.get(BACKEND_URL + `/individual-user/sub-categories`);
  }

  login(data: any) {
    return this.http
      .post(BACKEND_URL + `/individual-user/app-login`, data)
      .pipe(
        tap(async (res: any) => {
          if (data.remember) {
            localStorage.setItem('_Remember_me', JSON.stringify(data));
            console.log('hie', res);
          } else {
            localStorage.removeItem('_Remember_me');
          }
          console.log(res.token);
          this.setSession(res);
        })
      );
  }

  verifyOtp(data: any) {
    return this.http.post(
      BACKEND_URL + '/individual-user/verifyOtp-Createindividualuser',
      data
    );
  }
  resendOtp(data: any) {
    return this.http.post(BACKEND_URL + '/individual-user/resend-otp', data);
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

  fetchAllCourses(userId: any) {
    return this.http.get(
      BACKEND_URL + `/individual-user/fetchAllCourses/${userId}`
    );
  }

  fetchCourse(courseId: any, userId: any) {
    return this.http.get(
      BACKEND_URL + `/individual-user/fetchCourse/${courseId}/${userId} `
    );
  }

  fetchSamecategoryCourses(categories: any) {
    return this.http.get(
      BACKEND_URL + `/individual-user/fetchSamecategoryCourses/${categories} `
    );
  }

  addToCart(courseId: any, userId: any) {
    const data = { courseId, userId };
    return this.http.post(BACKEND_URL + '/individual-user/cart', data).pipe(
      tap(() => {
        // Call updateCartLength after the API call is finished
        this.updateCartLength(userId);
      })
    );
  }

  sendEmail(formData: FormData): Promise<Response> {
    return fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });
  }
  deleteFromCart(courseId: any, id: any) {
    return this.http
      .delete(BACKEND_URL + `/individual-user/cart/${courseId}/${id}`)
      .pipe(
        tap(() => {
          this.updateCartLength(id);
        })
      );
  }

  clearCartofUser(id: any) {
    return this.http.delete(BACKEND_URL + `/individual-user/cart/${id}`).pipe(
      tap(() => {
        this.updateCartLength(id);
      })
    );
  }

  addToWishlist(courseId: any, userId: any) {
    const data = { courseId, userId };
    return this.http.post(BACKEND_URL + `/individual-user/wishlist`, data);
  }

  deleteFromWishlist(courseId: any, id: any) {
    return this.http.delete(
      BACKEND_URL + `/individual-user/wishlist/${courseId}/${id}`
    );
  }

  getCoursesByCategories(name: any, id: any) {
    return this.http.get(
      BACKEND_URL + `/individual-user/courses/${name}/${id}`
    );
  }

  getCartItem(id: any) {
    return this.http.get(BACKEND_URL + `/individual-user/cart/${id}`);
  }

  getWishListItem(id: any) {
    return this.http.get(BACKEND_URL + `/individual-user/wishlist/${id}`);
  }

  updateCartLength(userId: any) {
    this.getCartItem(userId).subscribe((res: any) => {
      if (res) {
        this.cartLengthSource.next(res.length);
      }
    });
  }

  getIndividualuserComponentList(): string[] {
    // Return a list of component names
    return [
      'Contact-us',
      'My Learnings',
      'My Profile',
      'Wishlist',
      'Cart',
      'Home',
    ];
  }

  search(query: string): string[] {
    // Perform search logic (e.g., filter components based on the query)
    const componentList = this.getIndividualuserComponentList();
    return componentList.filter((component) =>
      component.toLowerCase().includes(query.toLowerCase())
    );
  }

  getPaymentData(userId: any, paymentId: any) {
    return this.http.get(
      BACKEND_URL + `/individual-user/payments/${userId}/${paymentId}`
    );
  }

  getTransactionsofUser(userId: any) {
    return this.http.get(
      BACKEND_URL + `/individual-user/transactions/${userId}`
    );
  }

  getQuestsionByVideoId(id: any, userId: any, type: any) {
    return this.http.get(
      BACKEND_URL + `/individual-user/questions/${id}/${userId}/${type}`
    );
  }

  getAllFeedbacks() {
    return this.http.get(BACKEND_URL + `/individual-user/feedbacks`);
  }

  getNameSuggestion() {
    return this.http.get(BACKEND_URL + `/individual-user/suggestion`);
  }

  createInvoice(data: any) {
    return this.http.post(BACKEND_URL + `/individual-user/invoice`, data);
  }

  getInvoiceByInvoiceID(invoiceId: any) {
    return this.http.get(BACKEND_URL + `/individual-user/invoice/${invoiceId}`);
  }

  fetchPayment(paymentId: string) {
    return this.http.get(BACKEND_URL + `/individual-user/payment/${paymentId}`);
  }

  updateInvoiceStatus(invoiceId: string, status: string) {
    return this.http.post(
      BACKEND_URL + '/individual-user/update-invoice-status',
      { invoiceId, status }
    );
  }
}
