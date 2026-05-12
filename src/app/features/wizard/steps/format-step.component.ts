import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';

import { WizardService } from '../wizard.service';
import { OUTPUT_FORMATS, OPERATING_MODES } from '../../../core/data/utransfer-catalog';
import { OutputFormat } from '../../../core/models/operation.model';

@Component({
  selector: 'app-format-step',
  imports: [FormsModule, MatRadioModule],
  template: `
    @if (supportsOutputFormat()) {
      <p class="helper-text">Pick how exported entities should be written to disk.</p>
      <mat-radio-group [ngModel]="outputFormat()" (ngModelChange)="setFormat($event)" class="format-radio-group">
        @for (f of formats; track f.value) {
          <mat-radio-button [value]="f.value">
            <div class="format-option">
              <strong>{{ f.displayName }}</strong>
              <span class="format-description">{{ f.description }}</span>
              @if (f.flag) {
                <code>{{ f.flag }}</code>
              }
            </div>
          </mat-radio-button>
        }
      </mat-radio-group>
    } @else {
      <p class="helper-text">
        Output format does not apply to this operation — the target server determines storage.
      </p>
    }
  `,
  styles: [
    `
      .format-radio-group {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-top: 12px;
      }
      .format-option {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .format-description {
        font: var(--mat-sys-body-small);
        color: var(--mat-sys-on-surface-variant);
      }
      code {
        background: var(--mat-sys-surface-container);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
      }
    `,
  ],
})
export class FormatStepComponent {
  protected readonly formats = OUTPUT_FORMATS;
  private readonly wizard = inject(WizardService);

  protected readonly outputFormat = computed(() => this.wizard.config().outputFormat);
  protected readonly supportsOutputFormat = computed(() => {
    const mode = OPERATING_MODES.find((m) => m.value === this.wizard.config().mode);
    return mode?.supportsOutputFormat ?? false;
  });

  protected setFormat(value: OutputFormat): void {
    this.wizard.update({ outputFormat: value });
  }
}
