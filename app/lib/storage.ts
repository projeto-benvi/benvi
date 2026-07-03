export type StorageUploadInput = {
  file: File;
  keyPrefix: string;
};

export type StorageUploadResult = {
  url: string;
  key: string;
};

const supportedProviders = new Set(["vercel-blob", "cloudinary", "s3", "r2"]);

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Upload de arquivos ainda nao esta configurado neste ambiente.");
    this.name = "StorageNotConfiguredError";
  }
}

export async function uploadPublicFile(input: StorageUploadInput): Promise<StorageUploadResult> {
  const provider = process.env.STORAGE_PROVIDER;

  if (!provider || provider === "disabled") {
    throw new StorageNotConfiguredError();
  }

  if (!supportedProviders.has(provider)) {
    throw new StorageNotConfiguredError();
  }

  void input;

  throw new StorageNotConfiguredError();
}

export function storageErrorStatus(error: unknown) {
  return error instanceof StorageNotConfiguredError ? 503 : 500;
}
