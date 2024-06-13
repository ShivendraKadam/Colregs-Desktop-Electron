import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyadmindashboardComponent } from './components/companyadmindashboard/companyadmindashboard.component';
import { CompanyAdminComponent } from './company-admin.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { ManageShorestaffComponent } from './components/manage-shorestaff/manage-shorestaff.component';
import { ManageSeafarersComponent } from './components/manage-seafarers/manage-seafarers.component';
import { ManageAdmincoursesComponent } from './components/manage-admincourses/manage-admincourses.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { UploadCourseComponent } from './components/upload-course/upload-course.component';
import { ShoreStaffDetailsComponent } from './components/shore-staff-details/shore-staff-details.component';
import { EditUserDetailsComponent } from './components/edit-user-details/edit-user-details.component';
import { CourseDetailsComponent } from './components/course-details/course-details.component';
import { AssignCoursesComponent } from './components/assign-courses/assign-courses.component';
import { RolePermissionsComponent } from './components/role-permissions/role-permissions.component';
import { EditCourseComponent } from './components/edit-course/edit-course.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ReviewCourseDetailsComponent } from './components/review-course-details/review-course-details.component';

const routes: Routes = [
  {
    path: '',
    component: CompanyAdminComponent,
    children: [
      {
        path: 'dashboard',
        component: CompanyadmindashboardComponent,
      },
      {
        path: 'add-user',
        component: AddUserComponent,
        data: { breadcrumb: 'User Management  > Add New Users' },
      },
      {
        path: 'manage-shorestaff',
        component: ManageShorestaffComponent,
        data: { breadcrumb: 'User Management  > Manage Shore Staff' },
      },
      {
        path: 'manage-seafarers',
        component: ManageSeafarersComponent,
        data: { breadcrumb: 'User Management  > Manage Seafarers' },
      },
      {
        path: 'manage-courses',
        component: ManageAdmincoursesComponent,
      },
      {
        path: 'upload-course',
        component: UploadCourseComponent,
        data: { breadcrumb: 'Manage Courses > Upload Course' },
      },
      {
        path: 'manage-seafarers/user-details/:email',
        component: UserDetailsComponent,
        data: { breadcrumb: 'User Management > Manage Seafarers >  User Details' },
      },
      {
        path: 'manage-shorestaff/shore-staff-details/:email',
        component: ShoreStaffDetailsComponent,
        data: {
          breadcrumb: 'User Management >  Manage Shore Staff > User Details',
        },
      },
      {
        path: ':component/edit-user-details/:email',
        component: EditUserDetailsComponent,
        data: {
          breadcrumb: 'User Management >  Manage Shore Staff > Edit Details',
        },
      },
      {
        path: 'manage-courses/course-details',
        component: CourseDetailsComponent,
        data: { breadcrumb: 'Manage Courses > Course Details' },
      },
      {
        path: 'manage-seafarers/assign-courses',
        component: AssignCoursesComponent,
        data: {
          breadcrumb: 'User Management > Manage Seafarers > Assign Courses',
        },
      },
      {
        path: 'roles-permissions',
        component: RolePermissionsComponent,
        data: {
          breadcrumb: 'Settings > Roles & Permissions',
        },
      },
      {
        path: 'manage-courses/edit-course',
        component: EditCourseComponent,
        data: {
          breadcrumb: 'Manage Courses > Edit Course',
        },
      },
      {
        path: 'user-profile',
        component: UserProfileComponent,
        data: {
          breadcrumb: 'Settings > User Profile',
        },
      },
      {
        path: 'review-details',
        component: ReviewCourseDetailsComponent,
        data: { breadcrumb: 'Manage Courses >  Review Details' },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyAdminRoutingModule { }
