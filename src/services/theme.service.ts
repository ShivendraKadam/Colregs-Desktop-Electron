import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

enum ThemeType {
  dark = 'dark',

  default = 'default',
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  currentTheme = this.getSavedTheme() || ThemeType.default; // Get saved theme or default
  private isDarkThemeSubject!: BehaviorSubject<boolean>;

  constructor() {
    this.isDarkThemeSubject = new BehaviorSubject<boolean>(this.isDarkTheme());
  }

  private reverseTheme(theme: string): ThemeType {
    return theme === ThemeType.dark ? ThemeType.default : ThemeType.dark;
  }

  private removeUnusedTheme(theme: ThemeType): void {
    document.documentElement.classList.remove(theme);

    const removedThemeStyle = document.getElementById(theme);

    if (removedThemeStyle) {
      document.head.removeChild(removedThemeStyle);
    }
  }

  private loadCss(href: string, id: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      const style = document.createElement('link');

      style.rel = 'stylesheet';

      style.href = href;

      style.id = id;

      style.onload = resolve;

      style.onerror = reject;

      document.head.append(style);
    });
  }

  public async loadTheme(firstLoad = true): Promise<Event> {
    const theme = await this.currentTheme;

    if (firstLoad) {
      document.documentElement.classList.add(theme);
    }

    return new Promise<Event>((resolve, reject) => {
      this.loadCss(`${theme}.css`, theme).then(
        (e) => {
          if (!firstLoad) {
            document.documentElement.classList.add(theme);
          }

          this.removeUnusedTheme(this.reverseTheme(theme));

          resolve(e);
        },

        (e) => reject(e)
      );
    });
  }

  public toggleTheme(): Promise<Event> {
    this.currentTheme = this.reverseTheme(this.currentTheme);

    this.saveCurrentTheme(this.currentTheme); // Save the current theme
    this.isDarkThemeSubject.next(this.isDarkTheme()); // Update the BehaviorSubject

    return this.loadTheme(false);
  }

  public isDarkThemeObservable(): Observable<boolean> {
    return this.isDarkThemeSubject.asObservable();
  }

  private saveCurrentTheme(theme: ThemeType): void {
    localStorage.setItem('currentTheme', theme);
  }

  private isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
  }

  public getSavedTheme(): ThemeType | null {
    return localStorage.getItem('currentTheme') as ThemeType;
  }
}
