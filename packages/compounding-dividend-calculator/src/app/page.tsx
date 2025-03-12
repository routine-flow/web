"use client";

import { useState, useEffect } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@routine-flow/ui/components/ui/alert";
import { Button } from "@routine-flow/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@routine-flow/ui/components/ui/card";
import { Input } from "@routine-flow/ui/components/ui/input";
import { Label } from "@routine-flow/ui/components/ui/label";
import { Skeleton } from "@routine-flow/ui/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@routine-flow/ui/components/ui/tabs";

import { AnnualYieldModel, StockDataModel } from "@/lib/models";
import {
  createAlphaVantageService,
  createLocalServerService,
  createNasdaqService,
  StockDataService,
} from "@/lib/api/service";
import { apiConfig } from "@/lib/config";

// 차트 컴포넌트 임포트
import { PriceChart } from "@/components/charts/PriceChart";
import { DividendChart } from "@/components/charts/DividendChart";
import { AnnualYieldChart } from "@/components/charts/AnnualYieldChart";
import { StockDataTable } from "@/components/StockDataTable";

export default function Home() {
  const [symbol, setSymbol] = useState<string>("");
  const [stockData, setStockData] = useState<StockDataModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [annualYieldData, setAnnualYieldData] = useState<AnnualYieldModel[]>(
    []
  );
  const [stockService, setStockService] = useState<StockDataService | null>(
    null
  );

  // 컴포넌트 마운트 시 서비스 초기화
  useEffect(() => {
    try {
      let service: StockDataService;

      // 설정 파일에서 API 소스 결정
      if (apiConfig.defaultSource === "alpha-vantage") {
        service = createAlphaVantageService();
      } else if (apiConfig.defaultSource === "local-server") {
        service = createLocalServerService();
      } else if (apiConfig.defaultSource === "nasdaq") {
        service = createNasdaqService();
      } else {
        throw new Error("지원되지 않는 API 소스입니다.");
      }

      setStockService(service);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "API 서비스를 초기화하는 중 오류가 발생했습니다"
      );
    }
  }, []);

  const fetchStockData = async () => {
    if (!symbol) {
      setError("주식 심볼을 입력해주세요.");
      return;
    }

    if (!stockService) {
      setError("API 서비스가 초기화되지 않았습니다.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 서비스를 통해 주식 데이터 가져오기
      const data = await stockService.getStockData(symbol);
      setStockData(data);

      // 연간 배당률 데이터 계산
      const yieldData = stockService.calculateAnnualYieldData(data.priceData);
      setAnnualYieldData(yieldData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "데이터를 가져오는 중 오류가 발생했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  // 선택한 기간에 따라 차트 데이터 필터링
  const filteredChartData =
    stockData && stockService
      ? stockService.filterDataByPeriod(stockData, "max")
      : [];

  return (
    <div className="flex min-h-screen flex-col items-center p-4 w-full max-w-5xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            주식 월간 데이터 조회
          </CardTitle>
          <CardDescription>
            특정 주식의 월간 데이터를 조회하고 배당률을 분석합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="ticker">티커 입력</Label>
              <div className="flex gap-2">
                <Input
                  id="ticker"
                  placeholder="AAPL, MSFT 등"
                  value={symbol}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSymbol(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchStockData();
                  }}
                />
                <Button
                  type="submit"
                  onClick={fetchStockData}
                  disabled={loading || !stockService}
                >
                  {loading ? "로딩 중..." : "조회"}
                </Button>
              </div>
              <p className="text-sm text-gray-500">예시: AAPL, MSFT, GOOG</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="space-y-2">
                <Skeleton className="h-[20px] w-[250px]" />
                <Skeleton className="h-[20px] w-[200px]" />
                <Skeleton className="h-[400px] w-[100%]" />
              </div>
            )}

            {stockData && !loading && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {stockData.info.symbol}{" "}
                    <span className="text-muted-foreground text-sm font-normal">
                      (최근 업데이트: {stockData.info.lastUpdated})
                    </span>
                  </h2>
                </div>

                <Tabs defaultValue="price">
                  <TabsList>
                    <TabsTrigger value="price">주가 차트</TabsTrigger>
                    <TabsTrigger value="dividend">배당금 차트</TabsTrigger>
                    <TabsTrigger value="annualYield">연간 배당률</TabsTrigger>
                  </TabsList>

                  <TabsContent value="price" className="border rounded-md p-4">
                    <PriceChart data={filteredChartData} />
                  </TabsContent>

                  <TabsContent
                    value="dividend"
                    className="border rounded-md p-4"
                  >
                    <DividendChart
                      data={filteredChartData}
                      annualData={annualYieldData}
                    />
                  </TabsContent>

                  <TabsContent
                    value="annualYield"
                    className="border rounded-md p-4"
                  >
                    <AnnualYieldChart data={annualYieldData} />
                  </TabsContent>
                </Tabs>

                <h3 className="text-lg font-semibold mt-6">최근 데이터</h3>
                <StockDataTable data={stockData} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
