import { describe, it, expect, beforeAll } from 'vitest';
import { webcrypto } from 'node:crypto';
import { CryptoService } from './crypto.service';

beforeAll(() => {
  if (!(globalThis as { crypto?: Crypto }).crypto) {
    (globalThis as { crypto: Crypto }).crypto = webcrypto as unknown as Crypto;
  }
});

describe('CryptoService', () => {
  it('round-trips encryption with the correct password', async () => {
    const svc = new CryptoService();
    const salt = svc.randomSaltB64();
    const key = await svc.deriveKey('correct horse battery staple', salt);
    const blob = await svc.encrypt('utransfer secret', key);
    const plain = await svc.decrypt(blob, key);
    expect(plain).toBe('utransfer secret');
  });

  it('fails to decrypt with the wrong password', async () => {
    const svc = new CryptoService();
    const salt = svc.randomSaltB64();
    const goodKey = await svc.deriveKey('right password', salt);
    const badKey = await svc.deriveKey('wrong password', salt);
    const blob = await svc.encrypt('secret data', goodKey);
    await expect(svc.decrypt(blob, badKey)).rejects.toBeDefined();
  });

  it('produces a distinct IV for each encryption', async () => {
    const svc = new CryptoService();
    const salt = svc.randomSaltB64();
    const key = await svc.deriveKey('p', salt);
    const a = await svc.encrypt('x', key);
    const b = await svc.encrypt('x', key);
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('decrypts unicode correctly', async () => {
    const svc = new CryptoService();
    const salt = svc.randomSaltB64();
    const key = await svc.deriveKey('p', salt);
    const blob = await svc.encrypt('🔐 utransfer 中文', key);
    const plain = await svc.decrypt(blob, key);
    expect(plain).toBe('🔐 utransfer 中文');
  });
});
