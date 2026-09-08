/**
 * Fórmulas de la tabla COC. Ninguna se guarda como columna — se recalculan
 * siempre a partir de los campos de entrada (igual que en FileMaker, donde
 * están marcadas "Sin almacenar"). Ver sección "Motor de cálculo" del
 * documento de diseño.
 */

/**
 * Potencia fiscal (fórmula oficial de la DGT española).
 * FileMaker: FR_potencia_fiscal =
 *   Round((_25_Cilindrada / _24_Numero_cilindros) ^ .6 * .08 * _24_Numero_cilindros; 2)
 */
export function fiscalHorsepower(
  displacement: number | null | undefined,
  cylinderCount: number | null | undefined
): number | null {
  if (!displacement || !cylinderCount) return null;
  const value = (displacement / cylinderCount) ** 0.6 * 0.08 * cylinderCount;
  return Math.round(value * 100) / 100;
}
