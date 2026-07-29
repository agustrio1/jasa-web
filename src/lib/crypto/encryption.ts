const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;

async function getKey(): Promise<CryptoKey> {
  const rawKey = Buffer.from(import.meta.env.ENCRYPTION_KEY, 'base64');
  return crypto.subtle.importKey('raw', rawKey, ALGORITHM, false, ['encrypt', 'decrypt']);
}

export async function encrypt(plainText: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plainText);

  const cipherBuffer = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);

  const ivBase64 = Buffer.from(iv).toString('base64');
  const cipherBase64 = Buffer.from(cipherBuffer).toString('base64');

  return `${ivBase64}:${cipherBase64}`;
}

export async function decrypt(encryptedText: string): Promise<string> {
  const [ivBase64, cipherBase64] = encryptedText.split(':');
  const key = await getKey();

  const iv = new Uint8Array(Buffer.from(ivBase64, 'base64'));
  const cipherBuffer = Buffer.from(cipherBase64, 'base64');

  const plainBuffer = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, cipherBuffer);

  return new TextDecoder().decode(plainBuffer);
}