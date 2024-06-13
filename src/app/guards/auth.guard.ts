// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
// import { NzModalService } from 'ng-zorro-antd/modal';
// import { Observable } from 'rxjs';
// import { AuthService } from 'src/services/auth.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard implements CanActivate {

//   constructor(
//     private authService: AuthService,
//     private modalService: NzModalService,
//     private router: Router,
//   ) { }

//   canActivate(): boolean {
//     if (!this.authService.isTokenPresent()) {
//       console.log(window.location.href)
//       const blanchedURL = decodeURIComponent(this.router.url.split('/')[1]);

//       // this.toggleModalVisibility({show:true,url:blanchedURL})
//       this.modalService.warning({
//         nzTitle: 'Session Expired!',
//         nzContent: ` <p>You will be redirected to the Login page</p>`, //'Your session has expired!, '
//         nzClosable: false,
//         nzCentered: true,
//         nzOkDisabled: false,
//         nzOkText: 'Ok',
//         nzOnOk: () => {
//           // this.router.navigateByUrl(`/${blanchedURL}/login`)
//         },
//       })
//       return false;
//     }

//     return true;
//   }

// }
