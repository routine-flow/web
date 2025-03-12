export interface StockData {
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Time Zone": string;
  };
  "Monthly Adjusted Time Series": {
    [key: string]: MonthlyDataPoint;
  };
}

export interface MonthlyDataPoint {
  "1. open": string;
  "2. high": string;
  "3. low": string;
  "4. close": string;
  "5. adjusted close": string;
  "6. volume": string;
  "7. dividend amount": string;
}

export interface ChartDataPoint {
  date: string;
  close: number;
  adjustedClose: number;
  dividend: number;
  dividendYield: number; // 일반 종가 기준 배당률
  adjustedDividendYield: number; // 조정 종가 기준 배당률
  dividendGrowthRate?: number; // 전년 동월 대비 배당 성장률(%)
  yieldGrowthRate?: number; // 전년 동월 대비 배당률 성장률(%)
}

export interface AnnualYieldData {
  year: string;
  averageYield: number; // 일반 종가 기준 평균 배당률
  adjustedAverageYield: number; // 조정 종가 기준 평균 배당률
  count: number; // 해당 연도에 포함된 월 데이터 수
  monthCount: number; // 해당 연도에 포함된 고유 월 수
  isPartialYear: boolean; // 불완전한 연도 여부
}

export type PeriodOption =
  | "1y" // 1년
  | "3y" // 3년
  | "5y" // 5년
  | "10y" // 10년
  | "max"; // 전체 기간
