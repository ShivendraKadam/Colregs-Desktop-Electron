import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeafarerService } from 'src/services/seafarer.service';
import { AuthService } from 'src/services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from 'src/services/theme.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-assessment-history',
  templateUrl: './assessment-history.component.html',
  styleUrls: ['./assessment-history.component.css'],
})
export class AssessmentHistoryComponent implements OnInit, OnDestroy {
  companyName: any;
  userId: any;
  assementRecord: any;
  groupedQuestions: any[] = [];
  totalQuestions!: number;
  resultForm!: FormGroup;
  responseArray!: any[];
  totalAttempts: any;
  points: any;
  courseId: any;
  tempArray: any[] = [];
  questionArray: any[] = [];
  courseContentType: any;
  courseContentId: any;
  isDarkTheme!: boolean;
  themeSubscription!: Subscription;
  subscriptions = new Subscription();
  constructor(
    private seaService: SeafarerService,
    private authService: AuthService,
    private url: ActivatedRoute,
    private themeService: ThemeService
  ) {}

  async fetchPreviousAssessmentRecord() {
    try {
      this.subscriptions.add(
        this.url.queryParams.subscribe((params) => {
          // Decrypt the parameters using the same encryption key
          this.courseContentId = params['id'];
          this.courseContentType = params['type'];
        })
      );
      const res: any = await this.seaService
        .getAssessmentRecord(
          this.userId,
          this.courseContentId,
          this.courseContentType
        )
        .toPromise();
      this.assementRecord = res;
      let userArray: any = [];
      this.totalAttempts = 0;
      this.points = 0;
      const assessmentQuestions = res.sortedAssessmentArray;
      const questions = res.sortedQuestionArray;
      for (let i = 0; i < assessmentQuestions.length; i++) {
        for (let element of assessmentQuestions[i]) {
          this.totalAttempts += element.attemptCount;
          userArray.push(
            JSON.parse(element.selectedAnswer) || element.selectedAnswer
          );
          this.points += element.marksObtained;
        }
        this.responseArray = await this.mergeArrays(questions[i], userArray);
        await this.groupQuestionsByIndex();
        userArray = [];
      }
    } catch (error) {
      console.error('Error fetching assessment record:', error);
    }
  }

  async groupQuestionsByIndex() {
    const tempGroupedQuestions: Map<number, any[]> = new Map();
    const tempQuestionArray: Map<number, any[]> = new Map();
    try {
      this.responseArray.forEach(async (question) => {
        const index = question.index;
        if (tempGroupedQuestions.has(index)) {
          await (tempGroupedQuestions.get(index) as any[]).push(question);
          await (tempQuestionArray as any).push(question.question);
        } else {
          await tempGroupedQuestions.set(index, [question]);
          await tempQuestionArray.set(index, [question.question]);
        }
      });
      this.groupedQuestions.push(tempGroupedQuestions);
      this.questionArray.push(tempQuestionArray);
      console.log(this.groupedQuestions);
    } catch (error) {
      console.log(error);
    }
  }

  async mergeArrays(arr1: any[], arr2: any[]): Promise<any[]> {
    const mergedMap = new Map();
    this.totalQuestions = arr1.length;
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
    return SortedArray;
  }

  async ngOnInit() {
    const currentTheme = this.themeService.getSavedTheme();
    this.subscriptions.add(
      (this.themeSubscription = this.themeService
        .isDarkThemeObservable()
        .subscribe((isDark: boolean) => {
          this.isDarkTheme = isDark;
        }))
    );
    this.userId = await this.authService.getIdFromToken();
    this.companyName = await this.authService.getCompanyNameFromTOken();
    this.fetchPreviousAssessmentRecord();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
