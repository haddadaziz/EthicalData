// Utility for RFC 6238 TOTP (Time-based One-Time Password) generation & validation
// Compatible with Google Authenticator, Microsoft Authenticator & Authy

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

// Pure JS SHA1 + HMAC implementation for instant cross-environment reliability
function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let keyPadded = new Uint8Array(blockSize);
  if (key.length > blockSize) {
    keyPadded.set(sha1(key));
  } else {
    keyPadded.set(key);
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = keyPadded[i] ^ 0x5c;
    iKeyPad[i] = keyPadded[i] ^ 0x36;
  }

  const innerMsg = new Uint8Array(iKeyPad.length + message.length);
  innerMsg.set(iKeyPad);
  innerMsg.set(message, iKeyPad.length);
  const innerHash = sha1(innerMsg);

  const outerMsg = new Uint8Array(oKeyPad.length + innerHash.length);
  outerMsg.set(oKeyPad);
  outerMsg.set(innerHash, oKeyPad.length);
  return sha1(outerMsg);
}

function sha1(msg: Uint8Array): Uint8Array {
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const bits = msg.length * 8;
  const paddingLen = (msg.length % 64 < 56) ? 56 - (msg.length % 64) : 120 - (msg.length % 64);
  const padded = new Uint8Array(msg.length + paddingLen + 8);
  padded.set(msg);
  padded[msg.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bits, false);

  const words = new Uint32Array(padded.length / 4);
  for (let i = 0; i < words.length; i++) {
    words[i] = view.getUint32(i * 4, false);
  }

  for (let i = 0; i < words.length; i += 16) {
    const w = new Uint32Array(80);
    for (let j = 0; j < 16; j++) w[j] = words[i + j];
    for (let j = 16; j < 80; j++) {
      const val = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
      w[j] = (val << 1) | (val >>> 31);
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4;

    for (let j = 0; j < 80; j++) {
      let f = 0, k = 0;
      if (j < 20) {
        f = (b & c) | ((~b) & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[j]) >>> 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const result = new Uint8Array(20);
  const resView = new DataView(result.buffer);
  resView.setUint32(0, h0, false);
  resView.setUint32(4, h1, false);
  resView.setUint32(8, h2, false);
  resView.setUint32(12, h3, false);
  resView.setUint32(16, h4, false);
  return result;
}

export function generateTOTPCode(base32Secret: string, timeOffsetWindows = 0): string {
  const secretBytes = base32ToBytes(base32Secret);
  const timeStep = 30;
  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / timeStep) + timeOffsetWindows;

  const msg = new Uint8Array(8);
  const view = new DataView(msg.buffer);
  view.setUint32(4, counter, false);

  const hmac = hmacSha1(secretBytes, msg);
  const offset = hmac[hmac.length - 1] & 0xf;
  const codeInt =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (codeInt % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Validates 6-digit TOTP input code against Base32 secret.
 * Checks current time window, -1 window (30s past) and +1 window (30s future) to handle clock drift.
 */
export function verifyTOTPCode(inputCode: string, base32Secret: string = 'JBSWY3DPEHPK3PXP'): boolean {
  const cleanInput = inputCode.trim().replace(/\s+/g, '');
  if (cleanInput.length !== 6 || !/^\d+$/.test(cleanInput)) return false;

  // Check windows: 0 (current), -1 (30s past), +1 (30s future)
  for (let window = -1; window <= 1; window++) {
    const validOtp = generateTOTPCode(base32Secret, window);
    if (cleanInput === validOtp) {
      return true;
    }
  }

  return false;
}

export const ADMIN_2FA_SECRET = 'JBSWY3DPEHPK3PXP';

export function getAdmin2FAStatus(): boolean {
  if (typeof window === 'undefined') return false;
  const status = localStorage.getItem('admin_2fa_enabled');
  return status === 'true';
}

export function setAdmin2FAStatus(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_2fa_enabled', enabled ? 'true' : 'false');
}

export function getUser2FAStatus(): boolean {
  if (typeof window === 'undefined') return false;
  const status = localStorage.getItem('user_2fa_enabled');
  return status === 'true';
}

export function setUser2FAStatus(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_2fa_enabled', enabled ? 'true' : 'false');
}
