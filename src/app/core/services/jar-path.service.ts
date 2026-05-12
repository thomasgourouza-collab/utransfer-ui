import { Injectable, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';
import { DEFAULT_JAR_PATH } from '../data/utransfer-catalog';

const STORAGE_KEY = 'utransfer-ui.jar-path';

@Injectable({ providedIn: 'root' })
export class JarPathService {
  private readonly storage = inject(StorageService);
  private readonly jarSignal = signal<string>(this.storage.read<string>(STORAGE_KEY, DEFAULT_JAR_PATH));
  readonly path = this.jarSignal.asReadonly();

  set(value: string): void {
    const trimmed = value.trim();
    this.jarSignal.set(trimmed);
    this.storage.write(STORAGE_KEY, trimmed);
  }

  resetToDefault(): void {
    this.set(DEFAULT_JAR_PATH);
  }
}
