import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { WizardService } from '../wizard/wizard.service';
import { OperationStepComponent } from '../wizard/steps/operation-step.component';
import { SourceStepComponent } from '../wizard/steps/source-step.component';
import { TargetStepComponent } from '../wizard/steps/target-step.component';
import { EntitiesStepComponent } from '../wizard/steps/entities-step.component';
import { FormatStepComponent } from '../wizard/steps/format-step.component';
import { AdvancedStepComponent } from '../wizard/steps/advanced-step.component';
import { ReviewStepComponent } from '../wizard/steps/review-step.component';
import { OPERATING_MODES } from '../../core/data/utransfer-catalog';

@Component({
  selector: 'app-power-user-form',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
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
        <h1 class="page-title">Power user</h1>
        <span class="spacer"></span>
        <button mat-stroked-button routerLink="/wizard">
          <mat-icon>auto_fix_high</mat-icon> Switch to wizard
        </button>
        <button mat-stroked-button (click)="reset()">
          <mat-icon>restart_alt</mat-icon> Reset
        </button>
      </div>

      <mat-accordion multi>
        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>1. Operation</mat-panel-title>
          </mat-expansion-panel-header>
          <app-operation-step />
        </mat-expansion-panel>

        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>2. {{ sourceLabel() }}</mat-panel-title>
          </mat-expansion-panel-header>
          <app-source-step />
        </mat-expansion-panel>

        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>3. {{ targetLabel() }}</mat-panel-title>
          </mat-expansion-panel-header>
          <app-target-step />
        </mat-expansion-panel>

        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>4. Entities</mat-panel-title>
          </mat-expansion-panel-header>
          <app-entities-step />
        </mat-expansion-panel>

        @if (supportsFormat()) {
          <mat-expansion-panel expanded>
            <mat-expansion-panel-header>
              <mat-panel-title>5. Format</mat-panel-title>
            </mat-expansion-panel-header>
            <app-format-step />
          </mat-expansion-panel>
        }

        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>6. Advanced options</mat-panel-title>
          </mat-expansion-panel-header>
          <app-advanced-step />
        </mat-expansion-panel>

        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title>7. Review and generate</mat-panel-title>
          </mat-expansion-panel-header>
          <app-review-step />
        </mat-expansion-panel>
      </mat-accordion>
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
      mat-expansion-panel {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class PowerUserFormComponent {
  protected readonly wizard = inject(WizardService);
  private readonly router = inject(Router);

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
    void this.router.navigateByUrl('/power');
  }
}
