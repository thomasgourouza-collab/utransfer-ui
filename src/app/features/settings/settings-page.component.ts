import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { JarPathService } from '../../core/services/jar-path.service';
import { ThemeMode, ThemeService } from '../../core/services/theme.service';
import { MasterPasswordService } from '../../core/services/master-password.service';
import { UnlockDialogComponent } from '../../shared/components/unlock-dialog/unlock-dialog.component';
import { DEFAULT_JAR_PATH, DOC_LINK, GLOBAL_NOTES } from '../../core/data/utransfer-catalog';

@Component({
  selector: 'app-settings-page',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
  ],
  template: `
    <div class="page">
      <h1 class="page-title">Settings</h1>

      <mat-card class="setting-card">
        <h2>utransfer.jar path</h2>
        <p class="helper-text">Path to the utransfer JAR file. Generated commands use this path.</p>
        <mat-form-field appearance="outline">
          <mat-label>Path</mat-label>
          <input matInput [(ngModel)]="jarPath" />
        </mat-form-field>
        <div class="row">
          <button mat-flat-button color="primary" (click)="saveJar()">Save path</button>
          <button mat-button (click)="resetJar()">Reset to default</button>
        </div>
        <p class="helper-text">Default: <code>{{ defaultJarPath }}</code></p>
      </mat-card>

      <mat-card class="setting-card">
        <h2>Theme</h2>
        <mat-radio-group [ngModel]="theme.mode()" (ngModelChange)="theme.setMode($event)">
          <mat-radio-button value="system">Follow system</mat-radio-button>
          <mat-radio-button value="light">Light</mat-radio-button>
          <mat-radio-button value="dark">Dark</mat-radio-button>
        </mat-radio-group>
      </mat-card>

      <mat-card class="setting-card">
        <h2>Master password</h2>
        <p class="helper-text">
          Used to encrypt server credentials in your browser. Encryption: AES-GCM with a PBKDF2-derived key
          (SHA-256, 200&nbsp;000 iterations). The password never leaves your browser.
        </p>
        <div class="row">
          @if (masterPassword.isInitialized()) {
            @if (masterPassword.isUnlocked()) {
              <button mat-stroked-button (click)="masterPassword.lock()">
                <mat-icon>lock</mat-icon> Lock vault
              </button>
            } @else {
              <button mat-flat-button color="primary" (click)="unlock()">
                <mat-icon>lock_open</mat-icon> Unlock vault
              </button>
            }
            <button mat-button color="warn" (click)="reset()">
              <mat-icon>delete_forever</mat-icon> Reset (wipes saved credentials)
            </button>
          } @else {
            <button mat-flat-button color="primary" (click)="unlock()">
              <mat-icon>add_moderator</mat-icon> Set master password
            </button>
          }
        </div>
      </mat-card>

      <mat-card class="setting-card">
        <h2>What utransfer never includes</h2>
        <ul>
          @for (note of globalNotes; track note) {
            <li>{{ note }}</li>
          }
        </ul>
        <p class="helper-text">
          Reference:
          <a [href]="docLink" target="_blank" rel="noopener">official utransfer documentation</a>.
        </p>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .setting-card {
        padding: 20px;
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      mat-radio-group {
        display: flex;
        gap: 16px;
      }
      code {
        background: var(--mat-sys-surface-container);
        padding: 1px 6px;
        border-radius: 4px;
      }
    `,
  ],
})
export class SettingsPageComponent {
  protected readonly jar = inject(JarPathService);
  protected readonly theme = inject(ThemeService);
  protected readonly masterPassword = inject(MasterPasswordService);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected jarPath = this.jar.path();
  protected readonly defaultJarPath = DEFAULT_JAR_PATH;
  protected readonly docLink = DOC_LINK;
  protected readonly globalNotes = GLOBAL_NOTES;

  protected saveJar(): void {
    this.jar.set(this.jarPath);
    this.snack.open('utransfer.jar path saved.', 'OK', { duration: 2000 });
  }

  protected resetJar(): void {
    this.jar.resetToDefault();
    this.jarPath = this.jar.path();
    this.snack.open('Reset to default jar path.', 'OK', { duration: 2000 });
  }

  protected unlock(): void {
    this.dialog.open(UnlockDialogComponent, { width: '420px' });
  }

  protected reset(): void {
    if (
      !confirm(
        'This will wipe the master password and all encrypted credentials in saved server profiles. The profile names will remain. Continue?',
      )
    )
      return;
    this.masterPassword.reset();
    this.snack.open('Master password reset.', 'OK', { duration: 2000 });
  }

  // theme mode bound directly via inline lambda
  protected setTheme(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }
}
