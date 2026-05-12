import { AfterViewInit, Component, computed, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';

import { OperationStepComponent } from './steps/operation-step.component';
import { SourceStepComponent } from './steps/source-step.component';
import { TargetStepComponent } from './steps/target-step.component';
import { EntitiesStepComponent } from './steps/entities-step.component';
import { FormatStepComponent } from './steps/format-step.component';
import { AdvancedStepComponent } from './steps/advanced-step.component';
import { ReviewStepComponent } from './steps/review-step.component';
import { WizardService } from './wizard.service';
import { OPERATING_MODES } from '../../core/data/utransfer-catalog';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-wizard-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    OperationStepComponent,
    SourceStepComponent,
    TargetStepComponent,
    EntitiesStepComponent,
    FormatStepComponent,
    AdvancedStepComponent,
    ReviewStepComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Build a transfer</h1>
        <span class="spacer"></span>
        <button mat-stroked-button routerLink="/power">
          <mat-icon>tune</mat-icon> Switch to power-user view
        </button>
        <button mat-stroked-button (click)="reset()">
          <mat-icon>restart_alt</mat-icon> Reset
        </button>
      </div>

      <mat-stepper [linear]="false" orientation="horizontal">
        <mat-step label="Operation">
          <app-operation-step />
        </mat-step>
        <mat-step [label]="sourceLabel()">
          <app-source-step />
        </mat-step>
        <mat-step [label]="targetLabel()">
          <app-target-step />
        </mat-step>
        <mat-step label="Entities">
          <app-entities-step />
        </mat-step>
        @if (supportsFormat()) {
          <mat-step label="Format">
            <app-format-step />
          </mat-step>
        }
        <mat-step label="Advanced">
          <app-advanced-step />
        </mat-step>
        <mat-step label="Review">
          <app-review-step />
        </mat-step>
      </mat-stepper>
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
      mat-stepper {
        background: transparent;
      }
    `,
  ],
})
export class WizardPageComponent implements AfterViewInit {
  protected readonly wizard = inject(WizardService);
  private readonly router = inject(Router);
  private readonly stepper = viewChild.required(MatStepper);

  ngAfterViewInit(): void {
    const step = this.wizard.consumeInitialStep();
    if (step !== null) {
      queueMicrotask(() => (this.stepper().selectedIndex = step));
    }
  }

  protected readonly currentMode = computed(() =>
    OPERATING_MODES.find((m) => m.value === this.wizard.config().mode),
  );

  protected readonly sourceLabel = computed(() =>
    this.currentMode()?.sourceKind === 'server' ? 'Source server' : 'Source file',
  );

  protected readonly targetLabel = computed(() =>
    this.currentMode()?.targetKind === 'server' ? 'Target server' : 'Target file',
  );

  protected readonly supportsFormat = computed(
    () => this.currentMode()?.supportsOutputFormat ?? false,
  );

  protected reset(): void {
    this.wizard.reset();
    void this.router.navigateByUrl('/wizard');
  }
}
