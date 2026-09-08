import type { MassesInputs } from "@/lib/calculations/masses";
import {
  initialTareNoAccessories,
  seatsDistributionAxle1,
  seatsDistributionAxle2,
  fuelDistributionAxle1,
  fuelDistributionAxle2,
  loadMassMma,
  loadMmaDistributionAxle1,
  loadMmaDistributionAxle2,
  totalMassNoHook,
  totalAxle1NoHook,
  totalAxle2NoHook,
  mom,
  momAxle1,
  momAxle2,
  hookMassDistributionAxle1,
  hookMassDistributionAxle2,
  loadMassMmaHook,
  hookLoadMmaDistributionAxle1,
  hookLoadMmaDistributionAxle2,
  totalHookMma,
  totalHookMmaAxle1,
  totalHookMmaAxle2,
  loadMassMmta,
  loadMmtaDistributionAxle1,
  loadMmtaDistributionAxle2,
  totalMmtaNoHook,
  totalAxle1Mmta,
  totalAxle2Mmta,
  hookLoadMassMmta,
  hookLoadMmtaDistributionAxle1,
  hookLoadMmtaDistributionAxle2,
  totalHookMmta,
  totalHookMmtaAxle1,
  totalHookMmtaAxle2,
} from "@/lib/calculations/masses";

type LimitFamily = "mma" | "mmta" | "both" | "none";

type Row = {
  label: string;
  total: number | null;
  axle1: number | null;
  axle2: number | null;
  limitFamily: LimitFamily;
};

type Limits = {
  mmaTotal: number | null;
  mmaAxle1: number | null;
  mmaAxle2: number | null;
  mmtaTotal: number | null;
  mmtaAxle1: number | null;
  mmtaAxle2: number | null;
};

function exceeds(value: number | null, limit: number | null): boolean {
  return value != null && limit != null && value > limit;
}

function cellExceeds(row: Row, column: "total" | "axle1" | "axle2", limits: Limits): boolean {
  if (row.limitFamily === "none") return false;
  const value = row[column];
  const mmaLimit = column === "total" ? limits.mmaTotal : column === "axle1" ? limits.mmaAxle1 : limits.mmaAxle2;
  const mmtaLimit = column === "total" ? limits.mmtaTotal : column === "axle1" ? limits.mmtaAxle1 : limits.mmtaAxle2;
  if (row.limitFamily === "mma") return exceeds(value, mmaLimit);
  if (row.limitFamily === "mmta") return exceeds(value, mmtaLimit);
  return exceeds(value, mmaLimit) || exceeds(value, mmtaLimit);
}

function limitLabel(row: Row, column: "total" | "axle1" | "axle2", limits: Limits): string | null {
  if (row.limitFamily === "none") return null;
  const mmaLimit = column === "total" ? limits.mmaTotal : column === "axle1" ? limits.mmaAxle1 : limits.mmaAxle2;
  const mmtaLimit = column === "total" ? limits.mmtaTotal : column === "axle1" ? limits.mmtaAxle1 : limits.mmtaAxle2;
  if (row.limitFamily === "mma") return mmaLimit != null ? `/ ${mmaLimit}` : null;
  if (row.limitFamily === "mmta") return mmtaLimit != null ? `/ ${mmtaLimit}` : null;
  const parts = [mmaLimit != null ? `MMA ${mmaLimit}` : null, mmtaLimit != null ? `MMTA ${mmtaLimit}` : null].filter(
    Boolean
  );
  return parts.length > 0 ? `/ ${parts.join(" · ")}` : null;
}

function Cell({ row, column, limits }: { row: Row; column: "total" | "axle1" | "axle2"; limits: Limits }) {
  const value = row[column];
  const bad = cellExceeds(row, column, limits);
  const limit = limitLabel(row, column, limits);
  return (
    <td className={`px-3 py-1.5 text-right text-sm ${bad ? "bg-danger/10 text-danger font-semibold" : "text-ink"}`}>
      {value ?? "—"}
      {limit && <span className="block text-[10px] font-normal opacity-70">{limit}</span>}
    </td>
  );
}

