import { SafeTransferConfig } from './transfer-preset.model';

export interface CommandHistoryEntry {
  id: string;
  createdAt: number;
  oneLiner: string;
  multiLine: string;
  config: SafeTransferConfig;
}
