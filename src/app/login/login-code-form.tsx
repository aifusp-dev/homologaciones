"use client";

import { useActionState, useEffect, useState } from "react";
import { requestLoginCode, verifyLoginCode } from "@/app/actions/auth";

const inputClass =
  "w-full bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-center";
const buttonClass =
  "w-full bg-panel border border-border-strong rounded-lg px-4 py-2 text-sm font-medium hover:border-accent transition-colors disabled:opacity-50";

export function LoginCodeForm() {
  const [requestState, requestAction, requestPending] = useActionState(requestLoginCode, undefined);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyLoginCode, undefined);
  const [step, setStep] = useState<"request" | "code">("request");
  const [email, setEmail] = useState("");

  // El paso 2 se activa tras cualquier envío del paso 1 (autorizado o no
  // — el mensaje ya es siempre el mismo, ver requestLoginCode).
  useEffect(() => {
    if (requestState?.step === "code") {
      setEmail(requestState.email);
      setStep("code");
    }
  }, [requestState]);

  if (step === "code") {
    return (
      <form action={verifyAction} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        <p className="text-sm text-ink-dim">
          Código enviado a <span className="text-ink font-medium">{email}</span>. Introduce los 6 dígitos.
        </p>
        <input
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoFocus
          required
          placeholder="000000"
          className={`${inputClass} text-lg tracking-[0.5em]`}
        />
        <button type="submit" disabled={verifyPending} className={buttonClass}>
          {verifyPending ? "Comprobando..." : "Verificar código"}
        </button>
        {(verifyState?.step === "code" ? verifyState.message : undefined) && (
          <p className="text-sm text-ink-dim">{verifyState?.message}</p>
        )}
        <button
          type="button"
          onClick={() => setStep("request")}
          className="text-xs text-ink-faint underline underline-offset-2"
        >
          Usar otro email
        </button>
      </form>
    );
  }

  return (
    <form action={requestAction} className="space-y-3">
      <input name="email" type="email" required placeholder="tu@email.com" className={inputClass} />
      <button type="submit" disabled={requestPending} className={buttonClass}>
        {requestPending ? "Enviando..." : "Enviar código de acceso"}
      </button>
      {requestState?.message && <p className="text-sm text-ink-dim">{requestState.message}</p>}
    </form>
  );
}