function Block({ title, rows, limits }: { title: string; rows: Row[]; limits: Limits }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-ink-faint uppercase tracking-wide">{title}</p>
      <table className="w-full border border-border rounded-lg overflow-hidden text-sm">
        <thead>
          <tr className="bg-panel text-[11px] text-ink-faint">
            <th className="px-3 py-1.5 text-left font-normal">&nbsp;</th>
            <th className="px-3 py-1.5 text-right font-normal">Total</th>
            <th className="px-3 py-1.5 text-right font-normal">Eje 1</th>
            <th className="px-3 py-1.5 text-right font-normal">Eje 2</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-border">
              <td className="px-3 py-1.5 text-ink-dim">{row.label}</td>
              <Cell row={row} column="total" limits={limits} />
              <Cell row={row} column="axle1" limits={limits} />
              <Cell row={row} column="axle2" limits={limits} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MassesVerificationPanel({ inputs }: { inputs: MassesInputs }) {
  const limits: Limits = {
    mmaTotal: inputs.maxLadenMassRegistration,
    mmaAxle1: inputs.maxLadenMassRegistrationAxle1,
    mmaAxle2: inputs.maxLadenMassRegistrationAxle2,
    mmtaTotal: inputs.maxTechnicallyPermissibleMassRequested,
    mmtaAxle1: inputs.maxTechnicallyPermissibleMassAxle1,
    mmtaAxle2: inputs.maxTechnicallyPermissibleMassAxle2,
  };

  const block1: Row[] = [
    { label: "Tara vehículo", total: initialTareNoAccessories(inputs), axle1: inputs.tareAxle1, axle2: inputs.tareAxle2, limitFamily: "none" },
    { label: "Masa plazas", total: inputs.seatsMass, axle1: seatsDistributionAxle1(inputs), axle2: seatsDistributionAxle2(inputs), limitFamily: "none" },
    { label: "Masa combustible", total: inputs.fuelCapacity, axle1: fuelDistributionAxle1(inputs), axle2: fuelDistributionAxle2(inputs), limitFamily: "none" },
    { label: "Masa carga MMA", total: loadMassMma(inputs), axle1: loadMmaDistributionAxle1(inputs), axle2: loadMmaDistributionAxle2(inputs), limitFamily: "none" },
    { label: "Totales", total: totalMassNoHook(inputs), axle1: totalAxle1NoHook(inputs), axle2: totalAxle2NoHook(inputs), limitFamily: "mma" },
    { label: "MOM", total: mom(inputs), axle1: momAxle1(inputs), axle2: momAxle2(inputs), limitFamily: "none" },
  ];

  const block2: Row[] = [
    { label: "M. estática (gancho)", total: inputs.staticCouplingPointMass, axle1: hookMassDistributionAxle1(inputs), axle2: hookMassDistributionAxle2(inputs), limitFamily: "none" },
    { label: "Masa carga MMA + gancho", total: loadMassMmaHook(inputs), axle1: hookLoadMmaDistributionAxle1(inputs), axle2: hookLoadMmaDistributionAxle2(inputs), limitFamily: "none" },
    { label: "Totales con gancho", total: totalHookMma(inputs), axle1: totalHookMmaAxle1(inputs), axle2: totalHookMmaAxle2(inputs), limitFamily: "both" },
  ];

  const block3: Row[] = [
    { label: "Masa carga MMTA", total: loadMassMmta(inputs), axle1: loadMmtaDistributionAxle1(inputs), axle2: loadMmtaDistributionAxle2(inputs), limitFamily: "none" },
    { label: "Totales sin gancho", total: totalMmtaNoHook(inputs), axle1: totalAxle1Mmta(inputs), axle2: totalAxle2Mmta(inputs), limitFamily: "mmta" },
    { label: "Masa carga MMTA + gancho", total: hookLoadMassMmta(inputs), axle1: hookLoadMmtaDistributionAxle1(inputs), axle2: hookLoadMmtaDistributionAxle2(inputs), limitFamily: "none" },
    { label: "Totales con gancho", total: totalHookMmta(inputs), axle1: totalHookMmtaAxle1(inputs), axle2: totalHookMmtaAxle2(inputs), limitFamily: "mmta" },
  ];

  return (
    <div className="border border-border rounded-xl p-4 space-y-4">
      <div>
        <p className="text-sm font-medium text-ink">Verificación MMA/MMTA por eje</p>
        <p className="text-xs text-ink-faint">
          MMA: {limits.mmaTotal ?? "—"} (eje1 {limits.mmaAxle1 ?? "—"} · eje2 {limits.mmaAxle2 ?? "—"}) · MMTA:{" "}
          {limits.mmtaTotal ?? "—"} (eje1 {limits.mmtaAxle1 ?? "—"} · eje2 {limits.mmtaAxle2 ?? "—"})
        </p>
      </div>

      <Block title="Sin gancho — comparado contra MMA" rows={block1} limits={limits} />
      <Block title="Con gancho montado — comparado contra MMA y MMTA" rows={block2} limits={limits} />
      <Block title="Capacidad de remolque — comparado contra MMTA" rows={block3} limits={limits} />

      <p className="text-[11px] text-ink-faint italic">
        Solo las filas &quot;Totales...&quot; se comparan contra los límites del vehículo. Estas fórmulas están
        portadas del motor de cálculo original y solo una parte se ha verificado contra un caso real — contrastar
        con el FileMaker original antes de firmar un documento oficial.
      </p>
    </div>
  );
}
