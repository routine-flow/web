import {
  AnnualYieldModel,
  StockDataAdapter,
  StockDataModel,
  StockPricePoint,
} from "../models";
import {
  AlphaVantageAdapter,
  YahooFinanceAdapter,
  LocalServerAdapter,
  NasdaqAdapter,
} from "./adapters";
import { PeriodOption } from "../types";

// API 소스 타입
export type ApiSource =
  | "alpha-vantage"
  | "yahoo-finance"
  | "local-server"
  | "nasdaq";

// 스톡 데이터 서비스 클래스
export class StockDataService {
  private adapter: StockDataAdapter;

  constructor(adapter: StockDataAdapter) {
    this.adapter = adapter;
  }

  // 어댑터 변경 메서드
  setAdapter(adapter: StockDataAdapter): void {
    this.adapter = adapter;
  }

  // 심볼 기준으로 주식 데이터 가져오기
  async getStockData(symbol: string): Promise<StockDataModel> {
    return this.adapter.fetchStockData(symbol);
  }

  // 선택한 기간에 따라 데이터 필터링
  filterDataByPeriod(
    stockData: StockDataModel,
    period: PeriodOption
  ): StockPricePoint[] {
    if (!stockData.priceData.length) return [];

    let monthsToShow = 0;

    switch (period) {
      case "1y":
        monthsToShow = 12;
        break;
      case "3y":
        monthsToShow = 36;
        break;
      case "5y":
        monthsToShow = 60;
        break;
      case "10y":
        monthsToShow = 120;
        break;
      case "max":
      default:
        return stockData.priceData; // 모든 데이터 반환
    }

    // 최신 데이터부터 계산하여 지정된 개월 수만큼 데이터 선택
    return stockData.priceData.slice(-monthsToShow);
  }

  // 연간 배당률 데이터 계산
  calculateAnnualYieldData(priceData: StockPricePoint[]): AnnualYieldModel[] {
    // 데이터를 연도별로 정렬 (날짜 오름차순)
    const sortedData = [...priceData].sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // 연도별로 데이터를 그룹화
    const yearlyDataMap: {
      [key: string]: {
        totalDividend: number; // 연간 총 배당금
        lastPrice: number; // 연도 마지막 주가
        lastAdjustedPrice: number; // 연도 마지막 조정 주가
        count: number; // 배당 발생 횟수
        months: Set<string>; // 해당 연도에 포함된 월 추적
        lastDate: string; // 해당 연도의 마지막 데이터 날짜
      };
    } = {};

    // 각 연도별 마지막 가격 데이터와 총 배당금을 기록
    sortedData.forEach((item) => {
      const year = item.date.substring(0, 4); // YYYY-MM-DD에서 연도 부분만 추출
      const month = item.date.substring(5, 7); // YYYY-MM-DD에서 월 부분 추출

      if (!yearlyDataMap[year]) {
        yearlyDataMap[year] = {
          totalDividend: 0,
          lastPrice: 0,
          lastAdjustedPrice: 0,
          count: 0,
          months: new Set<string>(),
          lastDate: "",
        };
      }

      // 현재 날짜가 기존 마지막 날짜보다 최신이면 마지막 가격 업데이트
      if (
        !yearlyDataMap[year].lastDate ||
        item.date > yearlyDataMap[year].lastDate
      ) {
        yearlyDataMap[year].lastPrice = item.close;
        yearlyDataMap[year].lastAdjustedPrice = item.adjustedClose;
        yearlyDataMap[year].lastDate = item.date;
      }

      // 배당금이 있는 경우 합산
      if (item.dividend > 0) {
        yearlyDataMap[year].totalDividend += item.dividend;
        yearlyDataMap[year].count += 1;
        yearlyDataMap[year].months.add(month);
      }
    });

    console.log(JSON.parse(JSON.stringify(yearlyDataMap, null, 2)));

    // 연간 데이터 생성
    const annualData = Object.entries(yearlyDataMap)
      .map(([year, data]) => {
        const monthCount = data.months.size;
        const isCompleteYear = monthCount >= 12;
        // 불완전한 연도 표시 (데이터가 12개월 미만인 경우)
        const isPartialYear = !isCompleteYear;

        // 마지막 주가로 배당률 계산
        let regularYield = 0;
        let adjustedYield = 0;
        let averageDividendPerShare = 0;

        // 평균 배당금 계산 (총 배당금 / 배당 횟수)
        if (data.count > 0) {
          averageDividendPerShare = data.totalDividend / data.count;
        }

        // 평균 배당금을 마지막 주가로 나누어 배당률 계산
        if (data.lastPrice > 0) {
          regularYield = (averageDividendPerShare / data.lastPrice) * 100;
        }

        if (data.lastAdjustedPrice > 0) {
          adjustedYield =
            (averageDividendPerShare / data.lastAdjustedPrice) * 100;
        }

        return {
          year,
          averageYield: parseFloat(regularYield.toFixed(2)),
          adjustedAverageYield: parseFloat(adjustedYield.toFixed(2)),
          count: data.count,
          monthCount,
          isPartialYear,
          totalDividend: parseFloat(data.totalDividend.toFixed(4)),
          averageDividendPerShare: parseFloat(
            averageDividendPerShare.toFixed(4)
          ),
          lastPrice: parseFloat(data.lastPrice.toFixed(2)),
        };
      })
      .filter((item) => item.count > 0) // 배당 데이터가 있는 연도만 포함
      .sort((a, b) => a.year.localeCompare(b.year)); // 연도순 정렬

    return annualData;
  }

