import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'etlearn-frontend';
  constructor(private themeService: ThemeService) {}
  async ngOnInit(): Promise<void> {
    await this.themeService.loadTheme();
  }
}
