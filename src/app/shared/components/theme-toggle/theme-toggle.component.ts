import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ThemeMode, ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="themeMenu"
      matTooltip="Theme: {{ theme.mode() }}"
      aria-label="Theme menu"
    >
      <mat-icon>{{ icon() }}</mat-icon>
    </button>
    <mat-menu #themeMenu="matMenu">
      <button mat-menu-item (click)="set('system')">
        <mat-icon>desktop_windows</mat-icon>
        <span>Follow system</span>
      </button>
      <button mat-menu-item (click)="set('light')">
        <mat-icon>light_mode</mat-icon>
        <span>Light</span>
      </button>
      <button mat-menu-item (click)="set('dark')">
        <mat-icon>dark_mode</mat-icon>
        <span>Dark</span>
      </button>
    </mat-menu>
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);

  protected icon(): string {
    if (this.theme.mode() === 'system') return 'desktop_windows';
    return this.theme.effective() === 'dark' ? 'dark_mode' : 'light_mode';
  }

  protected set(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }
}
