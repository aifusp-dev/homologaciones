import { GoogleSignInButton } from "./google-button";

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">WorkshopManagement</h1>
          <p className="text-sm text-neutral-400">Inicia sesión con tu cuenta de Google</p>
        </div>

        {clientId ? (
          <div className="flex justify-center">
            <GoogleSignInButton clientId={clientId} />
          </div>
        ) : (
          <p className="text-sm text-red-400">
            Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID.
          </p>
        )}
      </div>
    </div>
  );
}
