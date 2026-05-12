import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ServerProfilesService, NewProfileInput } from '../../core/services/server-profiles.service';
import { MasterPasswordService } from '../../core/services/master-password.service';
import { AUTH_MODES } from '../../core/data/utransfer-catalog';
import { AuthMode } from '../../core/models/operation.model';

@Component({
  selector: 'app-profiles-page',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Server profiles</h1>
        <span class="spacer"></span>
        <button mat-flat-button color="primary" (click)="newProfile()">
          <mat-icon>add</mat-icon> New profile
        </button>
      </div>

      <p class="helper-text">
        Server profiles are stored locally and encrypted with your master password (AES-GCM,
        PBKDF2-derived key, 200&nbsp;000 iterations). Nothing is sent over the network.
      </p>

      @if (profiles.profiles().length === 0) {
        <mat-card class="empty">
          <p>No profiles yet. Create one to skip retyping URLs and credentials in the wizard.</p>
        </mat-card>
      } @else {
        @for (profile of profiles.profiles(); track profile.id) {
          <mat-card class="profile-card">
            <div class="row">
              <div class="profile-info">
                <h3>{{ profile.name }}</h3>
                <p class="meta">{{ profile.url }}</p>
                <p class="meta">Auth: {{ authLabel(profile.auth) }} · User: {{ profile.username || '—' }}</p>
              </div>
              <button mat-stroked-button (click)="edit(profile.id)">
                <mat-icon>edit</mat-icon> Edit
              </button>
              <button mat-button color="warn" (click)="remove(profile.id, profile.name)">
                <mat-icon>delete</mat-icon> Delete
              </button>
            </div>
          </mat-card>
        }
      }

      @if (editing()) {
        <mat-card class="edit-form">
          <h3>{{ form().id ? 'Edit profile' : 'New profile' }}</h3>

          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput [(ngModel)]="form().name" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Server URL</mat-label>
            <input matInput [(ngModel)]="form().url" placeholder="https://example.com/app" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Authentication mode</mat-label>
            <mat-select [(ngModel)]="form().auth">
              @for (a of authModes; track a.value) {
                <mat-option [value]="a.value">{{ a.displayName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          @if (form().auth === 'admin' || form().auth === 'superadmin') {
            <mat-form-field appearance="outline">
              <mat-label>Username</mat-label>
              <input matInput [(ngModel)]="form().username" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="form().password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="showPassword.set(!showPassword())"
              >
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>
          } @else if (form().auth === 'header') {
            <mat-form-field appearance="outline">
              <mat-label>Header name</mat-label>
              <input matInput [(ngModel)]="form().headerName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Header value</mat-label>
              <input matInput [(ngModel)]="form().headerValue" />
            </mat-form-field>
          }

          <div class="row">
            <button mat-button (click)="cancel()">Cancel</button>
            <button mat-flat-button color="primary" (click)="save()" [disabled]="saving()">
              {{ form().id ? 'Save changes' : 'Create profile' }}
            </button>
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      .profile-card,
      .empty,
      .edit-form {
        padding: 16px;
        margin-bottom: 12px;
      }
      .edit-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .profile-info {
        flex: 1;
      }
      .profile-info h3 {
        margin: 0;
        font: var(--mat-sys-title-small);
      }
      .meta {
        margin: 2px 0 0;
        font: var(--mat-sys-body-small);
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class ProfilesPageComponent {
  protected readonly profiles = inject(ServerProfilesService);
  protected readonly masterPassword = inject(MasterPasswordService);
  private readonly snack = inject(MatSnackBar);

  protected readonly authModes = AUTH_MODES;
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly form = signal<NewProfileInput & { id?: string }>(this.emptyForm());

  protected newProfile(): void {
    this.form.set(this.emptyForm());
    this.editing.set(true);
  }

  protected async edit(id: string): Promise<void> {
    const profile = this.profiles.profiles().find((p) => p.id === id);
    if (!profile) return;
    try {
      const decrypted = await this.profiles.decrypt(profile);
      this.form.set({
        id: profile.id,
        name: profile.name,
        url: profile.url,
        auth: profile.auth,
        username: profile.username,
        password: decrypted.password,
        headerName: profile.headerName ?? '',
        headerValue: decrypted.headerValue ?? '',
      });
      this.editing.set(true);
    } catch (e) {
      this.snack.open('Cannot decrypt profile: ' + String(e), 'OK', { duration: 4000 });
    }
  }

  protected async save(): Promise<void> {
    const f = this.form();
    if (!f.name || !f.url) {
      this.snack.open('Name and URL are required.', 'OK', { duration: 2500 });
      return;
    }
    this.saving.set(true);
    try {
      if (f.id) {
        await this.profiles.update(f.id, f);
      } else {
        await this.profiles.create(f);
      }
      this.editing.set(false);
      this.form.set(this.emptyForm());
      this.snack.open('Profile saved.', 'OK', { duration: 2000 });
    } catch (e) {
      this.snack.open('Save failed: ' + String(e), 'OK', { duration: 4000 });
    } finally {
      this.saving.set(false);
    }
  }

  protected cancel(): void {
    this.editing.set(false);
    this.form.set(this.emptyForm());
  }

  protected remove(id: string, name: string): void {
    if (!confirm(`Delete profile "${name}"?`)) return;
    this.profiles.remove(id);
  }

  protected authLabel(auth: AuthMode): string {
    return AUTH_MODES.find((a) => a.value === auth)?.displayName ?? auth;
  }

  private emptyForm(): NewProfileInput & { id?: string } {
    return {
      name: '',
      url: '',
      auth: 'admin',
      username: '',
      password: '',
      headerName: '',
      headerValue: '',
    };
  }
}
