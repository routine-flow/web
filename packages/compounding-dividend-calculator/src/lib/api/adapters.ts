import {
  AlphaVantageMonthlyAdjustedResponse,
  StockDataAdapter,
  StockDataModel,
  StockInfo,
  StockPricePoint,
} from "../models";
import { apiConfig } from "../config";

// Alpha Vantage API 어댑터
export class AlphaVantageAdapter implements StockDataAdapter {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || apiConfig.alphaVantage.apiKey;
    this.baseUrl = apiConfig.alphaVantage.baseUrl;
  }

  async fetchStockData(symbol: string): Promise<StockDataModel> {
    try {
      const url = `${this.baseUrl}?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${symbol}&outputsize=full&apikey=${this.apiKey}`;

      const response = await fetch(url);
      const data: AlphaVantageMonthlyAdjustedResponse = await response.json();

      if ("Error Message" in data) {
        throw new Error(data["Error Message" as keyof typeof data] as string);
      }

      if ("Note" in data) {
        throw new Error(data["Note" as keyof typeof data] as string);
      }

      return this.transformData(data);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("데이터를 가져오는 중 오류가 발생했습니다");
    }
  }

  private transformData(
    data: AlphaVantageMonthlyAdjustedResponse
  ): StockDataModel {
    // 메타 데이터 변환
    const info: StockInfo = {
      symbol: data["Meta Data"]["2. Symbol"],
      lastUpdated: data["Meta Data"]["3. Last Refreshed"],
      timeZone: data["Meta Data"]["4. Time Zone"],
    };

    // 주가 데이터 변환 (배당률은 아직 계산하지 않음)
    const rawPriceData: StockPricePoint[] = Object.entries(
      data["Monthly Adjusted Time Series"]
    )
      .map(([date, values]) => {
        return {
          date,
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
          adjustedClose: parseFloat(values["5. adjusted close"]),
          volume: parseFloat(values["6. volume"]),
          dividend: parseFloat(values["7. dividend amount"]),
          dividendYield: 0, // 나중에 계산
          adjustedDividendYield: 0, // 나중에 계산
        };
      })
      .reverse(); // 날짜 순으로 정렬

    // 배당률 계산
    const priceData = this.calculateDividendYields(rawPriceData);

    return {
      info,
      priceData,
    };
  }

  private calculateDividendYields(
    priceData: StockPricePoint[]
  ): StockPricePoint[] {
    return priceData.map((point, index, allData) => {
      // 배당률 계산
      const yields = this.calculateYields(point, allData);

      // 성장률 계산 (12개월/1년 전 데이터와 비교)
      const growthRates =
        index >= 12
          ? this.calculateGrowthRates(point, allData[index - 12])
          : {};

      return {
        ...point,
        dividendYield: yields.regularYield,
        adjustedDividendYield: yields.adjustedYield,
        ...growthRates,
      };
    });
  }

  private calculateYields(
    currentPoint: StockPricePoint,
    allData: StockPricePoint[]
  ): { regularYield: number; adjustedYield: number } {
    // 현재 데이터의 인덱스 찾기
    const currentIndex = allData.findIndex(
      (item) => item.date === currentPoint.date
    );

    if (currentIndex === -1) return { regularYield: 0, adjustedYield: 0 };

    // 최근 12개월 배당금 합산 (현재 월 포함)
    let annualDividend = 0;

    // 최근 12개월 데이터가 충분하지 않으면 단일 월 데이터로 계산
    if (currentIndex < 11) {
      // 단일 월 데이터는 분기 배당으로 가정 (4배)
      annualDividend = currentPoint.dividend * 4;
    } else {
      // 최근 12개월 배당금 합산
      for (let i = 0; i <= 11; i++) {
        annualDividend += allData[currentIndex - i].dividend;
      }
    }

    // 일반 종가(close) 기준 배당률
    const regularYield =
      currentPoint.close > 0 ? (annualDividend / currentPoint.close) * 100 : 0;

    // 조정 종가(adjustedClose) 기준 배당률
    const adjustedYield =
      currentPoint.adjustedClose > 0
        ? (annualDividend / currentPoint.adjustedClose) * 100
        : 0;

    return {
      regularYield: parseFloat(regularYield.toFixed(2)),
      adjustedYield: parseFloat(adjustedYield.toFixed(2)),
    };
  }

  private calculateGrowthRates(
    currentPoint: StockPricePoint,
    previousYearPoint: StockPricePoint
  ): { dividendGrowthRate?: number; yieldGrowthRate?: number } {
    const result: { dividendGrowthRate?: number; yieldGrowthRate?: number } =
      {};

    // 배당금 성장률 계산
    if (previousYearPoint.dividend === 0 && currentPoint.dividend > 0) {
      result.dividendGrowthRate = 100; // 신규 배당 시작
    } else if (previousYearPoint.dividend > 0 && currentPoint.dividend === 0) {
      result.dividendGrowthRate = -100; // 배당 중단
    } else if (previousYearPoint.dividend > 0) {
      const growthRate =
        ((currentPoint.dividend - previousYearPoint.dividend) /
          previousYearPoint.dividend) *
        100;
      result.dividendGrowthRate = parseFloat(growthRate.toFixed(2));
    }

    // 배당률 성장률 계산
    if (
      previousYearPoint.dividendYield === 0 &&
      currentPoint.dividendYield > 0
    ) {
      result.yieldGrowthRate = 100; // 신규 배당 시작
    } else if (
      previousYearPoint.dividendYield > 0 &&
      currentPoint.dividendYield === 0
    ) {
      result.yieldGrowthRate = -100; // 배당 중단
    } else if (previousYearPoint.dividendYield > 0) {
      const yieldGrowthRate =
        ((currentPoint.dividendYield - previousYearPoint.dividendYield) /
          previousYearPoint.dividendYield) *
        100;
      result.yieldGrowthRate = parseFloat(yieldGrowthRate.toFixed(2));
    }

    return result;
  }
}

