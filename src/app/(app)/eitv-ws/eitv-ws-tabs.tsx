"use client";

import { useState, type ReactNode } from "react";

export type EitvWsTab = { id: string; label: string; icon: ReactNode; content: ReactNode };

// Mismo patrón que dossier-tabs.tsx (todas las pestañas montadas de una
// vez, ocultas con `hidden`, para no perder el estado de useActionState al
// cambiar de pestaña) pero simplificado: aquí no hace falta `wide` ni el
// salto entre pestañas de fieldJump.ts (eso es propio de la ficha de
// expediente).
export function EitvWsTabs({ tabs }: { tabs: EitvWsTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-border pb-2 lg:pb-0 lg:pr-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              active === tab.id
                ? "bg-accent text-accent-ink font-medium"
                : "text-ink-dim hover:text-ink hover:bg-panel"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-w-0 w-full max-w-4xl">
        {tabs.map((tab) => (
          <div key={tab.id} className={active === tab.id ? "" : "hidden"}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