  // 연간 평균 배당 성장률 계산
  calculateAnnualYieldGrowth(annualData: AnnualYieldModel[]): number {
    // 연도순으로 정렬
    const sortedData = [...annualData].sort((a, b) =>
      a.year.localeCompare(b.year)
    );

    if (sortedData.length < 2) {
      return 0; // 데이터가 2개 미만이면 성장률 계산 불가
    }

    // 연도별 성장률 계산
    const growthRates: number[] = [];

    for (let i = 1; i < sortedData.length; i++) {
      const prevYield = sortedData[i - 1].averageYield;
      const currentYield = sortedData[i].averageYield;

      // 이전 배당률이 0이 아닌 경우에만 성장률 계산
      if (prevYield > 0) {
        const growthRate = ((currentYield - prevYield) / prevYield) * 100;
        growthRates.push(growthRate);
      }
    }

    // 성장률 평균 계산
    if (growthRates.length === 0) {
      return 0;
    }

    const totalGrowth = growthRates.reduce((sum, rate) => sum + rate, 0);
    return parseFloat((totalGrowth / growthRates.length).toFixed(2));
  }
}

// 다양한 API 소스를 기반으로 서비스 인스턴스 생성
export const createStockDataService = (
  source: ApiSource,
  apiKey?: string
): StockDataService => {
  let adapter: StockDataAdapter;

  switch (source) {
    case "alpha-vantage":
      adapter = new AlphaVantageAdapter(apiKey);
      break;
    case "yahoo-finance":
      adapter = new YahooFinanceAdapter();
      break;
    case "nasdaq":
      adapter = new NasdaqAdapter();
      break;
    case "local-server":
      adapter = new LocalServerAdapter();
      break;
    default:
      throw new Error("지원되지 않는 API 소스입니다.");
  }

  return new StockDataService(adapter);
};

// 편의를 위한 특정 API 팩토리 함수
export const createAlphaVantageService = (
  apiKey?: string
): StockDataService => {
  return createStockDataService("alpha-vantage", apiKey);
};

export const createYahooFinanceService = (): StockDataService => {
  return createStockDataService("yahoo-finance");
};

// 로컬 서버 서비스 생성 함수
export const createLocalServerService = (): StockDataService => {
  return createStockDataService("local-server");
};

// NASDAQ 서비스 생성 함수
export const createNasdaqService = (): StockDataService => {
  return createStockDataService("nasdaq");
};
