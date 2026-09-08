import "server-only";

// Cliente mínimo de Resend — un fetch directo a su API REST, sin el SDK
// completo, porque solo se necesita este único endpoint.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "WorkshopManagement <acceso@mail.aifusp.dev>";

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY no está configurada.");
  }

  const html = `<!doctype html><html><body style="margin:0;padding:32px;background:#16140f;font-family:Arial,Helvetica,sans-serif;color:#f2efe9;">
    <div style="max-width:420px;margin:0 auto;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:#efa226;color:#1a1207;font-weight:bold;font-size:12px;">WM</span>
        <span style="font-weight:600;">WorkshopManagement</span>
      </div>
      <h1 style="font-size:20px;margin:0 0 12px;">Inicia sesión</h1>
      <p style="font-size:14px;color:#a89f8f;line-height:1.5;margin:0 0 24px;">
        Pulsa el botón para entrar en WorkshopManagement con ${esc(email)}. El enlace caduca en 15 minutos
        y solo se puede usar una vez.
      </p>
      <a href="${esc(url)}" style="display:inline-block;background:#efa226;color:#1a1207;font-weight:600;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;">
        Entrar en WorkshopManagement
      </a>
      <p style="font-size:12px;color:#6f6656;line-height:1.5;margin:28px 0 0;">
        Si no has pedido este enlace, puedes ignorar este correo — nadie podrá entrar sin pulsarlo.
      </p>
    </div>
  </body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: email,
      subject: "Tu enlace de acceso a WorkshopManagement",
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend devolvió ${res.status}: ${body}`);
  }
}
