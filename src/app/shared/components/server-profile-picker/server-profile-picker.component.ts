import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { MasterPasswordService } from '../../../core/services/master-password.service';
import { ServerProfilesService } from '../../../core/services/server-profiles.service';
import { DecryptedServerProfile } from '../../../core/models/server-profile.model';
import { UnlockDialogComponent } from '../unlock-dialog/unlock-dialog.component';

@Component({
  selector: 'app-server-profile-picker',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
  ],
  template: `
    <div class="row">
      <mat-form-field appearance="outline" class="profile-select">
        <mat-label>Server profile (optional)</mat-label>
        <mat-select [(ngModel)]="selectedId" (selectionChange)="apply()">
          <mat-option [value]="''">— None —</mat-option>
          @for (profile of profiles(); track profile.id) {
            <mat-option [value]="profile.id">
              {{ profile.name }} — {{ profile.url }}
            </mat-option>
          }
        </mat-select>
      </mat-form-field>
      @if (selectedId() && !masterPassword.isUnlocked()) {
        <button mat-stroked-button color="primary" (click)="unlock()">
          <mat-icon>lock</mat-icon> Unlock to apply
        </button>
      }
    </div>
    @if (error()) {
      <p class="warning-chip">{{ error() }}</p>
    }
  `,
  styles: [
    `
      .profile-select {
        flex: 1 1 320px;
      }
    `,
  ],
})
export class ServerProfilePickerComponent {
  readonly profileId = input<string | undefined>(undefined);
  readonly profileApplied = output<DecryptedServerProfile>();

  protected readonly selectedId = signal<string>('');
  protected readonly error = signal('');

  private readonly profilesService = inject(ServerProfilesService);
  protected readonly masterPassword = inject(MasterPasswordService);
  private readonly dialog = inject(MatDialog);

  protected readonly profiles = computed(() => this.profilesService.profiles());

  constructor() {
    const initial = this.profileId() ?? '';
    if (initial) this.selectedId.set(initial);
  }

  protected async apply(): Promise<void> {
    const id = this.selectedId();
    if (!id) return;
    if (!this.masterPassword.isUnlocked()) {
      this.error.set('Unlock the vault to apply this profile.');
      return;
    }
    const profile = this.profiles().find((p) => p.id === id);
    if (!profile) return;
    try {
      const decrypted = await this.profilesService.decrypt(profile);
      this.error.set('');
      this.profileApplied.emit(decrypted);
    } catch (e) {
      this.error.set('Could not decrypt profile: ' + String(e));
    }
  }

  protected unlock(): void {
    const ref = this.dialog.open(UnlockDialogComponent, { width: '420px' });
    ref.afterClosed().subscribe((ok: boolean | undefined) => {
      if (ok) this.apply();
    });
  }
}
