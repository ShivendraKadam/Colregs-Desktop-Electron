import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  private role$ = new BehaviorSubject<string>('');
  private email$ = new BehaviorSubject<string>('');
  private name$ = new BehaviorSubject<string>('');
  private companyId$ = new BehaviorSubject<string>('');

  constructor() {}

  public getRoleFromStore() {
    return this.role$.asObservable();
  }

  public setRoleForStore(role: string) {
    this.role$.next(role);
  }

  public getEmailFromStore() {
    return this.email$.asObservable();
  }

  public setEmailForStore(email: string) {
    this.email$.next(email);
  }

  public getCompanyIdFromStore() {
    return this.companyId$.asObservable();
  }

  public setCompanyIdForStore(companyId: string) {
    this.companyId$.next(companyId);
  }

  public getNameFromStore() {
    return this.name$.asObservable();
  }

  public setNameForStore(name: string) {
    this.name$.next(name);
  }
}
