import { Database } from "@sqlite.org/sqlite-wasm";

let db: Database | null = null;
let isInitializing = false;
let initPromise: Promise<Database> | null = null;

export async function initializeDatabase(): Promise<Database> {
  if (db) return db;

  if (initPromise) return initPromise;

  isInitializing = true;

  initPromise = new Promise(async (resolve, reject) => {
    try {
      // SQLite WASM 모듈을 동적으로 불러옵니다
      const sqliteModule = await import("@sqlite.org/sqlite-wasm");

      // SQLite 모듈 초기화
      const sqlite3 = await sqliteModule.default();

      // 데이터베이스 생성 - Origin Private File System을 사용하는 경우
      try {
        // 기존 데이터베이스가 있으면 사용
        const database = new sqlite3.oo1.OpfsDb("routine-flow.db");

        // 전역 변수에 할당
        db = database;
      } catch {
        // 데이터베이스가 없으면 메모리에 생성
        console.log(
          "OPFS 데이터베이스를 생성할 수 없습니다. 메모리 DB를 사용합니다."
        );
        const database = new sqlite3.oo1.DB();

        // 전역 변수에 할당
        db = database;
      }

      // 테이블 생성
      if (db) {
        await createTables(db);
      } else {
        throw new Error("데이터베이스 초기화 실패");
      }

      console.log("SQLite 데이터베이스가 성공적으로 초기화되었습니다.");
      isInitializing = false;
      resolve(db);
    } catch (error) {
      console.error("SQLite 데이터베이스 초기화 실패:", error);
      isInitializing = false;
      reject(error);
    }
  });

  return initPromise;
}

export async function getDatabase(): Promise<Database> {
  if (!db && !isInitializing) {
    return initializeDatabase();
  } else if (isInitializing && initPromise) {
    return initPromise;
  }
  if (!db) {
    throw new Error("데이터베이스가 초기화되지 않았습니다.");
  }
  return db;
}

async function createTables(database: Database): Promise<void> {
  try {
    // Users 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        timezone TEXT DEFAULT 'UTC',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Essences (목표) 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS essences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        target_value REAL NOT NULL DEFAULT 0,
        current_value REAL NOT NULL DEFAULT 0,
        deadline TIMESTAMP,
        color TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Milestones (중간목표) 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS milestones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        essence_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        target_value REAL NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        deadline TIMESTAMP,
        color TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (essence_id) REFERENCES essences(id)
      );
    `);

    // Routines (루틴) 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        essence_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        emoji TEXT,
        scheduled_time TIME,
        duration INTEGER,
        repeat_type TEXT,
        repeat_interval INTEGER,
        repeat_days TEXT,
        repeat_count_per_month INTEGER,
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (essence_id) REFERENCES essences(id)
      );
    `);

    // Todos (투두) 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id INTEGER,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status TEXT DEFAULT 'pending',
        FOREIGN KEY (routine_id) REFERENCES routines(id)
      );
    `);

    // RoutineLogs (루틴 로그) 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS routine_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id INTEGER NOT NULL,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        pause_time INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        mood_score INTEGER,
        emotion_emoji TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (routine_id) REFERENCES routines(id)
      );
    `);

    console.log("모든 테이블이 성공적으로 생성되었습니다.");
  } catch (error) {
    console.error("테이블 생성 중 오류 발생:", error);
    throw error;
  }
}

// 데이터베이스 종료
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    initPromise = null;
    isInitializing = false;
    console.log("SQLite 데이터베이스가 종료되었습니다.");
  }
}
