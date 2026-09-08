import { DeviceForm } from "./device-form";
import type { DeviceTableKey } from "@/lib/deviceFields";

const DEVICE_GROUP: DeviceTableKey[] = [
  "couplingDevice",
  "spraySuppression",
  "electromagneticCompatibility",
  "lateralProtection",
  "rearProtection",
  "lateralMarking",
];

const LIGHTING_GROUP: DeviceTableKey[] = [
  "lightingSide",
  "lightingPosition",
  "lightingReflector",
  "lightingBrake",
  "lightingTurnSignal",
  "lightingFrontOutlineMarker",
  "lightingRearOutlineMarker",
  "lightingPlate",
  "lightingReverse",
  "lightingFog",
];

const DOCUMENTATION_GROUP: DeviceTableKey[] = [
  "lightingMaterialChecklist",
  "regulatoryActNumbers",
  "copCoverSheet",
  "registrationPlates",
  "platesInscriptions",
];

type DeviceRecordMap = Partial<Record<DeviceTableKey, Record<string, string | number | null> | null>>;

export function DevicesSection({ dossierId, records }: { dossierId: string; records: DeviceRecordMap }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Dispositivos y protecciones
        </h3>
        <div className="space-y-2">
          {DEVICE_GROUP.map((key) => (
            <DeviceForm key={key} dossierId={dossierId} tableKey={key} data={records[key] ?? null} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Señalización y alumbrado
        </h3>
        <div className="space-y-2">
          {LIGHTING_GROUP.map((key) => (
            <DeviceForm key={key} dossierId={dossierId} tableKey={key} data={records[key] ?? null} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Documentación y actos reglamentarios
        </h3>
        <div className="space-y-2">
          {DOCUMENTATION_GROUP.map((key) => (
            <DeviceForm key={key} dossierId={dossierId} tableKey={key} data={records[key] ?? null} />
          ))}
        </div>
      </div>
    </div>
  );
}
