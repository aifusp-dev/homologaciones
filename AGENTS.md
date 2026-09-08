# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Este proyecto

SaaS multi-tenant de gestión de expedientes de homologación de vehículos, migrado desde
`HomologacionesVersion_2026.fmp12` (FileMaker) de Carrocerias Yecla, pensado para distribuirse
también a otros carroceros. Ver el documento de diseño y la memoria del proyecto para el
esquema completo, el motor de cálculo (~180 fórmulas) y el plan de fases.

- Backend (tablas/campos Postgres, Prisma, TypeScript) en **inglés**.
- Interfaz de usuario en **español** — es el idioma del taller.
- Login exclusivamente con Google, sin contraseña. Sin alta de empresa self-service: solo
  `super_admin` crea empresas nuevas y les asigna un email de "dueño" por invitación.
- Fase actual: **Fase 0 — cimientos SaaS** (`Company`/`User`/`Invitation`, login, panel
  super-admin). Las tablas del dominio de homologación (COC, carrozado, masas y dimensiones...)
  llegan en fases posteriores.
