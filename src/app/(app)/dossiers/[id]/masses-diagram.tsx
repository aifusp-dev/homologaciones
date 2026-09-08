import type { VehicleConfig } from "@/lib/vehicleConfig";

// Dibujo lateral del vehículo — calca el espíritu de
// BackEnd/FrontEnd/MASASYDIRECCIONES-*.png (esquema técnico con líneas de
// cota) para las 4 configuraciones reales del motor de cálculo (ver
// calculations/masses.ts): BASE (2 ejes), TRIAXLE (3 ejes, con grúa
// opcional), SEMI2 y SEMI3 (semirremolque de 2/3 ejes, sin cabina, unión
// por kingpin). Se actualiza tras cada "Guardar" (no tecla a tecla), ver
// nota en masses-form.tsx.
//
// Simplificación deliberada en SEMI2/SEMI3: no existe en el modelo un
// campo de "distancia del kingpin al grupo de ejes" — el grupo de ejes se
// dibuja a una posición aproximada (no data-driven) cerca de la parte
// trasera, igual que hacía el original con un aviso de "asumiendo
// distancia entre ejes del tridem < 1,4m". El largo total y el largo de
// caja SÍ son datos reales (semiTrailerTotalLength/Largo_total_O4 o su
// equivalente de 3 ejes).

export type DiagramData = {
  totalLength: number | null;
  frontOverhang: number | null;
  rearOverhang: number | null;
  wheelbase: number | null;
  wheelbase2: number | null;
  firstAxleToBodyDistance: number | null;
  cargoLength: number | null;
  height: number | null;
  width: number | null;
  hasCrane: boolean;
};

const DRAW_WIDTH = 720;
const MARGIN_X = 40;
const MARGIN_TOP = 30;
const GROUND_Y = 190;
const WHEEL_R = 17;

