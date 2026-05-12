import { Clipboard } from '@angular/cdk/clipboard';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommandHistoryService } from '../../core/services/command-history.service';

@Component({
  selector: 'app-history-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Command history</h1>
        <span class="spacer"></span>
        @if (history.entries().length > 0) {
          <button mat-stroked-button color="warn" (click)="clearAll()">
            <mat-icon>delete_sweep</mat-icon> Clear all
          </button>
        }
      </div>
      <p class="helper-text">
        Last {{ history.entries().length }} commands you generated. Passwords are redacted to <code>****</code> before storage.
      </p>

      @if (history.entries().length === 0) {
        <mat-card class="empty"><p>No history yet. Generate a command in the wizard to populate this list.</p></mat-card>
      } @else {
        @for (entry of history.entries(); track entry.id) {
          <mat-card class="entry-card">
            <div class="entry-meta">
              <span>{{ formatDate(entry.createdAt) }}</span>
              <span>{{ entry.config.mode }}</span>
              <span class="spacer"></span>
              <button mat-icon-button matTooltip="Copy one-liner" (click)="copy(entry.oneLiner)">
                <mat-icon>content_copy</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="remove(entry.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <pre class="code-block">{{ entry.oneLiner }}</pre>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      .entry-card,
      .empty {
        padding: 16px;
        margin-bottom: 12px;
      }
      .entry-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font: var(--mat-sys-label-small);
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 6px;
      }
      code {
        background: var(--mat-sys-surface-container);
        padding: 1px 6px;
        border-radius: 4px;
      }
    `,
  ],
})
export class HistoryPageComponent {
  protected readonly history = inject(CommandHistoryService);
  private readonly clipboard = inject(Clipboard);
  private readonly snack = inject(MatSnackBar);

  protected formatDate(ts: number): string {
    return new Date(ts).toLocaleString();
  }

  protected copy(text: string): void {
    this.clipboard.copy(text);
    this.snack.open('Command copied (password is redacted in history)', 'OK', { duration: 2500 });
  }

  protected remove(id: string): void {
    this.history.remove(id);
  }

  protected clearAll(): void {
    if (!confirm('Clear all command history?')) return;
    this.history.clear();
  }
}
