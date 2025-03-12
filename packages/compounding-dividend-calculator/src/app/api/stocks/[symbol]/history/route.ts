import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;

    // URL 검색 매개변수 가져오기
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const pageSize =
      searchParams.get("page_size") ||
      apiConfig.localServer.pageSize.toString();

    // 로컬 서버 API URL
    const localServerUrl = apiConfig.localServer.baseUrl;
    const apiUrl = `${localServerUrl}/stocks/${symbol}/history/?page=${page}&page_size=${pageSize}`;

    // 로컬 서버에 요청
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`로컬 서버 API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    // Next.js 응답으로 반환
    return NextResponse.json(data);
  } catch (error) {
    console.error("API 요청 오류:", error);

    return NextResponse.json(
      {
        error: "주식 데이터를 가져오는 중 오류가 발생했습니다",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
