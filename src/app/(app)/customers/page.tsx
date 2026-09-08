import { requireCompanyUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { SavedCustomerForm } from "./saved-customer-form";
import { DeleteSavedCustomerButton } from "./delete-saved-customer-button";

export default async function CustomersPage() {
  const user = await requireCompanyUser();
  const customers = await prisma.savedCustomer.findMany({
    where: { companyId: user.companyId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-sm text-ink-faint">
          Catálogo de clientes habituales del taller. Se seleccionan luego desde la pestaña
          &quot;Cliente&quot; de cada expediente en vez de teclear los datos cada vez.
        </p>
      </div>

      <SavedCustomerForm />

      <ul className="space-y-1.5 text-sm">
        {customers.map((c) => (
          <li key={c.id} className="flex justify-between items-center border-t border-border pt-2">
            <span>
              <span className="font-medium">{c.name}</span>
              {c.contactName && <span className="text-ink-faint"> · {c.contactName}</span>}
              {c.phone && <span className="text-ink-faint"> · {c.phone}</span>}
            </span>
            <DeleteSavedCustomerButton id={c.id} />
          </li>
        ))}
        {customers.length === 0 && <p className="text-sm text-ink-faint">Todavía no hay ningún cliente guardado.</p>}
      </ul>
    </div>
  );
}
