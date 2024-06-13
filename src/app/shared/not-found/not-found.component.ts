import { Component } from '@angular/core';
declare var jQuery: any;
import { Location } from '@angular/common';


@Component({
  selector: 'et-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.initializeScripts();
  }

  goBack(): void {
    this.location.back();
  }

  initializeScripts(): void {
    (function () {
      "use strict";

      var myPlayer = jQuery("#bgndVideo").YTPlayer();

      var onMobile = false;

      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) { onMobile = true; }

      if ((onMobile === false)) {

        jQuery(".player").mb_YTPlayer();

      } else {

        jQuery("body").vegas({
          slides: [
            { src: "assets/img/home-slide-1.jpg" },
            { src: "assets/img/home-slide-2.jpg" },
            { src: "assets/img/home-slide-3.jpg" }
          ],

          delay: 5000,
          transition: 'fade'
        });
      }
    })();
  }
}
