import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { CommandBuilderService } from '../../core/services/command-builder.service';
import { JarPathService } from '../../core/services/jar-path.service';
import { TransferConfig, makeDefaultConfig, makeEmptyEndpoint } from '../../core/models/transfer-config.model';
import { OPERATING_MODES } from '../../core/data/utransfer-catalog';
import { OperationMode } from '../../core/models/operation.model';

@Injectable({ providedIn: 'root' })
export class WizardService {
  private readonly jarService = inject(JarPathService);
  private readonly builder = inject(CommandBuilderService);

  private readonly configSignal = signal<TransferConfig>(makeDefaultConfig(this.jarService.path()));
  readonly config = this.configSignal.asReadonly();
  readonly generated = computed(() => this.builder.build(this.configSignal()));

  constructor() {
    // Keep jar path in sync with the global setting.
    effect(() => {
      const jar = this.jarService.path();
      this.configSignal.update((c) => (c.jarPath === jar ? c : { ...c, jarPath: jar }));
    });
  }

  update(patch: Partial<TransferConfig>): void {
    this.configSignal.update((c) => ({ ...c, ...patch }));
  }

  setMode(mode: OperationMode): void {
    const meta = OPERATING_MODES.find((m) => m.value === mode);
    if (!meta) return;
    this.configSignal.update((c) => ({
      ...c,
      mode,
      source: c.source.kind === meta.sourceKind ? c.source : makeEmptyEndpoint(meta.sourceKind),
      target: c.target.kind === meta.targetKind ? c.target : makeEmptyEndpoint(meta.targetKind),
    }));
  }

  reset(): void {
    this.configSignal.set(makeDefaultConfig(this.jarService.path()));
  }

  loadConfig(config: TransferConfig): void {
    this.configSignal.set({ ...config });
  }
}
