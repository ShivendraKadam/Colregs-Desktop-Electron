import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IndividualUserComponent,
  LimitWordsPipe,
} from './individual-user.component';
import { IndividualUserRoutingModule } from './individual-user-routing.module';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { ReactiveFormsModule } from '@angular/forms';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { CourseDetailsComponent } from './component/course-details/course-details.component';
import { NzPopoverModule } from 'ng-zorro-antd/popover';

import { VgCoreModule, VgApiService } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FormsModule } from '@angular/forms';
import { IndividualprofileComponent } from './component/individualprofile/individualprofile.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { ContactUsComponent } from './component/contact-us/contact-us.component';
import { UserGuidelinesComponent } from './component/user-guidelines/user-guidelines.component';

import { ScrollTopComponent } from './component/scroll-top/scroll-top.component';
import { VideoPlayerModule } from '../video-player/video-player.module';
import { AssesmentsComponent } from './component/assesments/assesments.component';
import { AssessmentHistoryComponent } from './component/assessment-history/assessment-history.component';
import { UserHistoryComponent } from './component/user-history/user-history.component';
import { DeviceInfoComponent } from './component/device-info/device-info.component';

@NgModule({
  declarations: [
    DashboardComponent,
    IndividualUserComponent,

    CourseDetailsComponent,
    IndividualprofileComponent,
    ContactUsComponent,
    ScrollTopComponent,
    UserGuidelinesComponent,
    LimitWordsPipe,
    AssesmentsComponent,
    AssessmentHistoryComponent,
    UserHistoryComponent,
    DeviceInfoComponent,
  ],
  imports: [
    CommonModule,
    NzSpinModule,
    NzBadgeModule,
    NzCollapseModule,
    NzPopoverModule,
    NzFormModule,
    NzToolTipModule,
    IndividualUserRoutingModule,
    NzButtonModule,
    NzLayoutModule,
    NzDropDownModule,
    NzEmptyModule,
    NzInputModule,
    NzDatePickerModule,
    NzIconModule,
    NzSelectModule,
    NzProgressModule,
    NzDrawerModule,
    NzCheckboxModule,
    NzModalModule,
    NzAlertModule,
    ReactiveFormsModule,
    NzMenuModule,
    NzMessageModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    PdfViewerModule,
    NzTabsModule,
    NzPaginationModule,
    NzRateModule,
    FormsModule,
    VideoPlayerModule,
  ],
})
export class IndividualUserModule {}
