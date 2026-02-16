interface CostChartProps {
  data: { provider: string; cost: number; color: string }[];
}

export function CostChart({ data }: CostChartProps) {
  const total = data.reduce((sum, item) => sum + item.cost, 0);
  let currentAngle = 0;
  const slices = data.map((item) => {
    const percentage = (item.cost / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
    };
  });

  const conicStops = slices
    .map((slice) => `${slice.color} ${slice.startAngle}deg ${slice.endAngle}deg`)
    .join(', ');

  return (
    <div className="card-premium p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Chart */}
        <div className="flex items-center justify-center lg:w-1/2">
          <div className="relative w-48 h-48">
            <div
              className="w-full h-full rounded-full shadow-lg"
              style={{
                background: `conic-gradient(${conicStops})`,
              }}
            />
            {/* Donut hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-full shadow-md flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    ${total.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Total Monthly</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="lg:w-1/2 space-y-3">
          {slices.map((slice) => (
            <div
              key={slice.provider}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 capitalize">{slice.provider}</p>
                  <p className="text-xs text-slate-500">{slice.percentage.toFixed(1)}% of total</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-slate-900">${slice.cost.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
