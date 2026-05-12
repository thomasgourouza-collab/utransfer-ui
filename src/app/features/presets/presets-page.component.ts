import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { TransferPresetsService } from '../../core/services/transfer-presets.service';
import { EntityPresetsService } from '../../core/services/entity-presets.service';
import { DestinationPresetsService } from '../../core/services/destination-presets.service';
import { WizardService } from '../wizard/wizard.service';
import { makeDefaultConfig } from '../../core/models/transfer-config.model';
import { JarPathService } from '../../core/services/jar-path.service';

@Component({
  selector: 'app-presets-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatTabsModule],
  template: `
    <div class="page">
      <h1 class="page-title">Presets</h1>
      <p class="helper-text">
        Save reusable building blocks: full transfer configs (without passwords), named entity
        selections and named destination paths.
      </p>

      <mat-tab-group>
        <mat-tab label="Transfer presets ({{ transferPresets.presets().length }})">
          @if (transferPresets.presets().length === 0) {
            <mat-card class="empty"><p>No transfer presets saved yet.</p></mat-card>
          } @else {
            @for (preset of transferPresets.presets(); track preset.id) {
              <mat-card class="preset-card">
                <div class="row">
                  <div class="preset-info">
                    <h3>{{ preset.name }}</h3>
                    @if (preset.description) {
                      <p class="meta">{{ preset.description }}</p>
                    }
                    <p class="meta">{{ preset.config.mode }} · {{ formatDate(preset.createdAt) }}</p>
                  </div>
                  <button mat-stroked-button color="primary" (click)="loadTransferPreset(preset.id)">
                    <mat-icon>play_arrow</mat-icon> Load
                  </button>
                  <button mat-button color="warn" (click)="removeTransferPreset(preset.id, preset.name)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-card>
            }
          }
        </mat-tab>

        <mat-tab label="Entity presets ({{ entityPresets.presets().length }})">
          @if (entityPresets.presets().length === 0) {
            <mat-card class="empty"><p>No entity presets saved yet.</p></mat-card>
          } @else {
            @for (preset of entityPresets.presets(); track preset.id) {
              <mat-card class="preset-card">
                <div class="row">
                  <div class="preset-info">
                    <h3>{{ preset.name }}</h3>
                    <p class="meta">
                      {{ preset.filterMode === 'just' ? '--just=' : preset.filterMode === 'skip' ? '--skip=' : '' }}{{ preset.selectedEntities.join(',') }}
                    </p>
                  </div>
                  <button mat-button color="warn" (click)="removeEntityPreset(preset.id, preset.name)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-card>
            }
          }
        </mat-tab>

        <mat-tab label="Destination presets ({{ destinationPresets.presets().length }})">
          @if (destinationPresets.presets().length === 0) {
            <mat-card class="empty"><p>No destination presets saved yet.</p></mat-card>
          } @else {
            @for (preset of destinationPresets.presets(); track preset.id) {
              <mat-card class="preset-card">
                <div class="row">
                  <div class="preset-info">
                    <h3>{{ preset.name }}</h3>
                    <p class="meta"><code>{{ preset.path }}</code></p>
                    @if (preset.description) {
                      <p class="meta">{{ preset.description }}</p>
                    }
                  </div>
                  <button mat-button color="warn" (click)="removeDestinationPreset(preset.id, preset.name)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-card>
            }
          }
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .preset-card,
      .empty {
        padding: 16px;
        margin: 12px 0;
      }
      .preset-info {
        flex: 1;
      }
      .preset-info h3 {
        margin: 0;
        font: var(--mat-sys-title-small);
      }
      .meta {
        margin: 2px 0 0;
        font: var(--mat-sys-body-small);
        color: var(--mat-sys-on-surface-variant);
      }
      code {
        background: var(--mat-sys-surface-container);
        padding: 1px 6px;
        border-radius: 4px;
      }
    `,
  ],
})
export class PresetsPageComponent {
  protected readonly transferPresets = inject(TransferPresetsService);
  protected readonly entityPresets = inject(EntityPresetsService);
  protected readonly destinationPresets = inject(DestinationPresetsService);
  private readonly wizard = inject(WizardService);
  private readonly jar = inject(JarPathService);
  private readonly router = inject(Router);

  protected loadTransferPreset(id: string): void {
    const preset = this.transferPresets.presets().find((p) => p.id === id);
    if (!preset) return;
    const config = {
      ...makeDefaultConfig(this.jar.path()),
      ...preset.config,
      source: { ...preset.config.source, password: '', headerValue: '' },
      target: { ...preset.config.target, password: '', headerValue: '' },
    };
    this.wizard.loadConfig(config);
    void this.router.navigateByUrl('/wizard');
  }

  protected removeTransferPreset(id: string, name: string): void {
    if (!confirm(`Delete transfer preset "${name}"?`)) return;
    this.transferPresets.remove(id);
  }

  protected removeEntityPreset(id: string, name: string): void {
    if (!confirm(`Delete entity preset "${name}"?`)) return;
    this.entityPresets.remove(id);
  }

  protected removeDestinationPreset(id: string, name: string): void {
    if (!confirm(`Delete destination preset "${name}"?`)) return;
    this.destinationPresets.remove(id);
  }

  protected formatDate(ts: number): string {
    return new Date(ts).toLocaleString();
  }
}
