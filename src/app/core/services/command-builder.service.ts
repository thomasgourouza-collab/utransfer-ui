import { Injectable } from '@angular/core';

import { GeneratedCommand } from '../models/generated-command.model';
import { EndpointConfig, TransferConfig } from '../models/transfer-config.model';
import { ENTITY_TYPES, OPERATING_MODES } from '../data/utransfer-catalog';
import { OperationMode } from '../models/operation.model';

const SAFE_BARE_RE = /^[A-Za-z0-9@%+=:,./_\-]+$/;

export function shellQuote(value: string): string {
  if (value === '') return "''";
  if (SAFE_BARE_RE.test(value)) return value;
  return "'" + value.replace(/'/g, "'\\''") + "'";
}

@Injectable({ providedIn: 'root' })
export class CommandBuilderService {
  build(config: TransferConfig): GeneratedCommand {
    const errors: string[] = [];
    const warnings: string[] = [];
    const hints: string[] = [];

    this.validateRequired(config, errors);
    this.collectWarnings(config, warnings);
    this.collectHints(config, hints);

    const argv: string[] = ['java', '-jar', config.jarPath || '<jar-path>'];

    argv.push(this.endpointPositional(config.source));
    argv.push(this.endpointPositional(config.target));

    if (config.source.kind === 'server') {
      this.appendAuthFlags(argv, config.source, 'from');
    }
    if (config.target.kind === 'server') {
      this.appendAuthFlags(argv, config.target, 'to');
    }

    this.appendEntityFilter(argv, config);
    this.appendOutputFormat(argv, config);

    if (config.idConversion !== 'ID') {
      argv.push(`--idConversion=${config.idConversion}`);
    }
    if (config.addSuffix) argv.push(`--add-suffix=${config.addSuffix}`);
    if (config.removeSuffix) argv.push(`--remove-suffix=${config.removeSuffix}`);

    if (config.keepApiKeys) argv.push('--keepApiKeys');
    if (config.keepMarkers) argv.push('--keepMarkers');
    if (config.verbose) argv.push('--verbose');
    if (config.deleteUnmatched) argv.push('--delete');

    const oneLiner = argv.map(shellQuote).join(' ');
    const multiLine = this.formatMultiLine(argv);
    const shellScript = this.formatShellScript(argv, config);

    return { argv, oneLiner, multiLine, shellScript, warnings, hints, errors };
  }

  private endpointPositional(endpoint: EndpointConfig): string {
    if (endpoint.kind === 'server') return endpoint.url || '<source-url>';
    return endpoint.path || '<file-or-folder>';
  }

  private appendAuthFlags(argv: string[], endpoint: EndpointConfig, side: 'from' | 'to'): void {
    const cap = side === 'from' ? 'from' : 'to';
    switch (endpoint.auth) {
      case 'admin':
        if (endpoint.username) argv.push(`--${cap}Admin=${endpoint.username}`);
        if (endpoint.password) argv.push(`--${cap}Password=${endpoint.password}`);
        break;
      case 'superadmin':
        if (endpoint.username) argv.push(`--${cap}Superadmin=${endpoint.username}`);
        if (endpoint.password) argv.push(`--${cap}Password=${endpoint.password}`);
        break;
      case 'header':
        if (endpoint.headerName) argv.push(`--${cap}Header=${endpoint.headerName}`);
        if (endpoint.headerValue) argv.push('-d', endpoint.headerValue);
        break;
      case 'noauth':
        argv.push(`--${cap}NoAuth`);
        break;
    }
  }

  private appendEntityFilter(argv: string[], config: TransferConfig): void {
    if (config.filterMode === 'just' && config.selectedEntities.length) {
      argv.push(`--just=${config.selectedEntities.join(',')}`);
    } else if (config.filterMode === 'skip' && config.selectedEntities.length) {
      argv.push(`--skip=${config.selectedEntities.join(',')}`);
    }
  }

  private appendOutputFormat(argv: string[], config: TransferConfig): void {
    const mode = this.getMode(config.mode);
    if (!mode.supportsOutputFormat) return;
    if (config.outputFormat === 'folder') argv.push('-f');
    else if (config.outputFormat === 'zip') argv.push('-z');
  }

  private validateRequired(config: TransferConfig, errors: string[]): void {
    if (!config.jarPath) errors.push('utransfer.jar path is required — set it in Settings.');

    const mode = this.getMode(config.mode);
    if (config.source.kind !== mode.sourceKind) {
      errors.push(`Source must be a ${mode.sourceKind} for ${mode.displayName}.`);
    }
    if (config.target.kind !== mode.targetKind) {
      errors.push(`Target must be a ${mode.targetKind} for ${mode.displayName}.`);
    }

    this.validateEndpoint(config.source, 'Source', errors);
    this.validateEndpoint(config.target, 'Target', errors);

    if (config.filterMode === 'just' && config.selectedEntities.length === 0) {
      errors.push('Filter mode is "Just these" but no entities are selected.');
    }
    if (config.addSuffix && config.removeSuffix) {
      errors.push('Cannot use Add suffix and Remove suffix at the same time.');
    }
  }

  private validateEndpoint(endpoint: EndpointConfig, label: string, errors: string[]): void {
    if (endpoint.kind === 'server') {
      if (!endpoint.url) errors.push(`${label} URL is required.`);
      if (endpoint.auth === 'admin' || endpoint.auth === 'superadmin') {
        if (!endpoint.username) errors.push(`${label} username is required.`);
        if (!endpoint.password) errors.push(`${label} password is required.`);
      } else if (endpoint.auth === 'header') {
        if (!endpoint.headerName) errors.push(`${label} header name is required.`);
        if (!endpoint.headerValue) errors.push(`${label} header value is required.`);
      }
    } else if (!endpoint.path) {
      errors.push(`${label} file/folder path is required.`);
    }
  }

  private collectWarnings(config: TransferConfig, warnings: string[]): void {
    const selected = this.effectivelyIncludedEntities(config);

    if (selected.has('USERS')) {
      warnings.push('USERS will be exported without passwords — credentials cannot be transferred.');
    }
    if (selected.has('TEAMS')) {
      warnings.push('TEAMS will be exported without credentials. The default team resists deletion on import.');
    }
    if (selected.has('DEPUTIES')) {
      warnings.push('DEPUTIES will be exported without credentials.');
    }
    if (selected.has('GLOBAL')) {
      const sourceAuth = config.source.kind === 'server' ? config.source.auth : null;
      const targetAuth = config.target.kind === 'server' ? config.target.auth : null;
      if (sourceAuth === 'admin') {
        warnings.push('GLOBAL is selected but the source is using admin credentials — superadmin is required.');
      }
      if (targetAuth === 'admin') {
        warnings.push('GLOBAL will be ignored on import because the target uses admin credentials (superadmin required).');
      }
    }
    if (config.keepApiKeys) {
      warnings.push('--keepApiKeys writes API key values in cleartext into the export file.');
    }
    if (config.verbose) {
      warnings.push('--verbose logs full HTTP traffic, which may include credentials and secrets.');
    }
    if (config.deleteUnmatched) {
      warnings.push('--delete will remove target entities that are not present in the source. Test against a non-production server first.');
    }
    if (
      config.source.kind === 'server' &&
      config.target.kind === 'server' &&
      config.source.url &&
      config.source.url === config.target.url
    ) {
      warnings.push('Source and target URLs are identical — this will overwrite the source account.');
    }
  }

  private collectHints(config: TransferConfig, hints: string[]): void {
    if (config.filterMode === 'defaults') {
      hints.push('No entity filter set: utransfer’s default exclusions (USERS, TEAMS, DEPUTIES) apply.');
    }
    if (config.idConversion === 'COUNTER') {
      hints.push('COUNTER IDs are order-dependent — different export sequences produce different IDs.');
    }
    if (config.addSuffix) {
      hints.push(`Globally unique names will be suffixed with "${config.addSuffix}" on import.`);
    }
  }

  private effectivelyIncludedEntities(config: TransferConfig): Set<string> {
    const defaults = new Set(ENTITY_TYPES.filter((e) => !e.defaultExcluded).map((e) => e.flag));
    if (config.filterMode === 'just') return new Set(config.selectedEntities);
    if (config.filterMode === 'skip') {
      const out = new Set(defaults);
      for (const f of config.selectedEntities) out.delete(f);
      return out;
    }
    return defaults;
  }

  private formatMultiLine(argv: string[]): string {
    const quoted = argv.map(shellQuote);
    const lines: string[] = [];
    let line = '';
    for (let i = 0; i < quoted.length; i++) {
      const piece = quoted[i];
      const isFlag = piece.startsWith('--') || piece === '-f' || piece === '-z' || piece === '-d';
      if (i > 0 && isFlag) {
        lines.push(line);
        line = '  ' + piece;
      } else if (line === '') {
        line = piece;
      } else {
        line += ' ' + piece;
      }
    }
    if (line) lines.push(line);
    return lines.join(' \\\n');
  }

  private formatShellScript(argv: string[], config: TransferConfig): string {
    const mode = this.getMode(config.mode);
    const header = [
      '#!/usr/bin/env bash',
      'set -euo pipefail',
      '',
      `# utransfer — ${mode.displayName}`,
      `# Generated by Utransfer UI`,
      '',
    ];
    return header.join('\n') + this.formatMultiLine(argv) + '\n';
  }

  private getMode(mode: OperationMode) {
    const found = OPERATING_MODES.find((m) => m.value === mode);
    if (!found) throw new Error(`Unknown operation mode: ${String(mode)}`);
    return found;
  }
}
