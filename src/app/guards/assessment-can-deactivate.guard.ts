import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { AssesmentsComponent } from '../individual-user/component/assesments/assesments.component';

@Injectable({
  providedIn: 'root',
})
export class AssessmentCanDeactivateGuard
  implements CanDeactivate<AssesmentsComponent>
{
  constructor(private message: NzMessageService) {}

  canDeactivate(
    component: AssesmentsComponent
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (component.isAssesmentStarted) {
      this.message.error('Complete the Assessment First');
      return false; // or return a boolean or a Promise<boolean> based on your logic
    }
    return true;
  }
}
