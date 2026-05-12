import { Component, computed, input, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import {
  DEFAULT_INCLUDED_ENTITY_FLAGS,
  ENTITY_TYPES,
} from '../../../core/data/utransfer-catalog';
import { EntityFilterMode } from '../../../core/models/operation.model';

@Component({
  selector: 'app-entity-picker',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatRadioModule,
    MatTooltipModule,
  ],
  template: `
    <div class="filter-row">
      <mat-radio-group [(ngModel)]="filterModeValue" class="filter-radio-group" (change)="filterModeChanged()">
        <mat-radio-button value="defaults">
          Defaults (USERS, TEAMS, DEPUTIES excluded)
        </mat-radio-button>
        <mat-radio-button value="just">Just these entities…</mat-radio-button>
        <mat-radio-button value="skip">All defaults except…</mat-radio-button>
      </mat-radio-group>
    </div>

    @if (filterModeValue() !== 'defaults') {
      <div class="bulk-actions">
        <button mat-button (click)="selectAll()"><mat-icon>done_all</mat-icon> Select all</button>
        <button mat-button (click)="selectNone()"><mat-icon>remove_done</mat-icon> Select none</button>
        <button mat-button (click)="selectDefaults()" matTooltip="USERS, TEAMS, DEPUTIES are excluded">
          <mat-icon>auto_awesome</mat-icon> Select defaults
        </button>
        <span class="spacer"></span>
        <span class="count">{{ selectedEntitiesValue().length }} selected</span>
      </div>

      <div class="entity-grid">
        @for (entity of entities; track entity.flag) {
          <mat-card
            class="entity-card"
            [class.selected]="isSelected(entity.flag)"
            (click)="toggle(entity.flag)"
          >
            <mat-checkbox
              [checked]="isSelected(entity.flag)"
              (click)="$event.stopPropagation()"
              (change)="toggle(entity.flag)"
            >
              <span class="entity-name">{{ entity.displayName }}</span>
            </mat-checkbox>
            <p class="entity-desc">{{ entity.description }}</p>
            <div class="entity-tags">
              @if (entity.defaultExcluded) {
                <span class="entity-tag warn" matTooltip="Excluded by default — credentials cannot be exported">
                  default-excluded
                </span>
              }
              @if (entity.requiresSuperadmin) {
                <span class="entity-tag info" matTooltip="Requires superadmin credentials">
                  superadmin
                </span>
              }
              @for (note of entity.notes; track note) {
                <span class="entity-note">{{ note }}</span>
              }
            </div>
          </mat-card>
        }
      </div>
    } @else {
      <p class="helper-text">
        Using utransfer’s default entity set. USERS, TEAMS and DEPUTIES are excluded
        because their credentials cannot be exported. License keys are never included.
      </p>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .filter-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .filter-radio-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .bulk-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .spacer {
        flex: 1 1 auto;
      }
      .count {
        font: var(--mat-sys-body-small);
        color: var(--mat-sys-on-surface-variant);
      }
      .entity-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 12px;
      }
      .entity-card {
        cursor: pointer;
        transition: outline 0.15s;
        outline: 1px solid transparent;
        padding: 12px;
      }
      .entity-card:hover {
        outline-color: var(--mat-sys-outline);
      }
      .entity-card.selected {
        outline: 2px solid var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
      }
      .entity-name {
        font: var(--mat-sys-title-small);
      }
      .entity-desc {
        font: var(--mat-sys-body-small);
        color: var(--mat-sys-on-surface-variant);
        margin: 6px 0;
      }
      .entity-card.selected .entity-desc {
        color: var(--mat-sys-on-primary-container);
      }
      .entity-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }
      .entity-tag {
        font: var(--mat-sys-label-small);
        padding: 2px 8px;
        border-radius: 999px;
      }
      .entity-tag.warn {
        background: var(--mat-sys-error-container);
        color: var(--mat-sys-on-error-container);
      }
      .entity-tag.info {
        background: var(--mat-sys-tertiary-container);
        color: var(--mat-sys-on-tertiary-container);
      }
      .entity-note {
        font: var(--mat-sys-label-small);
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class EntityPickerComponent {
  readonly filterModeValue = model.required<EntityFilterMode>({ alias: 'filterMode' });
  readonly selectedEntitiesValue = model.required<string[]>({ alias: 'selectedEntities' });
  readonly disabled = input(false);

  protected readonly entities = ENTITY_TYPES;
  protected readonly selectedSet = computed(() => new Set(this.selectedEntitiesValue()));

  protected isSelected(flag: string): boolean {
    return this.selectedSet().has(flag);
  }

  protected toggle(flag: string): void {
    if (this.disabled()) return;
    const set = new Set(this.selectedEntitiesValue());
    if (set.has(flag)) set.delete(flag);
    else set.add(flag);
    this.selectedEntitiesValue.set([...set]);
  }

  protected selectAll(): void {
    this.selectedEntitiesValue.set(this.entities.map((e) => e.flag));
  }

  protected selectNone(): void {
    this.selectedEntitiesValue.set([]);
  }

  protected selectDefaults(): void {
    this.selectedEntitiesValue.set([...DEFAULT_INCLUDED_ENTITY_FLAGS]);
  }

  protected filterModeChanged(): void {
    // Reset selection so it doesn't leak across "just" / "skip" semantics.
    this.selectedEntitiesValue.set([]);
  }
}
