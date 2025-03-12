"use client";

import { useState, FormEvent } from "react";
import {
  calculatePurchaseShares,
  calculateDividend,
  calculateEvaluationAmount2,
  calculateEvaluationYield,
  calculateSharesGrowthRate,
} from "../../lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@routine-flow/ui/components/ui/card";
import { Button } from "@routine-flow/ui/components/ui/button";
import { Input } from "@routine-flow/ui/components/ui/input";
import { Label } from "@routine-flow/ui/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@routine-flow/ui/components/ui/table";
import { Alert, AlertDescription } from "@routine-flow/ui/components/ui/alert";
import { Download, Upload, FileDown } from "lucide-react";

interface BacktestingEntry {
  id: string;
  date: string;
  stockPrice: number;
  dividendPerShare: number;
  purchasedShares: number;
  shares: number;
  dividend: number;
  totalValue: number;
  totalYield: number;
  sharesGrowthRate: number;
}

interface InitialSetup {
  isConfigured: boolean;
  initialInvestment: number;
  ticker: string;
  initialPurchasePrice: number;
}

// 백테스팅 데이터 저장 형식
interface BacktestingData {
  initialSetup: InitialSetup;
  entries: BacktestingEntry[];
  createdAt: string;
}

export default function BacktestingPage() {
  const [entries, setEntries] = useState<BacktestingEntry[]>([]);
  const [initialSetup, setInitialSetup] = useState<InitialSetup>({
    isConfigured: false,
    initialInvestment: 0,
    ticker: "",
    initialPurchasePrice: 0,
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    stockPrice: 0,
    dividendPerShare: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "date" ? value : Number(value),
    });
  };

  const handleInitialSetupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInitialSetup({
      ...initialSetup,
      [name]: name === "ticker" ? value : Number(value),
    });
  };

  const handleInitialSetupSubmit = (e: FormEvent) => {
    e.preventDefault();
    setInitialSetup({
      ...initialSetup,
      isConfigured: true,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // 첫 기록이면 초기 매수가격으로 계산, 그렇지 않으면 마지막 기록의 shares 사용
    const currentShares =
      entries.length > 0
        ? entries[entries.length - 1].shares
        : calculatePurchaseShares(
            initialSetup.initialInvestment,
            initialSetup.initialPurchasePrice
          );

    // 배당금 계산
    const dividend = calculateDividend(
      currentShares,
      formData.dividendPerShare
    );

    // 배당금으로 추가 구매한 주식 계산
    const additionalShares = calculatePurchaseShares(
      dividend,
      formData.stockPrice
    );

    // 총 주식수
    const totalShares = currentShares + additionalShares;

    // 평가 금액
    const totalValue = calculateEvaluationAmount2(
      totalShares,
      formData.stockPrice
    );

    // 평가 수익률
    const totalYield = calculateEvaluationYield(
      totalValue,
      initialSetup.initialInvestment
    );

    // 주식 증가율 계산 시 초기 매수가격 사용
    const initialShares = calculatePurchaseShares(
      initialSetup.initialInvestment,
      initialSetup.initialPurchasePrice
    );
    const sharesGrowthRate = calculateSharesGrowthRate(
      totalShares,
      initialShares
    );

    // 새 항목 추가
    const newEntry: BacktestingEntry = {
      id: Date.now().toString(),
      date: formData.date,
      stockPrice: formData.stockPrice,
      dividendPerShare: formData.dividendPerShare,
      purchasedShares: additionalShares,
      shares: totalShares,
      dividend,
      totalValue,
      totalYield,
      sharesGrowthRate,
    };

    setEntries([...entries, newEntry]);

    // 폼 리셋 (날짜만 업데이트)
    setFormData({
      ...formData,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleClear = () => {
    setEntries([]);
    setInitialSetup({
      isConfigured: false,
      initialInvestment: 0,
      ticker: "",
      initialPurchasePrice: 0,
    });
    setFormData({
      date: new Date().toISOString().split("T")[0],
      stockPrice: 0,
      dividendPerShare: 0,
    });
  };

  const resetSetup = () => {
    setInitialSetup({
      ...initialSetup,
      isConfigured: false,
    });
    setEntries([]);
  };

  // CSV 데이터 다운로드 함수
  const handleExportCSV = () => {
    if (entries.length === 0) return;

    // CSV 헤더 (테이블 컬럼과 동일하게 구성)
    const headers = [
      "날짜",
      "시가 ($)",
      "배당금 ($)",
      "매수 주식수",
      "보유 주식수",
      "평가금 ($)",
      "평가 수익률 (%)",
    ];

    // 데이터 행 생성
    const rows = entries.map((entry) => [
      entry.date,
      entry.stockPrice.toFixed(2),
      entry.dividend.toFixed(2),
      entry.purchasedShares.toFixed(2),
      entry.shares.toFixed(2),
      entry.totalValue.toFixed(2),
      entry.totalYield.toFixed(2),
    ]);

    // CSV 문자열 생성
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Blob 생성 및 다운로드
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backtesting-${initialSetup.ticker}-${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}.csv`;

    // 다운로드 실행
    document.body.appendChild(link);
    link.click();

    // 정리
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSON 내보내기 함수도 유지 (이름 변경)
  const handleExportJSON = () => {
    if (entries.length === 0) return;

    const data = {
      initialSetup,
      entries,
      createdAt: new Date().toISOString(),
    };

    // JSON 문자열로 변환
    const jsonData = JSON.stringify(data, null, 2);

    // Blob 생성
    const blob = new Blob([jsonData], { type: "application/json" });

    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backtesting-${initialSetup.ticker}-${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}.json`;

    // 다운로드 실행
    document.body.appendChild(link);
    link.click();

    // 정리
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSON 데이터 가져오기 함수
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(
          event.target?.result as string
        ) as BacktestingData;

        // 데이터 검증
        if (
          !json.initialSetup ||
          !json.entries ||
          !Array.isArray(json.entries)
        ) {
          throw new Error("유효하지 않은 백테스팅 데이터 파일입니다.");
        }

        // 데이터 불러오기
        setInitialSetup({
          ...json.initialSetup,
          isConfigured: true,
        });
        setEntries(json.entries);
      } catch (error) {
        console.error("데이터 가져오기 오류:", error);
        alert("유효하지 않은 데이터 파일입니다. 다시 시도해주세요.");
      }
    };

    reader.readAsText(file);

    // 파일 인풋 초기화
    e.target.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!initialSetup.isConfigured ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>백테스팅 초기 설정</CardTitle>
            <CardDescription>
              백테스팅을 시작하기 전 필요한 기본 정보를 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="initial-setup-form"
              onSubmit={handleInitialSetupSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="initialInvestment">투자 원금 (달러)</Label>
                  <Input
                    id="initialInvestment"
                    type="number"
                    name="initialInvestment"
                    value={initialSetup.initialInvestment || ""}
                    onChange={handleInitialSetupChange}
                    placeholder="초기 투자 금액 (달러)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticker">투자 종목 티커</Label>
                  <Input
                    id="ticker"
                    type="text"
                    name="ticker"
                    value={initialSetup.ticker}
                    onChange={handleInitialSetupChange}
                    placeholder="예: AAPL, MSFT"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialPurchasePrice">
                    초기 매수가격 (달러)
                  </Label>
                  <Input
                    id="initialPurchasePrice"
                    type="number"
                    name="initialPurchasePrice"
                    value={initialSetup.initialPurchasePrice || ""}
                    onChange={handleInitialSetupChange}
                    placeholder="주당 매수가격"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <div>
                  <input
                    type="file"
                    id="import-data"
                    className="hidden"
                    accept=".json"
                    onChange={handleImportData}
                  />
                  <label htmlFor="import-data">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        데이터 불러오기
                      </span>
                    </Button>
                  </label>
                </div>
                <Button type="submit">설정 완료</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                백테스팅: {initialSetup.ticker}
              </h1>
              <p className="text-gray-500">
                초기 투자금: ${initialSetup.initialInvestment.toFixed(2)} | 초기
                매수가: ${initialSetup.initialPurchasePrice.toFixed(2)}
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={resetSetup}>
                설정 변경
              </Button>
              {entries.length > 0 && (
                <div className="relative inline-block group">
                  <Button variant="outline" className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    데이터 내보내기
                  </Button>
                  <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10">
                    <div className="py-1">
                      <Button
                        variant="ghost"
                        onClick={handleExportCSV}
                        className="flex items-center w-full justify-start px-4 py-2"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        CSV로 내보내기
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleExportJSON}
                        className="flex items-center w-full justify-start px-4 py-2"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        JSON으로 내보내기
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <input
                type="file"
                id="import-data-after-setup"
                className="hidden"
                accept=".json"
                onChange={handleImportData}
              />
              <label htmlFor="import-data-after-setup">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    데이터 불러오기
                  </span>
                </Button>
              </label>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>배당금 재투자 기록</CardTitle>
              <CardDescription>
                배당금 내역을 입력하여 복리 효과를 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">매수 날짜</Label>
                    <Input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stockPrice">주식 시가 (달러)</Label>
                    <Input
                      id="stockPrice"
                      type="number"
                      name="stockPrice"
                      value={formData.stockPrice || ""}
                      onChange={handleChange}
                      placeholder="현재 주가"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dividendPerShare">주당 배당금 (달러)</Label>
                    <Input
                      id="dividendPerShare"
                      type="number"
                      name="dividendPerShare"
                      value={formData.dividendPerShare || ""}
                      onChange={handleChange}
                      placeholder="주당 배당금"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={handleClear}>
                    초기화
                  </Button>
                  <Button type="submit">기록 추가</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {entries.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>백테스팅 결과</CardTitle>
                <CardDescription>
                  배당금 재투자를 통한 복리 효과
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        ${entries[entries.length - 1].totalValue.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        총 평가금액
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {entries[entries.length - 1].totalYield.toFixed(2)}%
                      </div>
                      <p className="text-xs text-muted-foreground">총 수익률</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {entries[entries.length - 1].shares.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        보유 주식수
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {entries[entries.length - 1].sharesGrowthRate.toFixed(
                          2
                        )}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground">
                        주식 증가율
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableCaption>백테스팅 상세 결과</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>시가 ($)</TableHead>
                      <TableHead>배당금 ($)</TableHead>
                      <TableHead>매수 주식수</TableHead>
                      <TableHead>보유 주식수</TableHead>
                      <TableHead>평가금 ($)</TableHead>
                      <TableHead>평가 수익률 (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.stockPrice.toFixed(2)}</TableCell>
                        <TableCell>{entry.dividend.toFixed(2)}</TableCell>
                        <TableCell>
                          {entry.purchasedShares.toFixed(2)}
                        </TableCell>
                        <TableCell>{entry.shares.toFixed(2)}</TableCell>
                        <TableCell>{entry.totalValue.toFixed(2)}</TableCell>
                        <TableCell>{entry.totalYield.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Alert className="bg-blue-50">
              <AlertDescription>
                배당금 재투자 정보를 입력하고 기록 추가 버튼을 클릭하세요.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
