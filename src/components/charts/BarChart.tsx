export interface BarDatum {
  label: string;
  income: number;
  expense: number;
}

interface BarChartProps {
  data: BarDatum[];
  incomeLabel: string;
  expenseLabel: string;
  formatValue: (amount: number) => string;
}

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 36, left: 56 };

export function BarChart({ data, incomeLabel, expenseLabel, formatValue }: BarChartProps) {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(1, ...data.flatMap((datum) => [datum.income, datum.expense]));
  const groupWidth = innerWidth / Math.max(data.length, 1);
  const barWidth = Math.min(22, groupWidth * 0.32);
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((step) => maxValue * step);

  const yFor = (value: number) => PADDING.top + innerHeight - (value / maxValue) * innerHeight;

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-stone-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary-600" />
          {incomeLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-accent-500" />
          {expenseLabel}
        </span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={`${incomeLabel} / ${expenseLabel}`}>
        {gridValues.map((value) => (
          <g key={value}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={yFor(value)}
              y2={yFor(value)}
              stroke="#e7e5e4"
              strokeDasharray="4 4"
            />
            <text x={PADDING.left - 8} y={yFor(value) + 4} textAnchor="end" className="fill-stone-500" fontSize="11">
              {formatValue(value)}
            </text>
          </g>
        ))}
        {data.map((datum, index) => {
          const groupX = PADDING.left + index * groupWidth + groupWidth / 2;
          return (
            <g key={`${datum.label}-${index}`}>
              <rect
                x={groupX - barWidth - 2}
                y={yFor(datum.income)}
                width={barWidth}
                height={Math.max(PADDING.top + innerHeight - yFor(datum.income), 0)}
                rx={6}
                className="fill-primary-600 transition-all duration-700"
              >
                <title>{`${incomeLabel}: ${formatValue(datum.income)}`}</title>
              </rect>
              <rect
                x={groupX + 2}
                y={yFor(datum.expense)}
                width={barWidth}
                height={Math.max(PADDING.top + innerHeight - yFor(datum.expense), 0)}
                rx={6}
                className="fill-accent-500 transition-all duration-700"
              >
                <title>{`${expenseLabel}: ${formatValue(datum.expense)}`}</title>
              </rect>
              <text
                x={groupX}
                y={HEIGHT - 12}
                textAnchor="middle"
                className="fill-stone-600"
                fontSize="12"
              >
                {datum.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
