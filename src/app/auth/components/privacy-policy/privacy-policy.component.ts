import { Component, HostListener, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/services/auth.service';
import { ThemeService } from 'src/services/theme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css'],
})
export class PrivacyPolicyComponent {
  nzTabPosition: 'left' | 'top' = 'left';
  @HostListener('window:resize')
  onResize() {
    const width = window.innerWidth;
    this.nzTabPosition = width < 550 ? 'top' : 'left';
  }
  isScrolledToBottom = false;
  isTermsAgreed = false;
  isPrivacyAgreed = false;
  isEulaAgreed = false;
  isAcceptAllChecked = false;
  isPrivacyPolicyVisible = false;
  isDarkTheme!: boolean;
  userId: any;
  private themeSubscription!: Subscription;
  companyName: any;
  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    this.isScrolledToBottom = scrollPosition >= pageHeight;
  }
  @ViewChild('tabset', { static: false }) tabset: NzTabSetComponent | undefined;
  opentermsPolicyTab() {
    this.tabset?.setSelectedIndex(0);
  }
  openprivayPolicyTab() {
    this.tabset?.setSelectedIndex(2);
  }
  openeulaPolicyTab() {
    this.tabset?.setSelectedIndex(1);
  }
  onAcceptAllChange(checked: boolean): void {
    this.isTermsAgreed = checked;
    this.isPrivacyAgreed = checked;
    this.isEulaAgreed = checked;
  }
  onAccept() {
    this.authService.toggleIsTermsRead(this.userId).subscribe({
      next: async (res: any) => {
        this.router.navigate([`individual-user/dashboard`]);
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      },
    });
  }

  onDecline() {
    console.log('Declined');
  }

  showPrivacyPolicy() {
    this.isPrivacyPolicyVisible = true;
  }

  goBack(): void {
    this.location.back();
  }

  handleCancel() {
    this.isPrivacyPolicyVisible = false;
  }

  handleOk() {
    this.isPrivacyPolicyVisible = false;
  }

  isTermsRead: boolean = false;
  async ngOnInit(): Promise<void> {
    this.onResize();
    this.userId = await this.authService.getIdFromToken();
    const currentTheme = this.themeService.getSavedTheme();

    this.themeSubscription = this.themeService
      .isDarkThemeObservable()
      .subscribe((isDark: boolean) => {
        this.isDarkTheme = isDark;
      });
    this.authService.getIsTermsRead(this.userId).subscribe({
      next: async (res: any) => {
        this.isTermsRead = res;
      },
    });
  }
}
