import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { CommandHistoryService } from '../../core/services/command-history.service';
import { ServerProfilesService } from '../../core/services/server-profiles.service';
import { TransferPresetsService } from '../../core/services/transfer-presets.service';
import { DOC_LINK, OPERATING_MODES } from '../../core/data/utransfer-catalog';
import { JarPathService } from '../../core/services/jar-path.service';
import { WizardService } from '../wizard/wizard.service';
import { OperationMode } from '../../core/models/operation.model';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page">
      <h1 class="page-title">utransfer UI</h1>
      <p class="helper-text">
        Build any utransfer command without remembering flags. Profiles, presets and history
        live in your browser only — nothing is sent over the network.
      </p>

      <div class="card-grid">
        @for (mode of modes; track mode.value) {
          <mat-card class="action-card" (click)="openWizardWithMode(mode.value)">
            <mat-icon>{{ mode.icon }}</mat-icon>
            <h3>{{ mode.displayName }}</h3>
            <p>{{ mode.description }}</p>
            <button mat-button color="primary">Open wizard →</button>
          </mat-card>
        }
      </div>

      <h2 class="section-title">Quick actions</h2>
      <div class="row">
        <a mat-stroked-button routerLink="/profiles"><mat-icon>dns</mat-icon> Server profiles ({{ profiles.profiles().length }})</a>
        <a mat-stroked-button routerLink="/presets"><mat-icon>bookmark</mat-icon> Presets ({{ presets.presets().length }})</a>
        <a mat-stroked-button routerLink="/history"><mat-icon>history</mat-icon> History ({{ history.entries().length }})</a>
        <a mat-stroked-button routerLink="/settings"><mat-icon>settings</mat-icon> Settings</a>
      </div>

      @if (history.recent().length > 0) {
        <h2 class="section-title">Recent commands</h2>
        <div class="col">
          @for (entry of history.recent(); track entry.id) {
            <mat-card class="history-row">
              <div class="history-meta">
                <span>{{ formatDate(entry.createdAt) }}</span>
                <span>{{ entry.config.mode }}</span>
              </div>
              <pre class="code-block">{{ entry.oneLiner }}</pre>
            </mat-card>
          }
        </div>
      }

      <h2 class="section-title">Configuration</h2>
      <p class="helper-text">
        utransfer.jar: <code>{{ jar.path() }}</code>
      </p>
      <p class="helper-text">
        Reference:
        <a [href]="docLink" target="_blank" rel="noopener">official utransfer documentation</a>.
      </p>
    </div>
  `,
  styles: [
    `
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        margin: 16px 0;
      }
      .action-card {
        padding: 20px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 6px;
        transition: outline 0.15s;
        outline: 1px solid transparent;
      }
      .action-card:hover {
        outline-color: var(--mat-sys-primary);
      }
      .action-card h3 {
        margin: 0;
        font: var(--mat-sys-title-small);
      }
      .action-card p {
        margin: 0;
        font: var(--mat-sys-body-small);
        color: var(--mat-sys-on-surface-variant);
      }
      .action-card mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
      .history-row {
        padding: 12px;
      }
      .history-meta {
        display: flex;
        gap: 12px;
        font: var(--mat-sys-label-small);
        color: var(--mat-sys-on-surface-variant);
        margin-bottom: 6px;
      }
      code {
        background: var(--mat-sys-surface-container);
        padding: 2px 6px;
        border-radius: 4px;
      }
    `,
  ],
})
export class DashboardPageComponent {
  protected readonly modes = OPERATING_MODES;
  protected readonly docLink = DOC_LINK;

  protected readonly history = inject(CommandHistoryService);
  protected readonly profiles = inject(ServerProfilesService);
  protected readonly presets = inject(TransferPresetsService);
  protected readonly jar = inject(JarPathService);
  private readonly wizard = inject(WizardService);
  private readonly router = inject(Router);

  protected openWizardWithMode(mode: OperationMode): void {
    this.wizard.setMode(mode);
    this.wizard.requestInitialStep(1);
    void this.router.navigateByUrl('/wizard');
  }

  protected formatDate(ts: number): string {
    return new Date(ts).toLocaleString();
  }
}