// Yahoo Finance API 응답 타입 정의
interface YahooFinanceApiResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketTime: number;
        exchangeTimezoneName: string;
        symbol?: string;
        [key: string]: any;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
          [key: string]: any;
        }>;
        adjclose?: Array<{
          adjclose: number[];
          [key: string]: any;
        }>;
      };
      events?: {
        dividends?: Record<
          string,
          {
            date: number;
            amount: number;
            [key: string]: any;
          }
        >;
        [key: string]: any;
      };
    }>;
    error?: {
      code: string;
      description: string;
    };
  };
}

// Yahoo Finance API 어댑터
export class YahooFinanceAdapter implements StockDataAdapter {
  private baseUrl: string;

  constructor() {
    // 설정에서 baseUrl 가져오기
    this.baseUrl = apiConfig.yahooFinance.baseUrl;
  }

  async fetchStockData(symbol: string): Promise<StockDataModel> {
    try {
      // Yahoo Finance API v8 URL
      const params = "?interval=1mo&range=10y&events=div";
      const url = `${this.baseUrl}/${symbol}${params}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.chart?.error) {
        throw new Error(
          data.chart.error.description ||
            "데이터를 가져오는 중 오류가 발생했습니다"
        );
      }

      return this.transformData(data, symbol);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("데이터를 가져오는 중 오류가 발생했습니다");
    }
  }

  private transformData(
    yahooData: YahooFinanceApiResponse,
    symbol: string
  ): StockDataModel {
    // Yahoo API 응답에서 필요한 데이터 추출
    const result = yahooData.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    const adjclose = result.indicators.adjclose?.[0]?.adjclose || [];

    // 배당 정보 가져오기
    const dividends = result.events?.dividends || {};

    // 메타 데이터 변환
    const info: StockInfo = {
      symbol: symbol,
      lastUpdated: new Date(meta.regularMarketTime * 1000)
        .toISOString()
        .split("T")[0],
      timeZone: meta.exchangeTimezoneName,
    };

    // 주가 데이터 변환
    const rawPriceData: StockPricePoint[] = timestamps
      .map((timestamp: number, index: number) => {
        const date = new Date(timestamp * 1000).toISOString().split("T")[0];

        // 해당 타임스탬프의 배당금 확인
        const dividend = this.findDividendForDate(timestamp, dividends);

        return {
          date,
          open: quote.open[index] || 0,
          high: quote.high[index] || 0,
          low: quote.low[index] || 0,
          close: quote.close[index] || 0,
          adjustedClose: adjclose[index] || quote.close[index] || 0,
          volume: quote.volume[index] || 0,
          dividend,
          dividendYield: 0, // 나중에 계산
          adjustedDividendYield: 0, // 나중에 계산
        };
      })
      .filter((item: StockPricePoint) => item.close > 0); // 유효한 데이터만 필터링

    // 날짜순 정렬 (오름차순)
    rawPriceData.sort((a, b) => a.date.localeCompare(b.date));

    // 배당률 계산
    const priceData = this.calculateDividendYields(rawPriceData);

    return {
      info,
      priceData,
    };
  }

  private findDividendForDate(
    timestamp: number,
    dividends: Record<
      string,
      { date: number; amount: number; [key: string]: any }
    >
  ): number {
    // 해당 날짜의 배당금을 찾음
    for (const key in dividends) {
      if (dividends[key].date === timestamp) {
        return dividends[key].amount || 0;
      }
    }
    return 0;
  }

  // 이하 배당률 및 성장률 계산 로직은 AlphaVantageAdapter와 동일
  private calculateDividendYields(
    priceData: StockPricePoint[]
  ): StockPricePoint[] {
    return priceData.map((point, index, allData) => {
      // 배당률 계산
      const yields = this.calculateYields(point, allData);

      // 성장률 계산 (12개월/1년 전 데이터와 비교)
      const growthRates =
        index >= 12
          ? this.calculateGrowthRates(point, allData[index - 12])
          : {};

      return {
        ...point,
        dividendYield: yields.regularYield,
        adjustedDividendYield: yields.adjustedYield,
        ...growthRates,
      };
    });
  }

  private calculateYields(
    currentPoint: StockPricePoint,
    allData: StockPricePoint[]
  ): { regularYield: number; adjustedYield: number } {
    // 현재 데이터의 인덱스 찾기
    const currentIndex = allData.findIndex(
      (item) => item.date === currentPoint.date
    );

    if (currentIndex === -1) return { regularYield: 0, adjustedYield: 0 };

    // 최근 12개월 배당금 합산 (현재 월 포함)
    let annualDividend = 0;

    // 최근 12개월 데이터가 충분하지 않으면 단일 월 데이터로 계산
    if (currentIndex < 11) {
      // 단일 월 데이터는 분기 배당으로 가정 (4배)
      annualDividend = currentPoint.dividend * 4;
    } else {
      // 최근 12개월 배당금 합산
      for (let i = 0; i <= 11; i++) {
        annualDividend += allData[currentIndex - i].dividend;
      }
    }

    // 일반 종가(close) 기준 배당률
    const regularYield =
      currentPoint.close > 0 ? (annualDividend / currentPoint.close) * 100 : 0;

    // 조정 종가(adjustedClose) 기준 배당률
    const adjustedYield =
      currentPoint.adjustedClose > 0
        ? (annualDividend / currentPoint.adjustedClose) * 100
        : 0;

    return {
      regularYield: parseFloat(regularYield.toFixed(2)),
      adjustedYield: parseFloat(adjustedYield.toFixed(2)),
    };
  }

  private calculateGrowthRates(
    currentPoint: StockPricePoint,
    previousYearPoint: StockPricePoint
  ): { dividendGrowthRate?: number; yieldGrowthRate?: number } {
    const result: { dividendGrowthRate?: number; yieldGrowthRate?: number } =
      {};

    // 배당금 성장률 계산
    if (previousYearPoint.dividend === 0 && currentPoint.dividend > 0) {
      result.dividendGrowthRate = 100; // 신규 배당 시작
    } else if (previousYearPoint.dividend > 0 && currentPoint.dividend === 0) {
      result.dividendGrowthRate = -100; // 배당 중단
    } else if (previousYearPoint.dividend > 0) {
      const growthRate =
        ((currentPoint.dividend - previousYearPoint.dividend) /
          previousYearPoint.dividend) *
        100;
      result.dividendGrowthRate = parseFloat(growthRate.toFixed(2));
    }

    // 배당률 성장률 계산
    if (
      previousYearPoint.dividendYield === 0 &&
      currentPoint.dividendYield > 0
    ) {
      result.yieldGrowthRate = 100; // 신규 배당 시작
    } else if (
      previousYearPoint.dividendYield > 0 &&
      currentPoint.dividendYield === 0
    ) {
      result.yieldGrowthRate = -100; // 배당 중단
    } else if (previousYearPoint.dividendYield > 0) {
      const yieldGrowthRate =
        ((currentPoint.dividendYield - previousYearPoint.dividendYield) /
          previousYearPoint.dividendYield) *
        100;
      result.yieldGrowthRate = parseFloat(yieldGrowthRate.toFixed(2));
    }

    return result;
  }
}

// 로컬 서버 API 응답 타입 정의
interface LocalServerApiResponse {
  metadata: {
    symbol: string;
    total_records: number;
    message: string;
    records_added: number;
  };
  results: Array<{
    id: number;
    symbol: string;
    date: string;
    close: string;
    adj_close: string;
    dividend: string;
  }>;
  page: number;
  page_size: number;
  total_pages: number;
}

// 로컬 서버 API 어댑터
export class LocalServerAdapter implements StockDataAdapter {
  private baseUrl: string;
  private pageSize: number;
  private useProxy: boolean;
  private proxyBaseUrl: string;

  constructor() {
    this.baseUrl = apiConfig.localServer.baseUrl;
    this.pageSize = apiConfig.localServer.pageSize;
    this.useProxy = apiConfig.useProxy;
    this.proxyBaseUrl = apiConfig.proxyBaseUrl;
  }

  async fetchStockData(symbol: string): Promise<StockDataModel> {
    try {
      // 프록시 사용 여부에 따라 URL 결정
      const baseApiUrl = this.useProxy
        ? this.proxyBaseUrl // Next.js API 라우트 사용
        : this.baseUrl; // 직접 로컬 서버에 요청

      // 첫 번째 페이지만 가져오기
      const pageUrl = `${baseApiUrl}/stocks/${symbol}/history/?page_size=${this.pageSize}`;
      console.log(`데이터 요청: ${pageUrl}`);

      const response = await fetch(pageUrl);

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data: LocalServerApiResponse = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error(`${symbol}에 대한 데이터를 찾을 수 없습니다.`);
      }

      // 첫 번째 페이지의 결과만 사용
      const results = data.results;
      console.log(`${results.length}개의 데이터 항목을 가져왔습니다.`);

      // 결과를 StockDataModel로 변환
      const stockModel = this.transformData(
        symbol,
        data.metadata.message,
        results
      );

      return stockModel;
    } catch (error) {
      console.error("데이터 가져오기 오류:", error);
      throw error instanceof Error
        ? error
        : new Error("데이터를 가져오는 중 오류가 발생했습니다");
    }
  }

  private transformData(
    symbol: string,
    lastUpdated: string,
    results: Array<{
      id: number;
      symbol: string;
      date: string;
      close: string;
      adj_close: string;
      dividend: string;
    }>
  ): StockDataModel {
    // 메타 데이터 변환
    const info: StockInfo = {
      symbol: symbol,
      lastUpdated: lastUpdated.includes("Updated data from")
        ? lastUpdated.split("Updated data from ")[1].split(" to ")[0]
        : new Date().toISOString().split("T")[0],
      timeZone: "America/New_York", // 기본값 사용
    };

    // 배당금 데이터 로깅
    console.log(
      "LocalServerAdapter - 원본 배당금 데이터:",
      results
        .filter((item) => parseFloat(item.dividend) > 0)
        .map((item) => ({
          date: item.date,
          dividend: item.dividend,
        }))
    );

    // 주가 데이터 변환 (날짜 기준 정렬)
    const rawPriceData: StockPricePoint[] = results
      .map((item) => {
        // 배당금 문자열을 숫자로 변환시 주의
        const dividendValue = parseFloat(item.dividend);

        // 배당금이 아주 작은 값(거의 0)이거나 NaN인 경우 0으로 처리
        const dividend =
          isNaN(dividendValue) || dividendValue < 0.0001 ? 0 : dividendValue;

        // 분기 배당인 경우 로그 남김 (보통 분기 배당은 3/6/9/12월에 발생)
        if (dividend > 0) {
          const month = item.date.substring(5, 7); // YYYY-MM-DD에서 MM 추출
          console.log(
            `배당금 발견: ${item.date} (${month}월), 금액: ${dividend}`
          );
        }

        return {
          date: item.date,
          open: parseFloat(item.close), // 시가 데이터가 없으므로 종가 사용
          high: parseFloat(item.close), // 고가 데이터가 없으므로 종가 사용
          low: parseFloat(item.close), // 저가 데이터가 없으므로 종가 사용
          close: parseFloat(item.close),
          adjustedClose: parseFloat(item.adj_close),
          volume: 0, // 거래량 데이터가 없음
          dividend: dividend,
          dividendYield: 0, // 나중에 계산
          adjustedDividendYield: 0, // 나중에 계산
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date)); // 날짜 순 정렬

    // 배당률 계산
    const priceData = this.calculateDividendYields(rawPriceData);

    return {
      info,
      priceData,
    };
  }

  // 이하 배당률 및 성장률 계산 로직은 다른 어댑터와 동일
  private calculateDividendYields(
    priceData: StockPricePoint[]
  ): StockPricePoint[] {
    return priceData.map((point, index, allData) => {
      // 배당률 계산
      const yields = this.calculateYields(point, allData);

      // 성장률 계산 (12개월/1년 전 데이터와 비교)
      const growthRates =
        index >= 12
          ? this.calculateGrowthRates(point, allData[index - 12])
          : {};

      return {
        ...point,
        dividendYield: yields.regularYield,
        adjustedDividendYield: yields.adjustedYield,
        ...growthRates,
      };
    });
  }

  private calculateYields(
    currentPoint: StockPricePoint,
    allData: StockPricePoint[]
  ): { regularYield: number; adjustedYield: number } {
    // 현재 데이터의 인덱스 찾기
    const currentIndex = allData.findIndex(
      (item) => item.date === currentPoint.date
    );

    if (currentIndex === -1) return { regularYield: 0, adjustedYield: 0 };

    // 최근 12개월 배당금 합산 (현재 월 포함)
    let annualDividend = 0;

    // 최근 12개월 데이터가 충분하지 않으면 단일 월 데이터로 계산
    if (currentIndex < 11) {
      // 단일 월 데이터는 분기 배당으로 가정 (4배)
      annualDividend = currentPoint.dividend * 4;
    } else {
      // 최근 12개월 배당금 합산
      for (let i = 0; i <= 11; i++) {
        annualDividend += allData[currentIndex - i].dividend;
      }
    }

    // 일반 종가(close) 기준 배당률
    const regularYield =
      currentPoint.close > 0 ? (annualDividend / currentPoint.close) * 100 : 0;

    // 조정 종가(adjustedClose) 기준 배당률
    const adjustedYield =
      currentPoint.adjustedClose > 0
        ? (annualDividend / currentPoint.adjustedClose) * 100
        : 0;

    return {
      regularYield: parseFloat(regularYield.toFixed(2)),
      adjustedYield: parseFloat(adjustedYield.toFixed(2)),
    };
  }

  private calculateGrowthRates(
    currentPoint: StockPricePoint,
    previousYearPoint: StockPricePoint
  ): { dividendGrowthRate?: number; yieldGrowthRate?: number } {
    const result: { dividendGrowthRate?: number; yieldGrowthRate?: number } =
      {};

    // 배당금 성장률 계산
    if (previousYearPoint.dividend === 0 && currentPoint.dividend > 0) {
      result.dividendGrowthRate = 100; // 신규 배당 시작
    } else if (previousYearPoint.dividend > 0 && currentPoint.dividend === 0) {
      result.dividendGrowthRate = -100; // 배당 중단
    } else if (previousYearPoint.dividend > 0) {
      const growthRate =
        ((currentPoint.dividend - previousYearPoint.dividend) /
          previousYearPoint.dividend) *
        100;
      result.dividendGrowthRate = parseFloat(growthRate.toFixed(2));
    }

    // 배당률 성장률 계산
    if (
      previousYearPoint.dividendYield === 0 &&
      currentPoint.dividendYield > 0
    ) {
      result.yieldGrowthRate = 100; // 신규 배당 시작
    } else if (
      previousYearPoint.dividendYield > 0 &&
      currentPoint.dividendYield === 0
    ) {
      result.yieldGrowthRate = -100; // 배당 중단
    } else if (previousYearPoint.dividendYield > 0) {
      const yieldGrowthRate =
        ((currentPoint.dividendYield - previousYearPoint.dividendYield) /
          previousYearPoint.dividendYield) *
        100;
      result.yieldGrowthRate = parseFloat(yieldGrowthRate.toFixed(2));
    }

    return result;
  }
}

interface NasdaqHistoricalApiResponse {
  data: {
    symbol: string;
    totalRecords: number;
    tradesTable: {
      asOf: null;
      headers: {
        date: string;
        close: string;
        volume: string;
        open: string;
        high: string;
        low: string;
      };
      rows: Array<{
        date: string;
        close: string;
        volume: string;
        open: string;
        high: string;
        low: string;
      }>;
    };
  };
  message: null;
  status: {
    rCode: number;
    bCodeMessage: null;
    developerMessage: null;
  };
}

interface NasdaqDividendsApiResponse {
  data: {
    dividendHeaderValues: Array<{
      label: string;
      value: string;
    }>;
    exDividendDate: string;
    dividendPaymentDate: string;
    yield: string;
    annualizedDividend: string;
    payoutRatio: string;
    dividends: {
      asOf: null;
      headers: {
        exOrEffDate: string;
        type: string;
        amount: string;
        declarationDate: string;
        recordDate: string;
        paymentDate: string;
      };
      rows: Array<{
        exOrEffDate: string;
        type: string;
        amount: string;
        declarationDate: string;
        recordDate: string;
        paymentDate: string;
        currency: string;
      }>;
    };
  };
  message: null;
  status: {
    rCode: number;
    bCodeMessage: null;
    developerMessage: null;
  };
}

export class NasdaqAdapter implements StockDataAdapter {
  private baseUrl: string;
  private assetClass: string;
  private useProxy: boolean;
  private proxyBaseUrl: string;

  constructor() {
    this.baseUrl = apiConfig.nasdaq.baseUrl;
    this.assetClass = apiConfig.nasdaq.assetClass;
    this.useProxy = apiConfig.useProxy;
    this.proxyBaseUrl = apiConfig.proxyBaseUrl;
  }

  async fetchStockData(symbol: string): Promise<StockDataModel> {
    try {
      // 현재 날짜 기준 10년 전 날짜 계산
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setFullYear(fromDate.getFullYear() - 30);

      const fromDateStr = fromDate.toISOString().split("T")[0];
      const toDateStr = toDate.toISOString().split("T")[0];

      // 프록시 사용 여부에 따라 URL 결정
      let baseApiUrl;
      if (this.useProxy) {
        // Next.js API 라우트 사용 시 경로 패턴에 맞게 조정
        baseApiUrl = `${this.proxyBaseUrl}/nasdaq`;
        console.log(`프록시 사용: ${baseApiUrl}`);
      } else {
        // 직접 NASDAQ API에 요청
        baseApiUrl = this.baseUrl;
        console.log(`직접 API 요청: ${baseApiUrl}`);
      }

      // 가격 데이터 가져오기
      const priceUrl = `${baseApiUrl}/${symbol}/historical?assetclass=${this.assetClass}&fromdate=${fromDateStr}&todate=${toDateStr}&limit=99999`;
      console.log(`NASDAQ 가격 데이터 요청 URL: ${priceUrl}`);

      const priceResponse = await fetch(priceUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        cache: "no-store",
      });

      if (!priceResponse.ok) {
        throw new Error(
          `NASDAQ API price data fetch failed: ${priceResponse.statusText}`
        );
      }

      const priceData =
        (await priceResponse.json()) as NasdaqHistoricalApiResponse;

      // 배당 데이터 가져오기
      const dividendUrl = `${baseApiUrl}/${symbol}/dividends?assetclass=${this.assetClass}`;
      console.log(`NASDAQ 배당 데이터 요청 URL: ${dividendUrl}`);

      const dividendResponse = await fetch(dividendUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        cache: "no-store",
      });

      if (!dividendResponse.ok) {
        throw new Error(
          `NASDAQ API dividend data fetch failed: ${dividendResponse.statusText}`
        );
      }

      const dividendData =
        (await dividendResponse.json()) as NasdaqDividendsApiResponse;

      // 데이터 변환
      return this.transformData(symbol, priceData, dividendData);
    } catch (error) {
      console.error(`Failed to fetch data from NASDAQ API: ${error}`);
      throw error;
    }
  }

  private transformData(
    symbol: string,
    priceData: NasdaqHistoricalApiResponse,
    dividendData: NasdaqDividendsApiResponse
  ): StockDataModel {
    if (
      !priceData.data ||
      !priceData.data.tradesTable ||
      !priceData.data.tradesTable.rows
    ) {
      throw new Error("Invalid price data structure");
    }

    if (
      !dividendData.data ||
      !dividendData.data.dividends ||
      !dividendData.data.dividends.rows
    ) {
      throw new Error("Invalid dividend data structure");
    }

    // 배당금 데이터를 날짜별로 매핑
    const dividendMap = new Map<string, number>();
    dividendData.data.dividends.rows.forEach((row) => {
      const date = this.formatDate(row.exOrEffDate);
      const amount = parseFloat(row.amount.replace("$", ""));
      dividendMap.set(date, amount);
    });

    // 가격 데이터 변환
    let pricePoints: StockPricePoint[] = priceData.data.tradesTable.rows.map(
      (row) => {
        const date = this.formatDate(row.date);
        const close = parseFloat(row.close);
        const open = parseFloat(row.open || "0");
        const high = parseFloat(row.high || "0");
        const low = parseFloat(row.low || "0");
        const volume = parseFloat(row.volume.replace(/,/g, "") || "0");
        const dividend = dividendMap.get(date) || 0;

        return {
          date,
          open,
          high,
          low,
          close,
          adjustedClose: close, // 나스닥에서는 조정 종가를 제공하지 않으므로 일반 종가와 동일하게 설정
          volume,
          dividend,
          dividendYield: 0, // 나중에 계산됨
          adjustedDividendYield: 0, // 나중에 계산됨
          dividendGrowthRate: undefined,
          yieldGrowthRate: undefined,
        };
      }
    );

    // 날짜순으로 정렬 (오래된 순)
    pricePoints.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 수익률 계산
    pricePoints = this.calculateDividendYields(pricePoints);

    // 가장 최근 업데이트 날짜 찾기
    const lastUpdated =
      pricePoints.length > 0
        ? pricePoints[pricePoints.length - 1].date
        : new Date().toISOString().split("T")[0];

    return {
      info: {
        symbol,
        lastUpdated,
        timeZone: "America/New_York", // NASDAQ 기본 타임존
      },
      priceData: pricePoints,
    };
  }

  private formatDate(dateStr: string): string {
    // MM/DD/YYYY 형식을 YYYY-MM-DD로 변환
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(
        2,
        "0"
      )}`;
    }
    return dateStr;
  }

