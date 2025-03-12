"use client";

import * as Recharts from "recharts";
import { StockPricePoint } from "@/lib/models";

interface PriceChartProps {
  data: StockPricePoint[];
}

export function PriceChart({ data }: PriceChartProps) {
  // 차트 날짜 표시를 위한 함수 (이전의 getActualDateTicks 대체)
  const getDateTicks = (data: StockPricePoint[]): string[] => {
    if (data.length === 0) return [];

    // 최소한 시작, 중간, 끝 날짜는 표시
    if (data.length <= 5) return data.map((d) => d.date);

    // 6개 이상의 데이터가 있을 경우, 적절히 분산해서 표시
    const start = data[0].date;
    const end = data[data.length - 1].date;
    const middle = data[Math.floor(data.length / 2)].date;

    return [start, middle, end];
  };

  return (
    <div className="h-[400px]">
      <Recharts.ResponsiveContainer width="100%" height="100%">
        <Recharts.LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 10,
            bottom: 20,
          }}
        >
          <Recharts.CartesianGrid strokeDasharray="3 3" />
          <Recharts.XAxis
            dataKey="date"
            tickFormatter={(value) => value.substring(0, 7)}
            angle={-45}
            textAnchor="end"
            height={60}
            type="category"
            scale="point"
            ticks={getDateTicks(data)}
          />
          <Recharts.YAxis
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            domain={[
              0,
              data.length > 0
                ? Math.ceil(Math.max(...data.map((d) => d.adjustedClose)) * 1.1)
                : 100,
            ]}
          />
          <Recharts.Tooltip
            labelFormatter={(label) => `날짜: ${label}`}
            formatter={(value: number, name: string) => {
              if (name === "adjustedClose")
                return [`$${value.toFixed(2)}`, "조정 종가"];
              return [value, name];
            }}
          />
          <Recharts.Legend />
          <Recharts.Line
            type="monotone"
            dataKey="adjustedClose"
            name="조정 종가"
            stroke="#2aa198"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </Recharts.LineChart>
      </Recharts.ResponsiveContainer>
    </div>
  );
}
