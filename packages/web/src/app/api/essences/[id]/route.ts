import { NextRequest, NextResponse } from "next/server";
import { Essence, EssenceService } from "@/lib/db/services/essence-service";

const essenceService = new EssenceService();

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
        { error: "유효하지 않은 목표 ID입니다." },
        { status: 400 }
      );
    }

    const essence = await essenceService.getEssenceById(id);

    if (!essence) {
      return NextResponse.json(
        { error: "목표를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(essence);
  } catch (error) {
    console.error("목표 조회 중 오류 발생:", error);
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
        { error: "유효하지 않은 목표 ID입니다." },
        { status: 400 }
      );
    }

    // 기존 목표 존재 여부 확인
    const existingEssence = await essenceService.getEssenceById(id);
    if (!existingEssence) {
      return NextResponse.json(
        { error: "목표를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const essenceData = await req.json();

    // 사용자 ID는 변경 불가
    if (
      essenceData.user_id &&
      essenceData.user_id !== existingEssence.user_id
    ) {
      return NextResponse.json(
        { error: "사용자 ID는 변경할 수 없습니다." },
        { status: 400 }
      );
    }

    // 목표값 검증
    if (
      essenceData.target_value !== undefined &&
      essenceData.target_value < 0
    ) {
      return NextResponse.json(
        { error: "목표값은 음수일 수 없습니다." },
        { status: 400 }
      );
    }

    // 목표 데이터 업데이트
    const updatedEssence: Essence = {
      ...existingEssence,
      ...essenceData,
      id,
    };

    const success = await essenceService.updateEssence(updatedEssence);

    if (!success) {
      return NextResponse.json(
        { error: "목표 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "목표가 성공적으로 업데이트되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("목표 업데이트 중 오류 발생:", error);
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
        { error: "유효하지 않은 목표 ID입니다." },
        { status: 400 }
      );
    }

    // 기존 목표 존재 여부 확인
    const existingEssence = await essenceService.getEssenceById(id);
    if (!existingEssence) {
      return NextResponse.json(
        { error: "목표를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // URL에서 사용자 ID 확인 (보안상 사용자 검증)
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: "유효한 사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);

    if (existingEssence.user_id !== userIdNum) {
      return NextResponse.json(
        { error: "해당 목표를 삭제할 권한이 없습니다." },
        { status: 403 }
      );
    }

    const success = await essenceService.deleteEssence(id, userIdNum);

    if (!success) {
      return NextResponse.json(
        { error: "목표 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "목표가 성공적으로 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("목표 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
