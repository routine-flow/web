import { Database } from "@sqlite.org/sqlite-wasm";
import { getDatabase } from "../sqlite-client";

export interface User {
  id?: number;
  username: string;
  email: string;
  password_hash: string;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}

export class UserService {
  private db: Database | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.db = await getDatabase();
  }

  async createUser(user: User): Promise<number> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, timezone)
      VALUES (?, ?, ?, ?)
    `);

    try {
      stmt.bind([
        user.username,
        user.email,
        user.password_hash,
        user.timezone || "UTC",
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

  async getUserById(id: number): Promise<User | null> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, timezone, created_at, updated_at
      FROM users
      WHERE id = ?
    `);

    try {
      stmt.bind([id]);
      if (stmt.step()) {
        return this.rowToUser(stmt.get({}));
      }
      return null;
    } finally {
      stmt.finalize();
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      SELECT id, username, email, password_hash, timezone, created_at, updated_at
      FROM users
      WHERE email = ?
    `);

    try {
      stmt.bind([email]);
      if (stmt.step()) {
        return this.rowToUser(stmt.get({}));
      }
      return null;
    } finally {
      stmt.finalize();
    }
  }

  async updateUser(user: User): Promise<boolean> {
    if (!user.id) {
      throw new Error("사용자 ID가 필요합니다");
    }

    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      UPDATE users
      SET username = ?, email = ?, timezone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    try {
      stmt.bind([user.username, user.email, user.timezone || "UTC", user.id]);

      stmt.step();

      // 영향을 받은 행 수를 직접 확인
      const query = this.db.prepare("SELECT changes()");
      query.step();
      const changes = Number(query.get({})["changes()"]);
      query.finalize();

      return changes > 0;
    } finally {
      stmt.finalize();
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!this.db) {
      this.db = await getDatabase();
    }

    const stmt = this.db.prepare(`
      DELETE FROM users
      WHERE id = ?
    `);

    try {
      stmt.bind([id]);
      stmt.step();

      // 영향을 받은 행 수를 직접 확인
      const query = this.db.prepare("SELECT changes()");
      query.step();
      const changes = Number(query.get({})["changes()"]);
      query.finalize();

      return changes > 0;
    } finally {
      stmt.finalize();
    }
  }

  private rowToUser(row: Record<string, unknown>): User {
    return {
      id: row.id as number,
      username: row.username as string,
      email: row.email as string,
      password_hash: row.password_hash as string,
      timezone: row.timezone as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  }
}
