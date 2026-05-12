import { Injectable } from '@angular/core';

const ITERATIONS = 200_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

export interface EncryptedBlob {
  ciphertext: string;
  iv: string;
}

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private readonly enc = new TextEncoder();
  private readonly dec = new TextDecoder();

  randomSaltB64(): string {
    return toBase64(crypto.getRandomValues(new Uint8Array(SALT_LENGTH)));
  }

  async deriveKey(password: string, saltB64: string): Promise<CryptoKey> {
    const salt = fromBase64(saltB64);
    const baseKey = await crypto.subtle.importKey(
      'raw',
      this.enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  async encrypt(plaintext: string, key: CryptoKey): Promise<EncryptedBlob> {
    const iv = newArrayBufferUint8(IV_LENGTH);
    crypto.getRandomValues(iv);
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      this.enc.encode(plaintext),
    );
    return { ciphertext: toBase64(new Uint8Array(cipher)), iv: toBase64(iv) };
  }

  async decrypt(blob: EncryptedBlob, key: CryptoKey): Promise<string> {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(blob.iv) },
      key,
      fromBase64(blob.ciphertext),
    );
    return this.dec.decode(plain);
  }
}

function newArrayBufferUint8(length: number): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new ArrayBuffer(length));
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const raw = atob(b64);
  const bytes = newArrayBufferUint8(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}
