import { NextRequest, NextResponse } from "next/server";
import { Essence, EssenceService } from "@/lib/db/services/essence-service";

const essenceService = new EssenceService();

export async function GET(req: NextRequest) {
  try {
    // 요청 URL에서 사용자 ID 파라미터 추출
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: "유효한 사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const essences = await essenceService.getAllEssencesByUserId(
      parseInt(userId)
    );
    return NextResponse.json(essences);
  } catch (error) {
    console.error("목표 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const essenceData = await req.json();

    // 필수 필드 검증
    if (!essenceData.user_id || !essenceData.title) {
      return NextResponse.json(
        { error: "사용자 ID와 제목이 필요합니다." },
        { status: 400 }
      );
    }

    // 추가 필드 검증
    if (essenceData.target_value === undefined) {
      essenceData.target_value = 0;
    }

    if (essenceData.current_value === undefined) {
      essenceData.current_value = 0;
    }

    // 목표값이 음수인지 확인
    if (essenceData.target_value < 0) {
      return NextResponse.json(
        { error: "목표값은 음수일 수 없습니다." },
        { status: 400 }
      );
    }

    // 목표 생성
    const essenceId = await essenceService.createEssence(
      essenceData as Essence
    );

    return NextResponse.json(
      { id: essenceId, message: "목표가 성공적으로 생성되었습니다." },
      { status: 201 }
    );
  } catch (error) {
    console.error("목표 생성 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
