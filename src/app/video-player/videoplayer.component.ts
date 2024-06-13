import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  Input,
  HostListener,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { AuthService } from 'src/services/auth.service';
import { MediaService } from 'src/services/media.service';
import { SeafarerService } from 'src/services/seafarer.service';
import { Subscription } from 'rxjs';

declare let shaka: any;

@Component({
  selector: 'app-videoplayer',
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.css'],
})
export class VideoplayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoElementRef!: ElementRef;
  @ViewChild('videoContainer') videoContainerRef: ElementRef | undefined;
  @Input() videoUrl!: string; // Input property to receive the video URL
  @Input() videoId!: any; // Input property to receive the video URL
  @Input() disableSeeking!: boolean; // Input property to receive the video URL
  @Input() videoData!: any; // Input property to receive the video URL

  @Output() updateStatus = new EventEmitter<{
    showVideo: boolean;
    showRewatchandAssessment: boolean;
    isVideoPlaying: boolean;
    isPlayNext: Boolean;
  }>();

  videoElement: HTMLVideoElement | undefined;
  videoContainerElement: HTMLDivElement | undefined;
  player: any;
  private hideTimeout: any;
  private hideTimeout2: any;
  playPauseText: string = 'Play'; // Default text
  courseParamsId!: any;
  isPlayerPlaying: boolean = false;
  playerViewTime: number = 0;
  PlayerInterval: any;
  userId: any;
  pauseSubscription!: Subscription;
  subscriptions = new Subscription();
  videoTitle: any;

  constructor(
    private platform: Platform,
    private url: ActivatedRoute,
    private authService: AuthService,
    private mediaService: MediaService,
    private seaService: SeafarerService
  ) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault(); // Prevent the default action to stop scrolling when space is pressed
      this.togglePlayPause();
    }
  }

  togglePlayPause() {
    const video = this.videoElementRef?.nativeElement;
    if (video.paused || video.ended) {
      this.playPauseText = 'Pause';
      video.play();
    } else {
      this.playPauseText = 'Play';
      video.pause();
    }
  }

  pauseVideo() {
    const videoPlayer: HTMLVideoElement = document.getElementById(
      'videoPlayer'
    ) as HTMLVideoElement;
    if (videoPlayer) {
      this.playPauseText = 'Play';
      videoPlayer.pause();
    }
  }

  resumeVideo() {
    const videoPlayer: HTMLVideoElement = document.getElementById(
      'videoPlayer'
    ) as HTMLVideoElement;
    if (videoPlayer) {
      this.playPauseText = 'Pause';
      videoPlayer.play();
    }
  }

  private async initPlayer() {
    this.player = new shaka.Player(this.videoElement);

    if (this.authService.checkIsLoggedIn()) {
      this.userId = await this.authService.getIdFromToken();
    }
    this.seaService.registerVideoPlayer(this);

    this.subscriptions.add(
      this.url.queryParams.subscribe((params) => {
        // Decrypt the parameters using the same encryption key
        const decryptedCourseId = CryptoJS.AES.decrypt(
          params['id'],
          'encryptionKey'
        ).toString(CryptoJS.enc.Utf8);
        this.courseParamsId = decryptedCourseId;
        console.log('videoId', decryptedCourseId);
      })
    );

    const ui = new shaka.ui.Overlay(
      this.player,
      this.videoContainerElement,
      this.videoElement
    );

    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume && this.videoElement) {
      this.videoElement.volume = parseFloat(savedVolume);
    }

    this.subscriptions.add(
      this.seaService.saveDashProgress$.subscribe(() => {
        this.saveVideoProgress();
      })
    );

    // Add an event listener to save volume changes
    if (this.videoElement) {
      this.videoElement.addEventListener('volumechange', () => {
        if (this.videoElement) {
          // Check again inside the event listener
          localStorage.setItem(
            'playerVolume',
            this.videoElement.volume.toString()
          );
        }
      });

      this.pauseSubscription = this.seaService.pauseVideoObservable.subscribe(
        (pause) => {
          if (pause) {
            this.pauseVideo();
          } else {
            this.resumeVideo();
          }
        }
      );

      this.videoElement.addEventListener('ended', () => {
        if (this.disableSeeking) {
          this.updateStatus.emit({
            showVideo: false,
            showRewatchandAssessment: true,
            isVideoPlaying: false,
            isPlayNext: true,
          });

          this.saveVideoProgress();
        } else {
        }
      });
    }

    this.player
      .load(this.videoUrl)
      .then(() => {
        console.log('videoData', this.videoData);
        const videoPlayer: HTMLVideoElement =
          this.videoElementRef?.nativeElement;

        if (this.videoData) {
          const videoDurationInt = Math.round(this.videoData.videoDuration);
          const videoDurationStr = videoDurationInt.toFixed(0);
          const videoProgress = this.videoData.progress.toFixed(0);
          this.videoTitle = this.videoData.videoTitle;
          if (videoProgress === videoDurationStr) {
            videoPlayer.currentTime = 0;
          } else {
            videoPlayer.currentTime = this.videoData.progress;
          }
        }
        this.videoElement?.play();
        this.playPauseText = 'Pause';
        this.updateStatus.emit({
          showVideo: true,
          showRewatchandAssessment: false,
          isVideoPlaying: true,
          isPlayNext: false,
        });
      })
      .catch((e: any) => {
        console.error(e);
      });
  }

  private cleanupAndReinitializePlayer() {
    if (this.player) {
      this.player
        .destroy()
        .then(() => {
          console.log('Player destroyed successfully');
          this.initPlayer(); // Reinitialize the player only after it has been destroyed
        })
        .catch((e: any) => {
          console.error('Error destroying player', e);
        });
    } else {
      this.initPlayer(); // Initialize the player if it was not previously initialized
    }
  }

  private cleanupPlayer() {
    if (this.player) {
      this.player
        .destroy()
        .then(() => {
          console.log('Player destroyed successfully');
        })
        .catch((e: any) => {
          console.error('Error destroying player', e);
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if videoUrl input has changed
    if (changes['videoUrl'] && !changes['videoUrl'].firstChange) {
      // this.player.destroy();
      this.cleanupAndReinitializePlayer(); // Clean up the player when the component is destroyed
      // Reinitialize player with new URL
    }
  }

  setupEndAlert() {
    if (this.videoElement) {
      this.videoElement.addEventListener('ended', () => {
        this.playPauseText = 'Play';
      });
    }
  }

  rewind() {
    if (this.videoElement) {
      this.videoElement.currentTime -= 10; // Rewind by 10 seconds
    }
    if (this.playPauseText === 'Pause') {
      this.playPauseText = 'Play';
    } else {
      this.playPauseText = 'Pause';
    }
  }

  videoclick() {
    if (this.playPauseText === 'Pause') {
      this.playPauseText = 'Play';
    } else {
      this.playPauseText = 'Pause';
    }
  }

  private setupActivityListeners() {
    this.videoContainerElement?.addEventListener('mousemove', () =>
      this.resetInactivityTimer()
    );
    document.addEventListener(
      'mousemove',
      this.handleGlobalMouseMovement.bind(this)
    );
  }

  private setupActivityListeners2() {
    this.videoContainerElement?.addEventListener('mousemove', () =>
      this.resetInactivityTimer2()
    );
    document.addEventListener(
      'mousemove',
      this.handleGlobalMouseMovement2.bind(this)
    );
  }

  private resetInactivityTimer() {
    clearTimeout(this.hideTimeout);
    this.showRewindButton();
    this.hideTimeout = setTimeout(() => {
      this.hideRewindButton();
    }, 3000); // Hide after 2 seconds of inactivity
  }
  private resetInactivityTimer2() {
    clearTimeout(this.hideTimeout2);
    this.showRewindButton2();
    this.hideTimeout2 = setTimeout(() => {
      this.hideRewindButton2();
    }, 3000); // Hide after 2 seconds of inactivity
  }

  private showRewindButton() {
    const rewindButton = this.videoContainerElement?.querySelector(
      '.shaka-rewind-button'
    ) as HTMLElement;
    if (rewindButton) {
      rewindButton.style.opacity = '1';
      rewindButton.style.visibility = 'visible';
    }
  }
  private showRewindButton2() {
    const rewindButton = this.videoContainerElement?.querySelector(
      '.shaka-playpause-button'
    ) as HTMLElement;
    if (rewindButton) {
      rewindButton.style.opacity = '1';
      rewindButton.style.visibility = 'visible';
    }
  }

  private hideRewindButton() {
    const rewindButton = this.videoContainerElement?.querySelector(
      '.shaka-rewind-button'
    ) as HTMLElement;
    if (rewindButton) {
      rewindButton.style.opacity = '0';
      rewindButton.style.visibility = 'hidden';
    }
  }
  private hideRewindButton2() {
    const rewindButton = this.videoContainerElement?.querySelector(
      '.shaka-playpause-button'
    ) as HTMLElement;
    if (rewindButton) {
      rewindButton.style.opacity = '0';
      rewindButton.style.visibility = 'hidden';
    }
  }

  private handleGlobalMouseMovement(event: MouseEvent) {
    if (!this.videoContainerElement?.contains(event.target as Node)) {
      this.hideRewindButton();
    }
  }

  private handleGlobalMouseMovement2(event: MouseEvent) {
    if (!this.videoContainerElement?.contains(event.target as Node)) {
      this.hideRewindButton2();
    }
  }

  saveVideoProgress() {
    const videoElement = this.videoElementRef.nativeElement;
    const currentTime = videoElement.currentTime;
    const duration = videoElement.duration;
    if (!isNaN(duration)) {
      const progressPercentage = ((currentTime / duration) * 100).toFixed();

      const data = {
        userId: this.userId,
        courseId: this.courseParamsId,
        videoId: this.videoId,
        progress: currentTime,
        videoDuration: duration,
        progressPercentage: progressPercentage,
        playerViewTime: this.playerViewTime,
      };

      console.log(data);
      this.subscriptions.add(
        this.mediaService.saveVideoProgress(data).subscribe((res: any) => {
          this.seaService.saveVideoProgress();
        })
      );
    }
  }

  countPlayerViewTime() {
    this.isPlayerPlaying = !this.isPlayerPlaying;
    this.isPlayerPlaying
      ? (this.PlayerInterval = setInterval(() => {
          this.playerViewTime++;
        }, 1000))
      : clearInterval(this.PlayerInterval);
  }

  async ngAfterViewInit(): Promise<void> {
    shaka.polyfill.installAll();
    if (shaka.Player.isBrowserSupported()) {
      this.videoElement = this.videoElementRef?.nativeElement;
      this.videoContainerElement = this.videoContainerRef?.nativeElement;
      this.setupActivityListeners();
      this.setupActivityListeners2();
      this.setupEndAlert();
      if (this.videoUrl) {
        this.initPlayer();
      }
    } else {
      console.error('Browser not supported!');
    }
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.cleanupPlayer(); // Clean up the player when the component is destroyed
    }
    if (this.pauseSubscription) {
      this.pauseSubscription.unsubscribe();
    }
    this.subscriptions.unsubscribe();
  }
}
