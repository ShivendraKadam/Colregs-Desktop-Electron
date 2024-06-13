import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

declare let shaka: any;

@Component({
  selector: 'et-shaka',
  templateUrl: './shaka.component.html',
  styleUrls: ['./shaka.component.css'],
})
export class ShakaComponent implements AfterViewInit {
  @ViewChild('videoPlayer') videoElementRef: ElementRef | undefined;
  @ViewChild('videoContainer') videoContainerRef: ElementRef | undefined;

  videoElement: HTMLVideoElement | undefined;
  videoContainerElement: HTMLDivElement | undefined;
  player: any;

  constructor(private platform: Platform) { }

  ngAfterViewInit(): void {
    shaka.polyfill.installAll();
    if (shaka.Player.isBrowserSupported()) {
      this.videoElement = this.videoElementRef?.nativeElement;
      this.videoContainerElement = this.videoContainerRef?.nativeElement;
      this.initPlayer();
    } else {
      console.error('Browser not supported!');
    }
  }

  private initPlayer() {
    this.player = new shaka.Player(this.videoElement);

    const ui = new shaka.ui.Overlay(
      this.player,
      this.videoContainerElement,
      this.videoElement
    );

    // const cert = fetch("YOUR FAIRPLAY CERTIFICATE URL");

    // if (this.platform.SAFARI) {
    //   this.player.configure({
    //     preferredAudioLanguage: 'en-US',
    //     drm: {
    //       servers: {
    //         'com.apple.fps.1_0': '[fairplay license server URL]',
    //       },
    //       advanced: {
    //         'com.apple.fps.1_0': {
    //           serverCertificate: new Uint8Array(cert),
    //         },
    //       },
    //     },
    //   });
    // } else {
    //   this.player.configure({
    //     drm: {
    //       servers: {
    //         'com.widevine.alpha': '[Widevine license server URL]',
    //       },
    //       advanced: {
    //         'com.widevine.alpha': {
    //           videoRobustness: 'SW_SECURE_CRYPTO',
    //           audioRobustness: 'SW_SECURE_CRYPTO',
    //         },
    //       },
    //     },
    //   });
    // }

    let videoUrl =
      'https://d2wc4zewkm3l7p.cloudfront.net/COLREGS Re-Imagined Teaser 1_dash/out.mpd';
    if (this.platform.SAFARI) {
      videoUrl =
        'http://demo.unified-streaming.com/video/tears-of-steel/tears-of-steel.ism/.m3u8';
    }

    this.player
      .load(videoUrl)
      .then(() => {
        this.videoElement?.play();
      })
      .catch((e: any) => {
        console.error(e);
      });
  }
}
