import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MasterPasswordService } from '../services/master-password.service';
import { UnlockDialogComponent } from '../../shared/components/unlock-dialog/unlock-dialog.component';

export const unlockedGuard: CanActivateFn = async () => {
  const masterPassword = inject(MasterPasswordService);
  const dialog = inject(MatDialog);

  if (masterPassword.isUnlocked()) return true;
  const ref = dialog.open(UnlockDialogComponent, { width: '420px', disableClose: false });
  const result = await new Promise<boolean>((resolve) => {
    ref.afterClosed().subscribe((r: boolean | undefined) => resolve(r === true));
  });
  return result;
};
