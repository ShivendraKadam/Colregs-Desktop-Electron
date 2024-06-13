import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeafarerService } from 'src/services/seafarer.service';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { AuthService } from 'src/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as CryptoJS from 'crypto-js';
import { Subscription } from 'rxjs';
import { ThemeService } from 'src/services/theme.service';
import * as confetti from 'canvas-confetti';
import { EndUserService } from 'src/services/end-user.service';

@Component({
  selector: 'app-assesments',
  templateUrl: './assesments.component.html',
  styleUrls: ['./assesments.component.css'],
})
export class AssesmentsComponent implements OnInit, OnDestroy {
  assesmentData: any;
  totalQuestions!: number;
  radioValue = 'A';
  currentQuestionIndex = 0;
  currentQuestion: any[] = [];
  isAssesmentCompleted: boolean = false;
  isAssesmentStarted: boolean = false;
  AnswerArray: any[] = [];
  selectedOptions: string[] = [];
  buttonSizeForm: FormGroup;
  resultForm: FormGroup;
  audioContext!: AudioContext;
  audioBuffer!: AudioBuffer;
  answerStatus: any;
  mcqValue = new FormControl({});
  mcaValue = new FormControl({});
  tfValue = new FormControl({});
  blanksValue = new FormControl({});
  isDarkTheme!: boolean;
  private themeSubscription!: Subscription;

  groupedQuestions: Map<number, any[]> = new Map();
  isRatingVisible = false;
  isResultVisible = false;
  tooltips = ['terrible', 'bad', 'normal', 'good', 'wonderful'];
  ratingValue: number = 0; // Set the initial value here
  totalQuestion: any;
  totalAttempts: any;
  finalScore: any;
  assessmentUniqueId!: any;
  currentPendingAssessment!: any;
  shuffleQuestions: any;
  videoId: any;
  assessmentType!: string;
  userId: any;

  subscriptions = new Subscription();

  @ViewChild('button', { static: true }) button: ElementRef | undefined;
  buttonWidth: number | undefined;

  totalQuestionCount: any;
  companyId: any;

  timeOut(type: string): void {
    // this.message.create(type, `Countdown timer has run out.`);
    const modal = this.modal.warning({
      nzTitle: 'Countdown Timer has ran out',
      nzContent: `you have ${this.attempt - 2} attempt remaining`,

      nzClosable: true,
      nzCentered: true,
      nzOkDisabled: true,
      nzOkText: null,
    });
    setTimeout(() => {
      modal.destroy();
    }, 2000);
  }

  navigateAway(type: string): void {
    const data = {
      courseId: this.courseId,
      videoId: this.videoId,
      userId: this.userId,
      value: false,
    };

    this.subscriptions.add(
      this.seaService.toggleFailedAssessment(data).subscribe({
        next: async (res: any) => {},
        error: (Error) => {},
      })
    );

    const modal = this.modal.warning({
      nzTitle: 'Your attempt limit is exceeded',
      nzClosable: true,
      nzCentered: true,
      nzOkDisabled: true,
      nzOkText: null,
    });
    setTimeout(() => modal.destroy(), 2000);
  }

  companyName!: string;
  isMessageShown: boolean = false;
  isWrongBefore: boolean = false;
  attempt: number = 1;
  TimeCounter: number = 60;
  timerStatus: any;
  timerPercent: any;
  feedValue: string | undefined;
  formatOne = (TimeCounter: number): string =>
    `${(TimeCounter / 1.65).toFixed(0)}`;
  constructor(
    private url: ActivatedRoute,
    private seaService: SeafarerService,
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService,
    private authService: AuthService,
    private themeService: ThemeService,
    private endService: EndUserService
  ) {
    //

    // this['videoId'] = this.router.getCurrentNavigation()?.extras.state?.['videoId']
    this.buttonSizeForm = this.formBuilder.group({
      radioValue: new FormControl('', [Validators.required]),
      inputValue: new FormControl('', [Validators.required]),
      booleanValue: new FormControl('', [Validators.required]),
    });
    this.resultForm = this.formBuilder.group({});
    this.audioContext = new AudioContext();
  }

  AssessmentAttempts!: number;
  marksPerQuestion: any;
  assessmentAttemptNo: number = 0;
  questionAttemptNo: number = 0;
  noAbbrevation: any;
  feedbackSubscription: Subscription | undefined;
  largestOption: any;

  async getAssesmentQuestions(Id: any) {
    this.subscriptions.add(
      (this.feedbackSubscription = await this.endService
        .getQuestsionByVideoId(Id, this.userId, this.assessmentType)
        .subscribe(async (res: any) => {
          if (res) {
            console.group(res);

            this.totalQuestionCount = res.totalQuestionCount;

            const shuffledQuestions = this.shuffleOptionsInQuestions(
              res.shuffleQuestions
            );

            this.currentPendingAssessment = res.CurrentPendingAssessment;
            this.AssessmentAttempts = res.assesmentCount;
            this.AssessmentAttempts == 0 ? (this.noAbbrevation = 'st') : '';
            this.AssessmentAttempts == 0 ? (this.attemptColor = '#27AE60') : '';
            this.AssessmentAttempts == 1 ? (this.noAbbrevation = 'nd') : '';
            this.AssessmentAttempts == 1 ? (this.attemptColor = '#F2994A') : '';
            this.AssessmentAttempts == 2 ? (this.noAbbrevation = 'rd') : '';
            this.AssessmentAttempts == 2 ? (this.attemptColor = '#F2994A') : '';
            this.AssessmentAttempts >= 3 ? (this.noAbbrevation = 'th') : '';
            this.AssessmentAttempts >= 3 ? (this.attemptColor = '#EB5757') : '';
            this.totalQuestions = shuffledQuestions.length;

            this.assessmentAttemptNo = this.AssessmentAttempts + 1;
            this.marksPerQuestion = 100 / shuffledQuestions.length;

            this.assesmentData = await shuffledQuestions.map(
              (element: any, index: any) => {
                const { optionA, optionB, optionC, optionD } = element;
                let MaxLength = 0;
                if (element.questionType === 'True/False') {
                  MaxLength = Math.max(
                    optionA.length || 0,
                    optionB.length || 0
                  );
                } else {
                  MaxLength = Math.max(
                    optionA.length || 0,
                    optionB.length || 0,
                    optionC.length || 0,
                    optionD.length || 0
                  );
                }

                return { ...element, attempt: 0, index, MaxLength };
              }
            );
            console.log('assesmentData', this.assesmentData);
            this.populateQuestionData();
          }
        }))
    );
  }

