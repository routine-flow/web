import { NextRequest, NextResponse } from "next/server";
import { User, UserService } from "@/lib/db/services/user-service";

const userService = new UserService();

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 사용자 ID입니다." },
        { status: 400 }
      );
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 보안상 비밀번호 해시는 응답에서 제외
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      timezone: user.timezone,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("사용자 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 사용자 ID입니다." },
        { status: 400 }
      );
    }

    // 기존 사용자 존재 여부 확인
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userData = await req.json();

    // 필수 필드 검증
    if (!userData.username && !userData.email && !userData.timezone) {
      return NextResponse.json(
        {
          error:
            "최소한 하나 이상의 필드가 필요합니다 (username, email, timezone).",
        },
        { status: 400 }
      );
    }

    // 이메일 변경 시 유효성 및 중복 검사
    if (userData.email && userData.email !== existingUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return NextResponse.json(
          { error: "유효한 이메일 주소가 아닙니다." },
          { status: 400 }
        );
      }

      const userWithEmail = await userService.getUserByEmail(userData.email);
      if (userWithEmail) {
        return NextResponse.json(
          { error: "이미 존재하는 이메일입니다." },
          { status: 409 }
        );
      }
    }

    // 사용자 데이터 업데이트
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      id,
    };

    const success = await userService.updateUser(updatedUser);

    if (!success) {
      return NextResponse.json(
        { error: "사용자 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "사용자가 성공적으로 업데이트되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("사용자 업데이트 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 사용자 ID입니다." },
        { status: 400 }
      );
    }

    // 기존 사용자 존재 여부 확인
    const existingUser = await userService.getUserById(id);
    if (!existingUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const success = await userService.deleteUser(id);

    if (!success) {
      return NextResponse.json(
        { error: "사용자 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "사용자가 성공적으로 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("사용자 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
