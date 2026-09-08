// Heurística única para decidir cuál de las 4 configuraciones de vehículo
// (ver comentario largo en calculations/masses.ts) aplica a un expediente
// — no existe un campo explícito de "tipo de configuración" en el modelo
// (ver conversación: se decidió no añadirlo todavía), así que se infiere
// de datos ya reales. Centralizado aquí para no duplicar la misma
// heurística en las plantillas de PDF (bodyworkCertificate.ts,
// copRegister.ts) y en el esquema visual de Masas y dimensiones
// (masses-diagram.tsx).
export type VehicleConfig = "base" | "triaxle" | "semi2" | "semi3";

export function detectVehicleConfig(input: {
  axleCount: number | null | undefined;
  staticKingpinMass: number | null | undefined;
  kingpinToRearEdgeDistance: number | null | undefined;
  vehicleCategory: string | null | undefined;
}): VehicleConfig {
  const isSemiTrailer =
    input.staticKingpinMass != null ||
    input.kingpinToRearEdgeDistance != null ||
    (input.vehicleCategory ?? "").toUpperCase().startsWith("O");
  const isTriAxle = (input.axleCount ?? 0) >= 3;

  if (isSemiTrailer) return isTriAxle ? "semi3" : "semi2";
  return isTriAxle ? "triaxle" : "base";
}
