import { AuthMode, EndpointKind, EntityFilterMode, IdConversion, OperationMode, OutputFormat } from './operation.model';

export interface EndpointConfig {
  kind: EndpointKind;
  url: string;
  path: string;
  auth: AuthMode;
  username: string;
  password: string;
  headerName: string;
  headerValue: string;
  account: string;
  profileId?: string;
}

export interface TransferConfig {
  jarPath: string;
  mode: OperationMode;

  source: EndpointConfig;
  target: EndpointConfig;

  filterMode: EntityFilterMode;
  selectedEntities: string[];

  outputFormat: OutputFormat;

  idConversion: IdConversion;
  addSuffix: string;
  removeSuffix: string;

  keepApiKeys: boolean;
  keepMarkers: boolean;
  verbose: boolean;
  newUserPassword: string;
  noUtransferUser: boolean;
}

export function makeEmptyEndpoint(kind: EndpointKind): EndpointConfig {
  return {
    kind,
    url: '',
    path: '',
    auth: 'admin',
    username: '',
    password: '',
    headerName: '',
    headerValue: '',
    account: '',
  };
}

export function makeDefaultConfig(jarPath: string): TransferConfig {
  return {
    jarPath,
    mode: 'EXPORT',
    source: makeEmptyEndpoint('server'),
    target: makeEmptyEndpoint('file'),
    filterMode: 'defaults',
    selectedEntities: [],
    outputFormat: 'single',
    idConversion: 'ID',
    addSuffix: '',
    removeSuffix: '',
    keepApiKeys: false,
    keepMarkers: false,
    verbose: false,
    newUserPassword: '',
    noUtransferUser: false,
  };
}
