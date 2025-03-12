// API 응답 타입 정의
export interface AlphaVantageMonthlyAdjustedResponse {
  "Meta Data": {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Time Zone": string;
  };
  "Monthly Adjusted Time Series": {
    [key: string]: {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. adjusted close": string;
      "6. volume": string;
      "7. dividend amount": string;
    };
  };
}

// 프론트엔드 모델 정의
export interface StockInfo {
  symbol: string;
  lastUpdated: string;
  timeZone: string;
}

export interface StockPricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose: number;
  volume: number;
  dividend: number;
  dividendYield: number;
  adjustedDividendYield: number;
  dividendGrowthRate?: number;
  yieldGrowthRate?: number;
}

export interface StockDataModel {
  info: StockInfo;
  priceData: StockPricePoint[];
}

export interface AnnualYieldModel {
  year: string;
  averageYield: number;
  adjustedAverageYield: number;
  count: number;
  monthCount: number;
  isPartialYear: boolean;
  totalDividend: number;
  averageDividendPerShare: number;
  lastPrice: number;
}

// API 어댑터 타입
export interface StockDataAdapter {
  fetchStockData(symbol: string): Promise<StockDataModel>;
}
