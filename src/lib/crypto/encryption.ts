import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

const SECRET = process.env.ENCRYPTION_KEY;

if (!SECRET) {
  throw new Error('ENCRYPTION_KEY belum diset.');
}

// Harus menghasilkan 32 byte
const KEY = crypto.createHash('sha256').update(SECRET).digest();

export async function encrypt(text: string): Promise<string> {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

export async function decrypt(payload: string): Promise<string> {
  const [ivBase64, tagBase64, dataBase64] = payload.split(':');

  if (!ivBase64 || !tagBase64 || !dataBase64) {
    throw new Error('Format data terenkripsi tidak valid.');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(ivBase64, 'base64')
  );

  decipher.setAuthTag(Buffer.from(tagBase64, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataBase64, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}