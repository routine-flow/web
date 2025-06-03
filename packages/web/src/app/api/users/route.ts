import { NextRequest, NextResponse } from "next/server";
import { User, UserService } from "@/lib/db/services/user-service";

const userService = new UserService();

export async function GET(req: NextRequest) {
  try {
    // 요청 URL에서 이메일 파라미터 추출
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (email) {
      const user = await userService.getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // 비밀번호 해시는 제외하고 반환
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password_hash;
      return NextResponse.json(userWithoutPassword);
    } else {
      // email 파라미터가 없는 경우 - 사용자 목록 가져오기는 구현하지 않음
      return NextResponse.json(
        { error: "이메일 파라미터가 필요합니다." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("사용자 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();

    // 필수 필드 검증
    if (!userData.username || !userData.email || !userData.password_hash) {
      return NextResponse.json(
        { error: "사용자명, 이메일, 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { error: "유효한 이메일 주소가 아닙니다." },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingUser = await userService.getUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 존재하는 이메일입니다." },
        { status: 409 }
      );
    }

    // 사용자 생성
    const userId = await userService.createUser(userData as User);

    return NextResponse.json(
      { id: userId, message: "사용자가 성공적으로 생성되었습니다." },
      { status: 201 }
    );
  } catch (error) {
    console.error("사용자 생성 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
