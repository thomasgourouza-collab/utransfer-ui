import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
import { MasterPasswordService } from './core/services/master-password.service';
import { UnlockDialogComponent } from './shared/components/unlock-dialog/unlock-dialog.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    ThemeToggleComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly masterPassword = inject(MasterPasswordService);
  private readonly dialog = inject(MatDialog);

  protected unlock(): void {
    this.dialog.open(UnlockDialogComponent, { width: '420px' });
  }
}
