import { Injectable, computed, inject, signal } from '@angular/core';

import { CryptoService } from './crypto.service';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'utransfer-ui.master-password';
const VERIFIER_PLAINTEXT = 'UTRANSFER-UI-OK';
const IDLE_LOCK_MS = 15 * 60 * 1000;

interface MasterPasswordRecord {
  salt: string;
  verifierCiphertext: string;
  verifierIv: string;
}

@Injectable({ providedIn: 'root' })
export class MasterPasswordService {
  private readonly crypto = inject(CryptoService);
  private readonly storage = inject(StorageService);

  private readonly recordSignal = signal<MasterPasswordRecord | null>(this.loadRecord());
  private readonly keySignal = signal<CryptoKey | null>(null);
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isInitialized = computed(() => this.recordSignal() !== null);
  readonly isUnlocked = computed(() => this.keySignal() !== null);

  async initialize(password: string): Promise<void> {
    if (this.recordSignal() !== null) {
      throw new Error('Master password already initialised.');
    }
    const salt = this.crypto.randomSaltB64();
    const key = await this.crypto.deriveKey(password, salt);
    const verifier = await this.crypto.encrypt(VERIFIER_PLAINTEXT, key);
    const record: MasterPasswordRecord = {
      salt,
      verifierCiphertext: verifier.ciphertext,
      verifierIv: verifier.iv,
    };
    this.storage.write(STORAGE_KEY, record);
    this.recordSignal.set(record);
    this.keySignal.set(key);
    this.armIdleTimer();
  }

  async unlock(password: string): Promise<boolean> {
    const record = this.recordSignal();
    if (record === null) throw new Error('Master password not initialised.');
    const key = await this.crypto.deriveKey(password, record.salt);
    try {
      const plain = await this.crypto.decrypt(
        { ciphertext: record.verifierCiphertext, iv: record.verifierIv },
        key,
      );
      if (plain !== VERIFIER_PLAINTEXT) return false;
      this.keySignal.set(key);
      this.armIdleTimer();
      return true;
    } catch {
      return false;
    }
  }

  lock(): void {
    this.keySignal.set(null);
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  reset(): void {
    this.storage.remove(STORAGE_KEY);
    this.recordSignal.set(null);
    this.lock();
  }

  requireKey(): CryptoKey {
    const k = this.keySignal();
    if (k === null) throw new Error('Vault is locked.');
    return k;
  }

  touch(): void {
    if (this.keySignal() !== null) this.armIdleTimer();
  }

  private armIdleTimer(): void {
    if (this.idleTimer !== null) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.lock(), IDLE_LOCK_MS);
  }

  private loadRecord(): MasterPasswordRecord | null {
    return this.storage.read<MasterPasswordRecord | null>(STORAGE_KEY, null);
  }
}
