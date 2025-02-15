import { NextRequest, NextResponse, userAgent } from "next/server";
import { HEADER_KEYS } from "./const/header";

export function middleware(request: NextRequest) {
  const ua = userAgent(request);

  // 응답 헤더에 User-Agent 정보 추가
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(HEADER_KEYS.UA_BROWSER, JSON.stringify(ua.browser));
  requestHeaders.set(HEADER_KEYS.UA_DEVICE, JSON.stringify(ua.device));
  requestHeaders.set(HEADER_KEYS.UA_OS, JSON.stringify(ua.os));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
