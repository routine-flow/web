"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@routine-flow/ui/components/ui/table";
import { StockDataModel } from "@/lib/models";

interface StockDataTableProps {
  data: StockDataModel;
}

export function StockDataTable({ data }: StockDataTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>월간 주가 및 배당금 데이터</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>날짜</TableHead>
            <TableHead>시가</TableHead>
            <TableHead>고가</TableHead>
            <TableHead>저가</TableHead>
            <TableHead>종가</TableHead>
            <TableHead>조정 종가</TableHead>
            <TableHead>거래량</TableHead>
            <TableHead>배당금</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.priceData
            .slice(-12) // 최근 12개월 데이터 표시 (배열 맨 뒤에서부터)
            .reverse() // 날짜 내림차순 정렬 (최신 날짜부터)
            .map((point) => (
              <TableRow key={point.date}>
                <TableCell>{point.date}</TableCell>
                <TableCell>{point.open.toFixed(2)}</TableCell>
                <TableCell>{point.high.toFixed(2)}</TableCell>
                <TableCell>{point.low.toFixed(2)}</TableCell>
                <TableCell>{point.close.toFixed(2)}</TableCell>
                <TableCell>{point.adjustedClose.toFixed(2)}</TableCell>
                <TableCell>{point.volume.toLocaleString()}</TableCell>
                <TableCell>{point.dividend.toFixed(4)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