  getButtonHeight(height: any): string {
    const screenWidth = window.innerWidth;
    this.largestOption = height;
    console.log('largestOption', this.largestOption);
    // Check if the screen width is less than or equal to 550px
    if (screenWidth <= 550) {
      // Adjusted height values for screens <= 550px
      if (this.largestOption <= 50) {
        return '80px'; // Smaller height for smaller screens
      } else if (this.largestOption <= 100) {
        return '120px';
      } else if (this.largestOption <= 150) {
        return '140px';
      } else if (this.largestOption <= 200) {
        return '180px';
      } else if (this.largestOption <= 300) {
        return '200px';
      } else if (this.largestOption <= 400) {
        return '250px';
      } else if (this.largestOption <= 500) {
        return '280px';
      }
    } else {
      // Default height values for screens > 550px
      if (this.largestOption <= 50) {
        return '50px';
      } else if (this.largestOption <= 100) {
        return '60px';
      } else if (this.largestOption <= 150) {
        return '90px';
      } else if (this.largestOption <= 200) {
        return '110px';
      } else if (this.largestOption <= 300) {
        return '150px';
      } else if (this.largestOption <= 400) {
        return '200px';
      } else if (this.largestOption <= 500) {
        return '230px';
      }
    }
    // You can add more conditions if needed
    return '50px'; // Default height if needed
  }

  attemptColor: any;
  isAssesmentExist: boolean = false;
  async retakeAssessment() {
    this.subscriptions.add(
      await this.seaService
        .retakeAssessment(this.userId)
        .subscribe(async (res: any) => {
          if (res) {
            this.isAssesmentCompleted = false;
            this.isAssesmentStarted = true;
            this.buttonSizeForm.reset();
            this.selectedOptions = [];
            this.TimeCounter = 60;
            this.addTimer();

            await this.getAssesmentQuestions(this.videoId);
          }
        })
    );
  }

  responseArray!: any[];
  async onSubmit(data: any) {
    await this.nextQuestion(data).then(async (res: any) => {
      if (res) {
        await this.stopTimer();
        console.log(this.isResultVisible);
        this.isResultVisible = true;
        console.log(this.isResultVisible);
        const companyId = await this.auth.getCompanyIdFromToken();
        const Data = {
          assessmentUniqueId:
            this.assessmentUniqueId.assessmentUniqueId ||
            this.assessmentUniqueId,
          assessmentStatus: 'Submitted',
          courseId: this.courseId,
          companyId: companyId,
        };

        this.subscriptions.add(
          await this.seaService
            .saveAssessmentData(Data)
            .subscribe(async (res: any) => {
              if (res) {
                this.isAssesmentStarted = false;
                let userArray: any = [];
                this.totalAttempts = 0;
                this.points = 0;
                const AssessmentQuestion = res.assessmentQuestion;
                const Questions = res.Questions;
                await AssessmentQuestion.forEach((element: any) => {
                  this.totalAttempts =
                    this.totalAttempts + element.attemptCount;
                  userArray.push(JSON.parse(element.selectedAnswer));
                  this.points = this.points + element.marksObtained;
                });
                console.log('userArray', userArray);
                this.totalAttempts =
                  this.totalAttempts - this.assesmentData.length + 1;
                this.responseArray = await this.mergeArrays(
                  Questions,
                  userArray
                );

                await this.groupQuestionsByIndex();
                await this.celebrate();
              }
            })
        );
      } else {
        if (this.attempt == 4) {
          await this.stopTimer();
          const encryptedCourseId = CryptoJS.AES.encrypt(
            this.courseId.toString(),
            'encryptionKey'
          ).toString();
          await this.navigateAway('error');
          const courseTitle = localStorage.getItem('courseTitle');

          this.router.navigate(
            [`individual-user/course-details/${courseTitle}`],
            {
              queryParams: {
                id: encryptedCourseId,
              },
            }
          );
          localStorage.removeItem('courseTitle');
        }
      }
    });
  }

  points = 0;
  selectOptionmcq(option: string): void {
    this.buttonSizeForm.get('radioValue')?.setValue(option);

    // Remove 'selected' class from all options
    document.querySelectorAll('.questionoptbtn').forEach((el) => {
      el.classList.remove('selected');
    });
    document.querySelectorAll('.questionoptbtn1').forEach((el) => {
      el.classList.remove('selected');
    });

    // Add 'selected' class to the clicked option
    const selectedOption = document.getElementById(`option${option}`);
    if (selectedOption) {
      selectedOption.parentElement?.classList.add('selected');
    }
  }
  selectOptiontf(option: string): void {
    this.buttonSizeForm.get('booleanValue')?.setValue(option);

    // Remove 'selected' class from all options
    document.querySelectorAll('.questionoptbtn').forEach((el) => {
      el.classList.remove('selected');
    });
    document.querySelectorAll('.questionoptbtn1').forEach((el) => {
      el.classList.remove('selected');
    });

    // Add 'selected' class to the clicked option
    const selectedOption = document.getElementById(`option${option}`);
    if (selectedOption) {
      selectedOption.parentElement?.classList.add('selected');
    }
  }

