"use client";

import { useActionState } from "react";
import { deleteSavedCustomer } from "@/app/actions/savedCustomers";

export function DeleteSavedCustomerButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteSavedCustomer, undefined);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-xs text-danger hover:underline disabled:opacity-50">
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
      {state?.message && <span className="text-xs text-ink-faint">{state.message}</span>}
    </form>
  );
}
