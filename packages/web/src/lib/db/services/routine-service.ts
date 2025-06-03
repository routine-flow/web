import { Database } from "@sqlite.org/sqlite-wasm";
import { getDatabase } from "../sqlite-client";

export interface Routine {
  id?: number;
  user_id: number;
  essence_id?: number;
  title: string;
  description?: string;
  emoji?: string;
  scheduled_time?: string;
  duration?: number;
  repeat_type?: string;
  repeat_interval?: number;
  repeat_days?: string;
  repeat_count_per_month?: number;
  sort_order?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export class RoutineService {
  private db: Database | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.db = await getDatabase();
  }

  async createRoutine(routine: Routine): Promise<number | null> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      INSERT INTO routines (
        user_id, essence_id, title, description, emoji, 
        scheduled_time, duration, repeat_type, repeat_interval, 
        repeat_days, repeat_count_per_month, sort_order, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.bind([
        routine.user_id,
        routine.essence_id || null,
        routine.title,
        routine.description || "",
        routine.emoji || "",
        routine.scheduled_time || null,
        routine.duration || null,
        routine.repeat_type || "daily",
        routine.repeat_interval || null,
        routine.repeat_days || null,
        routine.repeat_count_per_month || null,
        routine.sort_order || 0,
        routine.status || "pending",
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

  async getRoutineById(id: number): Promise<Routine | null> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT *
      FROM routines
      WHERE id = ?
    `);

    try {
      stmt.bind([id]);
      if (stmt.step()) {
        return this.rowToRoutine(stmt.get({}));
      }
      return null;
    } finally {
      stmt.finalize();
    }
  }

  async getRoutinesByUserId(userId: number): Promise<Routine[]> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT *
      FROM routines
      WHERE user_id = ?
      ORDER BY sort_order ASC, created_at DESC
    `);

    const routines: Routine[] = [];

    try {
      stmt.bind([userId]);
      while (stmt.step()) {
        routines.push(this.rowToRoutine(stmt.get({})));
      }
      return routines;
    } finally {
      stmt.finalize();
    }
  }

  async getRoutinesByEssenceId(essenceId: number): Promise<Routine[]> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT *
      FROM routines
      WHERE essence_id = ?
      ORDER BY sort_order ASC, created_at DESC
    `);

    const routines: Routine[] = [];

    try {
      stmt.bind([essenceId]);
      while (stmt.step()) {
        routines.push(this.rowToRoutine(stmt.get({})));
      }
      return routines;
    } finally {
      stmt.finalize();
    }
  }

  async updateRoutine(routine: Routine): Promise<boolean> {
    if (!routine.id) {
      throw new Error("루틴 ID가 필요합니다");
    }

    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE routines
      SET 
        essence_id = ?, 
        title = ?, 
        description = ?, 
        emoji = ?,
        scheduled_time = ?, 
        duration = ?, 
        repeat_type = ?, 
        repeat_interval = ?,
        repeat_days = ?, 
        repeat_count_per_month = ?, 
        sort_order = ?, 
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    try {
      stmt.bind([
        routine.essence_id || null,
        routine.title,
        routine.description || "",
        routine.emoji || "",
        routine.scheduled_time || null,
        routine.duration || null,
        routine.repeat_type || "daily",
        routine.repeat_interval || null,
        routine.repeat_days || null,
        routine.repeat_count_per_month || null,
        routine.sort_order || 0,
        routine.status || "pending",
        routine.id,
        routine.user_id,
      ]);

      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async updateRoutineStatus(
    id: number,
    userId: number,
    status: string
  ): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE routines
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    try {
      stmt.bind([status, id, userId]);
      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async deleteRoutine(id: number, userId: number): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      DELETE FROM routines
      WHERE id = ? AND user_id = ?
    `);

    try {
      stmt.bind([id, userId]);
      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  private rowToRoutine(row: Record<string, unknown>): Routine {
    return {
      id: row.id as number,
      user_id: row.user_id as number,
      essence_id: row.essence_id as number | undefined,
      title: row.title as string,
      description: row.description as string | undefined,
      emoji: row.emoji as string | undefined,
      scheduled_time: row.scheduled_time as string | undefined,
      duration: row.duration as number | undefined,
      repeat_type: row.repeat_type as string | undefined,
      repeat_interval: row.repeat_interval as number | undefined,
      repeat_days: row.repeat_days as string | undefined,
      repeat_count_per_month: row.repeat_count_per_month as number | undefined,
      sort_order: row.sort_order as number | undefined,
      status: row.status as string | undefined,
      created_at: row.created_at as string | undefined,
      updated_at: row.updated_at as string | undefined,
    };
  }
}