  // async nextQuestion(data: any): Promise<any> {
  //   this.timerStatus = 'success';

  //   if (data.questionType === "MCQ") {
  //     const mcqAns = this.buttonSizeForm.get('radioValue')?.value;

  //     if (mcqAns !== data.correctAnswer) {
  //       if (this.attempt == 2) {
  //         await this.stopTimer();
  //         await this.navigateAway('error');

  //         const encryptedCourseId = CryptoJS.AES.encrypt((this.courseId).toString(), 'encryptionKey').toString();

  //         this.router.navigate([`${this.companyName}/course-details`], {
  //           queryParams: {
  //             id: encryptedCourseId
  //           }
  //         });
  //       }
  //       this.loadAudio(false)
  //       this.attempt = this.attempt - 1
  //       const AnsData = { index: this.currentQuestionIndex, selectedAnswer: mcqAns, attempt: this.attempt, isCorrect: false, questionId: data.id }
  //       this.AnswerArray.push(AnsData)
  //       this.isWrongBefore = true;
  //       this.answerStatus = 'incorrect';
  //       this.message.error('Incorrect Answer, Please Try Again')

  //     } else {
  //       this.loadAudio(true)
  //       this.attempt = this.attempt - 1
  //       const AnsData = { index: this.currentQuestionIndex, selectedAnswer: mcqAns, attempt: this.attempt, isCorrect: true, questionId: data.id }
  //       this.AnswerArray.push(AnsData)
  //
  //       if (!this.isWrongBefore) {
  //         this.points = this.points + 1;
  //       }
  //
  //       if (this.currentQuestionIndex !== this.totalQuestions - 1) {
  //         this.currentQuestionIndex = this.currentQuestionIndex + 1;
  //       }
  //       this.buttonSizeForm.get('radioValue')?.reset
  //       this.populateQuestionData();
  //       this.attempt = 4
  //       this.answerStatus = 'correct';

  //     }
  //     this.buttonSizeForm.reset()
  //   }
  //   else if (data.questionType === "MCA") {
  //     const stringArray = data.correctAnswer.split(',');
  //     const mcaAns = this.arraysAreEqual(stringArray, this.selectedOptions)
  //     if (mcaAns !== true || mcaAns === undefined) {
  //       this.loadAudio(false)

  //       this.attempt = this.attempt - 1
  //       this.message.error('Incorrect Answer, Please Try Again')
  //       this.answerStatus = 'incorrect';
  //       const AnsData = { index: this.currentQuestionIndex, selectedAnswer: mcaAns, attempt: this.attempt, isCorrect: false, questionId: data.id }
  //       this.AnswerArray.push(AnsData)
  //       this.isWrugBefore = true;
  //       return true

  //     }
  //     else {
  //       this.loadAudio(true)
  //       if (!this.isWrongBefore) {
  //         this.points = this.points + 1;
  //       }
  //       this.attempt = this.attempt - 1
  //       const AnsData = { index: this.currentQuestionIndex, selectedAnswer: this.selectedOptions, attempt: this.attempt, isCorrect: true, questionId: data.id }
  //       this.AnswerArray.push(AnsData)
  //
  //       this.currentQuestionIndex = this.currentQuestionIndex + 1;
  //       this.buttonSizeForm.get('radioValue')?.reset
  //       this.populateQuestionData();
  //       this.attempt = 4
  //       this.answerStatus = 'correct';
  //     }
  //     this.buttonSizeForm.reset()

  //   }
  //   else if (data.questionType === "True/False") {
  //     const tfAns = this.buttonSizeForm.get('booleanValue')?.value;
  //     if (tfAns !== data.correctAnswer) {
  //       this.loadAudio(false)
  //       this.attempt = this.attempt - 1
  //       const AnsData = { index: this.currentQuestionIndex, selectedAnswer: tfAns, attempt: this.attempt, isCorrect: false, questionId: data.id }
  //       this.AnswerArray.push(AnsData)
  //       this.isWrongBefore = true;
  //       this.answerStatus = 'incorrect';
  //       this.message.error('Incorrect Answer, Please Try Again')
  //     } else {
  //       this.loadAudio(true)
  //       this.attempt = this.attempt - 1

  //       const AnsData = { index: this.currentQuestionIndex, selectedAnswer: tfAns, attempt: this.attempt, isCorrect: true, questionId: data.id }
  //       this.AnswerArray.push(AnsData)
  //       if (!this.isWrongBefore) {
  //         this.points = this.points + 1;
  //       }
  //       this.currentQuestionIndex = this.currentQuestionIndex + 1;
  //       this.buttonSizeForm.get('booleanValue')?.reset
  //       this.populateQuestionData();
  //       this.attempt = 4
  //       this.answerStatus = 'correct';
  //     }
  //     this.buttonSizeForm.reset()
  //   }
  //   else if (data.questionType === "Blanks") {
  //     const mcqAns = this.buttonSizeForm.get('inputValue')?.value;

