import { Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { EndpointConfig } from '../../../core/models/transfer-config.model';
import { AUTH_MODES } from '../../../core/data/utransfer-catalog';
import { ServerProfilePickerComponent } from '../server-profile-picker/server-profile-picker.component';
import { InfoPopoverComponent } from '../info-popover/info-popover.component';
import { DecryptedServerProfile } from '../../../core/models/server-profile.model';

@Component({
  selector: 'app-endpoint-form',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ServerProfilePickerComponent,
    InfoPopoverComponent,
  ],
  template: `
    <div class="endpoint-form">
      @if (endpoint().kind === 'server') {
        <app-server-profile-picker
          [profileId]="endpoint().profileId"
          (profileApplied)="applyProfile($event)"
        />

        <mat-form-field appearance="outline">
          <mat-label>Server URL</mat-label>
          <input
            matInput
            [ngModel]="endpoint().url"
            (ngModelChange)="patch({ url: $event })"
            placeholder="https://example.com/app"
          />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>
            Authentication
            <app-info-popover [text]="authHint()" />
          </mat-label>
          <mat-select
            [ngModel]="endpoint().auth"
            (ngModelChange)="patch({ auth: $event })"
          >
            @for (a of authModes; track a.value) {
              <mat-option [value]="a.value">{{ a.displayName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (endpoint().auth === 'admin' || endpoint().auth === 'superadmin') {
          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input
              matInput
              [ngModel]="endpoint().username"
              (ngModelChange)="patch({ username: $event })"
              autocomplete="off"
            />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              [ngModel]="endpoint().password"
              (ngModelChange)="patch({ password: $event })"
              autocomplete="off"
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

          @if (endpoint().auth === 'superadmin' && side() === 'from') {
            <mat-form-field appearance="outline">
              <mat-label>
                Account ID (optional)
                <app-info-popover text="When set, the superadmin operates on this specific account instead of their own. Maps to --fromAccount." />
              </mat-label>
              <input
                matInput
                [ngModel]="endpoint().account"
                (ngModelChange)="patch({ account: $event })"
                placeholder="acme"
                autocomplete="off"
              />
            </mat-form-field>
          }
        } @else if (endpoint().auth === 'header') {
          <mat-form-field appearance="outline">
            <mat-label>Header name</mat-label>
            <input
              matInput
              [ngModel]="endpoint().headerName"
              (ngModelChange)="patch({ headerName: $event })"
              placeholder="X-Forwarded-User"
            />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Header value</mat-label>
            <input
              matInput
              [ngModel]="endpoint().headerValue"
              (ngModelChange)="patch({ headerValue: $event })"
            />
          </mat-form-field>
        }
      } @else {
        <mat-form-field appearance="outline">
          <mat-label>File or folder path</mat-label>
          <input
            matInput
            [ngModel]="endpoint().path"
            (ngModelChange)="patch({ path: $event })"
            [placeholder]="placeholder()"
          />
        </mat-form-field>
      }
    </div>
  `,
  styles: [
    `
      .endpoint-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    `,
  ],
})
export class EndpointFormComponent {
  readonly endpoint = model.required<EndpointConfig>();
  readonly side = input.required<'from' | 'to'>();
  readonly placeholder = input<string>('/tmp/export.json');

  protected readonly authModes = AUTH_MODES;
  protected readonly showPassword = signal(false);

  protected readonly authHint = computed(() => {
    const meta = AUTH_MODES.find((a) => a.value === this.endpoint().auth);
    if (!meta) return '';
    return `${meta.scope} — ${meta.caveats}`;
  });

  protected patch(p: Partial<EndpointConfig>): void {
    this.endpoint.set({ ...this.endpoint(), ...p });
  }

  protected applyProfile(profile: DecryptedServerProfile): void {
    this.endpoint.set({
      ...this.endpoint(),
      url: profile.url,
      auth: profile.auth,
      username: profile.username,
      password: profile.password,
      headerName: profile.headerName ?? '',
      headerValue: profile.headerValue ?? '',
      account: '',
      profileId: profile.id,
    });
  }
}