function DimensionLine({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
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

function HeightDimension({ x, top, bottom, label }: { x: number; top: number; bottom: number; label: string }) {
  const mid = (top + bottom) / 2;
  return (
    <g className="text-accent" stroke="currentColor" fill="currentColor">
      <line x1={x} y1={top} x2={x} y2={bottom} strokeWidth={1} />
      <line x1={x - 5} y1={top} x2={x + 5} y2={top} strokeWidth={1} />
      <line x1={x - 5} y1={bottom} x2={x + 5} y2={bottom} strokeWidth={1} />
      <text x={x + 10} y={mid} fontSize={10.5} fontFamily="var(--font-mono)" stroke="none" transform={`rotate(90 ${x + 10} ${mid})`} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy={GROUND_Y} r={WHEEL_R} fill="var(--color-bg)" stroke="var(--color-ink-dim)" strokeWidth={2} />
      <circle cx={cx} cy={GROUND_Y} r={4} fill="var(--color-ink-dim)" />
    </g>
  );
}

function CraneMast({ x, top, bottom }: { x: number; top: number; bottom: number }) {
  return (
    <g className="text-accent" stroke="currentColor">
      <rect x={x} y={top} width={14} height={bottom - top} fill="none" strokeWidth={1.5} />
      <text x={x + 7} y={(top + bottom) / 2} fontSize={9} fontFamily="var(--font-display)" stroke="none" fill="currentColor" textAnchor="middle" transform={`rotate(-90 ${x + 7} ${(top + bottom) / 2})`}>
        GRÚA
      </text>
    </g>
  );
}

function EmptyState({ text }: { text: React.ReactNode }) {
  return (
    <div className="border border-border rounded-xl p-6 text-center text-sm text-ink-faint bg-panel/40">{text}</div>
  );
}

function RigidDiagram({ variant, data }: { variant: "base" | "triaxle"; data: DiagramData }) {
  const { totalLength, frontOverhang, rearOverhang, wheelbase, wheelbase2, firstAxleToBodyDistance, cargoLength, height, width, hasCrane } = data;

  if (totalLength == null || (frontOverhang == null && wheelbase == null)) {
    return (
      <EmptyState
        text={
          <>
            Rellena al menos <b className="text-ink-dim">Largo total</b> (calculado),{" "}
            <b className="text-ink-dim">Voladizo delantero</b> y la <b className="text-ink-dim">distancia entre ejes</b>{" "}
            del COC para ver el dibujo del vehículo.
          </>
        }
      />
    );
  }

  const scale = (DRAW_WIDTH - MARGIN_X * 2) / totalLength;
  const toX = (mm: number) => MARGIN_X + mm * scale;

  const axle1X = toX(frontOverhang ?? totalLength * 0.15);
  const axle2X = wheelbase != null ? axle1X + wheelbase * scale : toX(totalLength - (rearOverhang ?? totalLength * 0.25));
  const axle3X = variant === "triaxle" && wheelbase2 != null ? axle2X + wheelbase2 * scale : null;
  const rearX = toX(totalLength);
  const cabEndX = Math.max(axle1X - 8, MARGIN_X + 30);

  const boxStartX = firstAxleToBodyDistance != null ? axle1X + firstAxleToBodyDistance * scale : cabEndX + 10;
  const boxEndX = cargoLength != null ? Math.min(boxStartX + cargoLength * scale, rearX) : rearX;

  const chassisY = GROUND_Y - WHEEL_R - 4;
  const boxTopY = MARGIN_TOP + 30;
  const cabTopY = MARGIN_TOP;
  const svgHeight = GROUND_Y + 60;

  const lastAxleX = axle3X ?? axle2X;
  const wheels = axle3X != null ? [axle1X, axle2X, axle3X] : [axle1X, axle2X];

  return (
    <div className="border border-border rounded-xl p-4 bg-panel/40 space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-display text-xs uppercase tracking-wide text-ink-faint">
          Esquema del vehículo — {variant === "triaxle" ? "3 ejes" : "2 ejes"}
          {hasCrane && " + grúa"}
        </p>
        {width != null && <p className="text-xs text-ink-faint font-mono">Ancho: {width} mm</p>}
      </div>
      <svg viewBox={`0 0 ${DRAW_WIDTH} ${svgHeight}`} className="w-full h-auto" role="img" aria-label="Esquema lateral del vehículo con cotas">
        <line x1={0} y1={GROUND_Y} x2={DRAW_WIDTH} y2={GROUND_Y} stroke="var(--color-border-strong)" strokeWidth={1.5} />

        <path
          d={`M ${MARGIN_X} ${GROUND_Y} L ${MARGIN_X} ${cabTopY + 20} Q ${MARGIN_X} ${cabTopY} ${MARGIN_X + 20} ${cabTopY} L ${cabEndX} ${cabTopY} L ${cabEndX} ${GROUND_Y}`}
          fill="var(--color-panel)"
          stroke="var(--color-ink-faint)"
          strokeWidth={1.5}
        />
        <line x1={MARGIN_X + 8} y1={cabTopY + 8} x2={cabEndX - 4} y2={cabTopY + 8} stroke="var(--color-ink-faint)" strokeWidth={1} opacity={0.6} />

        {hasCrane && <CraneMast x={cabEndX + 4} top={cabTopY - 10} bottom={chassisY} />}

        <rect x={cabEndX} y={chassisY} width={Math.max(rearX - cabEndX, 0)} height={6} fill="var(--color-ink-faint)" opacity={0.5} />

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

        {wheels.map((cx, i) => (
          <Wheel key={i} cx={cx} />
        ))}

        {frontOverhang != null && <DimensionLine x1={MARGIN_X} x2={axle1X} y={GROUND_Y + 24} label={`${frontOverhang}`} />}
        {wheelbase != null && <DimensionLine x1={axle1X} x2={axle2X} y={GROUND_Y + 24} label={`${wheelbase}`} />}
        {axle3X != null && wheelbase2 != null && (
          <DimensionLine x1={axle2X} x2={axle3X} y={GROUND_Y + 24} label={`${wheelbase2}`} />
        )}
        {rearOverhang != null && <DimensionLine x1={lastAxleX} x2={rearX} y={GROUND_Y + 24} label={`${rearOverhang}`} />}
        <DimensionLine x1={MARGIN_X} x2={rearX} y={GROUND_Y + 44} label={`${totalLength} mm total`} />

        {height != null && <HeightDimension x={rearX + 16} top={cabTopY} bottom={GROUND_Y} label={`${height} mm`} />}
      </svg>
    </div>
  );
}

function SemiTrailerDiagram({ variant, data }: { variant: "semi2" | "semi3"; data: DiagramData }) {
  const { totalLength, cargoLength, height, width } = data;

  if (totalLength == null) {
    return (
      <EmptyState
        text={
          <>
            Rellena <b className="text-ink-dim">Largo total O4</b>{" "}
            {variant === "semi3" ? <>(o su equivalente de 3 ejes, "LT")</> : null} en Masas y dimensiones para ver el
            dibujo del semirremolque.
          </>
        }
      />
    );
  }

  const scale = (DRAW_WIDTH - MARGIN_X * 2) / totalLength;
  const toX = (mm: number) => MARGIN_X + mm * scale;

  const frontX = MARGIN_X;
  const rearX = toX(totalLength);
  const kingpinX = frontX + 6;

  // Sin campo de datos para la posición exacta del grupo de ejes respecto
  // al kingpin — se aproxima a un 84% del largo total (ver comentario de
  // cabecera). El nº de ruedas SÍ es real (semi2 = 2, semi3 = 3).
  const groupCenterX = frontX + (rearX - frontX) * 0.84;
  const wheelGap = 42;
  const wheelXs =
    variant === "semi3"
      ? [groupCenterX - wheelGap, groupCenterX, groupCenterX + wheelGap]
      : [groupCenterX - wheelGap / 2, groupCenterX + wheelGap / 2];

  const bedY = GROUND_Y - WHEEL_R - 10;
  const boxTopY = MARGIN_TOP + 30;
  const boxEndX = cargoLength != null ? Math.min(frontX + cargoLength * scale, rearX) : rearX;
  const svgHeight = GROUND_Y + 60;

  return (
    <div className="border border-border rounded-xl p-4 bg-panel/40 space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-display text-xs uppercase tracking-wide text-ink-faint">
          Esquema del semirremolque — {variant === "semi3" ? "3 ejes" : "2 ejes"} (posición del grupo de ejes
          aproximada)
        </p>
        {width != null && <p className="text-xs text-ink-faint font-mono">Ancho: {width} mm</p>}
      </div>
      <svg viewBox={`0 0 ${DRAW_WIDTH} ${svgHeight}`} className="w-full h-auto" role="img" aria-label="Esquema lateral del semirremolque con cotas">
        <line x1={0} y1={GROUND_Y} x2={DRAW_WIDTH} y2={GROUND_Y} stroke="var(--color-border-strong)" strokeWidth={1.5} />

        {/* Kingpin / quinta rueda */}
        <line x1={kingpinX} y1={bedY} x2={kingpinX} y2={bedY - 26} stroke="var(--color-accent)" strokeWidth={3} />
        <circle cx={kingpinX} cy={bedY - 26} r={4} fill="var(--color-accent)" />

        {/* Chasis / bastidor plano */}
        <rect x={frontX} y={bedY} width={Math.max(rearX - frontX, 0)} height={6} fill="var(--color-ink-faint)" opacity={0.6} />

        {cargoLength != null && (
          <rect
            x={frontX}
            y={boxTopY}
            width={Math.max(boxEndX - frontX, 0)}
            height={bedY - boxTopY}
            fill="none"
            stroke="var(--color-ink-dim)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}

        {wheelXs.map((cx, i) => (
          <Wheel key={i} cx={cx} />
        ))}

        <DimensionLine x1={frontX} x2={rearX} y={GROUND_Y + 24} label={`${totalLength} mm total`} />
        {height != null && <HeightDimension x={rearX + 16} top={boxTopY} bottom={GROUND_Y} label={`${height} mm`} />}
      </svg>
    </div>
  );
}

export function MassesDiagram({ variant, data }: { variant: VehicleConfig; data: DiagramData }) {
  if (variant === "semi2" || variant === "semi3") return <SemiTrailerDiagram variant={variant} data={data} />;
  return <RigidDiagram variant={variant} data={data} />;
}
