import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { MasterPasswordService } from '../../../core/services/master-password.service';

@Component({
  selector: 'app-unlock-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ masterPassword.isInitialized() ? 'Unlock saved credentials' : 'Set a master password' }}
    </h2>
    <mat-dialog-content>
      <p class="helper-text">
        @if (masterPassword.isInitialized()) {
          Enter your master password to decrypt saved server profiles. The password never leaves your browser.
        } @else {
          Pick a master password used to encrypt server credentials in your browser. There is no recovery — write it down.
        }
      </p>
      <mat-form-field appearance="outline">
        <mat-label>Master password</mat-label>
        <input
          matInput
          [type]="show() ? 'text' : 'password'"
          [(ngModel)]="password"
          autocomplete="off"
          (keyup.enter)="submit()"
          autofocus
        />
        <button
          mat-icon-button
          matSuffix
          type="button"
          (click)="show.set(!show())"
          [attr.aria-label]="show() ? 'Hide password' : 'Show password'"
        >
          <mat-icon>{{ show() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      </mat-form-field>

      @if (!masterPassword.isInitialized()) {
        <mat-form-field appearance="outline">
          <mat-label>Confirm password</mat-label>
          <input
            matInput
            [type]="show() ? 'text' : 'password'"
            [(ngModel)]="confirm"
            (keyup.enter)="submit()"
          />
        </mat-form-field>
      }

      @if (error()) {
        <p class="warning-chip">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="busy()">
        {{ masterPassword.isInitialized() ? 'Unlock' : 'Set password' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 320px;
      }
    `,
  ],
})
export class UnlockDialogComponent {
  protected readonly masterPassword = inject(MasterPasswordService);
  private readonly dialogRef = inject(MatDialogRef<UnlockDialogComponent, boolean>);

  protected password = '';
  protected confirm = '';
  protected readonly show = signal(false);
  protected readonly error = signal('');
  protected readonly busy = signal(false);

  protected async submit(): Promise<void> {
    if (!this.password) {
      this.error.set('Password is required.');
      return;
    }
    this.error.set('');
    this.busy.set(true);
    try {
      if (this.masterPassword.isInitialized()) {
        const ok = await this.masterPassword.unlock(this.password);
        if (!ok) {
          this.error.set('Wrong password.');
          this.busy.set(false);
          return;
        }
        this.dialogRef.close(true);
      } else {
        if (this.password.length < 8) {
          this.error.set('Use at least 8 characters.');
          this.busy.set(false);
          return;
        }
        if (this.password !== this.confirm) {
          this.error.set('Passwords do not match.');
          this.busy.set(false);
          return;
        }
        await this.masterPassword.initialize(this.password);
        this.dialogRef.close(true);
      }
    } catch (e) {
      this.error.set('Unexpected error: ' + String(e));
      this.busy.set(false);
    }
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}
