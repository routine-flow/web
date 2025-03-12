import { NextRequest, NextResponse } from "next/server";
import { apiConfig } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { path } = params;
    const pathSegments = path.join("/");

    // URL 검색 매개변수 가져오기
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";

    // NASDAQ API URL
    const nasdaqBaseUrl = apiConfig.nasdaq.baseUrl;
    const apiUrl = `${nasdaqBaseUrl}/${pathSegments}${queryString}`;

    console.log(`NASDAQ API 프록시 요청: ${apiUrl}`);

    // NASDAQ API에 요청
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `NASDAQ API 요청 실패: ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        {
          error: `NASDAQ API 요청 실패: ${response.status}`,
          details: response.statusText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`NASDAQ API 응답 성공: ${pathSegments}`);

    // CORS 헤더 설정 및 데이터 반환
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("NASDAQ API 프록시 오류:", error);

    return NextResponse.json(
      {
        error: "NASDAQ 데이터를 가져오는 중 오류가 발생했습니다",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// OPTIONS 핸들러 추가 (CORS preflight 요청을 위해)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
      },
    }
  );
}