  //     const answer = data.correctAnswer.toLowerCase();
  //     const mcqAnsLowerCase = mcqAns.toLowerCase();
  //     if (mcqAnsLowerCase !== answer) {
  //       this.loadAudio(false)
  //       this.attempt = this.attempt - 1
  //       const AnsData = { index: this.currentQuestionIndex, selectedAnswer: mcqAnsLowerCase, attempt: this.attempt, isCorrect: false, questionId: data.id }
  //       this.AnswerArray.push(AnsData)
  //       this.isWrongBefore = true;
  //       this.answerStatus = 'incorrect';
  //       this.message.error('Incorrect Answer, Please Try Again')
  //     } else {
  //       this.loadAudio(true)
  //       this.attempt = this.attempt - 1

  //       const AnsData = { index: this.currentQuestionIndex, selectedAnswer: mcqAnsLowerCase, attempt: this.attempt, isCorrect: true, questionId: data.id }
  //       this.AnswerArray.push(AnsData)
  //       if (!this.isWrongBefore) {
  //         this.points = this.points + 1;
  //       }
  //       this.currentQuestionIndex = this.currentQuestionIndex + 1;
  //       this.buttonSizeForm.get('inputValue')?.reset
  //       this.populateQuestionData();
  //       this.attempt = 4
  //       this.answerStatus = 'correct';
  //     }
  //     this.buttonSizeForm.reset()
  //   }
  //   this.TimeCounter = 60;

  //   if (this.answerStatus == 'correct') {
  //     return true
  //   } else {
  //     return false
  //   }

  // }

