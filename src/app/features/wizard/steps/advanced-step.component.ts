import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { WizardService } from '../wizard.service';
import { ID_CONVERSION_STRATEGIES } from '../../../core/data/utransfer-catalog';
import { InfoPopoverComponent } from '../../../shared/components/info-popover/info-popover.component';
import { IdConversion } from '../../../core/models/operation.model';

@Component({
  selector: 'app-advanced-step',
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    InfoPopoverComponent,
  ],
  template: `
    <p class="helper-text">Fine-tune how IDs, names and side-effects behave.</p>

    <h3 class="section-title">ID conversion strategy</h3>
    <mat-form-field appearance="outline">
      <mat-label>ID conversion</mat-label>
      <mat-select
        [ngModel]="config().idConversion"
        (ngModelChange)="set({ idConversion: $event })"
      >
        @for (s of strategies; track s.value) {
          <mat-option [value]="s.value">
            {{ s.displayName }}
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
    @if (currentStrategyMeta(); as meta) {
      <div class="strategy-meta">
        <p><strong>What it does:</strong> {{ meta.description }}</p>
        <p><strong>When to use:</strong> {{ meta.whenToUse }}</p>
        <p class="caveat"><strong>Caveats:</strong> {{ meta.caveats }}</p>
      </div>
    }

    <h3 class="section-title">Name suffix</h3>
    <div class="row">
      <mat-form-field appearance="outline" class="suffix-field">
        <mat-label>Add suffix</mat-label>
        <input
          matInput
          [ngModel]="config().addSuffix"
          (ngModelChange)="set({ addSuffix: $event })"
          placeholder="_DEV"
        />
      </mat-form-field>
      <mat-form-field appearance="outline" class="suffix-field">
        <mat-label>Remove suffix</mat-label>
        <input
          matInput
          [ngModel]="config().removeSuffix"
          (ngModelChange)="set({ removeSuffix: $event })"
          placeholder="_DEV"
        />
      </mat-form-field>
    </div>
    <p class="helper-text">
      Suffixes are applied to globally unique names — useful for sharing one Collaboration Server
      between several environments.
    </p>

    <h3 class="section-title">Switches</h3>
    <div class="col">
      <mat-checkbox
        [ngModel]="config().keepApiKeys"
        (ngModelChange)="set({ keepApiKeys: $event })"
      >
        Keep API keys
        <app-info-popover text="Without this flag, API key values are stripped from exports. With it, keys are written in cleartext." />
      </mat-checkbox>
      <mat-checkbox
        [ngModel]="config().keepMarkers"
        (ngModelChange)="set({ keepMarkers: $event })"
      >
        Keep database markers
        <app-info-popover text="Retain internal timestamps and database markers that are normally stripped." />
      </mat-checkbox>
      <mat-checkbox
        [ngModel]="config().verbose"
        (ngModelChange)="set({ verbose: $event })"
      >
        Verbose logging
        <app-info-popover text="Log full HTTP requests and responses — useful for debugging but may include credentials." />
      </mat-checkbox>
    </div>

    @if (isImportLike()) {
      <h3 class="section-title">User import options</h3>
      <mat-form-field appearance="outline">
        <mat-label>
          Default password for newly created users
          <app-info-popover text="Used as the initial password for users created during import. Maps to --new-user-password." />
        </mat-label>
        <input
          matInput
          type="password"
          [ngModel]="config().newUserPassword"
          (ngModelChange)="set({ newUserPassword: $event })"
          autocomplete="new-password"
        />
      </mat-form-field>
      <div class="col">
        <mat-checkbox
          [ngModel]="config().noUtransferUser"
          (ngModelChange)="set({ noUtransferUser: $event })"
        >
          Don't create a temporary utransfer user (superadmin target only)
          <app-info-popover text="When the target uses superadmin auth, utransfer normally creates a short-lived utransfer user in the target account. Enable this to switch account directly instead. Maps to --no-utransfer-user." />
        </mat-checkbox>
      </div>
    }
  `,
  styles: [
    `
      .strategy-meta {
        margin: 8px 0 16px;
        padding: 12px;
        background: var(--mat-sys-surface-container);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font: var(--mat-sys-body-small);
      }
      .strategy-meta p {
        margin: 0;
      }
      .caveat {
        color: var(--mat-sys-error);
      }
      .suffix-field {
        flex: 1 1 240px;
      }
    `,
  ],
})
export class AdvancedStepComponent {
  protected readonly strategies = ID_CONVERSION_STRATEGIES;
  private readonly wizard = inject(WizardService);
  protected readonly config = this.wizard.config;

  protected readonly currentStrategyMeta = computed(() =>
    ID_CONVERSION_STRATEGIES.find((s) => s.value === this.config().idConversion),
  );

  protected readonly isImportLike = computed(() => {
    const mode = this.config().mode;
    return mode === 'IMPORT' || mode === 'TRANSFER';
  });

  protected set(patch: Partial<{ idConversion: IdConversion } & Record<string, unknown>>): void {
    this.wizard.update(patch);
  }
}
