import { describe, it, expect, beforeEach } from 'vitest';
import { CommandBuilderService, shellQuote } from './command-builder.service';
import { makeDefaultConfig, TransferConfig } from '../models/transfer-config.model';

const JAR = '/path/utransfer.jar';

function exportConfig(overrides: Partial<TransferConfig> = {}): TransferConfig {
  const cfg = makeDefaultConfig(JAR);
  cfg.mode = 'EXPORT';
  cfg.source = {
    kind: 'server',
    url: 'https://foo.com/app',
    path: '',
    auth: 'admin',
    username: 'admin',
    password: 'pass',
    headerName: '',
    headerValue: '',
  };
  cfg.target = {
    kind: 'file',
    url: '',
    path: '/tmp/out',
    auth: 'admin',
    username: '',
    password: '',
    headerName: '',
    headerValue: '',
  };
  return { ...cfg, ...overrides };
}

describe('shellQuote', () => {
  it('keeps safe values bare', () => {
    expect(shellQuote('hello')).toBe('hello');
    expect(shellQuote('/tmp/out')).toBe('/tmp/out');
    expect(shellQuote('https://foo.com/app')).toBe('https://foo.com/app');
    expect(shellQuote('USERS,TEAMS')).toBe('USERS,TEAMS');
    expect(shellQuote('--idConversion=NAME')).toBe('--idConversion=NAME');
  });

  it('quotes values containing spaces or special chars', () => {
    expect(shellQuote('hello world')).toBe("'hello world'");
    expect(shellQuote('p@$$w0rd!')).toBe("'p@$$w0rd!'");
  });

  it('quotes empty strings', () => {
    expect(shellQuote('')).toBe("''");
  });

  it('escapes embedded single quotes', () => {
    expect(shellQuote("it's")).toBe("'it'\\''s'");
  });
});