  async nextQuestion(data: any): Promise<any> {
    document.querySelectorAll('.questionoptbtn').forEach((el) => {
      el.classList.remove('selected');
    });
    document.querySelectorAll('.questionoptbtn1').forEach((el) => {
      el.classList.remove('selected');
    });
    this.timerStatus = 'success';

    if (data.questionType === 'MCQ') {
      this.attempt = data.attempt;
      const mcqAns = this.buttonSizeForm.get('radioValue')?.value;
      if (
        mcqAns.trim().toLowerCase() !== data.correctAnswer.trim().toLowerCase()
      ) {
        this.loadAudio(false);
        data.attempt = data.attempt + 1;
        this.attempt = data.attempt;
        const AnsData = {
          index: this.currentQuestionIndex,
          selectedAnswer: mcqAns,
          attempt: this.attempt,
          isCorrect: false,
          questionId: data.id,
        };
        this.AnswerArray.push(AnsData);

        if (this.attempt == 2) {
          await this.navigateAway('error');
          await this.forceSubmit(data.id, this.AnswerArray, this.attempt);
          const encryptedCourseId = CryptoJS.AES.encrypt(
            this.courseId.toString(),
            'encryptionKey'
          ).toString();
          this.seaService.rewatchVideo();
          const courseTitle = localStorage.getItem('courseTitle');

          this.router.navigate(
            [`individual-user/course-details/${courseTitle}`],
            {
              queryParams: {
                id: encryptedCourseId,
              },
            }
          );
          localStorage.removeItem('courseTitle');

          this.questionAttemptNo = 0;
          this.AnswerArray = [];
        }
        if (this.attempt == 4) {
          await this.navigateAway('error');
          await this.forceSubmit(data.id, this.AnswerArray, this.attempt);
          const encryptedCourseId = CryptoJS.AES.encrypt(
            this.courseId.toString(),
            'encryptionKey'
          ).toString();
          this.seaService.rewatchVideo();
          const courseTitle = localStorage.getItem('courseTitle');

          this.router.navigate(
            [`individual-user/course-details/${courseTitle}`],
            {
              queryParams: {
                id: encryptedCourseId,
              },
            }
          );
          localStorage.removeItem('courseTitle');
          this.questionAttemptNo = 0;
          this.AnswerArray = [];
        }
        this.questionAttemptNo += 1;
        this.answerStatus = 'incorrect';
        this.message.error('Incorrect Answer, Please Try Again');
        this.TimeCounter = 60;
        this.buttonSizeForm.get('radioValue')?.reset();
        document.querySelectorAll('.questionoptbtn').forEach((el) => {
          el.classList.remove('selected');
        });
        document.querySelectorAll('.questionoptbtn1').forEach((el) => {
          el.classList.remove('selected');
        });

        return false;
      } else {
        this.loadAudio(true);
        this.message.success('Correct Answer!');
        this.attempt = this.attempt + 1;
        if (this.attempt == 1) {
          this.points = this.marksPerQuestion;
        } else if (this.attempt == 2) {
          this.points = this.marksPerQuestion / 2;
        } else if (this.attempt >= 3) {
          this.points = 0;
        }

        const AnsData = {
          index: this.currentQuestionIndex,
          selectedAnswer: mcqAns,
          attempt: this.attempt,
          isCorrect: true,
          questionId: data.id,
          points: this.points,
        };
        this.AnswerArray.push(AnsData);

        await this.saveQuestionProgress({
          index: this.currentQuestionIndex,
          AnswerArray: this.AnswerArray,
          points: this.points,
          questionId: data.id,
        });
        //////window.alert(this.points)
        if (this.currentQuestionIndex !== this.totalQuestions - 1) {
          this.currentQuestionIndex = this.currentQuestionIndex + 1;
        }
        this.buttonSizeForm.get('radioValue')?.reset;
        this.populateQuestionData();
        this.attempt = 0;
        this.answerStatus = 'correct';
        this.questionAttemptNo = 0;
        this.AnswerArray = [];
        this.TimeCounter = 60;

        this.buttonSizeForm.get('radioValue')?.reset();
        document.querySelectorAll('.questionoptbtn').forEach((el) => {
          el.classList.remove('selected');
        });
        document.querySelectorAll('.questionoptbtn1').forEach((el) => {
          el.classList.remove('selected');
        });

        return true;
      }
    } else if (data.questionType === 'MCA') {
      this.attempt = data.attempt;
      const stringArray = data.correctAnswer
        .split(';')
        .map((item: any) => item.trim())
        .join(';');
      console.log('selectedOptions', this.selectedOptions);
      const mcaAns = this.arraysAreEqual(stringArray, this.selectedOptions);
      if (mcaAns !== true || mcaAns === undefined) {
        this.loadAudio(false);
        data.attempt = data.attempt + 1;
        this.attempt = data.attempt;
        this.selectedOptions = [];

        this.message.error('Incorrect Answer, Please Try Again');

        this.buttonSizeForm.get('radioValue')?.reset();
        document.querySelectorAll('.questionoptbtn').forEach((el) => {
          el.classList.remove('selected');
        });
        document.querySelectorAll('.questionoptbtn1').forEach((el) => {
          el.classList.remove('selected');
        });

        this.answerStatus = 'incorrect';
        const AnsData = {
          index: this.currentQuestionIndex,
          selectedAnswer: this.selectedOptions,
          attempt: this.attempt,
          isCorrect: false,
          questionId: data.id,
        };
        this.AnswerArray.push(AnsData);
        if (this.attempt == 2) {
          await this.navigateAway('error');
          await this.forceSubmit(data.id, this.AnswerArray, this.attempt);
          const encryptedCourseId = CryptoJS.AES.encrypt(
            this.courseId.toString(),
            'encryptionKey'
          ).toString();
          this.seaService.rewatchVideo();
          const courseTitle = localStorage.getItem('courseTitle');

          this.router.navigate(
            [`individual-user/course-details/${courseTitle}`],
            {
              queryParams: {
                id: encryptedCourseId,
              },
            }
          );
          localStorage.removeItem('courseTitle');
          this.questionAttemptNo = 0;
          this.AnswerArray = [];
        }
        if (this.attempt == 4) {
          await this.navigateAway('error');
          await this.forceSubmit(data.id, this.AnswerArray, this.attempt);
          const encryptedCourseId = CryptoJS.AES.encrypt(
            this.courseId.toString(),
            'encryptionKey'
          ).toString();
          this.seaService.rewatchVideo();
          const courseTitle = localStorage.getItem('courseTitle');

          this.router.navigate(
            [`individual-user/course-details/${courseTitle}`],
            {
              queryParams: {
                id: encryptedCourseId,
              },
            }
          );
          localStorage.removeItem('courseTitle');
          this.questionAttemptNo = 0;
          this.AnswerArray = [];
        }
        this.questionAttemptNo += 1;
        this.isWrongBefore = true;
        this.TimeCounter = 60;

        this.buttonSizeForm.get('radioValue')?.reset();
        document.querySelectorAll('.questionoptbtn').forEach((el) => {
          el.classList.remove('selected');
        });
        document.querySelectorAll('.questionoptbtn1').forEach((el) => {
          el.classList.remove('selected');
        });

        return false;
      } else {
        this.points = this.marksPerQuestion;
        this.loadAudio(true);
        this.message.success('Correct Answer!');
        this.selectedOptions = [];
        this.attempt = this.attempt + 1;
        if (this.attempt == 1) {
          this.points = this.marksPerQuestion;
        } else if (this.attempt == 2) {
          this.points = this.marksPerQuestion / 2;
        } else if (this.attempt >= 3) {
          this.points = 0;
        }
        const AnsData = {
          index: this.currentQuestionIndex,
          selectedAnswer: this.selectedOptions,
          attempt: this.attempt,
          isCorrect: true,
          questionId: data.id,
          points: this.points,
        };
        this.AnswerArray.push(AnsData);

        await this.saveQuestionProgress({
          index: this.currentQuestionIndex,
          AnswerArray: this.AnswerArray,
          points: this.points,
          questionId: data.id,
        });
        //////window.alert(this.points)
        this.currentQuestionIndex = this.currentQuestionIndex + 1;
        this.buttonSizeForm.get('radioValue')?.reset;
        this.populateQuestionData();
        this.attempt = 0;
        this.answerStatus = 'correct';
        this.AnswerArray = [];

        this.buttonSizeForm.get('radioValue')?.reset();
        document.querySelectorAll('.questionoptbtn').forEach((el) => {
          el.classList.remove('selected');
        });
        document.querySelectorAll('.questionoptbtn1').forEach((el) => {
          el.classList.remove('selected');
        });

        this.questionAttemptNo = 0;
        this.TimeCounter = 60;
        this.AnswerArray = [];
        return true;
      }
    } else if (data.questionType === 'True/False') {
      this.attempt = data.attempt;
      const tfAns = this.buttonSizeForm.get('booleanValue')?.value;
      if (tfAns !== data.correctAnswer) {
        this.loadAudio(false);
        data.attempt = data.attempt + 1;
        this.attempt = data.attempt;
        const AnsData = {
          index: this.currentQuestionIndex,
          selectedAnswer: tfAns,
          attempt: this.attempt,
          isCorrect: false,
          questionId: data.id,
        };
        this.AnswerArray.push(AnsData);
        if (this.attempt == 2) {
          await this.navigateAway('error');
          await this.forceSubmit(data.id, this.AnswerArray, this.attempt);
          const encryptedCourseId = CryptoJS.AES.encrypt(
            this.courseId.toString(),
            'encryptionKey'
          ).toString();
          this.seaService.rewatchVideo();
          const courseTitle = localStorage.getItem('courseTitle');

          this.router.navigate(
            [`individual-user/course-details/${courseTitle}`],
            {
              queryParams: {
                id: encryptedCourseId,
              },
            }
          );
          localStorage.removeItem('courseTitle');
          this.questionAttemptNo = 0;
          this.AnswerArray = [];
        }
        if (this.attempt == 4) {
          await this.navigateAway('error');
          await this.forceSubmit(data.id, this.AnswerArray, this.attempt);
          const encryptedCourseId = CryptoJS.AES.encrypt(
            this.courseId.toString(),
            'encryptionKey'
          ).toString();
          this.seaService.rewatchVideo();
          const courseTitle = localStorage.getItem('courseTitle');

          this.router.navigate(
            [`individual-user/course-details/${courseTitle}`],
            {
              queryParams: {
                id: encryptedCourseId,
              },
            }
          );
          localStorage.removeItem('courseTitle');
          this.questionAttemptNo = 0;
          this.AnswerArray = [];
        }
        this.questionAttemptNo += 1;
        this.isWrongBefore = true;
        this.answerStatus = 'incorrect';
        this.message.error('Incorrect Answer, Please Try Again');

        this.buttonSizeForm.get('radioValue')?.reset();
        document.querySelectorAll('.questionoptbtn').forEach((el) => {
          el.classList.remove('selected');
        });
        document.querySelectorAll('.questionoptbtn1').forEach((el) => {
          el.classList.remove('selected');
        });

        this.TimeCounter = 60;
        return false;
      } else {
        this.loadAudio(true);
        this.message.success('Correct Answer!');

        this.attempt = this.attempt + 1;
        if (this.attempt == 1) {
          this.points = this.marksPerQuestion;
        } else if (this.attempt == 2) {
          this.points = this.marksPerQuestion / 2;
        } else if (this.attempt >= 3) {
          this.points = 0;
        }
        const AnsData = {
          index: this.currentQuestionIndex,
          selectedAnswer: tfAns,
          attempt: this.attempt,
          isCorrect: true,
          questionId: data.id,
        };
        this.AnswerArray.push(AnsData);

        await this.saveQuestionProgress({
          index: this.currentQuestionIndex,
          questionId: data.id,
          AnswerArray: this.AnswerArray,
          points: this.points,
        });
        this.currentQuestionIndex = this.currentQuestionIndex + 1;
        this.buttonSizeForm.get('booleanValue')?.reset;
        this.populateQuestionData();
        this.attempt = 0;
        this.questionAttemptNo = 0;
        this.answerStatus = 'correct';

        this.buttonSizeForm.get('radioValue')?.reset();
        document.querySelectorAll('.questionoptbtn').forEach((el) => {
          el.classList.remove('selected');
        });
        document.querySelectorAll('.questionoptbtn1').forEach((el) => {
          el.classList.remove('selected');
        });

        this.AnswerArray = [];
        this.TimeCounter = 60;
        this.AnswerArray = [];
        return true;
      }
    }

    // this.TimeCounter = 60;

    if (this.answerStatus == 'correct') {
      return true;
    } else {
      return false;
    }
  }

