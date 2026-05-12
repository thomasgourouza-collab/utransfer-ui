import { Clipboard } from '@angular/cdk/clipboard';
import { Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GeneratedCommand } from '../../../core/models/generated-command.model';

@Component({
  selector: 'app-command-preview',
  imports: [MatButtonModule, MatIconModule, MatTabsModule],
  template: `
    <div class="preview">
      <mat-tab-group [(selectedIndex)]="activeTab" mat-stretch-tabs="false">
        <mat-tab label="One-liner">
          <pre class="code-block">{{ command().oneLiner }}</pre>
          <button mat-stroked-button class="copy-btn" (click)="copy(command().oneLiner, 'One-liner')">
            <mat-icon>content_copy</mat-icon> Copy one-liner
          </button>
        </mat-tab>
        <mat-tab label="Multi-line">
          <pre class="code-block">{{ command().multiLine }}</pre>
          <button mat-stroked-button class="copy-btn" (click)="copy(command().multiLine, 'Multi-line')">
            <mat-icon>content_copy</mat-icon> Copy multi-line
          </button>
        </mat-tab>
        <mat-tab label="Shell script">
          <pre class="code-block">{{ command().shellScript }}</pre>
          <button mat-stroked-button class="copy-btn" (click)="copy(command().shellScript, 'Shell script')">
            <mat-icon>content_copy</mat-icon> Copy shell script
          </button>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .preview {
        margin-top: 12px;
      }
      .code-block {
        margin: 16px 0 12px;
      }
      .copy-btn {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class CommandPreviewComponent {
  readonly command = input.required<GeneratedCommand>();
  protected activeTab = 0;

  private readonly clipboard = inject(Clipboard);
  private readonly snack = inject(MatSnackBar);

  protected copy(text: string, label: string): void {
    this.clipboard.copy(text);
    this.snack.open(`${label} copied to clipboard`, 'OK', { duration: 2500 });
  }
}
