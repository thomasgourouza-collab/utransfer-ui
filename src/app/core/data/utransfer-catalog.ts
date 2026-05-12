import { AuthMode, IdConversion, OperationMode, OutputFormat } from '../models/operation.model';

export const DEFAULT_JAR_PATH =
  '/Users/tgourouza/Documents/Unblu/utransfer/com.unblu.utransfer.server.cli-8.32.0.FUVTepZh-all.jar';

export interface OperatingModeMeta {
  value: OperationMode;
  displayName: string;
  description: string;
  sourceKind: 'server' | 'file';
  targetKind: 'server' | 'file';
  supportsOutputFormat: boolean;
  icon: string;
}

export const OPERATING_MODES: readonly OperatingModeMeta[] = [
  {
    value: 'EXPORT',
    displayName: 'Export from server to file',
    description:
      'Read entities from a live Unblu Collaboration Server and write them to a local JSON file, folder or ZIP archive.',
    sourceKind: 'server',
    targetKind: 'file',
    supportsOutputFormat: true,
    icon: 'cloud_download',
  },
  {
    value: 'IMPORT',
    displayName: 'Import from file to server',
    description:
      'Read an exported JSON file (or folder/ZIP) and apply its entities to a target Unblu Collaboration Server.',
    sourceKind: 'file',
    targetKind: 'server',
    supportsOutputFormat: false,
    icon: 'cloud_upload',
  },
  {
    value: 'TRANSFER',
    displayName: 'Transfer server to server',
    description:
      'Stream entities directly from a source Unblu server to a target Unblu server in a single invocation.',
    sourceKind: 'server',
    targetKind: 'server',
    supportsOutputFormat: false,
    icon: 'sync_alt',
  },
  {
    value: 'TRANSFORM',
    displayName: 'Transform file',
    description:
      'Re-export an existing export file or folder with different ID-conversion, suffix or format options, producing a transformed file or folder.',
    sourceKind: 'file',
    targetKind: 'file',
    supportsOutputFormat: true,
    icon: 'swap_horiz',
  },
] as const;

export interface EntityTypeMeta {
  flag: string;
  displayName: string;
  description: string;
  defaultExcluded: boolean;
  requiresSuperadmin?: boolean;
  notes: string[];
}

export const ENTITY_TYPES: readonly EntityTypeMeta[] = [
  {
    flag: 'API_KEYS',
    displayName: 'API keys',
    description: 'Keys used by external systems to authenticate against the Unblu Web API.',
    defaultExcluded: false,
    notes: ['Key values are stripped on export unless you enable Keep API keys.'],
  },
  {
    flag: 'BOTS',
    displayName: 'Bots',
    description: 'Dialog bots and concierge configurations (chatbot definitions).',
    defaultExcluded: false,
    notes: ['Only dialog bots and concierge transfer; runtime conversations cannot be exported.'],
  },
  {
    flag: 'BRANCHES',
    displayName: 'Branches',
    description: 'Logical branches of the agent organisation used to scope conversations and routing.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'CANNED_RESPONSES',
    displayName: 'Canned responses',
    description: 'Predefined chat replies and quick-response snippets used by agents.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'CONVERSATION_TEMPLATES',
    displayName: 'Conversation templates (dialog templates)',
    description: 'Templates that define conversation flows, dialog structures and starting messages.',
    defaultExcluded: false,
    notes: ['Default templates resist deletion during import.'],
  },
  {
    flag: 'CUSTOM_ACTIONS',
    displayName: 'Custom actions',
    description: 'User-defined actions exposed in the agent and visitor UIs.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'DEPUTIES',
    displayName: 'Deputies',
    description: 'Substitute agents who can act on behalf of another agent.',
    defaultExcluded: true,
    notes: ['Excluded by default because credentials cannot be exported.'],
  },
  {
    flag: 'DOMAINS',
    displayName: 'Domains',
    description: 'Web domains where Unblu may be embedded and on which deployment rules apply.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'EXTERNAL_MESSENGERS',
    displayName: 'External messengers',
    description: 'Configurations for external messaging channels (WhatsApp, Apple Messages, etc.).',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'FILE_UPLOAD_INTERCEPTORS',
    displayName: 'File upload interceptors',
    description: 'Hooks that inspect or block file uploads, e.g. virus scanners.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'GLOBAL',
    displayName: 'Global configuration',
    description: 'Account-wide configuration and text properties that apply to all entities.',
    defaultExcluded: false,
    requiresSuperadmin: true,
    notes: [
      'Only accessible with superadmin credentials.',
      'Secrets are masked on export — provide unmasked values to apply them on import.',
    ],
  },
  {
    flag: 'MESSAGE_INTERCEPTORS',
    displayName: 'Message interceptors',
    description: 'Hooks that inspect, modify or block chat messages.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'NAMED_AREAS',
    displayName: 'Named areas',
    description: 'Named regions of a host application that Unblu uses to anchor collaboration.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'PERSON_LABELS',
    displayName: 'Person labels',
    description: 'Tags assigned to people (visitors / agents) for segmentation.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'PERSON_VISIBILITY_RULES',
    displayName: 'Person visibility rules',
    description: 'Rules controlling which agents can see which visitors.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'RECORD_RETENTION',
    displayName: 'Record retention',
    description: 'Data retention policies for conversations, recordings and personal data.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'SUGGESTION_SOURCES',
    displayName: 'Suggestion sources',
    description: 'Knowledge sources feeding suggested replies and search-based assistance.',
    defaultExcluded: false,
    notes: [],
  },
  {
    flag: 'TEAMS',
    displayName: 'Teams',
    description: 'Agent teams used for routing and collaboration.',
    defaultExcluded: true,
    notes: [
      'Excluded by default because credentials cannot be exported.',
      'The default team resists deletion on import.',
    ],
  },
  {
    flag: 'USERS',
    displayName: 'Users',
    description: 'Agent and admin user accounts (identities, roles, profile data).',
    defaultExcluded: true,
    notes: [
      'Excluded by default because passwords cannot be exported.',
      'License keys are never included in exports.',
    ],
  },
  {
    flag: 'WEBHOOKS',
    displayName: 'Webhooks',
    description: 'Outgoing webhook subscriptions emitted by the Unblu server.',
    defaultExcluded: false,
    notes: [],
  },
] as const;

