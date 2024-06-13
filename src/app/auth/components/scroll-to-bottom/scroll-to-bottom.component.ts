import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-scroll-to-bottom',
  templateUrl: './scroll-to-bottom.component.html',
  styleUrls: ['./scroll-to-bottom.component.css'],
})
export class ScrollToBottomComponent implements OnInit {
  windowScrolled: boolean = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    const maxScroll =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    if (scrollPosition > 100 && scrollPosition < maxScroll - 1) {
      this.windowScrolled = true;
    } else if (
      this.windowScrolled &&
      (scrollPosition < 10 || scrollPosition >= maxScroll - 1)
    ) {
      this.windowScrolled = false;
    }
  }

  scrollToBottom() {
    const maxScroll =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    window.scrollTo({
      top: maxScroll,
      behavior: 'smooth',
    });
    this.windowScrolled = false;
  }

  ngOnInit() {}
}
