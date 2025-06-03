import { NextRequest, NextResponse } from "next/server";
import { Routine, RoutineService } from "@/lib/db/services/routine-service";

const routineService = new RoutineService();

export async function GET(req: NextRequest) {
  try {
    // 요청 URL에서 사용자 ID 또는 목표 ID 파라미터 추출
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const essenceId = url.searchParams.get("essenceId");

    if (userId && !isNaN(parseInt(userId))) {
      // 사용자 ID로 루틴 조회
      const routines = await routineService.getRoutinesByUserId(
        parseInt(userId)
      );
      return NextResponse.json(routines);
    } else if (essenceId && !isNaN(parseInt(essenceId))) {
      // 목표 ID로 루틴 조회
      const routines = await routineService.getRoutinesByEssenceId(
        parseInt(essenceId)
      );
      return NextResponse.json(routines);
    } else {
      return NextResponse.json(
        { error: "유효한 사용자 ID 또는 목표 ID가 필요합니다." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("루틴 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const routineData = await req.json();

    // 필수 필드 검증
    if (!routineData.user_id || !routineData.title) {
      return NextResponse.json(
        { error: "사용자 ID와 제목이 필요합니다." },
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
      if (routineData.repeat_type === "weekly" && !routineData.repeat_days) {
        return NextResponse.json(
          { error: "주간 반복 루틴은 반복 요일(repeat_days)이 필요합니다." },
          { status: 400 }
        );
      }

      if (
        routineData.repeat_type === "monthly" &&
        !routineData.repeat_count_per_month
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
        !routineData.repeat_interval
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

    // 루틴 생성
    const routineId = await routineService.createRoutine(
      routineData as Routine
    );

    if (!routineId) {
      return NextResponse.json(
        { error: "루틴 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { id: routineId, message: "루틴이 성공적으로 생성되었습니다." },
      { status: 201 }
    );
  } catch (error) {
    console.error("루틴 생성 중 오류 발생:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
