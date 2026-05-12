import { TransferConfig } from './transfer-config.model';

export type SafeEndpoint = Omit<TransferConfig['source'], 'password' | 'headerValue'>;

export interface SafeTransferConfig
  extends Omit<TransferConfig, 'source' | 'target'> {
  source: SafeEndpoint;
  target: SafeEndpoint;
}

export interface TransferPreset {
  id: string;
  name: string;
  description?: string;
  config: SafeTransferConfig;
  createdAt: number;
  updatedAt: number;
}

export function stripSecrets(config: TransferConfig): SafeTransferConfig {
  const stripEndpoint = (e: TransferConfig['source']): SafeEndpoint => {
    const { password: _password, headerValue: _headerValue, ...rest } = e;
    return rest;
  };
  return {
    ...config,
    source: stripEndpoint(config.source),
    target: stripEndpoint(config.target),
  };
}
