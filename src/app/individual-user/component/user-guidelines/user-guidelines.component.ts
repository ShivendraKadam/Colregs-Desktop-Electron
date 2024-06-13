import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-user-guidelines',
  templateUrl: './user-guidelines.component.html',
  styleUrls: ['./user-guidelines.component.css'],
})
export class UserGuidelinesComponent {
  courseId!: string;
  isUserGuidelinesPage!: boolean;

  constructor(
    private router: Router,
    private authService: AuthService,
    private url: ActivatedRoute
  ) {}

  companyName: any;

  goToCourseDetails() {
    const encryptedCourseId = CryptoJS.AES.encrypt(
      this.courseId.toString(),
      'encryptionKey'
    ).toString();

    this.router.navigate([`${this.companyName}/course-details`], {
      queryParams: {
        id: encryptedCourseId,
      },
    });
  }

  async ngOnInit(): Promise<void> {
    this.companyName = await this.authService.getCompanyNameFromTOken();

    this.url.url.subscribe((urlSegments) => {
      const path = urlSegments.map((segment) => segment.path).join('/');
      if (path === 'user-guidelines') {
        // The current component is UserGuidelinesComponent
        this.isUserGuidelinesPage = true;
      } else {
        this.isUserGuidelinesPage = false;
      }
    });

    this.url.queryParams.subscribe((params) => {
      // Decrypt the parameters using the same encryption key
      const decryptedCourseId = CryptoJS.AES.decrypt(
        params['id'],
        'encryptionKey'
      ).toString(CryptoJS.enc.Utf8);
      this.courseId = decryptedCourseId;
      console.log('videoId', decryptedCourseId);
    });
  }
}
