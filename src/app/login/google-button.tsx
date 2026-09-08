"use client";

import { useActionState, useEffect, useRef } from "react";
import Script from "next/script";
import { googleLogin } from "@/app/actions/auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState(googleLogin, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const credentialRef = useRef<HTMLInputElement>(null);
  const buttonSlotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function render() {
      if (!window.google || !buttonSlotRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (credentialRef.current) {
            credentialRef.current.value = response.credential;
          }
          formRef.current?.requestSubmit();
        },
      });
      window.google.accounts.id.renderButton(buttonSlotRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 280,
      });
    }
    const id = window.setInterval(() => {
      if (window.google) {
        render();
        window.clearInterval(id);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [clientId]);

  return (
    <div className="space-y-4">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <form ref={formRef} action={action} className="flex flex-col items-center gap-4">
        <input ref={credentialRef} type="hidden" name="credential" />
        <div ref={buttonSlotRef} aria-live="polite" />
      </form>
      {pending && <p className="text-sm text-neutral-400 text-center">Entrando...</p>}
      {state?.message && <p className="text-sm text-red-400 text-center max-w-xs">{state.message}</p>}
    </div>
  );
}
