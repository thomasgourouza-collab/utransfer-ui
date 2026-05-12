import { AuthMode } from './operation.model';

export interface ServerProfile {
  id: string;
  name: string;
  url: string;
  auth: AuthMode;
  username: string;
  encryptedPassword: string;
  iv: string;
  headerName?: string;
  encryptedHeaderValue?: string;
  headerIv?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DecryptedServerProfile extends ServerProfile {
  password: string;
  headerValue?: string;
}