  private calculateDividendYields(
    priceData: StockPricePoint[]
  ): StockPricePoint[] {
    return priceData.map((currentPoint, index, allData) => {
      // 수익률 계산
      const yields = this.calculateYields(currentPoint, allData);

      // 성장률 계산 (1년 전 데이터 기준)
      const oneYearAgoIndex = this.findIndexOfOneYearAgo(
        currentPoint.date,
        allData
      );
      const growthRates =
        oneYearAgoIndex >= 0
          ? this.calculateGrowthRates(currentPoint, allData[oneYearAgoIndex])
          : {};

      return {
        ...currentPoint,
        dividendYield: yields.regularYield,
        adjustedDividendYield: yields.adjustedYield,
        ...growthRates,
      };
    });
  }

  private calculateYields(
    currentPoint: StockPricePoint,
    allData: StockPricePoint[]
  ): { regularYield: number; adjustedYield: number } {
    // 현재 데이터의 인덱스 찾기
    const currentIndex = allData.findIndex(
      (item) => item.date === currentPoint.date
    );

    if (currentIndex === -1) return { regularYield: 0, adjustedYield: 0 };

    // 최근 12개월 배당금 합산 (현재 월 포함)
    let annualDividend = 0;

    // 최근 12개월 데이터가 충분하지 않으면 단일 월 데이터로 계산
    if (currentIndex < 11) {
      // 단일 월 데이터는 분기 배당으로 가정 (4배)
      annualDividend = currentPoint.dividend * 4;
    } else {
      // 최근 12개월 배당금 합산
      for (let i = 0; i <= 11; i++) {
        annualDividend += allData[currentIndex - i].dividend;
      }
    }

    // 일반 종가(close) 기준 배당률
    const regularYield =
      currentPoint.close > 0 ? (annualDividend / currentPoint.close) * 100 : 0;

    // 조정 종가(adjustedClose) 기준 배당률
    const adjustedYield =
      currentPoint.adjustedClose > 0
        ? (annualDividend / currentPoint.adjustedClose) * 100
        : 0;

    return {
      regularYield: parseFloat(regularYield.toFixed(2)),
      adjustedYield: parseFloat(adjustedYield.toFixed(2)),
    };
  }