  arraysAreEqual(arr1: any, arr2: any) {
    // Convert arr1 (comma-separated string) to an array
    const arr1Array = arr1.split(';').map((item: any) => item.trim());
    const arr2Array = arr2.map((item: any) => item.trim());

    if (arr1Array.length !== arr2.length) {
      return false;
    }

    const sortedArr1 = arr1Array.slice().sort();
    const sortedArr2 = arr2Array.slice().sort();

    for (let i = 0; i < sortedArr1.length; i++) {
      if (sortedArr1[i] !== sortedArr2[i]) {
        return false;
      }
    }

    return true;
  }

  selectOption(option: string) {
    // Check if the option is already selected
    const index = this.selectedOptions.indexOf(option);

    if (index !== -1) {
      // If it's selected, deselect it
      this.selectedOptions.splice(index, 1);
    } else {
      // If it's not selected, select it
      this.selectedOptions.push(option);
    }
    return this.selectedOptions;
  }
  isSelected(option: string): boolean {
    return this.selectedOptions.includes(option);
  }

  async loadAudio(value: boolean) {
    const soundPath = value
      ? 'assets/sounds/mixkit-achievement-bell-600.wav '
      : 'assets/sounds/mixkit-wrong-long-buzzer-954.wav';

    const response = await fetch(soundPath);
    const arrayBuffer = await response.arrayBuffer();
    this.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
      this.audioBuffer = buffer;
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    });
  }

  questionArray: Map<number, any[]> = new Map();
  groupQuestionsByIndex() {
    try {
      this.responseArray.forEach(async (question) => {
        const index = question.index;

        if (this.groupedQuestions.has(index)) {
          await (this.groupedQuestions.get(index) as any[]).push(question);
          // await (this.questionArray.get(index) as any[]).push(question.question);
        } else {
          await this.groupedQuestions.set(index, [question]);
          await this.questionArray.set(index, [question.question]);
        }
      });
      this.groupedQuestions;

      console.log('groupedQuestions', this.groupedQuestions);
    } catch (error) {
      console.log(error);
    }
  }

  async mergeArrays(arr1: any[], arr2: any[]): Promise<any[]> {
    const mergedMap = new Map();

    this.totalQuestion = arr1.length;
    // Populate map with items from arr1
    arr1.forEach((item: any) => {
      mergedMap.set(item.index, item);
    });

    const mergedArray: any[] = [];

    // Iterate over keys of arr2 object
    Object.keys(arr2).forEach((key: any) => {
      const items = arr2[key];
      // Iterate over items in the current key
      for (let itemKey in items) {
        if (items.hasOwnProperty(itemKey)) {
          const item = items[itemKey];
          const existingItem = mergedMap.get(item.index);
          if (existingItem) {
            const mergedObject = {
              index: existingItem.index,
              question: existingItem.question,
              optionA: existingItem.optionA,
              optionB: existingItem.optionB,
              optionC: existingItem.optionC,
              optionD: existingItem.optionD,
              questionType: existingItem.questionType,
              correctAnswer: existingItem.correctAnswer,
              attempts: item.attempt,
              selectedAnswer: item.selectedAnswer,
            };

            mergedArray.push(mergedObject);
          }
        }
      }
    });
    const SortedArray = await mergedArray.sort((a: any, b: any) => {
      if (a.attempts < b.attempts) {
        return -1;
      }
      if (a.attempts > b.attempts) {
        return 1;
      }
      return 0;
    });

    console.log('SortedArray', SortedArray);
    return SortedArray;
  }

  reviewTest(): void {
    this.isResultVisible = false;
    this.isAssesmentCompleted = true;
    this.isAssesmentStarted = false;
  }

  gotoRatings(): void {
    this.isResultVisible = false;
    this.isRatingVisible = true;
  }

  handleOk(): void {
    this.isRatingVisible = false;
    this.cd.detectChanges();
    // Accessing the rating value
    const selectedRating = this.ratingValue;
  }

  handleCancel(): void {
    this.isRatingVisible = false;
    this.goBackToCourse();
  }

  courseId: any;
  goBackToCourse() {
    const encryptedCourseId = CryptoJS.AES.encrypt(
      this.courseId.toString(),
      'encryptionKey'
    ).toString();

    const courseTitle = localStorage.getItem('courseTitle');

    this.router.navigate([`individual-user/course-details/${courseTitle}`], {
      queryParams: {
        id: encryptedCourseId,
      },
    });
    localStorage.removeItem('courseTitle');
  }

  async startAssesments() {
    // Shuffle options in each question
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    this.subscriptions.add(
      await this.seaService
        .createAssessment(
          this.videoId,
          this.userId,
          this.courseId,
          this.assessmentType,
          this.assesmentData
        )
        .subscribe((res: any) => {
          this.assessmentUniqueId = res;
        })
    );
    this.isAssesmentCompleted = false;
    this.isAssesmentStarted = true;
    await this.addTimer();
  }

  async resumeAssesments() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    this.subscriptions.add(
      await this.seaService
        .resumeAssessment(this.currentPendingAssessment[0].assessmentUniqueId)
        .subscribe(async (res: any) => {
          if (res) {
            const shuffledQuestions = this.shuffleOptionsInQuestions(res);
            this.assessmentUniqueId =
              this.currentPendingAssessment[0].assessmentUniqueId;
            this.assesmentData = await shuffledQuestions.sort(
              (a: any, b: any) => a.index - b.index
            );
            this.currentQuestionIndex = this.assesmentData[0].index;
            this.assesmentData = await shuffledQuestions.map((element: any) => {
              const { optionA, optionB, optionC, optionD } = element;
              let MaxLength = 0;
              if (element.questionType === 'True/False') {
                MaxLength = Math.max(optionA.length || 0, optionB.length || 0);
              } else {
                MaxLength = Math.max(
                  optionA.length || 0,
                  optionB.length || 0,
                  optionC.length || 0,
                  optionD.length || 0
                );
              }

              return { ...element, MaxLength };
            });
            console.log('assesmentData', this.assesmentData);
            await this.populateQuestionData();
            this.isAssesmentCompleted = false;
            this.isAssesmentStarted = true;
            this.addTimer();
          }
        })
    );
  }

  async saveQuestionProgress(data: any) {
    const questionData = {
      ...data,
      assessmentUniqueId: this.assessmentUniqueId,
    };

    this.subscriptions.add(
      await this.seaService
        .saveQuestionProgress(questionData)
        .subscribe((res: any) => {
          this.AnswerArray = [];
        })
    );
  }

  shuffleOptionsInQuestions(questions: any[]) {
    return questions.map((question: any) => {
      // Extract the options
      const { optionA, optionB, optionC, optionD, ...rest } = question;
      if (question.questionType !== 'True/False') {
        // Shuffle all options
        const optionsArray = [optionA, optionB, optionC, optionD];
        this.shuffleArray(optionsArray);

        // Create a new question object with shuffled options and the rest of the properties
        return {
          optionA: optionsArray[0],
          optionB: optionsArray[1],
          optionC: optionsArray[2],
          optionD: optionsArray[3],
          ...rest,
        };
      } else {
        const optionsArray = [optionA, optionB];
        this.shuffleArray(optionsArray);

        // Create a new question object with shuffled options and the rest of the properties
        return {
          optionA: optionsArray[0],
          optionB: optionsArray[1],
          ...rest,
        };
      }
    });
  }

  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  populateQuestionData() {
    if (this.currentQuestionIndex < this.totalQuestions) {
      this.currentQuestion = this.assesmentData.filter((item: any) => {
        return item.index === this.currentQuestionIndex;
      });
    }
  }

  async addTimer() {
    await this.timeCounter();
    const encryptedCourseId = CryptoJS.AES.encrypt(
      this.courseId.toString(),
      'encryptionKey'
    ).toString();

    if (!this.isMessageShown) {
      if (this.attempt == 2) {
        this.isAssesmentStarted = false;
        await this.navigateAway('error');
        this.seaService.rewatchVideo();
        const courseTitle = localStorage.getItem('courseTitle');

        this.router.navigate(
          [`individual-user/course-details/${courseTitle}`],
          {
            queryParams: {
              id: encryptedCourseId,
            },
          }
        );
        localStorage.removeItem('courseTitle');
      } else {
        this.timeoutActions();
      }
    }
  }

  timeoutActions() {
    this.isMessageShown = true;
    this.attempt++;
    this.TimeCounter = 60;
    this.isMessageShown = false;
    this.timerStatus = 'success';
    this.message.error(`Time's Up`);
    this.addTimer();
  }

  timerInterval: any;
  isPulsating: boolean = false;

  timeCounter() {
    return new Promise<void>((resolve) => {
      this.timerInterval = setInterval(() => {
        if (this.TimeCounter < 16) {
          this.timerStatus = 'exception';
          // Enable pulsating animation when timer reaches 15 seconds
          this.isPulsating = true;
        } else if (this.TimeCounter > 16 && this.TimeCounter < 30) {
          this.timerStatus = 'normal';
        } else {
          this.isPulsating = false;
        }
        if (this.TimeCounter === 0) {
          this.stopTimer();

          if (this.attempt === 2) {
            this.timeOut('error');
          }

          clearInterval(this.timerInterval);
          // Reset pulsating animation after the timer reaches 0
          this.isPulsating = false;
          resolve();
        } else {
          console.log(this.TimeCounter--);
        }
      }, 1000);
    });
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  async forceSubmit(questionId: any, data: any, attempt: any) {
    await this.stopTimer();
    this.isResultVisible = false;
    this.isAssesmentStarted = false;
    const userId = await this.auth.getIdFromToken();
    const companyId = await this.auth.getCompanyIdFromToken();
    await this.updateAssessmentAttemptCount(questionId, data, attempt);
    if (attempt === 5) {
      const Data = {
        assessmentUniqueId:
          this.assessmentUniqueId.assessmentUniqueId || this.assessmentUniqueId,
        assessmentStatus: 'Resetted',
        courseId: this.courseId,
        companyId: companyId,
        questionId,
      };

      this.subscriptions.add(
        await this.seaService.saveAssessmentData(Data).subscribe((res: any) => {
          this.TimeCounter = 60;
        })
      );
    } else {
      const Data = {
        assessmentUniqueId:
          this.assessmentUniqueId.assessmentUniqueId || this.assessmentUniqueId,
        assessmentStatus: 'Discarded',
        courseId: this.courseId,
        companyId: companyId,
        questionId,
      };

      this.subscriptions.add(
        await this.seaService.saveAssessmentData(Data).subscribe((res: any) => {
          this.TimeCounter = 60;
        })
      );
    }
  }

  async submitFeedback() {
    const userId = await this.auth.getIdFromToken();
    const rating = this.ratingValue;
    const review = this.feedValue;
    const data = { rating, review, userId, videoId: this.videoId };

    this.subscriptions.add(
      this.seaService.saveFeedback(data).subscribe((res: any) => {
        this.isRatingVisible = !this.isRatingVisible;
        this.goBackToCourse();
      })
    );
  }

  async updateAssessmentAttemptCount(
    questionId: number,
    AnswerArray: any,
    attempt: any
  ) {
    const assesssmentData = {
      assessmentUniqueId:
        this.assessmentUniqueId.assessmentUniqueId || this.assessmentUniqueId,
      AnswerArray,
      questionId,
      attempt,
    };

    this.subscriptions.add(
      await this.seaService
        .updateDiscardedAssessment(assesssmentData)
        .subscribe((res: any) => {})
    );
  }

  async celebrate() {
    const duration = 3000;
    // Create a new canvas element for confetti
    const canvas = document.createElement('canvas');
    // Set the canvas dimensions to cover the entire viewport
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '9999'; // Ensure the canvas appears on top of other content
    // Append the canvas to the body element
    document.body.appendChild(canvas);

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    // Perform any additional actions, such as starting the confetti animation
    // For example, you can start the confetti animation immediately:
    myConfetti({
      particleCount: 150,
      angle: 45,
      spread: 150,
      gravity: 0.5,
      origin: { x: 0, y: 0.6 },
    });

    // and launch a few from the right edge
    myConfetti({
      particleCount: 150,
      angle: 135,
      gravity: 0.5,
      spread: 150,
      origin: { x: 1, y: 0.6 },
    });

    // Optionally, remove the canvas and badge after a certain duration
    setTimeout(() => {
      document.body.removeChild(canvas);
    }, duration);
  }

  async ngOnInit() {
    if (this.button) {
      this.buttonWidth = this.button.nativeElement.offsetWidth;
    }

    this.timerStatus = 'success';
    const currentTheme = this.themeService.getSavedTheme();

    this.subscriptions.add(
      (this.themeSubscription = this.themeService
        .isDarkThemeObservable()
        .subscribe((isDark: boolean) => {
          this.isDarkTheme = isDark;
        }))
    );

    this.url.queryParams.subscribe((params) => {
      // Decrypt the parameters using the same encryption key
      const decryptedVideoId = CryptoJS.AES.decrypt(
        params['vid'],
        'encryptionKey'
      ).toString(CryptoJS.enc.Utf8);
      const decryptedType = CryptoJS.AES.decrypt(
        params['typ'],
        'encryptionKey'
      ).toString(CryptoJS.enc.Utf8);
      const decryptedCourseId = CryptoJS.AES.decrypt(
        params['id'],
        'encryptionKey'
      ).toString(CryptoJS.enc.Utf8);

      this.videoId = decryptedVideoId;
      this.assessmentType = decryptedType;
      this.courseId = decryptedCourseId;
    });

    // alert(this.videoId);

    this.userId = await this.authService.getIdFromToken();

    this.getAssesmentQuestions(this.videoId);
  }

  ngOnDestroy() {
    this.stopTimer();
    this.subscriptions.unsubscribe();
  }
}
