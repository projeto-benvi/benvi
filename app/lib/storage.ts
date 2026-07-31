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

export type PrivateAudioUploadResult = {
  secureUrl: string;
  publicId: string;
  format: string;
  mimeType: string;
  bytes: number;
  duration: number;
};

export type ChatAttachmentResourceType = "image" | "video" | "raw";

export type PrivateChatAttachmentUploadResult = {
  secureUrl: string;
  publicId: string;
  format: string;
  mimeType: string;
  bytes: number;
  resourceType: ChatAttachmentResourceType;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_CHAT_AUDIO_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_CHAT_AUDIO_DURATION_SECONDS = 120;
export const MAX_CHAT_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ["jpg", "jpeg"]],
  ["image/png", ["png"]],
  ["image/webp", ["webp"]],
]);
const ALLOWED_AUDIO_TYPES = new Map([
  ["audio/webm", ["webm"]],
  ["audio/ogg", ["ogg", "oga"]],
  ["audio/mp4", ["m4a", "mp4"]],
  ["audio/mpeg", ["mp3"]],
  ["audio/wav", ["wav"]],
]);
const ALLOWED_CHAT_ATTACHMENT_TYPES = new Map<
  string,
  { extensions: string[]; resourceType: ChatAttachmentResourceType }
>([
  ["image/jpeg", { extensions: ["jpg", "jpeg"], resourceType: "image" }],
  ["image/png", { extensions: ["png"], resourceType: "image" }],
  ["image/webp", { extensions: ["webp"], resourceType: "image" }],
  ["video/mp4", { extensions: ["mp4"], resourceType: "video" }],
  ["video/webm", { extensions: ["webm"], resourceType: "video" }],
  ["application/pdf", { extensions: ["pdf"], resourceType: "raw" }],
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

export class AudioStorageNotConfiguredError extends Error {
  constructor() {
    super("O envio de áudio não está disponível neste ambiente.");
    this.name = "AudioStorageNotConfiguredError";
  }
}

export class ChatAttachmentStorageNotConfiguredError extends Error {
  constructor() {
    super("O envio de anexos não está disponível neste ambiente.");
    this.name = "ChatAttachmentStorageNotConfiguredError";
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

function configureAudioCloudinary() {
  try {
    configureCloudinary();
  } catch {
    throw new AudioStorageNotConfiguredError();
  }
}

function configureChatAttachmentCloudinary() {
  try {
    configureCloudinary();
  } catch {
    throw new ChatAttachmentStorageNotConfiguredError();
  }
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

function hasValidAudioSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "audio/webm") {
    return buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  }
  if (mimeType === "audio/ogg") return buffer.subarray(0, 4).toString("ascii") === "OggS";
  if (mimeType === "audio/wav") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WAVE";
  }
  if (mimeType === "audio/mp4") return buffer.subarray(4, 8).toString("ascii") === "ftyp";
  if (mimeType === "audio/mpeg") {
    return buffer.subarray(0, 3).toString("ascii") === "ID3" ||
      (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
  }
  return false;
}

function validateAudioFile(file: File, buffer: Buffer) {
  if (!file || file.size <= 0 || file.size !== buffer.length) {
    throw new StorageValidationError("Arquivo de áudio inválido.");
  }
  if (file.size > MAX_CHAT_AUDIO_SIZE_BYTES) {
    throw new StorageValidationError("O áudio excede o limite de 8 MB.");
  }
  const mimeType = file.type.split(";")[0].toLowerCase();
  const allowedExtensions = ALLOWED_AUDIO_TYPES.get(mimeType);
  if (!allowedExtensions) throw new StorageValidationError("Formato de áudio não permitido.");
  if (!allowedExtensions.includes(getExtension(file.name))) {
    throw new StorageValidationError("Extensão de áudio não permitida.");
  }
  if (!hasValidAudioSignature(buffer, mimeType)) {
    throw new StorageValidationError("O conteúdo do arquivo não corresponde ao formato informado.");
  }
}

function hasValidChatAttachmentSignature(buffer: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (mimeType === "image/webp") {
    return buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP";
  }
  if (mimeType === "video/mp4") return buffer.subarray(4, 8).toString("ascii") === "ftyp";
  if (mimeType === "video/webm") {
    return buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  }
  if (mimeType === "application/pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  return false;
}

function validateChatAttachment(file: File, buffer: Buffer) {
  if (!file || file.size <= 0 || file.size !== buffer.length) {
    throw new StorageValidationError("Arquivo inválido.");
  }
  if (file.size > MAX_CHAT_ATTACHMENT_SIZE_BYTES) {
    throw new StorageValidationError("O anexo excede o limite de 10 MB.");
  }

  const mimeType = file.type.split(";")[0].toLowerCase();
  const allowed = ALLOWED_CHAT_ATTACHMENT_TYPES.get(mimeType);
  if (!allowed) {
    throw new StorageValidationError("Formato não permitido. Envie JPG, PNG, WebP, MP4, WebM ou PDF.");
  }
  if (!allowed.extensions.includes(getExtension(file.name))) {
    throw new StorageValidationError("A extensão do arquivo não corresponde ao formato informado.");
  }
  if (!hasValidChatAttachmentSignature(buffer, mimeType)) {
    throw new StorageValidationError("O conteúdo do arquivo não corresponde ao formato informado.");
  }
  return { mimeType, ...allowed };
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

export async function uploadPrivateChatAudio(file: File): Promise<PrivateAudioUploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  validateAudioFile(file, buffer);
  const mimeType = file.type.split(";")[0].toLowerCase();
  configureAudioCloudinary();

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    format?: string;
    bytes?: number;
    duration?: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "benvi/chat-audio",
        public_id: randomUUID(),
        resource_type: "video",
        type: "authenticated",
        overwrite: false,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(new StorageUploadError());
          return;
        }
        resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  const duration = Number(result.duration ?? 0);
  if (!Number.isFinite(duration) || duration <= 0 || duration > MAX_CHAT_AUDIO_DURATION_SECONDS) {
    await deletePrivateChatAudio(result.public_id).catch(() => undefined);
    throw new StorageValidationError("A duração do áudio deve ser de até 2 minutos.");
  }

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    format: String(result.format || getExtension(file.name)),
    mimeType,
    bytes: Number(result.bytes ?? file.size),
    duration,
  };
}

export async function deletePrivateChatAudio(publicId: string) {
  configureAudioCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
    type: "authenticated",
    invalidate: true,
  });
}

