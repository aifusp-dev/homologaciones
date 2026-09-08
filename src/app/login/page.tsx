import { GoogleSignInButton } from "./google-button";
import { LoginCodeForm } from "./login-code-form";

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">WorkshopManagement</h1>
          <p className="text-sm text-ink-dim">Inicia sesión para continuar</p>
        </div>

        <div className="space-y-6">
          <LoginCodeForm />

          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-faint uppercase tracking-wide">o</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          {clientId ? (
            <div className="flex justify-center">
              <GoogleSignInButton clientId={clientId} />
            </div>
          ) : (
            <p className="text-sm text-danger">Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID.</p>
          )}
        </div>
      </div>
    </div>
  );
}
