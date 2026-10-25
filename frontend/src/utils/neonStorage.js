// Neon Object Storage Utility (S3 Compatible)
export const NEON_STORAGE_CONFIG = {
  endpoint: import.meta.env.VITE_NEON_STORAGE_ENDPOINT || "https://br-green-star-a17pg4w7.storage.c-1.ap-southeast-1.aws.neon.tech",
  bucket: import.meta.env.VITE_NEON_STORAGE_BUCKET || "assets",
  region: "ap-southeast-1"
};

/**
 * Returns the public or signed URL for an asset in Neon Object Storage
 * @param {string} objectKey
 * @returns {string}
 */
export function getAssetUrl(objectKey) {
  if (!objectKey) return "";
  if (objectKey.startsWith("http://") || objectKey.startsWith("https://")) {
    return objectKey;
  }
  return `${NEON_STORAGE_CONFIG.endpoint}/${NEON_STORAGE_CONFIG.bucket}/${objectKey.replace(/^\//, '')}`;
}

export default {
  NEON_STORAGE_CONFIG,
  getAssetUrl
};
