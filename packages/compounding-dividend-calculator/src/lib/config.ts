import { ApiSource } from "./api/service";

// API 구성 설정
interface ApiConfig {
  // 기본 API 소스
  defaultSource: ApiSource;

  // API 프록시 설정
  useProxy: boolean;
  proxyBaseUrl: string;

  // Alpha Vantage 설정
  alphaVantage: {
    apiKey: string;
    baseUrl: string;
  };

  // Yahoo Finance 설정
  yahooFinance: {
    baseUrl: string;
  };

  // NASDAQ API 설정
  nasdaq: {
    baseUrl: string;
    assetClass: string;
  };

  // 로컬 서버 설정
  localServer: {
    baseUrl: string;
    pageSize: number;
  };
}

// 기본 값은 환경 변수에서 가져오거나 하드코딩된 값 사용
// 실제 프로덕션에서는 환경 변수나 외부 설정을 사용하는 것이 좋음
export const apiConfig: ApiConfig = {
  // 기본 API 소스 설정
  defaultSource:
    (process.env.NEXT_PUBLIC_DEFAULT_API_SOURCE as ApiSource) || "nasdaq",

  // API 프록시 설정
  useProxy: process.env.NEXT_PUBLIC_USE_API_PROXY === "false" ? false : true, // 기본값은 true
  proxyBaseUrl: process.env.NEXT_PUBLIC_API_PROXY_BASE_URL || "/api", // Next.js API 라우트 기본 경로

  // Alpha Vantage API 설정
  alphaVantage: {
    apiKey: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || "",
    baseUrl:
      process.env.NEXT_PUBLIC_ALPHA_VANTAGE_BASE_URL ||
      "https://www.alphavantage.co/query",
  },

  // Yahoo Finance API 설정
  yahooFinance: {
    baseUrl:
      process.env.NEXT_PUBLIC_YAHOO_FINANCE_BASE_URL ||
      "https://query1.finance.yahoo.com/v8/finance/chart",
  },

  // NASDAQ API 설정
  nasdaq: {
    baseUrl:
      process.env.NEXT_PUBLIC_NASDAQ_BASE_URL ||
      "https://api.nasdaq.com/api/quote",
    assetClass: process.env.NEXT_PUBLIC_NASDAQ_ASSET_CLASS || "etf",
  },

  // 로컬 서버 API 설정
  localServer: {
    baseUrl:
      process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://127.0.0.1:8000/api",
    pageSize: parseInt(process.env.NEXT_PUBLIC_LOCAL_API_PAGE_SIZE || "400"), // 대용량 페이지 사이즈로 설정
  },
};

// API 소스별 공통 설정 가져오기
export function getApiSourceConfig<T extends keyof ApiConfig>(
  source: ApiSource
): ApiConfig[T] {
  if (source === "alpha-vantage") {
    return apiConfig.alphaVantage as unknown as ApiConfig[T];
  } else if (source === "yahoo-finance") {
    return apiConfig.yahooFinance as unknown as ApiConfig[T];
  } else if (source === "nasdaq") {
    return apiConfig.nasdaq as unknown as ApiConfig[T];
  } else if (source === "local-server") {
    return apiConfig.localServer as unknown as ApiConfig[T];
  }

  throw new Error(`지원되지 않는 API 소스: ${source}`);
}
