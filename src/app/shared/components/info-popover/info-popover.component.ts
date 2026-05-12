import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-info-popover',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <mat-icon
      class="info-icon"
      [matTooltip]="text()"
      matTooltipPosition="above"
      aria-label="More info"
    >info</mat-icon>
  `,
  styles: [
    `
      .info-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--mat-sys-on-surface-variant);
        cursor: help;
        vertical-align: middle;
      }
    `,
  ],
})
export class InfoPopoverComponent {
  readonly text = input.required<string>();
}