export const ENTITY_FLAGS: readonly string[] = ENTITY_TYPES.map((e) => e.flag);

export const DEFAULT_INCLUDED_ENTITY_FLAGS: readonly string[] = ENTITY_TYPES.filter(
  (e) => !e.defaultExcluded,
).map((e) => e.flag);

export interface IdConversionMeta {
  value: IdConversion;
  displayName: string;
  description: string;
  whenToUse: string;
  caveats: string;
}

export const ID_CONVERSION_STRATEGIES: readonly IdConversionMeta[] = [
  {
    value: 'ID',
    displayName: 'ID (keep original)',
    description: 'Keep the original numeric / opaque IDs as they exist on the source.',
    whenToUse: 'Same-account round-trip exports, or backups you intend to restore in place.',
    caveats:
      'Will collide if you import into a different account that already has overlapping IDs.',
  },
  {
    value: 'NAME',
    displayName: 'NAME (use display name)',
    description: 'Replace IDs with the human-readable name/title of each entity.',
    whenToUse: 'Stable transfers between installations: names rarely change, IDs always differ.',
    caveats:
      'Two entities with the same display name will conflict. Renaming on the source produces a different ID on import.',
  },
  {
    value: 'HASH',
    displayName: 'HASH (stable hash of attributes)',
    description: 'Derive a deterministic hash from each entity’s business attributes.',
    whenToUse: 'Cross-installation transfers where you want stable IDs that are not display names.',
    caveats: 'IDs are opaque and not human-readable. Changes to attributes change the hash.',
  },
  {
    value: 'COUNTER',
    displayName: 'COUNTER (sequential)',
    description: 'Use sequential IDs like `account001`, `account002`, ...',
    whenToUse: 'Generating fresh test data sets where the actual ID does not matter.',
    caveats:
      'Order-dependent: re-exporting the same data in a different order produces different IDs.',
  },
] as const;

export interface AuthModeMeta {
  value: AuthMode;
  displayName: string;
  scope: string;
  caveats: string;
}

export const AUTH_MODES: readonly AuthModeMeta[] = [
  {
    value: 'admin',
    displayName: 'Admin (basic auth)',
    scope: 'Access limited to the admin user’s own account. GLOBAL properties are ignored on import.',
    caveats: 'Cannot create new accounts on import. Many entity types are skipped for the technical admin role.',
  },
  {
    value: 'superadmin',
    displayName: 'Superadmin (basic auth)',
    scope: 'Full access to any account and to GLOBAL properties.',
    caveats: 'Can create new accounts on import. Treat the password as highly sensitive.',
  },
  {
    value: 'header',
    displayName: 'Custom header',
    scope: 'Authenticates by sending a custom HTTP header.',
    caveats: 'Server must be configured to accept this header. Typically used for ID-propagation setups.',
  },
  {
    value: 'noauth',
    displayName: 'No authentication',
    scope: 'Sends no authentication header.',
    caveats: 'Only works against servers that explicitly accept unauthenticated requests.',
  },
] as const;

export interface OutputFormatMeta {
  value: OutputFormat;
  flag: '' | '-f' | '-z';
  displayName: string;
  description: string;
}

export const OUTPUT_FORMATS: readonly OutputFormatMeta[] = [
  {
    value: 'single',
    flag: '',
    displayName: 'Single JSON file',
    description: 'All entities in one .json file (default).',
  },
  {
    value: 'folder',
    flag: '-f',
    displayName: 'Folder (one file per entity type)',
    description: 'One JSON file per entity type inside a folder — ideal for version control.',
  },
  {
    value: 'zip',
    flag: '-z',
    displayName: 'ZIP archive',
    description: 'Same folder layout as `-f`, packaged into a single .zip file.',
  },
] as const;

export const DOC_LINK = 'https://docs.unblu.com/latest/knowledge-base/guides/tooling/utransfer.html';

export const GLOBAL_NOTES: readonly string[] = [
  'License keys are never included in exports.',
  'User passwords are never included in exports.',
  'Cannot transfer between different major Unblu versions.',
  'Configuration secrets are masked as ****PROTECTED_SECRET**** on export.',
];
