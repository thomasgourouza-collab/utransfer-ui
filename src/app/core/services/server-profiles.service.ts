import { Injectable, computed, inject, signal } from '@angular/core';

import { CryptoService } from './crypto.service';
import { MasterPasswordService } from './master-password.service';
import { StorageService } from './storage.service';
import { DecryptedServerProfile, ServerProfile } from '../models/server-profile.model';
import { AuthMode } from '../models/operation.model';

const STORAGE_KEY = 'utransfer-ui.server-profiles';

export interface NewProfileInput {
  name: string;
  url: string;
  auth: AuthMode;
  username: string;
  password: string;
  headerName?: string;
  headerValue?: string;
}

@Injectable({ providedIn: 'root' })
export class ServerProfilesService {
  private readonly storage = inject(StorageService);
  private readonly crypto = inject(CryptoService);
  private readonly masterPassword = inject(MasterPasswordService);

  private readonly profilesSignal = signal<ServerProfile[]>(
    this.storage.read<ServerProfile[]>(STORAGE_KEY, []),
  );

  readonly profiles = this.profilesSignal.asReadonly();
  readonly hasProfiles = computed(() => this.profilesSignal().length > 0);

  async create(input: NewProfileInput): Promise<ServerProfile> {
    const key = this.masterPassword.requireKey();
    const pwd = await this.crypto.encrypt(input.password, key);
    let header: { ciphertext: string; iv: string } | undefined;
    if (input.auth === 'header' && input.headerValue) {
      header = await this.crypto.encrypt(input.headerValue, key);
    }
    const profile: ServerProfile = {
      id: makeId(),
      name: input.name,
      url: input.url,
      auth: input.auth,
      username: input.username,
      encryptedPassword: pwd.ciphertext,
      iv: pwd.iv,
      headerName: input.headerName,
      encryptedHeaderValue: header?.ciphertext,
      headerIv: header?.iv,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.profilesSignal.update((list) => [...list, profile]);
    this.persist();
    return profile;
  }

  async update(id: string, input: NewProfileInput): Promise<void> {
    const key = this.masterPassword.requireKey();
    const pwd = await this.crypto.encrypt(input.password, key);
    let header: { ciphertext: string; iv: string } | undefined;
    if (input.auth === 'header' && input.headerValue) {
      header = await this.crypto.encrypt(input.headerValue, key);
    }
    this.profilesSignal.update((list) =>
      list.map((p) =>
        p.id === id
          ? {
              ...p,
              name: input.name,
              url: input.url,
              auth: input.auth,
              username: input.username,
              encryptedPassword: pwd.ciphertext,
              iv: pwd.iv,
              headerName: input.headerName,
              encryptedHeaderValue: header?.ciphertext,
              headerIv: header?.iv,
              updatedAt: Date.now(),
            }
          : p,
      ),
    );
    this.persist();
  }

  remove(id: string): void {
    this.profilesSignal.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }

  async decrypt(profile: ServerProfile): Promise<DecryptedServerProfile> {
    const key = this.masterPassword.requireKey();
    const password = await this.crypto.decrypt(
      { ciphertext: profile.encryptedPassword, iv: profile.iv },
      key,
    );
    let headerValue: string | undefined;
    if (profile.encryptedHeaderValue && profile.headerIv) {
      headerValue = await this.crypto.decrypt(
        { ciphertext: profile.encryptedHeaderValue, iv: profile.headerIv },
        key,
      );
    }
    return { ...profile, password, headerValue };
  }

  private persist(): void {
    this.storage.write(STORAGE_KEY, this.profilesSignal());
  }
}

function makeId(): string {
  return crypto.randomUUID();
}
