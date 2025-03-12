import { ChartDataPoint, AnnualYieldData, PeriodOption } from "./types";

// 선택한 기간에 따라 차트 데이터 필터링
export const filterDataByPeriod = (
  chartData: ChartDataPoint[],
  period: PeriodOption
): ChartDataPoint[] => {
  if (!chartData.length) return [];

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
      return chartData; // 모든 데이터 반환
  }

  // 최신 데이터부터 계산하여 지정된 개월 수만큼 데이터 선택
  return chartData.slice(-monthsToShow);
};

// 배당률 성장률 차트를 위한 함수 - 실제 데이터에 있는 날짜만 ticks로 사용
export const getActualDateTicks = (data: ChartDataPoint[]): string[] => {
  if (data.length === 0) return [];

  // 최소한 시작, 중간, 끝 날짜는 표시
  if (data.length <= 5) return data.map((d) => d.date);

  // 6개 이상의 데이터가 있을 경우, 적절히 분산해서 표시
  const start = data[0].date;
  const end = data[data.length - 1].date;
  const middle = data[Math.floor(data.length / 2)].date;

  return [start, middle, end];
};

// 연간 배당률 계산 함수
export const calculateAnnualYieldData = (
  data: ChartDataPoint[]
): AnnualYieldData[] => {
  // 연도별로 데이터를 그룹화
  const yearlyDataMap: {
    [key: string]: {
      regularTotal: number;
      adjustedTotal: number;
      count: number;
      months: Set<string>; // 해당 연도에 포함된 월 추적
    };
  } = {};

  // 데이터를 연도별로 그룹화
  data.forEach((item) => {
    const year = item.date.substring(0, 4); // YYYY-MM-DD에서 연도 부분만 추출
    const month = item.date.substring(5, 7); // YYYY-MM-DD에서 월 부분 추출

    if (!yearlyDataMap[year]) {
      yearlyDataMap[year] = {
        regularTotal: 0,
        adjustedTotal: 0,
        count: 0,
        months: new Set<string>(),
      };
    }

    // 배당률이 0이 아닌 경우만 계산에 포함
    if (item.dividendYield > 0) {
      yearlyDataMap[year].regularTotal += item.dividendYield;
      yearlyDataMap[year].adjustedTotal += item.adjustedDividendYield;
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

      return {
        year,
        averageYield: parseFloat((data.regularTotal / data.count).toFixed(2)),
        adjustedAverageYield: parseFloat(
          (data.adjustedTotal / data.count).toFixed(2)
        ),
        count: data.count,
        monthCount,
        isPartialYear,
      };
    })
    .filter((item) => item.count > 0) // 데이터가 있는 연도만 포함
    .sort((a, b) => a.year.localeCompare(b.year)); // 연도순 정렬

  return annualData;
};

// 연간 평균 배당 성장률 계산 함수 추가
export const calculateAnnualYieldGrowth = (data: AnnualYieldData[]): number => {
  // 연도순으로 정렬
  const sortedData = [...data].sort((a, b) => a.year.localeCompare(b.year));

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
};

/**
 * 투자원금 계산
 * @param principal 원금
 * @param exchangeRate 환율
 * @returns 환율로 나눈 투자원금 (아랫자리 반올림)
 */
export const calculateInvestmentAmount = (
  principal: number,
  exchangeRate: number
): number => {
  return Math.round(principal / exchangeRate);
};

/**
 * 수익률 계산
 * @param purchasePrice 매수가격
 * @param sellingPrice 종가매도
 * @returns 수익률 (둘째자리 반올림, 퍼센트)
 */
export const calculateYield = (
  purchasePrice: number,
  sellingPrice: number
): number => {
  // 노트에는 (매수가격) - (종가매도) / (매수가격)로 되어 있으나, 올바른 수익률 계산은 아래와 같음
  // (종가매도 - 매수가격) / 매수가격 * 100
  return parseFloat(
    (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(2)
  );
};

/**
 * 보유 주식수 계산
 * @param currentShares 잔고 주식수
 * @param purchaseAmount 매수금액
 * @param purchasePrice 매수가격
 * @returns 총 보유 주식수
 */
export const calculateHoldingShares = (
  currentShares: number,
  purchaseAmount: number,
  purchasePrice: number
): number => {
  return currentShares + purchaseAmount / purchasePrice;
};

/**
 * 배당금 계산 (원천징수 85% 적용)
 * @param shares 보유 주식수
 * @param dividendPerShare 주당 배당금
 * @returns 배당금 (둘째자리 반올림)
 */
export const calculateDividend = (
  shares: number,
  dividendPerShare: number
): number => {
  return parseFloat((shares * dividendPerShare * 0.85).toFixed(2));
};

/**
 * 기존 주식 수익금 계산
 * @param existingShares 기존 주식수
 * @param currentPrice 주당 시가
 * @returns 기존 주식 수익금 (둘째자리 반올림)
 */
export const calculateExistingStockValue = (
  existingShares: number,
  currentPrice: number
): number => {
  return parseFloat((existingShares * currentPrice).toFixed(2));
};

/**
 * 매수 주식수 계산
 * @param purchaseAmount 매수금
 * @param currentPrice 주당 시가
 * @returns 매수 주식수
 */
export const calculatePurchaseShares = (
  purchaseAmount: number,
  currentPrice: number
): number => {
  return purchaseAmount / currentPrice;
};

/**
 * 평가금액 계산 (방법 1)
 * @param existingStockValue 기존 주식 수익금
 * @param additionalInvestment 추가 투자금
 * @returns 평가금액
 */
export const calculateEvaluationAmount1 = (
  existingStockValue: number,
  additionalInvestment: number
): number => {
  return existingStockValue + additionalInvestment;
};

/**
 * 평가금액 계산 (방법 2)
 * @param holdingShares 보유 주식수
 * @param currentPrice 주당 시가
 * @returns 평가금액
 */
export const calculateEvaluationAmount2 = (
  holdingShares: number,
  currentPrice: number
): number => {
  return holdingShares * currentPrice;
};

/**
 * 평가 수익률 계산
 * @param evaluationAmount 평가금액
 * @param investmentAmount 투자원금
 * @returns 평가 수익률 (둘째자리 반올림, 퍼센트)
 */
export const calculateEvaluationYield = (
  evaluationAmount: number,
  investmentAmount: number
): number => {
  // 노트에는 (1 - (평가금액 / 투자원금)) * 100으로 되어 있으나, 올바른 수익률 계산은 아래와 같음
  // ((평가금액 / 투자원금) - 1) * 100
  return parseFloat(
    ((evaluationAmount / investmentAmount - 1) * 100).toFixed(2)
  );
};

/**
 * 원금대비 주식수 증가율 계산
 * @param currentShares 현재 보유 주식수
 * @param initialShares 처음 주식수
 * @returns 주식수 증가율 (퍼센트)
 */
export const calculateSharesGrowthRate = (
  currentShares: number,
  initialShares: number
): number => {
  // 노트에는 (1 - (보유 주식수 / 처음 주식수)) * 100으로 되어 있으나, 올바른 증가율 계산은 아래와 같음
  // ((보유 주식수 / 처음 주식수) - 1) * 100
  return (currentShares / initialShares - 1) * 100;
};
