import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

export type PublicImageFolder = "avatars" | "services" | "portfolio";

export type StorageUploadInput = {
  file: File;
  folder: PublicImageFolder;
};

export type StorageUploadResult = {
  url: string;
  publicId: string;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ["jpg", "jpeg"]],
  ["image/png", ["png"]],
  ["image/webp", ["webp"]],
]);

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Upload de imagens ainda nao esta configurado neste ambiente.");
    this.name = "StorageNotConfiguredError";
  }
}

export class StorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageValidationError";
  }
}

export class StorageUploadError extends Error {
  constructor() {
    super("Falha ao enviar imagem para o storage.");
    this.name = "StorageUploadError";
  }
}

function logStorageUploadError(error: unknown, contexto: Record<string, unknown>) {
  const erro = error as { name?: string; code?: string | number; http_code?: number; message?: string; stack?: string };

  console.error("Erro ao enviar imagem para o storage.", {
    tipo: erro?.name ?? typeof error,
    codigo: erro?.code,
    httpCode: erro?.http_code,
    mensagem: erro?.message,
    stack: erro?.stack,
    ...contexto,
  });
}

function requireCloudinaryEnv(name: "CLOUDINARY_CLOUD_NAME" | "CLOUDINARY_API_KEY" | "CLOUDINARY_API_SECRET") {
  const value = process.env[name];
  if (!value) throw new StorageNotConfiguredError();
  return value;
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: requireCloudinaryEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requireCloudinaryEnv("CLOUDINARY_API_KEY"),
    api_secret: requireCloudinaryEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });
}

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function validateImageFile(file: File) {
  if (!file || file.size <= 0) {
    throw new StorageValidationError("Arquivo de imagem invalido.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new StorageValidationError("Imagem maior que 5MB.");
  }

  const allowedExtensions = ALLOWED_IMAGE_TYPES.get(file.type);
  if (!allowedExtensions) {
    throw new StorageValidationError("Tipo de imagem nao permitido.");
  }

  const extension = getExtension(file.name);
  if (!allowedExtensions.includes(extension)) {
    throw new StorageValidationError("Extensao de imagem nao permitida.");
  }
}

function cloudinaryFolder(folder: PublicImageFolder) {
  return `benvi/${folder}`;
}

async function uploadBuffer(buffer: Buffer, folder: PublicImageFolder, publicId: string) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder(folder),
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          logStorageUploadError(error, {
            folder: cloudinaryFolder(folder),
            publicId,
          });
          reject(new StorageUploadError());
          return;
        }

        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );

    stream.end(buffer);
  });
}

export async function uploadPublicImage(input: StorageUploadInput): Promise<StorageUploadResult> {
  validateImageFile(input.file);
  configureCloudinary();

  const arrayBuffer = await input.file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const result = await uploadBuffer(buffer, input.folder, randomUUID());

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export function storageErrorStatus(error: unknown) {
  if (error instanceof StorageValidationError) return 400;
  if (error instanceof StorageNotConfiguredError) return 503;
  if (error instanceof StorageUploadError) return 503;
  return 500;
}
