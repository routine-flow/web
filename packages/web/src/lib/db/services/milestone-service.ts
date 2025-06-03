import { Database } from "@sqlite.org/sqlite-wasm";
import { getDatabase } from "../sqlite-client";

export interface Milestone {
  id?: number;
  essence_id: number;
  title: string;
  description?: string;
  completed?: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export class MilestoneService {
  private db: Database | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.db = await getDatabase();
  }

  async createMilestone(milestone: Milestone): Promise<number> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      INSERT INTO milestones (essence_id, title, description, completed, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.bind([
        milestone.essence_id,
        milestone.title,
        milestone.description || "",
        milestone.completed ? 1 : 0,
        milestone.start_date || null,
        milestone.end_date || null,
      ]);

      stmt.step();

      // 마지막 삽입된 ID 가져오기
      const query = this.db.prepare("SELECT last_insert_rowid()");
      query.step();
      const id = Number(query.get({})["last_insert_rowid()"]);
      query.finalize();

      return id;
    } finally {
      stmt.finalize();
    }
  }

  async getMilestoneById(id: number): Promise<Milestone | null> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT id, essence_id, title, description, completed, start_date, end_date, created_at, updated_at
      FROM milestones
      WHERE id = ?
    `);

    try {
      stmt.bind([id]);
      if (stmt.step()) {
        return this.rowToMilestone(stmt.get({}));
      }
      return null;
    } finally {
      stmt.finalize();
    }
  }

  async getMilestonesByEssenceId(essenceId: number): Promise<Milestone[]> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT id, essence_id, title, description, completed, start_date, end_date, created_at, updated_at
      FROM milestones
      WHERE essence_id = ?
      ORDER BY created_at ASC
    `);

    const milestones: Milestone[] = [];

    try {
      stmt.bind([essenceId]);
      while (stmt.step()) {
        milestones.push(this.rowToMilestone(stmt.get({})));
      }
      return milestones;
    } finally {
      stmt.finalize();
    }
  }

  async updateMilestone(milestone: Milestone): Promise<boolean> {
    if (!milestone.id) {
      throw new Error("마일스톤 ID가 필요합니다");
    }

    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE milestones
      SET title = ?, description = ?, completed = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND essence_id = ?
    `);

    try {
      stmt.bind([
        milestone.title,
        milestone.description || "",
        milestone.completed ? 1 : 0,
        milestone.start_date || null,
        milestone.end_date || null,
        milestone.id,
        milestone.essence_id,
      ]);

      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async toggleMilestoneCompletion(
    id: number,
    essenceId: number,
    completed: boolean
  ): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE milestones
      SET completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND essence_id = ?
    `);

    try {
      stmt.bind([completed ? 1 : 0, id, essenceId]);
      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async deleteMilestone(id: number, essenceId: number): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      DELETE FROM milestones
      WHERE id = ? AND essence_id = ?
    `);

    try {
      stmt.bind([id, essenceId]);
      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  private rowToMilestone(row: Record<string, unknown>): Milestone {
    return {
      id: row.id as number,
      essence_id: row.essence_id as number,
      title: row.title as string,
      description: row.description as string,
      completed: Boolean(row.completed),
      start_date: row.start_date as string,
      end_date: row.end_date as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  }
}
