import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { CommandPreviewComponent } from '../../../shared/components/command-preview/command-preview.component';
import { WizardService } from '../wizard.service';
import { CommandHistoryService } from '../../../core/services/command-history.service';
import { TransferPresetsService } from '../../../core/services/transfer-presets.service';

@Component({
  selector: 'app-review-step',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    CommandPreviewComponent,
  ],
  template: `
    @if (generated().errors.length > 0) {
      <mat-card class="errors">
        <h3><mat-icon>error</mat-icon> Cannot build a valid command yet</h3>
        <ul>
          @for (e of generated().errors; track e) {
            <li>{{ e }}</li>
          }
        </ul>
      </mat-card>
    }

    @if (generated().warnings.length > 0) {
      <mat-card class="warnings">
        <h3><mat-icon>warning</mat-icon> Warnings</h3>
        <ul>
          @for (w of generated().warnings; track w) {
            <li>{{ w }}</li>
          }
        </ul>
      </mat-card>
    }

    @if (generated().hints.length > 0) {
      <mat-card class="hints">
        <h3><mat-icon>tips_and_updates</mat-icon> Hints</h3>
        <ul>
          @for (h of generated().hints; track h) {
            <li>{{ h }}</li>
          }
        </ul>
      </mat-card>
    }

    <app-command-preview [command]="generated()" />

    <div class="row" style="margin-top: 16px">
      <button mat-flat-button color="primary" (click)="recordToHistory()">
        <mat-icon>history</mat-icon> Save to history
      </button>
      <button mat-stroked-button (click)="showSavePresetForm.set(!showSavePresetForm())">
        <mat-icon>bookmark_add</mat-icon> Save as transfer preset
      </button>
    </div>

    @if (showSavePresetForm()) {
      <mat-card class="save-preset">
        <mat-form-field appearance="outline">
          <mat-label>Preset name</mat-label>
          <input matInput [(ngModel)]="presetName" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Description (optional)</mat-label>
          <input matInput [(ngModel)]="presetDescription" />
        </mat-form-field>
        <div class="row">
          <button mat-button (click)="showSavePresetForm.set(false)">Cancel</button>
          <button mat-flat-button color="primary" (click)="confirmSavePreset()" [disabled]="!presetName">
            Save preset
          </button>
        </div>
        <p class="helper-text">
          Saves all wizard fields except passwords / header values. Passwords are never written to disk.
        </p>
      </mat-card>
    }
  `,
  styles: [
    `
      mat-card {
        padding: 16px;
        margin-bottom: 12px;
      }
      mat-card h3 {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0 0 8px;
        font: var(--mat-sys-title-small);
      }
      mat-card.errors {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }
      mat-card.warnings {
        background: var(--mat-sys-tertiary-container);
        color: var(--mat-sys-on-tertiary-container);
      }
      mat-card.hints {
        background: var(--mat-sys-secondary-container);
        color: var(--mat-sys-on-secondary-container);
      }
      ul {
        margin: 0;
        padding-left: 18px;
      }
      .save-preset {
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `,
  ],
})
export class ReviewStepComponent {
  private readonly wizard = inject(WizardService);
  private readonly history = inject(CommandHistoryService);
  private readonly presets = inject(TransferPresetsService);

  protected readonly generated = computed(() => this.wizard.generated());
  protected readonly showSavePresetForm = signal(false);
  protected presetName = '';
  protected presetDescription = '';

  protected recordToHistory(): void {
    this.history.record(this.wizard.config(), this.wizard.generated());
  }

  protected confirmSavePreset(): void {
    if (!this.presetName) return;
    this.presets.save(this.presetName, this.presetDescription || undefined, this.wizard.config());
    this.presetName = '';
    this.presetDescription = '';
    this.showSavePresetForm.set(false);
  }
}
