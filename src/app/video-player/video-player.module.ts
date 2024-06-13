import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoplayerComponent } from './videoplayer.component';


@NgModule({
  declarations: [VideoplayerComponent],
  imports: [
    CommonModule
  ],
  exports: [VideoplayerComponent]
})
export class VideoPlayerModule { }
