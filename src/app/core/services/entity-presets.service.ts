import { Injectable, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';
import { EntityPreset } from '../models/entity-preset.model';
import { EntityFilterMode } from '../models/operation.model';

const STORAGE_KEY = 'utransfer-ui.entity-presets';

@Injectable({ providedIn: 'root' })
export class EntityPresetsService {
  private readonly storage = inject(StorageService);
  private readonly presetsSignal = signal<EntityPreset[]>(
    this.storage.read<EntityPreset[]>(STORAGE_KEY, []),
  );
  readonly presets = this.presetsSignal.asReadonly();

  save(name: string, description: string | undefined, mode: EntityFilterMode, selectedEntities: string[]): EntityPreset {
    const preset: EntityPreset = {
      id: crypto.randomUUID(),
      name,
      description,
      filterMode: mode,
      selectedEntities: [...selectedEntities],
      createdAt: Date.now(),
    };
    this.presetsSignal.update((list) => [...list, preset]);
    this.persist();
    return preset;
  }

  remove(id: string): void {
    this.presetsSignal.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.write(STORAGE_KEY, this.presetsSignal());
  }
}
