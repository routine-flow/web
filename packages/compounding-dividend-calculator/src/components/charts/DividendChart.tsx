"use client";

import * as Recharts from "recharts";
import { StockPricePoint, AnnualYieldModel } from "@/lib/models";
import { useMemo, useRef } from "react";

interface DividendChartProps {
  data: StockPricePoint[];
  annualData?: AnnualYieldModel[];
}

export function DividendChart({ data, annualData = [] }: DividendChartProps) {
  // 이상치 정보를 저장할 ref
  const hasOutliers = useRef<boolean>(false);
  const outlierYears = useRef<string[]>([]);

  // 배당금이 있는 경우만 필터링 (임계값을 0으로 설정하여 모든 배당금 표시)
  const filteredData = data.filter((item) => item.dividend > 0);

  // 연평균 배당금 성장률 계산 (배당률이 아닌 배당금액 기준)
  const avgDividendGrowth = useMemo(() => {
    // 계산 전에 이상치 정보 초기화
    hasOutliers.current = false;
    outlierYears.current = [];
    return calculateAnnualDividendGrowth(annualData);
  }, [annualData]);

  // 데이터가 없는 경우 메시지 표시
  if (filteredData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        배당금 지급 내역이 없습니다.
      </div>
    );
  }

  // 최대 배당금 계산
  const maxDividend =
    filteredData.length > 0
      ? Math.max(...filteredData.map((d) => d.dividend)) * 1.5
      : 0;

  // 차트 날짜 표시를 위한 함수
  const getDateTicks = (data: StockPricePoint[]): string[] => {
    if (data.length === 0) return [];

    // 모든 배당 지급 날짜 표시 (배당 날짜는 상대적으로 적기 때문에)
    if (data.length <= 12) return data.map((d) => d.date);

    // 12개 이상의 데이터가 있을 경우, 분기별(또는 적절한 간격으로) 표시
    return data
      .filter((_, index) => index % Math.ceil(data.length / 12) === 0)
      .map((d) => d.date);
  };

  // 월 이름 가져오기
  const getMonthName = (dateStr: string): string => {
    const months = [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ];
    const monthIndex = parseInt(dateStr.substring(5, 7)) - 1;
    return months[monthIndex];
  };

  // 연간 평균 배당금 성장률 계산 함수
  function calculateAnnualDividendGrowth(
    annualData: AnnualYieldModel[]
  ): number {
    // 연도순으로 정렬
    const sortedData = [...annualData]
      .filter((item) => item.totalDividend > 0) // 배당금이 있는 연도만 포함
      .sort((a, b) => a.year.localeCompare(b.year));

    if (sortedData.length < 2) {
      return 0; // 데이터가 2개 미만이면 성장률 계산 불가
    }

    // 연도별 배당금 성장률 계산
    const growthRates: number[] = [];
    const outliers: string[] = []; // 이상치로 처리된 연도 기록

    for (let i = 1; i < sortedData.length; i++) {
      const prevYear = sortedData[i - 1].year;
      const currentYear = sortedData[i].year;
      const prevDividend = sortedData[i - 1].totalDividend;
      const currentDividend = sortedData[i].totalDividend;

      // 이전 배당금이 0이 아닌 경우에만 성장률 계산
      if (prevDividend > 0) {
        // 배당금 변화율 계산
        const ratio = currentDividend / prevDividend;
        const growthRate =
          ((currentDividend - prevDividend) / prevDividend) * 100;

        // 급격한 변화(1.5배 이상 증가 또는 33% 이상 감소)가 아닌 경우만 포함
        if (ratio <= 1.5 && ratio >= 0.67) {
          growthRates.push(growthRate);
        } else {
          // 급격한 변화가 있는 연도 기록
          outliers.push(`${prevYear}→${currentYear}`);
        }
      }
    }

    // 성장률 평균 계산
    if (growthRates.length === 0) {
      return 0;
    }

    const totalGrowth = growthRates.reduce((sum, rate) => sum + rate, 0);
    // 이상치 정보 저장
    hasOutliers.current = outliers.length > 0;
    outlierYears.current = outliers;

    return parseFloat((totalGrowth / growthRates.length).toFixed(2));
  }

  return (
    <>
      <div className="h-[400px]">
        <Recharts.ResponsiveContainer width="100%" height="100%">
          <Recharts.BarChart
            data={filteredData}
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
              tickFormatter={(value) => {
                // YYYY-MM-DD 형식에서 YYYY-MM 형식으로 변환
                const yearMonth = value.substring(0, 7);
                const month = getMonthName(value);
                return `${yearMonth.substring(0, 4)}년 ${month}`;
              }}
              angle={-45}
              textAnchor="end"
              height={80}
              type="category"
              scale="point"
              ticks={getDateTicks(filteredData)}
              interval={0}
            />
            <Recharts.YAxis
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              domain={[0, maxDividend]}
            />
            <Recharts.Tooltip
              labelFormatter={(label) => {
                const date = new Date(label);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                return `${year}년 ${month}월 배당금`;
              }}
              formatter={(value: number) => [`$${value.toFixed(4)}`, "배당금"]}
            />
            <Recharts.Legend />
            <Recharts.Bar
              dataKey="dividend"
              name="배당금"
              fill="#b58900"
              barSize={20}
            />
          </Recharts.BarChart>
        </Recharts.ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">배당금</span>은 주식 1주당 지급된 배당
          금액입니다.
          <span className="block mt-1">
            <span className="inline-block w-3 h-3 bg-[#b58900] mr-1"></span>
            <strong>배당금</strong>은 배당 지급 시점의 주당 지급액입니다.
          </span>
          {avgDividendGrowth !== 0 && (
            <span className="mt-2 block">
              <span className="font-semibold">배당금 성장률</span>은{" "}
              <span
                className={
                  avgDividendGrowth > 0 ? "text-green-600" : "text-red-600"
                }
              >
                {avgDividendGrowth > 0 ? "+" : ""}
                {avgDividendGrowth}%
              </span>
              입니다. 이는 연도별 총 배당금액의 증가율을 나타냅니다.
              {hasOutliers.current && (
                <span className="block mt-1 text-xs text-gray-600">
                  <span className="italic">참고:</span> 급격한 변화(±50% 이상)가
                  있는
                  {outlierYears.current.map((year, idx) => (
                    <span key={idx} className="mx-1 font-mono">
                      {year}
                    </span>
                  ))}
                  연도는 계산에서 제외되었습니다.
                </span>
              )}
            </span>
          )}
        </p>
      </div>
    </>
  );
}
