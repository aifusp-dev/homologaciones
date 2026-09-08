"use client";

import { useState, type ReactNode } from "react";

export type DossierTab = {
  id: string;
  label: string;
  content: ReactNode;
};

// Layout apaisado: sidebar de pestañas a la izquierda + panel de contenido
// a la derecha, en vez de las 7 secciones apiladas verticalmente que había
// antes (ver Fase 6). Todas las pestañas se montan de una vez (el contenido
// ya viene renderizado desde el server) y se ocultan con `hidden` — así el
// useActionState de cada formulario no se remonta al cambiar de pestaña.
export function DossierTabs({ tabs }: { tabs: DossierTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-800 pb-2 lg:pb-0 lg:pr-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`text-left px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              active === tab.id
                ? "bg-neutral-100 text-neutral-900 font-medium"
                : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900"
            }`}
          >
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
