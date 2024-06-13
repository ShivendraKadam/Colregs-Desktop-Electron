import { Component } from '@angular/core';
import { ThemeService } from 'src/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'et-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isDarkTheme!: boolean;
  private themeSubscription!: Subscription;
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    const currentTheme = this.themeService.getSavedTheme();
    this.themeSubscription = this.themeService
      .isDarkThemeObservable()
      .subscribe((isDark: boolean) => {
        this.isDarkTheme = isDark;
      });
  }

}
