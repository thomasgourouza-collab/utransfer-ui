import { Injectable, computed, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';
import { CommandHistoryEntry } from '../models/command-history-entry.model';
import { GeneratedCommand } from '../models/generated-command.model';
import { TransferConfig } from '../models/transfer-config.model';
import { stripSecrets } from '../models/transfer-preset.model';

const STORAGE_KEY = 'utransfer-ui.history';
const MAX_ENTRIES = 100;

@Injectable({ providedIn: 'root' })
export class CommandHistoryService {
  private readonly storage = inject(StorageService);
  private readonly entriesSignal = signal<CommandHistoryEntry[]>(
    this.storage.read<CommandHistoryEntry[]>(STORAGE_KEY, []),
  );
  readonly entries = this.entriesSignal.asReadonly();
  readonly recent = computed(() => this.entriesSignal().slice(0, 5));

  record(config: TransferConfig, generated: GeneratedCommand): CommandHistoryEntry {
    const entry: CommandHistoryEntry = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      oneLiner: redactSecrets(generated.oneLiner),
      multiLine: redactSecrets(generated.multiLine),
      config: stripSecrets(config),
    };
    this.entriesSignal.update((list) => [entry, ...list].slice(0, MAX_ENTRIES));
    this.persist();
    return entry;
  }

  clear(): void {
    this.entriesSignal.set([]);
    this.persist();
  }

  remove(id: string): void {
    this.entriesSignal.update((list) => list.filter((e) => e.id !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.write(STORAGE_KEY, this.entriesSignal());
  }
}

const SECRET_FLAGS = ['--fromPassword=', '--toPassword='];

function redactSecrets(input: string): string {
  let out = input;
  for (const flag of SECRET_FLAGS) {
    const re = new RegExp(`(${escapeRe(flag)})('?)([^'\\s\\\\]+)`, 'g');
    out = out.replace(re, '$1$2****');
    const reQuoted = new RegExp(`('${escapeRe(flag)})([^']+)'`, 'g');
    out = out.replace(reQuoted, "$1****'");
  }
  return out;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
