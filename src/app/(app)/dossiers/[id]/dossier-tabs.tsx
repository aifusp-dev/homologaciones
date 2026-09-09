"use client";

import { useEffect, useState, type ReactNode } from "react";

export type DossierTab = {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
  // Deja sin capar el ancho del panel de contenido para esta pestaña — usado
  // por "Masas y dimensiones", cuyo sandbox de edición en caliente (esquema +
  // verificación + panel de ajuste) necesita más espacio horizontal que el
  // resto de formularios de la app.
  wide?: boolean;
};

// Layout apaisado: sidebar de pestañas a la izquierda + panel de contenido
// a la derecha, en vez de las 7 secciones apiladas verticalmente que había
// antes (ver Fase 6). Todas las pestañas se montan de una vez (el contenido
// ya viene renderizado desde el server) y se ocultan con `hidden` — así el
// useActionState de cada formulario no se remonta al cambiar de pestaña.
export function DossierTabs({ tabs }: { tabs: DossierTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const isWide = tabs.find((t) => t.id === active)?.wide ?? false;

  // Permite saltar a otra pestaña desde fuera de este árbol de componentes
  // (ver src/lib/fieldJump.ts) — usado por los mensajes "rellena este campo"
  // que apuntan a un campo de una pestaña distinta a la actual.
  useEffect(() => {
    function handleTabSwitch(e: Event) {
      const tab = (e as CustomEvent<{ tab?: string }>).detail?.tab;
      if (tab && tabs.some((t) => t.id === tab)) setActive(tab);
    }
    window.addEventListener("dossier-tab-switch", handleTabSwitch);
    return () => window.removeEventListener("dossier-tab-switch", handleTabSwitch);
  }, [tabs]);

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

      <div className={`flex-1 min-w-0 w-full ${isWide ? "max-w-none" : "max-w-4xl"}`}>
        {tabs.map((tab) => (
          <div key={tab.id} className={active === tab.id ? "" : "hidden"}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
