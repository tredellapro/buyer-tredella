/* Message.attachment is a single String on the API. A stored filename is
   randomised, so a bare URL cannot say what the file was called or how big it
   is — which is what the file card in a thread needs to show.

   Both apps write a small JSON blob into that field, and anything that is not
   JSON is treated as a plain URL, so older messages still render. Keep this in
   step with lib/chatAttachment.ts in the seller app. */

export type ChatAttachment = {
  url: string;
  name: string;
  sizeBytes: number | null;
  mimeType: string | null;
};

export function parseAttachment(raw: string | null): ChatAttachment | null {
  if (!raw) return null;

  if (raw.trimStart().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Partial<ChatAttachment>;
      if (typeof parsed.url === "string")
        return {
          url: parsed.url,
          name: parsed.name ?? "Attachment",
          sizeBytes:
            typeof parsed.sizeBytes === "number" ? parsed.sizeBytes : null,
          mimeType: parsed.mimeType ?? null,
        };
    } catch {
      // fall through and treat it as a URL
    }
  }

  return {
    url: raw,
    name: raw.split("/").pop() || "Attachment",
    sizeBytes: null,
    mimeType: null,
  };
}

export const serialiseAttachment = (attachment: ChatAttachment): string =>
  JSON.stringify(attachment);

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "OrderInfo.pdf" → "PDF", for the tag on the file card. */
export function fileKind(attachment: ChatAttachment): string {
  const fromMime = attachment.mimeType?.split("/")[1];
  const fromName = attachment.name.split(".").pop();
  const kind = (fromMime || fromName || "file").toUpperCase();
  return kind === "JPEG" ? "JPG" : kind.slice(0, 4);
}

export const isImage = (attachment: ChatAttachment): boolean =>
  attachment.mimeType?.startsWith("image/") ??
  /\.(jpe?g|png|webp|gif)$/i.test(attachment.name);

export const CHAT_ATTACHMENT_ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp,image/gif";
