import { useState } from "react";
import { useClient, type DocumentActionComponent } from "sanity";
import { TrashIcon } from "@sanity/icons";

/**
 * Cascade delete: removes the document together with everything that references
 * it (nested sub-entities/releases via `parent`, related press items, …) and
 * its draft. References are weak, so the transaction is never blocked.
 */
export const deleteWithContent: DocumentActionComponent = (props) => {
  const client = useClient({ apiVersion: "2024-10-01" });
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const baseId = (props.id || "").replace(/^drafts\./, "");

  return {
    label: "Удалить со всем содержимым",
    tone: "critical",
    icon: TrashIcon,
    disabled: busy,
    onHandle: () => setOpen(true),
    dialog: open && {
      type: "confirm",
      tone: "critical",
      message:
        "Удалить этот документ и всё вложенное содержимое (выпуски, связанную прессу)? Действие необратимо.",
      confirmButtonText: busy ? "Удаление…" : "Удалить",
      cancelButtonText: "Отмена",
      onCancel: () => setOpen(false),
      onConfirm: async () => {
        setBusy(true);
        try {
          const refIds: string[] = await client.fetch("*[references($id)]._id", { id: baseId });
          const ids = new Set<string>();
          for (const rid of refIds || []) {
            const base = rid.replace(/^drafts\./, "");
            ids.add(base);
            ids.add(`drafts.${base}`);
          }
          ids.add(baseId);
          ids.add(`drafts.${baseId}`);

          const tx = client.transaction();
          ids.forEach((id) => tx.delete(id));
          await tx.commit({ visibility: "async" });
        } finally {
          setBusy(false);
          setOpen(false);
          props.onComplete();
        }
      },
    },
  };
};
