import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { EndUserService } from 'src/services/end-user.service';
import { ThemeService } from 'src/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'et-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css'],
})
export class ContactUsComponent implements OnInit, OnDestroy {
  onSubmit: boolean = false;
  submitSuccess: boolean = false;
  isDarkTheme!: boolean;
  private themeSubscription!: Subscription;
  subscriptions = new Subscription()

  contactFormValues = {
    name: '',
    email: '',
    phone: '',
    message: '',
  };

  isVisible = false;

  constructor(
    private modal: NzModalService,
    public endservice: EndUserService,
    private themeService: ThemeService
  ) { }

  async submitEmail(contactForm: NgForm) {
    this.onSubmit = true;

    if (contactForm.invalid) {
      return;
    }

    let formData: FormData = new FormData();
    formData.append('name', this.contactFormValues.name);
    formData.append('email', this.contactFormValues.email);
    formData.append('phone', this.contactFormValues.phone);
    formData.append('message', this.contactFormValues.message);
    formData.append('access_key', environment.form_access_key);
    formData.append('subject', 'Form submission');
    formData.append('from_name', 'Contact us');

    try {
      const res = await this.endservice.sendEmail(formData);
      if (!res.ok) {
        throw new Error();
      }

      this.submitSuccess = true;
      contactForm.resetForm();
      // this.showSuccessModal();
      this.isVisible = true;
    } catch (err) {
      console.error(err);
    }

    this.onSubmit = false;
  }
  handleCancel() {
    this.isVisible = false;
  }
  showSuccessModal(): void {
    const modalRef: NzModalRef = this.modal.create({
      // nzTitle: 'Success',
      nzContent: `
       <div style="text-align: center;">
      <img src="assets/images/tickanimation 1.gif" alt="Submitting..." style="display: block; margin: 0 auto;" />
      <p style="margin-top: 20px; font-size: 16px;">Thanks for contacting us, we will be in touch soon</p>
    </div>`,

      nzOkText: null,
      nzMaskClosable: false,
      nzClosable: false,
      nzCancelText: null,
    });

    setTimeout(() => {
      modalRef.close();
    }, 20000);
  }

  async ngOnInit(): Promise<void> {
    const currentTheme = this.themeService.getSavedTheme();

    this.subscriptions.add(
      this.themeSubscription = this.themeService
        .isDarkThemeObservable()
        .subscribe((isDark: boolean) => {
          this.isDarkTheme = isDark;
        }))
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
}
