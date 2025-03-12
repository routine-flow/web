"use client";

import * as Recharts from "recharts";
import { AnnualYieldModel } from "@/lib/models";

interface AnnualYieldChartProps {
  data: AnnualYieldModel[];
}

export function AnnualYieldChart({ data }: AnnualYieldChartProps) {
  // Y축 최대값 계산
  const maxYield =
    data.length > 0
      ? Math.min(
          Math.max(...data.map((d) => d.averageYield)) * 1.2,
          20 // 최대 20%로 제한
        )
      : 5;

  // 심플한 X축 틱 형식 사용
  const getYearTicks = (): string[] => {
    if (data.length <= 15) {
      // 데이터가 15개 이하면 모든 연도 표시
      return data.map((d) => d.year);
    } else {
      // 데이터가 많으면 시작, 중간, 끝 연도만 표시
      const years = data.map((d) => d.year).sort();
      const start = years[0];
      const end = years[years.length - 1];
      const middle = years[Math.floor(years.length / 2)];
      return [start, middle, end];
    }
  };

  return (
    <>
      <div className="h-[400px]">
        <Recharts.ResponsiveContainer width="100%" height="100%">
          <Recharts.BarChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 20,
            }}
          >
            <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <Recharts.XAxis
              dataKey="year"
              angle={-45}
              textAnchor="end"
              height={60}
              type="category"
              scale="point"
              ticks={getYearTicks()}
            />
            <Recharts.YAxis
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              domain={[0, maxYield]}
              stroke="#888"
              label={{
                value: "평균 배당률 (%)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <Recharts.Tooltip
              labelFormatter={(label) => {
                const item = data.find((d) => d.year === label);
                return `${label}년 - ${item?.monthCount || 0}개월 데이터`;
              }}
              formatter={(value: number, name: string) => {
                if (name === "averageYield") {
                  return [`${value.toFixed(2)}%`, "평균 배당률"];
                }
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "6px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            />
            <Recharts.Legend wrapperStyle={{ paddingTop: "10px" }} />

            {/* 일반 종가 기준 배당률 */}
            <Recharts.Bar
              dataKey="averageYield"
              name="평균 배당률"
              fill="#8884d8"
              barSize={20}
            />
          </Recharts.BarChart>
        </Recharts.ResponsiveContainer>
      </div>
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">연간 평균 배당률</span>은 각 연도의
          월간 배당률 데이터를 평균한 값입니다.
          <span className="block mt-1">
            <span className="inline-block w-3 h-3 bg-[#8884d8] mr-1"></span>
            <strong>배당률</strong>은 평균 배당금을 해당 연도 마지막 종가로 나눈
            값입니다.
          </span>
        </p>
      </div>
    </>
  );
}
