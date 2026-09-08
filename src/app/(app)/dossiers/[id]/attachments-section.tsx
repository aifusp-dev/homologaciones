"use client";

import { useActionState } from "react";
import { createFolder, deleteFolder, uploadAttachment, deleteAttachment } from "@/app/actions/attachments";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent";

type AttachmentValue = { id: string; fileName: string; fileSize: number; mimeType: string; createdAt: Date };
type FolderValue = { id: string; name: string; attachments: AttachmentValue[] };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NewFolderForm({ dossierId }: { dossierId: string }) {
  const [state, action, pending] = useActionState(createFolder, undefined);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="dossierId" value={dossierId} />
      <input name="name" placeholder="Nombre de la carpeta" required className={`${inputClass} max-w-xs`} />
      <button
        type="submit"
        disabled={pending}
        className="border border-border-strong rounded-lg px-3 py-1.5 text-sm hover:border-accent transition-colors disabled:opacity-50 shrink-0"
      >
        {pending ? "Creando..." : "+ Nueva carpeta"}
      </button>
      {state?.message && <span className="text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

function UploadAttachmentForm({ dossierId, folderId }: { dossierId: string; folderId: string }) {
  const [state, action, pending] = useActionState(uploadAttachment, undefined);
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="dossierId" value={dossierId} />
      <input type="hidden" name="folderId" value={folderId} />
      <input type="file" name="file" required className={`${inputClass} py-1.5`} />
      <button
        type="submit"
        disabled={pending}
        className="border border-border-strong rounded-lg px-3 py-1.5 text-sm hover:border-accent transition-colors disabled:opacity-50 shrink-0"
      >
        {pending ? "Subiendo..." : "Subir"}
      </button>
      {state?.message && <span className="text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

function DeleteAttachmentButton({ dossierId, attachmentId }: { dossierId: string; attachmentId: string }) {
  const [state, action, pending] = useActionState(deleteAttachment, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="dossierId" value={dossierId} />
      <input type="hidden" name="attachmentId" value={attachmentId} />
      <button type="submit" disabled={pending} className="text-xs text-danger hover:underline disabled:opacity-50">
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
      {state?.message && <span className="ml-2 text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

function DeleteFolderButton({ dossierId, folderId, hasFiles }: { dossierId: string; folderId: string; hasFiles: boolean }) {
  const [state, action, pending] = useActionState(deleteFolder, undefined);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (hasFiles && !window.confirm("Esta carpeta tiene archivos dentro. ¿Eliminarla junto con todo su contenido?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="dossierId" value={dossierId} />
      <input type="hidden" name="folderId" value={folderId} />
      <button type="submit" disabled={pending} className="text-xs text-danger hover:underline disabled:opacity-50">
        {pending ? "Eliminando..." : "Eliminar carpeta"}
      </button>
      {state?.message && <span className="ml-2 text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}

function FolderCard({ dossierId, folder }: { dossierId: string; folder: FolderValue }) {
  return (
    <details className="border border-border rounded-xl overflow-hidden">
      <summary className="cursor-pointer select-none px-4 py-3 bg-panel text-sm font-medium flex items-center justify-between">
        {folder.name}
        <span className="text-ink-faint text-xs">{folder.attachments.length} archivos</span>
      </summary>
      <div className="p-4 space-y-3">
        {folder.attachments.length > 0 && (
          <ul className="space-y-1.5 text-sm">
            {folder.attachments.map((a) => (
              <li key={a.id} className="flex justify-between items-center border-t border-border pt-2">
                <a
                  href={`/api/attachments/${a.id}`}
                  target="_blank"
                  className="text-ink-dim hover:text-white underline truncate max-w-xs"
                >
                  {a.fileName}
                </a>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-ink-faint text-xs">{formatBytes(a.fileSize)}</span>
                  <DeleteAttachmentButton dossierId={dossierId} attachmentId={a.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <UploadAttachmentForm dossierId={dossierId} folderId={folder.id} />
        <div className="pt-1">
          <DeleteFolderButton dossierId={dossierId} folderId={folder.id} hasFiles={folder.attachments.length > 0} />
        </div>
      </div>
    </details>
  );
}

export function AttachmentsSection({ dossierId, folders }: { dossierId: string; folders: FolderValue[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Archivos adjuntos
        </h3>
      </div>
      <NewFolderForm dossierId={dossierId} />
      <div className="space-y-2">
        {folders.map((folder) => (
          <FolderCard key={folder.id} dossierId={dossierId} folder={folder} />
        ))}
        {folders.length === 0 && <p className="text-sm text-ink-faint">Todavía no hay ninguna carpeta.</p>}
      </div>
    </div>
  );
}
