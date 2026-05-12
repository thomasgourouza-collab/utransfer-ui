import { Injectable, computed, signal } from '@angular/core';

import { StorageService } from './storage.service';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'utransfer-ui.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = new StorageService();
  private readonly modeSignal = signal<ThemeMode>(this.load());
  readonly mode = this.modeSignal.asReadonly();
  readonly effective = computed<'light' | 'dark'>(() => this.resolve(this.modeSignal()));

  constructor() {
    this.apply(this.modeSignal());
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      if (this.modeSignal() === 'system') this.apply('system');
    });
  }

  setMode(mode: ThemeMode): void {
    this.modeSignal.set(mode);
    this.storage.write(STORAGE_KEY, mode);
    this.apply(mode);
  }

  private resolve(mode: ThemeMode): 'light' | 'dark' {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  }

  private apply(mode: ThemeMode): void {
    const effective = this.resolve(mode);
    const root = document.documentElement;
    root.classList.toggle('theme-dark', effective === 'dark');
    root.classList.toggle('theme-light', effective === 'light');
  }

  private load(): ThemeMode {
    return this.storage.read<ThemeMode>(STORAGE_KEY, 'system');
  }
}
