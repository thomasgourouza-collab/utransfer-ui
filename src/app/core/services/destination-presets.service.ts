import { Injectable, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';
import { DestinationPreset } from '../models/destination-preset.model';

const STORAGE_KEY = 'utransfer-ui.destination-presets';

@Injectable({ providedIn: 'root' })
export class DestinationPresetsService {
  private readonly storage = inject(StorageService);
  private readonly presetsSignal = signal<DestinationPreset[]>(
    this.storage.read<DestinationPreset[]>(STORAGE_KEY, []),
  );
  readonly presets = this.presetsSignal.asReadonly();

  save(name: string, path: string, description?: string): DestinationPreset {
    const preset: DestinationPreset = {
      id: crypto.randomUUID(),
      name,
      path,
      description,
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
