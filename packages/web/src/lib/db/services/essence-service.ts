import { Database } from "@sqlite.org/sqlite-wasm";
import { getDatabase } from "../sqlite-client";

export interface Essence {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export class EssenceService {
  private db: Database | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.db = await getDatabase();
  }

  async createEssence(essence: Essence): Promise<number> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      INSERT INTO essences (title, description, icon, color)
      VALUES (?, ?, ?, ?)
    `);

    try {
      stmt.bind([
        essence.title,
        essence.description || "",
        essence.icon || "",
        essence.color || "#3b82f6",
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

  async getEssenceById(id: number): Promise<Essence | null> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT id, title, description, icon, color, created_at, updated_at
      FROM essences
      WHERE id = ?
    `);

    try {
      stmt.bind([id]);
      if (stmt.step()) {
        return this.rowToEssence(stmt.get({}));
      }
      return null;
    } finally {
      stmt.finalize();
    }
  }

  async getAllEssences(): Promise<Essence[]> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT id, title, description, icon, color, created_at, updated_at
      FROM essences
      ORDER BY created_at DESC
    `);

    const essences: Essence[] = [];

    try {
      while (stmt.step()) {
        essences.push(this.rowToEssence(stmt.get({})));
      }
      return essences;
    } finally {
      stmt.finalize();
    }
  }

  async updateEssence(essence: Essence): Promise<boolean> {
    if (!essence.id) {
      throw new Error("에센스 ID가 필요합니다");
    }

    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE essences
      SET title = ?, description = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    try {
      stmt.bind([
        essence.title,
        essence.description || "",
        essence.icon || "",
        essence.color || "#3b82f6",
        essence.id,
      ]);

      stmt.step();
      return true;
    } finally {
      stmt.finalize();
    }
  }

  async deleteEssence(id: number): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      DELETE FROM essences
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

  private rowToEssence(row: Record<string, unknown>): Essence {
    return {
      id: row.id as number,
      title: row.title as string,
      description: row.description as string,
      icon: row.icon as string,
      color: row.color as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  }
}
