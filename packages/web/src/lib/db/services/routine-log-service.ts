import { Database } from "@sqlite.org/sqlite-wasm";
import { getDatabase } from "../sqlite-client";

export interface RoutineLog {
  id?: number;
  routine_id: number;
  start_time?: string;
  end_time?: string;
  pause_time?: number;
  status?: string;
  mood_score?: number;
  emotion_emoji?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export class RoutineLogService {
  private db: Database | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.db = await getDatabase();
  }

  async createRoutineLog(log: RoutineLog): Promise<number | null> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      INSERT INTO routine_logs (
        routine_id, start_time, end_time, pause_time, status, mood_score, emotion_emoji, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.bind([
        log.routine_id,
        log.start_time || null,
        log.end_time || null,
        log.pause_time || 0,
        log.status || "pending",
        log.mood_score || null,
        log.emotion_emoji || null,
        log.notes || "",
      ]);

      stmt.step();
      try {
        const row = this.db.selectValue("SELECT last_insert_rowid()");
        return row ? Number(row) : null;
      } catch (error) {
        console.error("Failed to get last insert ID:", error);
        return null;
      }
    } finally {
      stmt.finalize();
    }
  }

  async getRoutineLogById(id: number): Promise<RoutineLog | null> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT *
      FROM routine_logs
      WHERE id = ?
    `);

    try {
      stmt.bind([id]);
      if (stmt.step()) {
        return this.rowToRoutineLog(stmt.get({}));
      }
      return null;
    } finally {
      stmt.finalize();
    }
  }

  async getRoutineLogsByRoutineId(routineId: number): Promise<RoutineLog[]> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT *
      FROM routine_logs
      WHERE routine_id = ?
      ORDER BY created_at DESC
    `);

    const logs: RoutineLog[] = [];

    try {
      stmt.bind([routineId]);
      while (stmt.step()) {
        logs.push(this.rowToRoutineLog(stmt.get({})));
      }
      return logs;
    } finally {
      stmt.finalize();
    }
  }

  async updateRoutineLog(log: RoutineLog): Promise<boolean> {
    if (!log.id) {
      throw new Error("로그 ID가 필요합니다");
    }

    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE routine_logs
      SET 
        start_time = ?, 
        end_time = ?, 
        pause_time = ?, 
        status = ?,
        mood_score = ?, 
        emotion_emoji = ?, 
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND routine_id = ?
    `);

    try {
      stmt.bind([
        log.start_time || null,
        log.end_time || null,
        log.pause_time || 0,
        log.status || "pending",
        log.mood_score || null,
        log.emotion_emoji || null,
        log.notes || "",
        log.id,
        log.routine_id,
      ]);

      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async updateRoutineLogStatus(
    id: number,
    routineId: number,
    status: string
  ): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE routine_logs
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND routine_id = ?
    `);

    try {
      stmt.bind([status, id, routineId]);
      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async completeRoutineLog(
    id: number,
    routineId: number,
    endTime: string,
    moodScore?: number,
    emotionEmoji?: string,
    notes?: string
  ): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE routine_logs
      SET 
        end_time = ?, 
        status = 'completed', 
        mood_score = ?, 
        emotion_emoji = ?, 
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND routine_id = ?
    `);

    try {
      stmt.bind([
        endTime,
        moodScore || null,
        emotionEmoji || null,
        notes || "",
        id,
        routineId,
      ]);

      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async deleteRoutineLog(id: number): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      DELETE FROM routine_logs
      WHERE id = ?
    `);

    try {
      stmt.bind([id]);
      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  private rowToRoutineLog(row: Record<string, unknown>): RoutineLog {
    return {
      id: row.id as number,
      routine_id: row.routine_id as number,
      start_time: row.start_time as string | undefined,
      end_time: row.end_time as string | undefined,
      pause_time: row.pause_time as number | undefined,
      status: row.status as string | undefined,
      mood_score: row.mood_score as number | undefined,
      emotion_emoji: row.emotion_emoji as string | undefined,
      notes: row.notes as string | undefined,
      created_at: row.created_at as string | undefined,
      updated_at: row.updated_at as string | undefined,
    };
  }
}
