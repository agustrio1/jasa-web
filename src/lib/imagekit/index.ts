import ImageKit from 'imagekit';

export const imagekit = new ImageKit({
  publicKey: import.meta.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: import.meta.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: import.meta.env.IMAGEKIT_URL_ENDPOINT,
});

export function getUploadAuthParams() {
  return imagekit.getAuthenticationParameters();
}

export async function deleteImage(fileId: string) {
  return imagekit.deleteFile(fileId);
}