// Utilidad para los mensajes "rellena estos campos" (ej. el esquema vacío de
// Masas y dimensiones): hace clicable el nombre de un campo para que salte
// directo a su input real, aunque viva en otra pestaña del expediente
// (DossierTabs monta las 7 pestañas a la vez y las oculta con `hidden`, así
// que el campo ya existe en el DOM — solo hay que activar su pestaña,
// abrir el `<details>` que lo contiene si está plegado, y hacer scroll).
//
// Cambiar de pestaña se resuelve con un CustomEvent en vez de contexto/props
// porque DossierTabs es el único que sabe cuál es la pestaña activa y este
// helper se llama desde componentes que no tienen ninguna relación de
// props con él (ej. masses-diagram.tsx, dentro de otra pestaña).
export function jumpToField(fieldName: string, tab?: string) {
  if (typeof window === "undefined") return;

  if (tab) {
    window.dispatchEvent(new CustomEvent("dossier-tab-switch", { detail: { tab } }));
  }

  // Doble rAF: deja que React aplique el cambio de pestaña (quitar `hidden`)
  // y el navegador pinte el layout antes de medir/hacer scroll.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[name="${fieldName}"]`);
      if (!el) return;

      const details = el.closest("details");
      if (details && !details.open) details.open = true;

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
        el.focus({ preventScroll: true });
      }
    });
  });
}