describe('CommandBuilderService', () => {
  let svc: CommandBuilderService;
  beforeEach(() => {
    svc = new CommandBuilderService();
  });

  it('builds a basic server-to-file export with --fromAdmin/--fromPassword', () => {
    const out = svc.build(exportConfig());
    expect(out.argv).toEqual([
      'java',
      '-jar',
      JAR,
      'https://foo.com/app',
      '/tmp/out',
      '--fromAdmin=admin',
      '--fromPassword=pass',
    ]);
    expect(out.errors).toEqual([]);
  });

  it('appends --add-suffix and --keepApiKeys', () => {
    const cfg = exportConfig({ addSuffix: '_DEV', keepApiKeys: true });
    const out = svc.build(cfg);
    expect(out.argv).toContain('--add-suffix=_DEV');
    expect(out.argv).toContain('--keepApiKeys');
    expect(out.warnings.some((w) => w.includes('cleartext'))).toBe(true);
  });

  it('emits --idConversion=NAME when chosen', () => {
    const cfg = exportConfig({ idConversion: 'NAME' });
    const out = svc.build(cfg);
    expect(out.argv).toContain('--idConversion=NAME');
  });

  it('omits --idConversion when ID (default) is chosen', () => {
    const out = svc.build(exportConfig());
    expect(out.argv.some((a) => a.startsWith('--idConversion'))).toBe(false);
  });

  it('builds --skip with a comma list', () => {
    const cfg = exportConfig({
      filterMode: 'skip',
      selectedEntities: ['WEBHOOKS', 'BOTS', 'EXTERNAL_MESSENGERS'],
    });
    const out = svc.build(cfg);
    expect(out.argv).toContain('--skip=WEBHOOKS,BOTS,EXTERNAL_MESSENGERS');
  });

  it('builds --just with a comma list', () => {
    const cfg = exportConfig({
      filterMode: 'just',
      selectedEntities: ['CANNED_RESPONSES', 'MESSAGE_INTERCEPTORS', 'CONVERSATION_TEMPLATES'],
    });
    const out = svc.build(cfg);
    expect(out.argv).toContain('--just=CANNED_RESPONSES,MESSAGE_INTERCEPTORS,CONVERSATION_TEMPLATES');
  });

  it('appends -f for folder format on export', () => {
    const cfg = exportConfig({ outputFormat: 'folder' });
    const out = svc.build(cfg);
    expect(out.argv).toContain('-f');
  });

  it('appends -z for zip format on export', () => {
    const cfg = exportConfig({ outputFormat: 'zip' });
    const out = svc.build(cfg);
    expect(out.argv).toContain('-z');
  });

  it('builds a server-to-server transfer with superadmin on both sides', () => {
    const cfg = makeDefaultConfig(JAR);
    cfg.mode = 'TRANSFER';
    cfg.source = {
      kind: 'server',
      url: 'https://source.com/app',
      path: '',
      auth: 'superadmin',
      username: 'superadmin',
      password: 'pwd',
      headerName: '',
      headerValue: '',
    };
    cfg.target = {
      kind: 'server',
      url: 'https://target.com/app',
      path: '',
      auth: 'superadmin',
      username: 'superadmin',
      password: 'pwd',
      headerName: '',
      headerValue: '',
    };
    const out = svc.build(cfg);
    expect(out.argv).toContain('--fromSuperadmin=superadmin');
    expect(out.argv).toContain('--fromPassword=pwd');
    expect(out.argv).toContain('--toSuperadmin=superadmin');
    expect(out.argv).toContain('--toPassword=pwd');
    expect(out.argv).not.toContain('-f');
    expect(out.argv).not.toContain('-z');
  });

  it('builds an import with --verbose', () => {
    const cfg = makeDefaultConfig(JAR);
    cfg.mode = 'IMPORT';
    cfg.source = {
      kind: 'file',
      url: '',
      path: '/tmp/export.json',
      auth: 'admin',
      username: '',
      password: '',
      headerName: '',
      headerValue: '',
    };
    cfg.target = {
      kind: 'server',
      url: 'https://target.com/app',
      path: '',
      auth: 'admin',
      username: 'admin',
      password: 'password',
      headerName: '',
      headerValue: '',
    };
    cfg.verbose = true;
    const out = svc.build(cfg);
    expect(out.argv).toEqual([
      'java',
      '-jar',
      JAR,
      '/tmp/export.json',
      'https://target.com/app',
      '--toAdmin=admin',
      '--toPassword=password',
      '--verbose',
    ]);
  });

  it('combines idConversion + suffix + keepApiKeys', () => {
    const cfg = exportConfig({ idConversion: 'HASH', addSuffix: '_CLONE', keepApiKeys: true });
    const out = svc.build(cfg);
    expect(out.argv).toContain('--idConversion=HASH');
    expect(out.argv).toContain('--add-suffix=_CLONE');
    expect(out.argv).toContain('--keepApiKeys');
  });

  it('emits --fromNoAuth when no-auth is selected on a server source', () => {
    const cfg = exportConfig();
    cfg.source.auth = 'noauth';
    cfg.source.username = '';
    cfg.source.password = '';
    const out = svc.build(cfg);
    expect(out.argv).toContain('--fromNoAuth');
    expect(out.argv.some((a) => a.startsWith('--fromAdmin'))).toBe(false);
  });

  it('emits --fromHeader + -d for header auth', () => {
    const cfg = exportConfig();
    cfg.source.auth = 'header';
    cfg.source.headerName = 'X-Forwarded-User';
    cfg.source.headerValue = 'tg';
    const out = svc.build(cfg);
    expect(out.argv).toContain('--fromHeader=X-Forwarded-User');
    expect(out.argv).toContain('-d');
    expect(out.argv).toContain('tg');
  });

  it('reports an error when filterMode=just but no entities selected', () => {
    const cfg = exportConfig({ filterMode: 'just', selectedEntities: [] });
    const out = svc.build(cfg);
    expect(out.errors.some((e) => e.includes('no entities'))).toBe(true);
  });

  it('reports an error when both suffixes are set', () => {
    const cfg = exportConfig({ addSuffix: '_A', removeSuffix: '_B' });
    const out = svc.build(cfg);
    expect(out.errors.some((e) => e.includes('Add suffix and Remove suffix'))).toBe(true);
  });

  it('warns when USERS is included via --just', () => {
    const cfg = exportConfig({ filterMode: 'just', selectedEntities: ['USERS'] });
    const out = svc.build(cfg);
    expect(out.warnings.some((w) => w.startsWith('USERS'))).toBe(true);
  });

  it('warns when source URL equals target URL on a server-to-server transfer', () => {
    const cfg = makeDefaultConfig(JAR);
    cfg.mode = 'TRANSFER';
    cfg.source = {
      kind: 'server',
      url: 'https://foo.com/app',
      path: '',
      auth: 'admin',
      username: 'a',
      password: 'b',
      headerName: '',
      headerValue: '',
    };
    cfg.target = { ...cfg.source };
    const out = svc.build(cfg);
    expect(out.warnings.some((w) => w.includes('identical'))).toBe(true);
  });

  it('renders a one-liner string with proper quoting', () => {
    const cfg = exportConfig();
    cfg.source.password = 'has spaces';
    const out = svc.build(cfg);
    expect(out.oneLiner).toContain("'--fromPassword=has spaces'");
  });

  it('renders a multi-line string with backslash continuations', () => {
    const out = svc.build(exportConfig());
    expect(out.multiLine).toContain(' \\\n');
  });

  it('renders a shell script with shebang', () => {
    const out = svc.build(exportConfig());
    expect(out.shellScript.startsWith('#!/usr/bin/env bash')).toBe(true);
  });
});
