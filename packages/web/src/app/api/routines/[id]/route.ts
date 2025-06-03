import { NextRequest, NextResponse } from "next/server";
import { Routine, RoutineService } from "@/lib/db/services/routine-service";

const routineService = new RoutineService();

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
        { error: "유효하지 않은 루틴 ID입니다." },
        { status: 400 }
      );
    }

    const routine = await routineService.getRoutineById(id);

    if (!routine) {
      return NextResponse.json(
        { error: "루틴을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(routine);
  } catch (error) {
    console.error("루틴 조회 중 오류 발생:", error);
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
        { error: "유효하지 않은 루틴 ID입니다." },
        { status: 400 }
      );
    }

    // 기존 루틴 존재 여부 확인
    const existingRoutine = await routineService.getRoutineById(id);
    if (!existingRoutine) {
      return NextResponse.json(
        { error: "루틴을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const routineData = await req.json();

    // 사용자 ID는 변경 불가
    if (
      routineData.user_id &&
      routineData.user_id !== existingRoutine.user_id
    ) {
      return NextResponse.json(
        { error: "사용자 ID는 변경할 수 없습니다." },
        { status: 400 }
      );
    }

    // 루틴 타입 검증 (설정된 경우)
    if (routineData.repeat_type) {
      const validTypes = ["daily", "weekly", "monthly", "interval"];
      if (!validTypes.includes(routineData.repeat_type)) {
        return NextResponse.json(
          {
            error:
              "유효하지 않은 반복 타입입니다. 유효한 값: daily, weekly, monthly, interval",
          },
          { status: 400 }
        );
      }

      // 반복 유형에 따른 추가 검증
      if (
        routineData.repeat_type === "weekly" &&
        !routineData.repeat_days &&
        !existingRoutine.repeat_days
      ) {
        return NextResponse.json(
          { error: "주간 반복 루틴은 반복 요일(repeat_days)이 필요합니다." },
          { status: 400 }
        );
      }

      if (
        routineData.repeat_type === "monthly" &&
        !routineData.repeat_count_per_month &&
        !existingRoutine.repeat_count_per_month
      ) {
        return NextResponse.json(
          {
            error:
              "월간 반복 루틴은 월간 반복 횟수(repeat_count_per_month)가 필요합니다.",
          },
          { status: 400 }
        );
      }

      if (
        routineData.repeat_type === "interval" &&
        !routineData.repeat_interval &&
        !existingRoutine.repeat_interval
      ) {
        return NextResponse.json(
          {
            error: "간격 반복 루틴은 반복 간격(repeat_interval)이 필요합니다.",
          },
          { status: 400 }
        );
      }
    }

    // 루틴 상태 검증 (설정된 경우)
    if (routineData.status) {
      const validStatuses = [
        "pending",
        "in_progress",
        "paused",
        "completed",
        "skipped",
      ];
      if (!validStatuses.includes(routineData.status)) {
        return NextResponse.json(
          {
            error:
              "유효하지 않은 상태입니다. 유효한 값: pending, in_progress, paused, completed, skipped",
          },
          { status: 400 }
        );
      }
    }

    // 루틴 데이터 업데이트
    const updatedRoutine: Routine = {
      ...existingRoutine,
      ...routineData,
      id,
      user_id: existingRoutine.user_id, // 사용자 ID는 항상 원래 값 유지
    };

    const success = await routineService.updateRoutine(updatedRoutine);

    if (!success) {
      return NextResponse.json(
        { error: "루틴 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "루틴이 성공적으로 업데이트되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("루틴 업데이트 중 오류 발생:", error);
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
        { error: "유효하지 않은 루틴 ID입니다." },
        { status: 400 }
      );
    }

    // 기존 루틴 존재 여부 확인
    const existingRoutine = await routineService.getRoutineById(id);
    if (!existingRoutine) {
      return NextResponse.json(
        { error: "루틴을 찾을 수 없습니다." },
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

    if (existingRoutine.user_id !== userIdNum) {
      return NextResponse.json(
        { error: "해당 루틴을 삭제할 권한이 없습니다." },
        { status: 403 }
      );
    }

    const success = await routineService.deleteRoutine(id, userIdNum);

    if (!success) {
      return NextResponse.json(
        { error: "루틴 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "루틴이 성공적으로 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("루틴 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
