import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { EntityPickerComponent } from '../../../shared/components/entity-picker/entity-picker.component';
import { WizardService } from '../wizard.service';
import { EntityFilterMode } from '../../../core/models/operation.model';
import { EntityPresetsService } from '../../../core/services/entity-presets.service';

@Component({
  selector: 'app-entities-step',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    EntityPickerComponent,
  ],
  template: `
    <p class="helper-text">
      Choose which entity types utransfer should process. By default, USERS, TEAMS and DEPUTIES
      are excluded because their credentials cannot be exported.
    </p>

    @if (presetsService.presets().length > 0) {
      <div class="row">
        <mat-form-field appearance="outline" class="preset-select">
          <mat-label>Apply an entity preset</mat-label>
          <mat-select [(ngModel)]="selectedPresetId" (selectionChange)="applyPreset()">
            <mat-option [value]="''">— None —</mat-option>
            @for (p of presetsService.presets(); track p.id) {
              <mat-option [value]="p.id">{{ p.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    }

    <app-entity-picker
      [filterMode]="filterMode()"
      (filterModeChange)="onFilterModeChange($event)"
      [selectedEntities]="selectedEntities()"
      (selectedEntitiesChange)="onSelectionChange($event)"
    />

    <button mat-stroked-button (click)="saveAsPreset()" [disabled]="!canSaveAsPreset()">
      <mat-icon>bookmark_add</mat-icon> Save as entity preset
    </button>

    @if (showSaveDialog()) {
      <div class="save-dialog">
        <mat-form-field appearance="outline">
          <mat-label>Preset name</mat-label>
          <input matInput [(ngModel)]="presetName" />
        </mat-form-field>
        <div class="row">
          <button mat-button (click)="showSaveDialog.set(false)">Cancel</button>
          <button mat-flat-button color="primary" (click)="confirmSave()" [disabled]="!presetName">
            Save
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .preset-select {
        flex: 1 1 320px;
      }
      .save-dialog {
        margin-top: 12px;
        padding: 12px;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 8px;
      }
    `,
  ],
})
export class EntitiesStepComponent {
  private readonly wizard = inject(WizardService);
  protected readonly presetsService = inject(EntityPresetsService);

  protected readonly filterMode = computed(() => this.wizard.config().filterMode);
  protected readonly selectedEntities = computed(() => this.wizard.config().selectedEntities);

  protected selectedPresetId = '';
  protected presetName = '';
  protected readonly showSaveDialog = signal(false);

  protected onFilterModeChange(mode: EntityFilterMode): void {
    this.wizard.update({ filterMode: mode, selectedEntities: [] });
  }

  protected onSelectionChange(entities: string[]): void {
    this.wizard.update({ selectedEntities: entities });
  }

  protected applyPreset(): void {
    if (!this.selectedPresetId) return;
    const preset = this.presetsService.presets().find((p) => p.id === this.selectedPresetId);
    if (!preset) return;
    this.wizard.update({
      filterMode: preset.filterMode,
      selectedEntities: [...preset.selectedEntities],
    });
  }

  protected canSaveAsPreset(): boolean {
    return this.filterMode() !== 'defaults' && this.selectedEntities().length > 0;
  }

  protected saveAsPreset(): void {
    this.showSaveDialog.set(true);
  }

  protected confirmSave(): void {
    if (!this.presetName) return;
    this.presetsService.save(
      this.presetName,
      undefined,
      this.filterMode(),
      this.selectedEntities(),
    );
    this.presetName = '';
    this.showSaveDialog.set(false);
  }
}
