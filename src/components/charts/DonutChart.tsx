export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  centerLabel: string;
  centerValue: string;
}

const SIZE = 180;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DonutChart({ slices, centerLabel, centerValue }: DonutChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let offset = 0;

  return (
    <div className="relative mx-auto h-[180px] w-[180px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90 h-full w-full" role="img" aria-label={centerLabel}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#f5f5f4" strokeWidth={STROKE} />
        {total > 0 &&
          slices.map((slice) => {
            const length = (slice.value / total) * CIRCUMFERENCE;
            const segment = (
              <circle
                key={slice.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
              >
                <title>{`${slice.label}: ${slice.value}`}</title>
              </circle>
            );
            offset += length;
            return segment;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-medium text-stone-500">{centerLabel}</span>
        <span className="mt-1 max-w-[120px] text-sm font-bold text-stone-900">{centerValue}</span>
      </div>
    </div>
  );
}
