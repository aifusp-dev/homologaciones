import type { MassesInputs } from "@/lib/calculations/masses";
import type { VehicleConfig } from "@/lib/vehicleConfig";
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
  // TRIAXLE
  mom3Axle,
  mom3AxleAxle1,
  mom3AxleAxle2and3,
  craneLoadMmta3AxleNoHook,
  craneLoadMmta3AxleNoHookDistributionAxle1,
  craneLoadMmta3AxleNoHookDistributionAxle2,
  total3AxleMmtaNoHook,
  total3AxleMmtaNoHookAxle1,
  total3AxleMmtaNoHookAxle2,
  total3AxleMmaWithHook,
  total3AxleMmaWithHookAxle1,
  total3AxleMmaWithHookAxle2,
  total3AxleMmtaWithHook,
  total3AxleMmtaWithHookAxle1,
  total3AxleMmtaWithHookAxle2,
  // SEMI_O4
  loadMassMmaO4,
  loadMmaKingpinDistributionO4,
  loadMmaAxleGroupDistributionO4,
  loadMassMmtaO4,
  loadMmtaKingpinDistributionO4,
  loadMmtaAxleGroupDistributionO4,
  totalMmaKingpinO4,
  totalMmaAxleGroupO4,
  totalMmtaKingpinO4,
  totalMmtaAxleGroupO4,
  // SEMI_O4_3AXLE
  loadMma3AxleSemi,
  loadMmaKingpin3Axle,
  loadMmaAxleGroup3Axle,
  loadMmta3AxleSemi,
  loadMmtaKingpin3Axle,
  loadMmtaAxleGroup3Axle,
  totalMma3AxleSemi,
  totalMmaKingpin3Axle,
  totalMmaAxleGroup3Axle,
  totalMmta3AxleSemi,
  totalMmtaKingpin3Axle,
} from "@/lib/calculations/masses";

type LimitFamily = "mma" | "mmta" | "both" | "none";

type Column = { key: string; label: string };

type Row = {
  label: string;
  values: Partial<Record<string, number | null>>;
  limitFamily: LimitFamily;
};

type ColumnLimit = { mma: number | null; mmta: number | null };
type Limits = Partial<Record<string, ColumnLimit>>;

type Block = { title: string; rows: Row[] };

function sum(...values: (number | null | undefined)[]): number | null {
  if (values.some((v) => v == null)) return null;
  return values.reduce((s: number, v) => s + (v as number), 0);
}

function diff(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a == null || b == null) return null;
  return a - b;
}

function exceeds(value: number | null, limit: number | null): boolean {
  return value != null && limit != null && value > limit;
}

function cellExceeds(row: Row, columnKey: string, limits: Limits): boolean {
  if (row.limitFamily === "none") return false;
  const limit = limits[columnKey];
  if (!limit) return false;
  if (row.limitFamily === "mma") return exceeds(row.values[columnKey] ?? null, limit.mma);
  if (row.limitFamily === "mmta") return exceeds(row.values[columnKey] ?? null, limit.mmta);
  return exceeds(row.values[columnKey] ?? null, limit.mma) || exceeds(row.values[columnKey] ?? null, limit.mmta);
}

function limitLabel(row: Row, columnKey: string, limits: Limits): string | null {
  if (row.limitFamily === "none") return null;
  const limit = limits[columnKey];
  if (!limit) return null;
  if (row.limitFamily === "mma") return limit.mma != null ? `/ ${limit.mma}` : null;
  if (row.limitFamily === "mmta") return limit.mmta != null ? `/ ${limit.mmta}` : null;
  const parts = [limit.mma != null ? `MMA ${limit.mma}` : null, limit.mmta != null ? `MMTA ${limit.mmta}` : null].filter(
    Boolean
  );
  return parts.length > 0 ? `/ ${parts.join(" · ")}` : null;
}