export function getPrivateChatAudioUrl(publicId: string, format: string) {
  configureAudioCloudinary();
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: "video",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60,
    attachment: false,
  });
}

export async function uploadPrivateChatAttachment(
  file: File
): Promise<PrivateChatAttachmentUploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const validated = validateChatAttachment(file, buffer);
  configureChatAttachmentCloudinary();

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    format?: string;
    bytes?: number;
  }>((resolve, reject) => {
    const extension = getExtension(file.name);
    const publicId =
      validated.resourceType === "raw" ? `${randomUUID()}.${extension}` : randomUUID();
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "benvi/chat-attachments",
        public_id: publicId,
        resource_type: validated.resourceType,
        type: "authenticated",
        overwrite: false,
        use_filename: false,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(new StorageUploadError());
          return;
        }
        resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    format: String(result.format || getExtension(file.name)),
    mimeType: validated.mimeType,
    bytes: Number(result.bytes ?? file.size),
    resourceType: validated.resourceType,
  };
}

export async function deletePrivateChatAttachment(
  publicId: string,
  resourceType: ChatAttachmentResourceType
) {
  configureChatAttachmentCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: "authenticated",
    invalidate: true,
  });
}

export function getPrivateChatAttachmentUrl(
  publicId: string,
  format: string,
  resourceType: ChatAttachmentResourceType
) {
  configureChatAttachmentCloudinary();
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: resourceType,
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60,
    attachment: false,
  });
}

export function storageErrorStatus(error: unknown) {
  if (error instanceof StorageValidationError) return 400;
  if (error instanceof AudioStorageNotConfiguredError) return 503;
  if (error instanceof ChatAttachmentStorageNotConfiguredError) return 503;
  if (error instanceof StorageNotConfiguredError) return 503;
  if (error instanceof StorageUploadError) return 503;
  return 500;
}
