// Dibujo lateral del vehículo (configuración BASE, 2 ejes) — calca el
// espíritu de BackEnd/FrontEnd/MASASYDIRECCIONES-GENERAL.png: un esquema
// técnico con líneas de cota que se rellenan con los datos reales del
// expediente en vez de una tabla de números sueltos. Se actualiza tras
// cada "Guardar" (no tecla a tecla) porque usa los mismos valores ya
// guardados/calculados que el resto del formulario — ver nota en
// masses-form.tsx sobre por qué no se hizo totalmente en vivo.
//
// Primera versión: solo la configuración BASE (2 ejes). Las otras 3
// (TRIAXLE, SEMI_O4, SEMI_O4_3AXLE) quedan para una fase posterior si el
// usuario confirma que este primer dibujo merece la pena extenderlo.

type DiagramData = {
  totalLength: number | null;
  frontOverhang: number | null;
  rearOverhang: number | null;
  wheelbase: number | null;
  firstAxleToBodyDistance: number | null;
  cargoLength: number | null;
  height: number | null;
  width: number | null;
};

const DRAW_WIDTH = 720;
const MARGIN_X = 40;
const MARGIN_TOP = 30;
const GROUND_Y = 190;
const WHEEL_R = 17;

function DimensionLine({
  x1,
  x2,
  y,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
}) {
  const mid = (x1 + x2) / 2;
  return (
    <g className="text-accent" stroke="currentColor" fill="currentColor">
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} strokeWidth={1} />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} strokeWidth={1} />
      <line x1={x1} y1={y} x2={x2} y2={y} strokeWidth={1} />
      <rect x={mid - 24} y={y - 9} width={48} height={14} fill="var(--color-bg)" opacity={0.92} />
      <text x={mid} y={y + 2} textAnchor="middle" fontSize={10.5} fontFamily="var(--font-mono)" stroke="none">
        {label}
      </text>
    </g>
  );
}

export function MassesDiagram({ data }: { data: DiagramData }) {
  const { totalLength, frontOverhang, rearOverhang, wheelbase, firstAxleToBodyDistance, cargoLength, height, width } =
    data;

  const haveEnoughData = totalLength != null && (frontOverhang != null || wheelbase != null);
  if (!haveEnoughData) {
    return (
      <div className="border border-border rounded-xl p-6 text-center text-sm text-ink-faint bg-panel/40">
        Rellena al menos <b className="text-ink-dim">Largo total</b> (calculado),{" "}
        <b className="text-ink-dim">Voladizo delantero</b> y la <b className="text-ink-dim">distancia entre ejes</b> del
        COC para ver el dibujo del vehículo.
      </div>
    );
  }

  const scale = (DRAW_WIDTH - MARGIN_X * 2) / totalLength;
  const toX = (mm: number) => MARGIN_X + mm * scale;

  const axle1X = toX(frontOverhang ?? totalLength * 0.15);
  const axle2X = wheelbase != null ? axle1X + wheelbase * scale : toX(totalLength - (rearOverhang ?? totalLength * 0.25));
  const rearX = toX(totalLength);
  const cabEndX = Math.max(axle1X - 8, MARGIN_X + 30);

  const boxStartX =
    firstAxleToBodyDistance != null ? axle1X + firstAxleToBodyDistance * scale : cabEndX + 10;
  const boxEndX = cargoLength != null ? Math.min(boxStartX + cargoLength * scale, rearX) : rearX;

  const chassisY = GROUND_Y - WHEEL_R - 4;
  const boxTopY = MARGIN_TOP + 30;
  const cabTopY = MARGIN_TOP;

  const svgHeight = GROUND_Y + 60;

  return (
    <div className="border border-border rounded-xl p-4 bg-panel/40 space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-display text-xs uppercase tracking-wide text-ink-faint">
          Esquema del vehículo — configuración base (2 ejes)
        </p>
        {width != null && <p className="text-xs text-ink-faint font-mono">Ancho: {width} mm</p>}
      </div>
      <svg viewBox={`0 0 ${DRAW_WIDTH} ${svgHeight}`} className="w-full h-auto" role="img" aria-label="Esquema lateral del vehículo con cotas">
        {/* Suelo */}
        <line x1={0} y1={GROUND_Y} x2={DRAW_WIDTH} y2={GROUND_Y} stroke="var(--color-border-strong)" strokeWidth={1.5} />

        {/* Cabina */}
        <path
          d={`M ${MARGIN_X} ${GROUND_Y} L ${MARGIN_X} ${cabTopY + 20} Q ${MARGIN_X} ${cabTopY} ${MARGIN_X + 20} ${cabTopY} L ${cabEndX} ${cabTopY} L ${cabEndX} ${GROUND_Y}`}
          fill="var(--color-panel)"
          stroke="var(--color-ink-faint)"
          strokeWidth={1.5}
        />
        <line x1={MARGIN_X + 8} y1={cabTopY + 8} x2={cabEndX - 4} y2={cabTopY + 8} stroke="var(--color-ink-faint)" strokeWidth={1} opacity={0.6} />

        {/* Chasis */}
        <rect x={cabEndX} y={chassisY} width={Math.max(rearX - cabEndX, 0)} height={6} fill="var(--color-ink-faint)" opacity={0.5} />

        {/* Caja / carrozado */}
        {cargoLength != null && (
          <rect
            x={boxStartX}
            y={boxTopY}
            width={Math.max(boxEndX - boxStartX, 0)}
            height={chassisY - boxTopY}
            fill="none"
            stroke="var(--color-ink-dim)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}

        {/* Ruedas */}
        {[axle1X, axle2X].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={GROUND_Y} r={WHEEL_R} fill="var(--color-bg)" stroke="var(--color-ink-dim)" strokeWidth={2} />
            <circle cx={cx} cy={GROUND_Y} r={4} fill="var(--color-ink-dim)" />
          </g>
        ))}

        {/* Cota: voladizo delantero */}
        {frontOverhang != null && (
          <DimensionLine x1={MARGIN_X} x2={axle1X} y={GROUND_Y + 24} label={`${frontOverhang}`} />
        )}
        {/* Cota: distancia entre ejes */}
        {wheelbase != null && <DimensionLine x1={axle1X} x2={axle2X} y={GROUND_Y + 24} label={`${wheelbase}`} />}
        {/* Cota: voladizo trasero */}
        {rearOverhang != null && (
          <DimensionLine x1={axle2X} x2={rearX} y={GROUND_Y + 24} label={`${rearOverhang}`} />
        )}
        {/* Cota: largo total */}
        <DimensionLine x1={MARGIN_X} x2={rearX} y={GROUND_Y + 44} label={`${totalLength} mm total`} />

        {/* Cota: altura */}
        {height != null && (
          <g className="text-accent" stroke="currentColor" fill="currentColor">
            <line x1={rearX + 16} y1={cabTopY} x2={rearX + 16} y2={GROUND_Y} strokeWidth={1} />
            <line x1={rearX + 11} y1={cabTopY} x2={rearX + 21} y2={cabTopY} strokeWidth={1} />
            <line x1={rearX + 11} y1={GROUND_Y} x2={rearX + 21} y2={GROUND_Y} strokeWidth={1} />
            <text
              x={rearX + 30}
              y={(cabTopY + GROUND_Y) / 2}
              fontSize={10.5}
              fontFamily="var(--font-mono)"
              stroke="none"
              transform={`rotate(90 ${rearX + 30} ${(cabTopY + GROUND_Y) / 2})`}
              textAnchor="middle"
            >
              {height} mm
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
