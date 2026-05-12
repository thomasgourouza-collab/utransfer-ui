import { Injectable, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';
import { TransferPreset, stripSecrets } from '../models/transfer-preset.model';
import { TransferConfig } from '../models/transfer-config.model';

const STORAGE_KEY = 'utransfer-ui.transfer-presets';

@Injectable({ providedIn: 'root' })
export class TransferPresetsService {
  private readonly storage = inject(StorageService);
  private readonly presetsSignal = signal<TransferPreset[]>(
    this.storage.read<TransferPreset[]>(STORAGE_KEY, []),
  );
  readonly presets = this.presetsSignal.asReadonly();

  save(name: string, description: string | undefined, config: TransferConfig): TransferPreset {
    const preset: TransferPreset = {
      id: crypto.randomUUID(),
      name,
      description,
      config: stripSecrets(config),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.presetsSignal.update((list) => [...list, preset]);
    this.persist();
    return preset;
  }

  remove(id: string): void {
    this.presetsSignal.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }

  rename(id: string, name: string, description?: string): void {
    this.presetsSignal.update((list) =>
      list.map((p) => (p.id === id ? { ...p, name, description, updatedAt: Date.now() } : p)),
    );
    this.persist();
  }

  private persist(): void {
    this.storage.write(STORAGE_KEY, this.presetsSignal());
  }
}
