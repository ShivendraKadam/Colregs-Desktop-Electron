import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './components/login/login.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { AuthInterceptorInterceptor } from 'src/interceptors/auth-interceptor.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { NzModalModule } from 'ng-zorro-antd/modal';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { ScrollToBottomComponent } from './components/scroll-to-bottom/scroll-to-bottom.component';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { VerifyOtpComponent } from '../shared/verify-otp/verify-otp.component';

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    ForgotPasswordComponent,
    PrivacyPolicyComponent,
    ScrollToBottomComponent,
    VerifyOtpComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    NzFormModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzRadioModule,
    NzIconModule,
    NzAlertModule,
    NzSelectModule,
    NzDatePickerModule,
    FormsModule,
    NzModalModule,
    NzTabsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorInterceptor,
      multi: true,
    },
  ],
})
export class AuthModule {}