  private calculateGrowthRates(
    currentPoint: StockPricePoint,
    previousYearPoint: StockPricePoint
  ): { dividendGrowthRate?: number; yieldGrowthRate?: number } {
    const result: { dividendGrowthRate?: number; yieldGrowthRate?: number } =
      {};

    // 배당금 성장률 계산
    if (previousYearPoint.dividend === 0 && currentPoint.dividend > 0) {
      result.dividendGrowthRate = 100; // 신규 배당 시작
    } else if (previousYearPoint.dividend > 0 && currentPoint.dividend === 0) {
      result.dividendGrowthRate = -100; // 배당 중단
    } else if (previousYearPoint.dividend > 0) {
      const growthRate =
        ((currentPoint.dividend - previousYearPoint.dividend) /
          previousYearPoint.dividend) *
        100;
      result.dividendGrowthRate = parseFloat(growthRate.toFixed(2));
    }

    // 배당률 성장률 계산
    if (
      previousYearPoint.dividendYield === 0 &&
      currentPoint.dividendYield > 0
    ) {
      result.yieldGrowthRate = 100; // 신규 배당 시작
    } else if (
      previousYearPoint.dividendYield > 0 &&
      currentPoint.dividendYield === 0
    ) {
      result.yieldGrowthRate = -100; // 배당 중단
    } else if (previousYearPoint.dividendYield > 0) {
      const yieldGrowthRate =
        ((currentPoint.dividendYield - previousYearPoint.dividendYield) /
          previousYearPoint.dividendYield) *
        100;
      result.yieldGrowthRate = parseFloat(yieldGrowthRate.toFixed(2));
    }

    return result;
  }

  private findIndexOfOneYearAgo(
    currentDate: string,
    priceData: StockPricePoint[]
  ): number {
    const currentDateObj = new Date(currentDate);
    const targetYear = currentDateObj.getFullYear() - 1;
    const targetMonth = currentDateObj.getMonth();
    const targetDay = currentDateObj.getDate();

    // 1년 전과 가장 가까운 날짜 인덱스 찾기
    let closestIndex = -1;
    let minDiff = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < priceData.length; i++) {
      const pointDate = new Date(priceData[i].date);
      if (pointDate.getFullYear() === targetYear) {
        const diff =
          Math.abs(pointDate.getMonth() - targetMonth) * 30 +
          Math.abs(pointDate.getDate() - targetDay);

        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }
    }

    return closestIndex;
  }
}
