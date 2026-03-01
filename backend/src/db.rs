use rusqlite::Connection;

pub fn init_db() -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open("openclaw_console.db")?;

    // 平台配置表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS platforms (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            enabled INTEGER DEFAULT 0,
            config TEXT,
            created_at TEXT,
            updated_at TEXT
        )",
        [],
    )?;

    // 模型配置表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS models (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            provider TEXT NOT NULL,
            api_key TEXT,
            base_url TEXT,
            model_id TEXT,
            enabled INTEGER DEFAULT 1,
            created_at TEXT,
            updated_at TEXT
        )",
        [],
    )?;

    // Skills 表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            source TEXT,
            spec TEXT,
            version TEXT,
            installed INTEGER DEFAULT 0,
            enabled INTEGER DEFAULT 1,
            created_at TEXT,
            updated_at TEXT
        )",
        [],
    )?;

    // 系统配置表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TEXT
        )",
        [],
    )?;

    // 插入默认平台
    let default_platforms = vec!["feishu", "telegram", "qqbot", "ddingtalk", "wecom"];
    for platform in default_platforms {
        conn.execute(
            "INSERT OR IGNORE INTO platforms (name, enabled, created_at) VALUES (?1, 0, datetime('now'))",
            [platform],
        )?;
    }

    Ok(conn)
}