function Cell({ row, column, limits }: { row: Row; column: Column; limits: Limits }) {
  const value = row.values[column.key] ?? null;
  const bad = cellExceeds(row, column.key, limits);
  const limit = limitLabel(row, column.key, limits);
  return (
    <td className={`px-3 py-1.5 text-right text-sm ${bad ? "bg-danger/10 text-danger font-semibold" : "text-ink"}`}>
      {value ?? "—"}
      {limit && <span className="block text-[10px] font-normal opacity-70">{limit}</span>}
    </td>
  );
}

function BlockTable({ block, columns, limits }: { block: Block; columns: Column[]; limits: Limits }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] text-ink-faint uppercase tracking-wide">{block.title}</p>
      <table className="w-full border border-border rounded-lg overflow-hidden text-sm">
        <thead>
          <tr className="bg-panel text-[11px] text-ink-faint">
            <th className="px-3 py-1.5 text-left font-normal">&nbsp;</th>
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-1.5 text-right font-normal">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.label} className="border-t border-border">
              <td className="px-3 py-1.5 text-ink-dim">{row.label}</td>
              {columns.map((c) => (
                <Cell key={c.key} row={row} column={c} limits={limits} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BASE_COLUMNS: Column[] = [
  { key: "total", label: "Total" },
  { key: "axle1", label: "Eje 1" },
  { key: "axle2", label: "Eje 2" },
];

const TRIAXLE_COLUMNS: Column[] = [
  { key: "total", label: "Total" },
  { key: "axle1", label: "Eje 1" },
  { key: "axle23", label: "Ejes 2+3" },
];

const KINGPIN_COLUMNS: Column[] = [
  { key: "total", label: "Total" },
  { key: "kingpin", label: "Kingpin" },
  { key: "axleGroup", label: "Grupo ejes" },
];

function buildBase(inputs: MassesInputs): { columns: Column[]; blocks: Block[]; limits: Limits; note: string } {
  const limits: Limits = {
    total: { mma: inputs.maxLadenMassRegistration, mmta: inputs.maxTechnicallyPermissibleMassRequested },
    axle1: { mma: inputs.maxLadenMassRegistrationAxle1, mmta: inputs.maxTechnicallyPermissibleMassAxle1 },
    axle2: { mma: inputs.maxLadenMassRegistrationAxle2, mmta: inputs.maxTechnicallyPermissibleMassAxle2 },
  };

  const blocks: Block[] = [
    {
      title: "Sin gancho — comparado contra MMA",
      rows: [
        {
          label: "Tara vehículo",
          values: { total: initialTareNoAccessories(inputs), axle1: inputs.tareAxle1, axle2: inputs.tareAxle2 },
          limitFamily: "none",
        },
        {
          label: "Masa plazas",
          values: { total: inputs.seatsMass, axle1: seatsDistributionAxle1(inputs), axle2: seatsDistributionAxle2(inputs) },
          limitFamily: "none",
        },
        {
          label: "Masa combustible",
          values: { total: inputs.fuelCapacity, axle1: fuelDistributionAxle1(inputs), axle2: fuelDistributionAxle2(inputs) },
          limitFamily: "none",
        },
        {
          label: "Masa carga MMA",
          values: { total: loadMassMma(inputs), axle1: loadMmaDistributionAxle1(inputs), axle2: loadMmaDistributionAxle2(inputs) },
          limitFamily: "none",
        },
        {
          label: "Totales",
          values: { total: totalMassNoHook(inputs), axle1: totalAxle1NoHook(inputs), axle2: totalAxle2NoHook(inputs) },
          limitFamily: "mma",
        },
        { label: "MOM", values: { total: mom(inputs), axle1: momAxle1(inputs), axle2: momAxle2(inputs) }, limitFamily: "none" },
      ],
    },
    {
      title: "Con gancho montado — comparado contra MMA y MMTA",
      rows: [
        {
          label: "M. estática (gancho)",
          values: {
            total: inputs.staticCouplingPointMass,
            axle1: hookMassDistributionAxle1(inputs),
            axle2: hookMassDistributionAxle2(inputs),
          },
          limitFamily: "none",
        },
        {
          label: "Masa carga MMA + gancho",
          values: {
            total: loadMassMmaHook(inputs),
            axle1: hookLoadMmaDistributionAxle1(inputs),
            axle2: hookLoadMmaDistributionAxle2(inputs),
          },
          limitFamily: "none",
        },
        {
          label: "Totales con gancho",
          values: { total: totalHookMma(inputs), axle1: totalHookMmaAxle1(inputs), axle2: totalHookMmaAxle2(inputs) },
          limitFamily: "both",
        },
      ],
    },
    {
      title: "Capacidad de remolque — comparado contra MMTA",
      rows: [
        {
          label: "Masa carga MMTA",
          values: {
            total: loadMassMmta(inputs),
            axle1: loadMmtaDistributionAxle1(inputs),
            axle2: loadMmtaDistributionAxle2(inputs),
          },
          limitFamily: "none",
        },
        {
          label: "Totales sin gancho",
          values: { total: totalMmtaNoHook(inputs), axle1: totalAxle1Mmta(inputs), axle2: totalAxle2Mmta(inputs) },
          limitFamily: "mmta",
        },
        {
          label: "Masa carga MMTA + gancho",
          values: {
            total: hookLoadMassMmta(inputs),
            axle1: hookLoadMmtaDistributionAxle1(inputs),
            axle2: hookLoadMmtaDistributionAxle2(inputs),
          },
          limitFamily: "none",
        },
        {
          label: "Totales con gancho",
          values: { total: totalHookMmta(inputs), axle1: totalHookMmtaAxle1(inputs), axle2: totalHookMmtaAxle2(inputs) },
          limitFamily: "mmta",
        },
      ],
    },
  ];

  const note = `MMA: ${inputs.maxLadenMassRegistration ?? "—"} (eje1 ${inputs.maxLadenMassRegistrationAxle1 ?? "—"} · eje2 ${
    inputs.maxLadenMassRegistrationAxle2 ?? "—"
  }) · MMTA: ${inputs.maxTechnicallyPermissibleMassRequested ?? "—"} (eje1 ${
    inputs.maxTechnicallyPermissibleMassAxle1 ?? "—"
  } · eje2 ${inputs.maxTechnicallyPermissibleMassAxle2 ?? "—"})`;

  return { columns: BASE_COLUMNS, blocks, limits, note };
}

function buildTriaxle(inputs: MassesInputs): { columns: Column[]; blocks: Block[]; limits: Limits; note: string } {
  const axle23Mma = sum(inputs.maxLadenMassRegistrationAxle2, inputs.maxLadenMassRegistrationAxle3);
  const axle23Mmta = sum(inputs.maxTechnicallyPermissibleMassAxle2, inputs.maxTechnicallyPermissibleMassAxle3);
  const limits: Limits = {
    total: { mma: inputs.maxLadenMassRegistration, mmta: inputs.maxTechnicallyPermissibleMassRequested },
    axle1: { mma: inputs.maxLadenMassRegistrationAxle1, mmta: inputs.maxTechnicallyPermissibleMassAxle1 },
    axle23: { mma: axle23Mma, mmta: axle23Mmta },
  };

  const blocks: Block[] = [
    {
      title: "Sin gancho — comparado contra MMTA",
      rows: [
        {
          label: "MOM",
          values: { total: mom3Axle(inputs), axle1: mom3AxleAxle1(inputs), axle23: mom3AxleAxle2and3(inputs) },
          limitFamily: "none",
        },
        {
          label: "Carga MMTA (sin gancho)",
          values: {
            total: craneLoadMmta3AxleNoHook(inputs),
            axle1: craneLoadMmta3AxleNoHookDistributionAxle1(inputs),
            axle23: craneLoadMmta3AxleNoHookDistributionAxle2(inputs),
          },
          limitFamily: "none",
        },
        {
          label: "Totales sin gancho",
          values: {
            total: total3AxleMmtaNoHook(inputs),
            axle1: total3AxleMmtaNoHookAxle1(inputs),
            axle23: total3AxleMmtaNoHookAxle2(inputs),
          },
          limitFamily: "mmta",
        },
      ],
    },
    {
      title: "Con gancho montado — comparado contra MMA y MMTA",
      rows: [
        {
          label: "Totales con gancho (MMA)",
          values: {
            total: total3AxleMmaWithHook(inputs),
            axle1: total3AxleMmaWithHookAxle1(inputs),
            axle23: total3AxleMmaWithHookAxle2(inputs),
          },
          limitFamily: "mma",
        },
        {
          label: "Totales con gancho (MMTA)",
          values: {
            total: total3AxleMmtaWithHook(inputs),
            axle1: total3AxleMmtaWithHookAxle1(inputs),
            axle23: total3AxleMmtaWithHookAxle2(inputs),
          },
          limitFamily: "mmta",
        },
      ],
    },
  ];

  const note = `MMA: ${inputs.maxLadenMassRegistration ?? "—"} (eje1 ${inputs.maxLadenMassRegistrationAxle1 ?? "—"} · ejes2+3 ${
    axle23Mma ?? "—"
  }) · MMTA: ${inputs.maxTechnicallyPermissibleMassRequested ?? "—"} (eje1 ${
    inputs.maxTechnicallyPermissibleMassAxle1 ?? "—"
  } · ejes2+3 ${axle23Mmta ?? "—"})`;

  return { columns: TRIAXLE_COLUMNS, blocks, limits, note };
}

function buildSemi2(inputs: MassesInputs): { columns: Column[]; blocks: Block[]; limits: Limits; note: string } {
  const axleGroupMma = sum(inputs.maxLadenMassRegistrationAxle1, inputs.maxLadenMassRegistrationAxle2);
  const axleGroupMmta = sum(inputs.maxTechnicallyPermissibleMassAxle1, inputs.maxTechnicallyPermissibleMassAxle2);
  const limits: Limits = {
    total: { mma: inputs.maxLadenMassRegistration, mmta: inputs.maxTechnicallyPermissibleMassRequested },
    kingpin: { mma: inputs.staticCouplingPointMass, mmta: inputs.staticCouplingPointMass },
    axleGroup: { mma: axleGroupMma, mmta: axleGroupMmta },
  };

  const blocks: Block[] = [
    {
      title: "Reparto de carga",
      rows: [
        {
          label: "Carga MMA",
          values: {
            total: loadMassMmaO4(inputs),
            kingpin: loadMmaKingpinDistributionO4(inputs),
            axleGroup: loadMmaAxleGroupDistributionO4(inputs),
          },
          limitFamily: "none",
        },
        {
          label: "Carga MMTA",
          values: {
            total: loadMassMmtaO4(inputs),
            kingpin: loadMmtaKingpinDistributionO4(inputs),
            axleGroup: loadMmtaAxleGroupDistributionO4(inputs),
          },
          limitFamily: "none",
        },
      ],
    },
    {
      title: "Totales — comparado contra límites",
      rows: [
        {
          label: "Total MMA",
          values: {
            total: sum(totalMmaKingpinO4(inputs), totalMmaAxleGroupO4(inputs)),
            kingpin: totalMmaKingpinO4(inputs),
            axleGroup: totalMmaAxleGroupO4(inputs),
          },
          limitFamily: "mma",
        },
        {
          label: "Total MMTA",
          values: {
            total: sum(totalMmtaKingpinO4(inputs), totalMmtaAxleGroupO4(inputs)),
            kingpin: totalMmtaKingpinO4(inputs),
            axleGroup: totalMmtaAxleGroupO4(inputs),
          },
          limitFamily: "mmta",
        },
      ],
    },
  ];

  const note = `MMA: ${inputs.maxLadenMassRegistration ?? "—"} · MMTA: ${
    inputs.maxTechnicallyPermissibleMassRequested ?? "—"
  } · Kingpin (masa estática): ${inputs.staticCouplingPointMass ?? "—"} · Grupo ejes MMA ${axleGroupMma ?? "—"} / MMTA ${
    axleGroupMmta ?? "—"
  }`;

  return { columns: KINGPIN_COLUMNS, blocks, limits, note };
}

function buildSemi3(inputs: MassesInputs): { columns: Column[]; blocks: Block[]; limits: Limits; note: string } {
  const axleGroupMma = sum(
    inputs.maxLadenMassRegistrationAxle1,
    inputs.maxLadenMassRegistrationAxle2,
    inputs.maxLadenMassRegistrationAxle3
  );
  const axleGroupMmta = sum(
    inputs.maxTechnicallyPermissibleMassAxle1,
    inputs.maxTechnicallyPermissibleMassAxle2,
    inputs.maxTechnicallyPermissibleMassAxle3
  );
  const limits: Limits = {
    total: { mma: inputs.maxLadenMassRegistration, mmta: inputs.maxTechnicallyPermissibleMassRequested },
    kingpin: { mma: inputs.staticCouplingPointMass, mmta: inputs.staticCouplingPointMass },
    axleGroup: { mma: axleGroupMma, mmta: axleGroupMmta },
  };

  const blocks: Block[] = [
    {
      title: "Reparto de carga",
      rows: [
        {
          label: "Carga MMA",
          values: {
            total: loadMma3AxleSemi(inputs),
            kingpin: loadMmaKingpin3Axle(inputs),
            axleGroup: loadMmaAxleGroup3Axle(inputs),
          },
          limitFamily: "none",
        },
        {
          label: "Carga MMTA",
          values: {
            total: loadMmta3AxleSemi(inputs),
            kingpin: loadMmtaKingpin3Axle(inputs),
            axleGroup: loadMmtaAxleGroup3Axle(inputs),
          },
          limitFamily: "none",
        },
      ],
    },
    {
      title: "Totales — comparado contra límites",
      rows: [
        {
          label: "Total MMA",
          values: {
            total: totalMma3AxleSemi(inputs),
            kingpin: totalMmaKingpin3Axle(inputs),
            axleGroup: totalMmaAxleGroup3Axle(inputs),
          },
          limitFamily: "mma",
        },
        {
          label: "Total MMTA",
          values: {
            total: totalMmta3AxleSemi(inputs),
            kingpin: totalMmtaKingpin3Axle(inputs),
            // Sin función dedicada en el motor (solo existe la media por eje,
            // totalMmtaPerAxle3Axle) — se deriva por complementariedad con el
            // total y el kingpin, mismo criterio que usa el propio motor para
            // repartir el resto de magnitudes de este bloque.
            axleGroup: diff(totalMmta3AxleSemi(inputs), totalMmtaKingpin3Axle(inputs)),
          },
          limitFamily: "mmta",
        },
      ],
    },
  ];

  const note = `MMA: ${inputs.maxLadenMassRegistration ?? "—"} · MMTA: ${
    inputs.maxTechnicallyPermissibleMassRequested ?? "—"
  } · Kingpin (masa estática): ${inputs.staticCouplingPointMass ?? "—"} · Grupo ejes MMA ${axleGroupMma ?? "—"} / MMTA ${
    axleGroupMmta ?? "—"
  }`;

  return { columns: KINGPIN_COLUMNS, blocks, limits, note };
}

export function MassesVerificationPanel({
  inputs,
  vehicleConfig,
}: {
  inputs: MassesInputs;
  vehicleConfig: VehicleConfig;
}) {
  const { columns, blocks, limits, note } =
    vehicleConfig === "triaxle"
      ? buildTriaxle(inputs)
      : vehicleConfig === "semi2"
        ? buildSemi2(inputs)
        : vehicleConfig === "semi3"
          ? buildSemi3(inputs)
          : buildBase(inputs);

  return (
    <div className="border border-border rounded-xl p-4 space-y-4">
      <div>
        <p className="text-sm font-medium text-ink">Verificación MMA/MMTA</p>
        <p className="text-xs text-ink-faint">{note}</p>
      </div>

      {blocks.map((block) => (
        <BlockTable key={block.title} block={block} columns={columns} limits={limits} />
      ))}

      <p className="text-[11px] text-ink-faint italic">
        Solo las filas &quot;Total...&quot; se comparan contra los límites del vehículo. Estas fórmulas están portadas
        del motor de cálculo original y solo la configuración BASE se ha verificado contra un caso real —
        contrastar con el FileMaker original antes de firmar un documento oficial de un vehículo de 3 ejes o
        semirremolque.
      </p>
    </div>
  );
}
