import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'invoices';

if (!connectionString) {
  // We don't throw here so code can still run locally without Azure configured.
  console.warn('Azure Storage connection string not configured (AZURE_STORAGE_CONNECTION_STRING)');
}

function getBlobServiceClient() {
  if (!connectionString) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  return BlobServiceClient.fromConnectionString(connectionString);
}

export async function uploadBufferToBlob(buffer: Buffer, blobName: string, contentType = 'application/octet-stream') {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(containerName);
  // ensure container exists (no-op if already exists)
  await containerClient.createIfNotExists({ access: 'container' });

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType }
  });

  return blockBlobClient.url;
}

export async function uploadStringToBlob(content: string, blobName: string, contentType = 'application/xml') {
  const buffer = Buffer.from(content, 'utf-8');
  return uploadBufferToBlob(buffer, blobName, contentType);
}

export default {
  uploadBufferToBlob,
  uploadStringToBlob,
};
