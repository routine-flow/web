import { Database } from "@sqlite.org/sqlite-wasm";
import { getDatabase } from "../sqlite-client";

export interface Action {
  id?: number;
  milestone_id: number;
  title: string;
  description?: string;
  completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export class ActionService {
  private db: Database | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.db = await getDatabase();
  }

  async createAction(action: Action): Promise<number> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      INSERT INTO actions (milestone_id, title, description, completed)
      VALUES (?, ?, ?, ?)
    `);

    try {
      stmt.bind([
        action.milestone_id,
        action.title,
        action.description || "",
        action.completed ? 1 : 0,
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

  async getActionById(id: number): Promise<Action | null> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT id, milestone_id, title, description, completed, created_at, updated_at
      FROM actions
      WHERE id = ?
    `);

    try {
      stmt.bind([id]);
      if (stmt.step()) {
        return this.rowToAction(stmt.get({}));
      }
      return null;
    } finally {
      stmt.finalize();
    }
  }

  async getActionsByMilestoneId(milestoneId: number): Promise<Action[]> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT id, milestone_id, title, description, completed, created_at, updated_at
      FROM actions
      WHERE milestone_id = ?
      ORDER BY created_at DESC
    `);

    const actions: Action[] = [];

    try {
      stmt.bind([milestoneId]);
      while (stmt.step()) {
        actions.push(this.rowToAction(stmt.get({})));
      }
      return actions;
    } finally {
      stmt.finalize();
    }
  }

  async updateAction(action: Action): Promise<boolean> {
    if (!action.id) {
      throw new Error("액션 ID가 필요합니다");
    }

    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE actions
      SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND milestone_id = ?
    `);

    try {
      stmt.bind([
        action.title,
        action.description || "",
        action.completed ? 1 : 0,
        action.id,
        action.milestone_id,
      ]);

      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async toggleActionCompletion(
    id: number,
    milestoneId: number,
    completed: boolean
  ): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE actions
      SET completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND milestone_id = ?
    `);

    try {
      stmt.bind([completed ? 1 : 0, id, milestoneId]);
      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async deleteAction(id: number, milestoneId: number): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      DELETE FROM actions
      WHERE id = ? AND milestone_id = ?
    `);

    try {
      stmt.bind([id, milestoneId]);
      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  private rowToAction(row: Record<string, unknown>): Action {
    return {
      id: row.id as number,
      milestone_id: row.milestone_id as number,
      title: row.title as string,
      description: row.description as string,
      completed: Boolean(row.completed),
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  }
}
