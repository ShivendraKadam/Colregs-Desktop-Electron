import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndividualUserComponent } from './individual-user.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';

import { CourseDetailsComponent } from './component/course-details/course-details.component';
import { IndividualprofileComponent } from './component/individualprofile/individualprofile.component';
import { ContactUsComponent } from './component/contact-us/contact-us.component';
import { UserGuidelinesComponent } from './component/user-guidelines/user-guidelines.component';
import { CanDeactivateGuard } from '../guards/can-deactivate.guard';
import { AssessmentCanDeactivateGuard } from '../guards/assessment-can-deactivate.guard';
import { AssesmentsComponent } from './component/assesments/assesments.component';
import { AssessmentHistoryComponent } from './component/assessment-history/assessment-history.component';
import { UserHistoryComponent } from './component/user-history/user-history.component';

const routes: Routes = [
  {
    path: '',
    component: IndividualUserComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { breadcrumb: 'Dashboard' },
      },

      {
        path: 'course-details/:courseTitle',
        canDeactivate: [CanDeactivateGuard],
        component: CourseDetailsComponent,
        data: { breadcrumb: 'Course Details' },
      },

      {
        path: 'user/myprofile',
        component: IndividualprofileComponent,
        data: { breadcrumb: 'My Profile' },
      },

      {
        path: 'user/contactus',
        component: ContactUsComponent,
        data: { breadcrumb: 'Contact us' },
      },
      {
        path: 'user/user-guidelines',
        component: UserGuidelinesComponent,
      },
      {
        path: 'user/assessment-history',
        component: AssessmentHistoryComponent,
      },
      {
        path: 'user/user-history',
        component: UserHistoryComponent,
      },
      {
        path: 'user/assesments',
        component: AssesmentsComponent,
        // canDeactivate: [AssessmentCanDeactivateGuard],
        data: {
          breadcrumb: 'Assigned Courses > Course Details > Start Assesments',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndividualUserRoutingModule {}
