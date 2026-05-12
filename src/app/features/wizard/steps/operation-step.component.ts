import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { WizardService } from '../wizard.service';
import { OPERATING_MODES } from '../../../core/data/utransfer-catalog';
import { OperationMode } from '../../../core/models/operation.model';

@Component({
  selector: 'app-operation-step',
  imports: [MatCardModule, MatIconModule],
  template: `
    <p class="helper-text">Pick what kind of operation you want utransfer to perform.</p>
    <div class="mode-grid">
      @for (mode of modes; track mode.value) {
        <mat-card
          class="mode-card"
          [class.selected]="selectedMode() === mode.value"
          (click)="select(mode.value)"
        >
          <div class="mode-icon"><mat-icon>{{ mode.icon }}</mat-icon></div>
          <h3>{{ mode.displayName }}</h3>
          <p>{{ mode.description }}</p>
          <p class="kinds">
            Source: <strong>{{ mode.sourceKind }}</strong> →
            Target: <strong>{{ mode.targetKind }}</strong>
          </p>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .mode-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        margin-top: 16px;
      }
      .mode-card {
        padding: 16px;
        cursor: pointer;
        transition: outline 0.15s;
        outline: 1px solid transparent;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .mode-card:hover {
        outline-color: var(--mat-sys-outline);
      }
      .mode-card.selected {
        outline: 2px solid var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
      }
      .mode-icon {
        font-size: 32px;
      }
      .mode-icon mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
      h3 {
        margin: 0;
        font: var(--mat-sys-title-small);
      }
      p {
        margin: 0;
        font: var(--mat-sys-body-small);
      }
      .kinds {
        color: var(--mat-sys-on-surface-variant);
      }
      .mode-card.selected .kinds {
        color: var(--mat-sys-on-primary-container);
      }
    `,
  ],
})
export class OperationStepComponent {
  protected readonly modes = OPERATING_MODES;
  protected readonly wizard = inject(WizardService);
  protected readonly selectedMode = computed(() => this.wizard.config().mode);

  protected select(mode: OperationMode): void {
    this.wizard.setMode(mode);
  }
}
