import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { SeafarerService } from 'src/services/seafarer.service';
import { CourseDetailsComponent } from '../individual-user/component/course-details/course-details.component';

@Injectable({
  providedIn: 'root',
})
export class CanDeactivateGuard
  implements CanDeactivate<CourseDetailsComponent>
{
  constructor(private seafarerService: SeafarerService) {}

  async canDeactivate(component: CourseDetailsComponent): Promise<boolean> {
    if (component.isVideoPlaying) {
      if (component.isToolbar) {
        await component.saveVideoProgress();
        return true;
      } else {
        this.seafarerService.saveDashProgress();
        return true;
      }
    }
    return true;
  }
}
