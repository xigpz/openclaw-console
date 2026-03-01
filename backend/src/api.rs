use axum::{
    extract::{Path, State},
    Json,
};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use futures_util::Stream;
use std::process::Command;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
}

impl AppState {
    pub fn new(db: Connection) -> Self {
        Self {
            db: Arc::new(Mutex::new(db)),
        }
    }
}

// ============ 通用类型 ============

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: T,
    pub message: String,
}

fn ok_response<T: Serialize>(data: T) -> Json<ApiResponse<T>> {
    Json(ApiResponse {
        success: true,
        data,
        message: "ok".to_string(),
    })
}

fn err_response<T: Serialize + Default>(msg: &str) -> Json<ApiResponse<T>> {
    Json(ApiResponse {
        success: false,
        data: T::default(),
        message: msg.to_string(),
    })
}

// ============ 健康检查 ============

pub async fn health() -> Json<ApiResponse<String>> {
    ok_response("OpenClaw Console is running".to_string())
}

// ============ 记忆管理 ============

#[derive(Deserialize)]
pub struct RememberReq {
    pub role: String,
    pub content: String,
}

pub async fn remember(Json(req): Json<RememberReq>) -> Json<ApiResponse<String>> {
    crate::memory::remember(&req.role, &req.content);
    ok_response("ok".to_string())
}

#[derive(Deserialize)]
pub struct KeyPointReq {
    pub key: String,
    pub value: String,
}

pub async fn remember_keypoint(Json(req): Json<KeyPointReq>) -> Json<ApiResponse<String>> {
    crate::memory::remember_keypoint(&req.key, &req.value);
    ok_response("ok".to_string())
}

pub async fn compress_memory() -> Json<ApiResponse<String>> {
    crate::memory::compress_memory();
    ok_response("ok".to_string())
}

pub async fn read_memory() -> Json<ApiResponse<String>> {
    let content = crate::memory::read_memory();
    ok_response(content)
}

// ============ 平台配置 ============

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Platform {
    pub id: Option<i64>,
    pub name: String,
    pub enabled: bool,
    pub config: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SavePlatformReq {
    pub name: String,
    pub enabled: bool,
    pub config: Option<String>,
}

pub async fn list_platforms(State(state): State<AppState>) -> Json<ApiResponse<Vec<Platform>>> {
    let db = state.db.lock().unwrap();
    let mut stmt = db
        .prepare("SELECT id, name, enabled, config FROM platforms ORDER BY id")
        .unwrap();
    let platforms: Vec<Platform> = stmt
        .query_map([], |row| {
            Ok(Platform {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                enabled: row.get::<_, i32>(2)? == 1,
                config: row.get(3).ok(),
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();
    ok_response(platforms)
}

pub async fn get_platform(
    State(state): State<AppState>,
    Path(name): Path<String>,
) -> Json<ApiResponse<Option<Platform>>> {
    let db = state.db.lock().unwrap();
    let result = db.query_row(
        "SELECT id, name, enabled, config FROM platforms WHERE name = ?1",
        [&name],
        |row| {
            Ok(Platform {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                enabled: row.get::<_, i32>(2)? == 1,
                config: row.get(3).ok(),
            })
        },
    );
    match result {
        Ok(p) => ok_response(Some(p)),
        Err(_) => ok_response(None),
    }
}

pub async fn save_platform(
    State(state): State<AppState>,
    Json(req): Json<SavePlatformReq>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().unwrap();
    let now = chrono::Utc::now().to_rfc3339();
    let config = req.config.unwrap_or_default();
    
    match db.execute(
        "INSERT OR REPLACE INTO platforms (name, enabled, config, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)",
        rusqlite::params![req.name, req.enabled as i32, config, now],
    ) {
        Ok(_) => ok_response("ok".to_string()),
        Err(e) => err_response(&format!("保存失败: {}", e)),
    }
}

pub async fn toggle_platform(
    State(state): State<AppState>,
    Path(name): Path<String>,
) -> Json<ApiResponse<bool>> {
    let db = state.db.lock().unwrap();
    let now = chrono::Utc::now().to_rfc3339();
    
    let current: i32 = db
        .query_row(
            "SELECT enabled FROM platforms WHERE name = ?1",
            [&name],
            |row| row.get(0),
        )
        .unwrap_or(0);
    
    let new_enabled = if current == 1 { 0 } else { 1 };
    
    match db.execute(
        "UPDATE platforms SET enabled = ?1, updated_at = ?2 WHERE name = ?3",
        rusqlite::params![new_enabled, now, name],
    ) {
        Ok(_) => ok_response(new_enabled == 1),
        Err(e) => err_response(&format!("切换失败: {}", e)),
    }
}

// ============ 模型配置 ============

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Model {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub model_id: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Deserialize)]
pub struct SaveModelReq {
    pub name: String,
    pub provider: String,
    pub api_key: Option<String>,
    pub base_url: Option<String>,
    pub model_id: Option<String>,
    pub enabled: Option<bool>,
}

pub async fn list_models(State(state): State<AppState>) -> Json<ApiResponse<Vec<Model>>> {
    let db = state.db.lock().unwrap();
    let mut stmt = db
        .prepare("SELECT id, name, provider, api_key, base_url, model_id, enabled FROM models ORDER BY name")
        .unwrap();
    let models: Vec<Model> = stmt
        .query_map([], |row| {
            let mut api_key: Option<String> = row.get(3).ok();
            // 从环境变量读取API Key
            if let Ok(env_key) = std::env::var("OPENCLAW_MINIMAX_API_KEY") {
                if !env_key.is_empty() {
                    api_key = Some(env_key);
                }
            }
            Ok(Model {
                id: row.get(0)?,
                name: row.get(1)?,
                provider: row.get(2)?,
                api_key,
                base_url: row.get(4).ok(),
                model_id: row.get(5).ok(),
                enabled: row.get::<_, i32>(6)? == 1,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();
    ok_response(models)
}

pub async fn get_model(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Json<ApiResponse<Option<Model>>> {
    let db = state.db.lock().unwrap();
    let result = db.query_row(
        "SELECT id, name, provider, api_key, base_url, model_id, enabled FROM models WHERE id = ?1",
        [&id],
        |row| {
            Ok(Model {
                id: row.get(0)?,
                name: row.get(1)?,
                provider: row.get(2)?,
                api_key: row.get(3).ok(),
                base_url: row.get(4).ok(),
                model_id: row.get(5).ok(),
                enabled: row.get::<_, i32>(6)? == 1,
            })
        },
    );
    match result {
        Ok(m) => ok_response(Some(m)),
        Err(_) => ok_response(None),
    }
}

pub async fn save_model(
    State(state): State<AppState>,
    Json(req): Json<SaveModelReq>,
) -> Json<ApiResponse<Model>> {
    let db = state.db.lock().unwrap();
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();
    let enabled = req.enabled.unwrap_or(true);

    match db.execute(
        "INSERT INTO models (id, name, provider, api_key, base_url, model_id, enabled, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        rusqlite::params![id, req.name, req.provider, req.api_key, req.base_url, req.model_id, enabled as i32, now, now],
    ) {
        Ok(_) => ok_response(Model {
            id,
            name: req.name,
            provider: req.provider,
            api_key: req.api_key,
            base_url: req.base_url,
            model_id: req.model_id,
            enabled,
        }),
        Err(e) => err_response(&format!("保存失败: {}", e)),
    }
}

pub async fn delete_model(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().unwrap();
    match db.execute("DELETE FROM models WHERE id = ?1", [&id]) {
        Ok(_) => ok_response("ok".to_string()),
        Err(e) => err_response(&format!("删除失败: {}", e)),
    }
}

// ============ Skills ============

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Skill {
    pub id: i64,
    pub name: String,
    pub source: Option<String>,
    pub spec: Option<String>,
    pub version: Option<String>,
    pub installed: bool,
    pub enabled: bool,
}

pub async fn list_skills(State(state): State<AppState>) -> Json<ApiResponse<Vec<Skill>>> {
    let db = state.db.lock().unwrap();
    let mut stmt = db
        .prepare("SELECT id, name, source, spec, version, installed, enabled FROM skills ORDER BY name")
        .unwrap();
    let skills: Vec<Skill> = stmt
        .query_map([], |row| {
            Ok(Skill {
                id: row.get(0)?,
                name: row.get(1)?,
                source: row.get(2).ok(),
                spec: row.get(3).ok(),
                version: row.get(4).ok(),
                installed: row.get::<_, i32>(5)? == 1,
                enabled: row.get::<_, i32>(6)? == 1,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();
    ok_response(skills)
}

#[derive(Debug, Deserialize)]
pub struct InstallSkillReq {
    pub name: String,
    pub source: Option<String>,
    pub spec: Option<String>,
}

pub async fn install_skill(
    State(state): State<AppState>,
    Json(req): Json<InstallSkillReq>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().unwrap();
    let now = chrono::Utc::now().to_rfc3339();
    let source = req.source.unwrap_or_else(|| "npm".to_string());

    match db.execute(
        "INSERT OR REPLACE INTO skills (name, source, spec, installed, enabled, created_at, updated_at) VALUES (?1, ?2, ?3, 1, 1, ?4, ?4)",
        rusqlite::params![req.name, source, req.spec.unwrap_or_else(|| "".to_string()), now],
    ) {
        Ok(_) => ok_response("ok".to_string()),
        Err(e) => err_response(&format!("安装失败: {}", e)),
    }
}

pub async fn uninstall_skill(
    State(state): State<AppState>,
    Path(name): Path<String>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().unwrap();
    match db.execute(
        "UPDATE skills SET installed = 0, enabled = 0 WHERE name = ?1",
        [&name],
    ) {
        Ok(_) => ok_response("ok".to_string()),
        Err(e) => err_response(&format!("卸载失败: {}", e)),
    }
}

// ============ 系统配置 ============

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct ConfigItem {
    pub key: String,
    pub value: String,
}

pub async fn get_config(State(state): State<AppState>) -> Json<ApiResponse<Vec<ConfigItem>>> {
    let db = state.db.lock().unwrap();
    let mut stmt = db
        .prepare("SELECT key, value FROM config ORDER BY key")
        .unwrap();
    let config: Vec<ConfigItem> = stmt
        .query_map([], |row| {
            Ok(ConfigItem {
                key: row.get(0)?,
                value: row.get(1)?,
            })
        })
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();
    ok_response(config)
}

#[derive(Debug, Deserialize)]
pub struct SaveConfigReq {
    pub key: String,
    pub value: String,
}

pub async fn save_config(
    State(state): State<AppState>,
    Json(req): Json<SaveConfigReq>,
) -> Json<ApiResponse<String>> {
    let db = state.db.lock().unwrap();
    let now = chrono::Utc::now().to_rfc3339();
    
    match db.execute(
        "INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?1, ?2, ?3)",
        rusqlite::params![req.key, req.value, now],
    ) {
        Ok(_) => ok_response("ok".to_string()),
        Err(e) => err_response(&format!("保存失败: {}", e)),
    }
}

// ============ Gateway 管理 ============

#[derive(Serialize)]
pub struct GatewayStatus {
    pub running: bool,
    pub pid: Option<u32>,
    pub uptime: Option<String>,
}

pub async fn gateway_status() -> Json<ApiResponse<GatewayStatus>> {
    // 检查 gateway 进程是否在运行
    let output = Command::new("pgrep")
        .args(["-f", "openclaw"])
        .output();
    
    let running = match output {
        Ok(o) => !o.stdout.is_empty(),
        Err(_) => false,
    };
    
    ok_response(GatewayStatus {
        running,
        pid: None,
        uptime: None,
    })
}

pub async fn gateway_restart() -> Json<ApiResponse<String>> {
    // 执行 openclaw gateway restart
    let output = Command::new("openclaw")
        .args(["gateway", "restart"])
        .output();
    
    match output {
        Ok(o) if o.status.success() => {
            ok_response("Gateway 重启成功".to_string())
        }
        Ok(o) => {
            let msg = String::from_utf8_lossy(&o.stderr);
            err_response(&format!("重启失败: {}", msg))
        }
        Err(e) => {
            err_response(&format!("执行失败: {}", e))
        }
    }
}

// ============ OpenClaw 更新 ============

#[derive(Serialize)]
pub struct VersionInfo {
    pub current: String,
    pub latest: String,
    pub update_available: bool,
}

pub async fn openclaw_version() -> Json<ApiResponse<VersionInfo>> {
    // 获取当前版本
    let current = Command::new("openclaw")
        .arg("--version")
        .output();
    
    let current_version = match current {
        Ok(o) if o.status.success() => {
            String::from_utf8_lossy(&o.stdout).trim().to_string()
        }
        _ => "未知".to_string(),
    };
    
    // 检查最新版本 (通过 npm 检查)
    let latest = Command::new("npm")
        .args(["view", "openclaw", "version"])
        .output();
    
    let latest_version = match latest {
        Ok(o) if o.status.success() => {
            String::from_utf8_lossy(&o.stdout).trim().to_string()
        }
        _ => "未知".to_string(),
    };
    
    let update_available = current_version != latest_version && latest_version != "未知";
    
    ok_response(VersionInfo {
        current: current_version,
        latest: latest_version,
        update_available,
    })
}

pub async fn openclaw_update() -> Json<ApiResponse<String>> {
    // 执行更新
    let output = Command::new("openclaw")
        .arg("update")
        .output();
    
    match output {
        Ok(o) if o.status.success() => {
            let msg = String::from_utf8_lossy(&o.stdout);
            ok_response(format!("更新成功: {}", msg))
        }
        Ok(o) => {
            let msg = String::from_utf8_lossy(&o.stderr);
            err_response(&format!("更新失败: {}", msg))
        }
        Err(e) => {
            err_response(&format!("执行更新失败: {}", e))
        }
    }
}

pub async fn get_logs() -> Json<ApiResponse<Vec<String>>> {
    let mut logs: Vec<String> = Vec::new();
    let session_file = "/root/.openclaw/agents/main/sessions/5808c42e-c301-469d-9a65-9ffc506090b2.jsonl";
    if let Ok(content) = std::fs::read_to_string(session_file) {
        for line in content.lines().rev().take(100) {
            if !line.is_empty() {
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
                    if json.get("type").and_then(|v| v.as_str()).unwrap_or("") == "message" {
                        if let Some(msg_obj) = json.get("message").and_then(|v| v.as_object()) {
                            let role = msg_obj.get("role").and_then(|v| v.as_str()).unwrap_or("");
                            if let Some(content_arr) = msg_obj.get("content").and_then(|v| v.as_array()) {
                                for item in content_arr {
                                    if let Some(text) = item.get("text").and_then(|v| v.as_str()) {
                                        let ts_raw = json.get("timestamp").and_then(|v| v.as_str()).unwrap_or("");
                                        let ts = if let Ok(dt) = chrono::DateTime::parse_from_rfc3339(ts_raw) {
                                            let cst = dt.with_timezone(&chrono::FixedOffset::east(8 * 3600));
                                            cst.format("%Y-%m-%d %H:%M:%S").to_string()
                                        } else {
                                            ts_raw[..19].replace("T", " ").to_string()
                                        };
                                        logs.push(format!("[{}] {}: {}", ts, role, text.chars().take(150).collect::<String>()));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    logs.reverse();
    ok_response(logs)
}

pub async fn backup_config() -> Json<ApiResponse<String>> {
    let config_path = "/root/.openclaw/openclaw.json";
    let db_path = "/root/.openclaw/workspace/openclaw-console/backend/openclaw_console.db";
    
    let mut backup = serde_json::json!({
        "version": "1.0",
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "config": {},
        "database": {}
    });
    
    // 读取config
    if let Ok(content) = std::fs::read_to_string(config_path) {
        if let Ok(v) = serde_json::from_str(&content) {
            backup["config"] = v;
        }
    }
    
    // 读取数据库
    if let Ok(content) = std::fs::read_to_string(db_path) {
        backup["database"] = serde_json::json!(content);
    }
    
    let filename = format!("openclaw-backup-{}.json", chrono::Utc::now().format("%Y%m%d-%H%M%S"));
    if std::fs::write(&filename, backup.to_string()).is_ok() {
        ok_response(filename)
    } else {
        err_response("备份失败")
    }
}

pub async fn get_system_status() -> Json<ApiResponse<serde_json::Value>> {
    let mut status = serde_json::json!({});
    
    // CPU
    if let Ok(content) = std::fs::read_to_string("/proc/stat") {
        if let Some(line) = content.lines().next() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() > 4 {
                let total: u64 = parts[1..].iter().filter_map(|s| s.parse::<u64>().ok()).sum();
                let idle: u64 = parts[4].parse().unwrap_or(0);
                if total > 0 {
                    let cpu = (100.0 * (total - idle) as f64 / total as f64) as u32;
                    status["cpu_percent"] = serde_json::json!(cpu);
                }
            }
        }
    }
    
    // Load average
    if let Ok(content) = std::fs::read_to_string("/proc/loadavg") {
        let parts: Vec<&str> = content.split_whitespace().collect();
        if parts.len() >= 3 {
            status["load_avg"] = serde_json::json!({"1min": parts[0], "5min": parts[1], "15min": parts[2]});
        }
    }
    
    // 内存
    let mut total_mb = 0u64;
    let mut avail_mb = 0u64;
    if let Ok(content) = std::fs::read_to_string("/proc/meminfo") {
        for line in content.lines() {
            if line.starts_with("MemTotal:") {
                total_mb = line.split_whitespace().nth(1).and_then(|s| s.parse::<u64>().ok()).unwrap_or(0) / 1024;
            }
            if line.starts_with("MemAvailable:") {
                avail_mb = line.split_whitespace().nth(1).and_then(|s| s.parse::<u64>().ok()).unwrap_or(0) / 1024;
            }
        }
    }
    if total_mb > 0 {
        let used_mb = total_mb - avail_mb;
        status["memory"] = serde_json::json!({"total_mb": total_mb, "used_mb": used_mb, "free_mb": avail_mb, "percent": (used_mb * 100) / total_mb});
    }
    
    // 磁盘
    if let Ok(output) = std::process::Command::new("df").arg("-h").arg("/").output() {
        let output_str = String::from_utf8_lossy(&output.stdout);
        for line in output_str.lines().skip(1) {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 6 {
                status["disk"] = serde_json::json!({"total": parts[1], "used": parts[2], "available": parts[3], "percent": parts[4]});
            }
        }
    }
    
    // 运行时间
    if let Ok(content) = std::fs::read_to_string("/proc/uptime") {
        let secs = content.split_whitespace().next().and_then(|s| s.parse::<f64>().ok()).unwrap_or(0.0);
        let days = (secs / 86400.0) as u32;
        let hours = ((secs % 86400.0) / 3600.0) as u32;
        let mins = ((secs % 3600.0) / 60.0) as u32;
        status["uptime"] = serde_json::json!(format!("{}天{}小时{}分", days, hours, mins));
    }
    
    ok_response(status)
}

#[derive(Serialize, Deserialize)]
pub struct AgentData {
    pub identity: Option<serde_json::Value>,
    pub user: Option<serde_json::Value>,
}

pub async fn get_agent() -> Json<ApiResponse<AgentData>> {
    let identity_path = "/root/.openclaw/workspace/IDENTITY.md";
    let user_path = "/root/.openclaw/workspace/USER.md";
    
    let mut identity = serde_json::json!({});
    let mut user = serde_json::json!({});
    
    // 解析IDENTITY.md
    if let Ok(content) = std::fs::read_to_string(identity_path) {
        for line in content.lines() {
            if line.starts_with("- **Name:**") {
                identity["name"] = serde_json::json!(line.split(":").nth(1).unwrap_or("").trim());
            }
            if line.starts_with("- **Creature:**") {
                identity["creature"] = serde_json::json!(line.split(":").nth(1).unwrap_or("").trim());
            }
            if line.starts_with("- **Vibe:**") {
                identity["vibe"] = serde_json::json!(line.split(":").nth(1).unwrap_or("").trim());
            }
            if line.starts_with("- **Emoji:**") {
                identity["emoji"] = serde_json::json!(line.split(":").nth(1).unwrap_or("").trim());
            }
        }
    }
    
    // 解析USER.md
    if let Ok(content) = std::fs::read_to_string(user_path) {
        for line in content.lines() {
            if line.starts_with("- **Name:**") {
                user["name"] = serde_json::json!(line.split(":").nth(1).unwrap_or("").trim());
            }
            if line.starts_with("- **What to call them:**") {
                user["call_as"] = serde_json::json!(line.split(":").nth(1).unwrap_or("").trim());
            }
            if line.starts_with("- **Timezone:**") {
                user["timezone"] = serde_json::json!(line.split(":").nth(1).unwrap_or("").trim());
            }
        }
    }
    
    ok_response(AgentData { identity: Some(identity), user: Some(user) })
}

pub async fn save_agent(
    Json(req): Json<serde_json::Value>,
) -> Json<ApiResponse<String>> {
    // 保存到文件
    if let Some(identity) = req.get("identity") {
        let mut content = String::new();
        content.push_str("# IDENTITY.md - Who Am I?\n\n");
        content.push_str("_(Fill this in during your first conversation. Make it yours.)_\n\n");
        content.push_str("- **Name:** ");
        if let Some(v) = identity.get("name").and_then(|v| v.as_str()) { content.push_str(v); }
        content.push_str("\n- **Creature:** ");
        if let Some(v) = identity.get("creature").and_then(|v| v.as_str()) { content.push_str(v); }
        content.push_str("\n- **Vibe:** ");
        if let Some(v) = identity.get("vibe").and_then(|v| v.as_str()) { content.push_str(v); }
        content.push_str("\n- **Emoji:** ");
        if let Some(v) = identity.get("emoji").and_then(|v| v.as_str()) { content.push_str(v); }
        content.push_str("\n\n---\n\n");
        content.push_str("Notes:\n\n");
        content.push_str("- Save this file at the workspace root as `IDENTITY.md`.\n");
        
        let _ = std::fs::write("/root/.openclaw/workspace/IDENTITY.md", content);
    }
    
    if let Some(user) = req.get("user") {
        let mut content = String::new();
        content.push_str("# USER.md - About Your Human\n\n");
        content.push_str("_(Learn about the person you're helping. Update this as you go.)_\n\n");
        content.push_str("- **Name:** ");
        if let Some(v) = user.get("name").and_then(|v| v.as_str()) { content.push_str(v); }
        content.push_str("\n- **What to call them:** ");
        if let Some(v) = user.get("call_as").and_then(|v| v.as_str()) { content.push_str(v); }
        content.push_str("\n- **Pronouns:** _(optional)_\n- **Timezone:** ");
        if let Some(v) = user.get("timezone").and_then(|v| v.as_str()) { content.push_str(v); }
        content.push_str("\n- **Notes:**\n\n## Context\n\n_(What do they care about? What projects are they working on? What annoys them? What makes them laugh? Build this over time.)_\n\n---\n\n");
        
        let _ = std::fs::write("/root/.openclaw/workspace/USER.md", content);
    }
    
    ok_response("保存成功".to_string())
}

pub async fn get_cron_logs() -> Json<ApiResponse<Vec<String>>> {
    let cron_dir = "/root/.openclaw/cron";
    let mut logs: Vec<String> = Vec::new();
    
    if let Ok(entries) = std::fs::read_dir(cron_dir) {
        for entry in entries.flatten() {
            if let Ok(content) = std::fs::read_to_string(entry.path()) {
                for line in content.lines().rev().take(20) {
                    if !line.is_empty() {
                        logs.push(line.to_string());
                    }
                }
            }
        }
    }
    
    logs.reverse();
    ok_response(logs)
}

pub async fn get_full_config() -> Json<ApiResponse<serde_json::Value>> {
    let config_path = "/root/.openclaw/openclaw.json";
    
    if let Ok(content) = std::fs::read_to_string(config_path) {
        if let Ok(json) = serde_json::from_str(&content) {
            return ok_response(json);
        }
    }
    
    err_response("无法读取配置")
}

pub async fn list_cron() -> Json<ApiResponse<Vec<serde_json::Value>>> {
    let cron_file = "/root/.openclaw/cron/jobs.json";
    let mut jobs: Vec<serde_json::Value> = Vec::new();
    
    if let Ok(content) = std::fs::read_to_string(cron_file) {
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(arr) = json.get("jobs").and_then(|v| v.as_array()) {
                jobs = arr.clone();
            }
        }
    }
    
    ok_response(jobs)
}


// Sessions API
pub async fn list_sessions() -> Result<Json<serde_json::Value>, String> {
    let sessions_dir = std::path::Path::new("/root/.openclaw/agents/main/sessions");
    let mut sessions = Vec::new();
    
    if let Ok(entries) = std::fs::read_dir(sessions_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("jsonl") {
                let id = path.file_stem().and_then(|s| s.to_str()).unwrap_or("");
                if let Ok(content) = std::fs::read_to_string(&path) {
                    let lines: Vec<&str> = content.lines().collect();
                    let mut preview = String::new();
                    if let Some(last) = lines.last() {
                        if let Ok(v) = serde_json::from_str::<serde_json::Value>(last) {
                            if let Some(msg) = v.get("message") {
                                if let Some(c) = msg.get("content") {
                                    if let Some(arr) = c.as_array() {
                                        for item in arr {
                                            if let Some(t) = item.get("type").and_then(|x| x.as_str()) {
                                                if t == "text" {
                                                    if let Some(text) = item.get("text").and_then(|x| x.as_str()) {
                                                        preview = text.chars().take(50).collect();
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    let metadata = std::fs::metadata(&path).ok();
                    let updated = metadata.and_then(|m| m.modified().ok())
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_secs())
                        .unwrap_or(0);
                    
                    sessions.push(serde_json::json!({
                        "id": id,
                        "updated": updated,
                        "message_count": lines.len(),
                        "preview": preview
                    }));
                }
            }
        }
    }
    
    sessions.sort_by(|a, b| b["updated"].as_u64().unwrap_or(0).cmp(&a["updated"].as_u64().unwrap_or(0)));
    
    Ok(Json(serde_json::json!({ "success": true, "sessions": sessions })))
}

pub async fn get_session(Path(id): Path<String>) -> Result<Json<serde_json::Value>, String> {
    let path = format!("/root/.openclaw/agents/main/sessions/{}.jsonl", id);
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    
    let messages: Vec<serde_json::Value> = content
        .lines()
        .filter_map(|l| serde_json::from_str::<serde_json::Value>(l).ok())
        .collect();
    
    Ok(Json(serde_json::json!({ "success": true, "messages": messages })))
}

pub async fn delete_session(Path(id): Path<String>) -> Result<Json<serde_json::Value>, String> {
    let path = format!("/root/.openclaw/agents/main/sessions/{}.jsonl", id);
    std::fs::remove_file(&path).map_err(|e| e.to_string())?;
    Ok(Json(serde_json::json!({ "success": true })))
}


// Stats API - 使用统计
pub async fn get_stats() -> Result<Json<serde_json::Value>, String> {
    let sessions_dir = std::path::Path::new("/root/.openclaw/agents/main/sessions");
    let mut total_messages = 0u64;
    let mut total_input = 0u64;
    let mut total_output = 0u64;
    let mut total_cache_read = 0u64;
    let mut total_cache_write = 0u64;
    let mut session_count = 0u64;
    
    if let Ok(entries) = std::fs::read_dir(sessions_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("jsonl") {
                session_count += 1;
                if let Ok(content) = std::fs::read_to_string(&path) {
                    for line in content.lines() {
                        if let Ok(v) = serde_json::from_str::<serde_json::Value>(line) {
                            // 只统计 assistant 消息
                            if let Some(msg) = v.get("message") {
                                if let Some(role) = msg.get("role").and_then(|r| r.as_str()) {
                                    if role == "assistant" {
                                        total_messages += 1;
                                        if let Some(usage) = msg.get("usage") {
                                            total_input += usage.get("input").and_then(|v| v.as_u64()).unwrap_or(0);
                                            total_output += usage.get("output").and_then(|v| v.as_u64()).unwrap_or(0);
                                            total_cache_read += usage.get("cacheRead").and_then(|v| v.as_u64()).unwrap_or(0);
                                            total_cache_write += usage.get("cacheWrite").and_then(|v| v.as_u64()).unwrap_or(0);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 计算成本 (CNY per 1M tokens)
    let input_cost = (total_input as f64) / 1_000_000.0 * 1.0;
    let output_cost = (total_output as f64) / 1_000_000.0 * 1.0;
    let cache_read_cost = (total_cache_read as f64) / 1_000_000.0 * 0.1;
    let cache_write_cost = (total_cache_write as f64) / 1_000_000.0 * 0.1;
    let total_cost = input_cost + output_cost + cache_read_cost + cache_write_cost;
    
    let stats = serde_json::json!({
        "totalMessages": total_messages,
        "totalInputTokens": total_input,
        "totalOutputTokens": total_output,
        "totalCacheRead": total_cache_read,
        "totalCacheWrite": total_cache_write,
        "estimatedCost": total_cost,
        "sessionCount": session_count
    });
    
    Ok(Json(serde_json::json!({ "success": true, "stats": stats })))
}



// Monitor API - 轮询方式
pub async fn get_recent_messages() -> Result<Json<serde_json::Value>, String> {
    let sessions_dir = std::path::Path::new("/root/.openclaw/agents/main/sessions");
    let mut messages = Vec::new();
    
    if let Ok(entries) = std::fs::read_dir(sessions_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("jsonl") {
                if let Ok(content) = std::fs::read_to_string(&path) {
                    let lines: Vec<&str> = content.lines().collect();
                    for line in lines.iter().rev().take(10) {
                        if let Ok(v) = serde_json::from_str::<serde_json::Value>(line) {
                            if let Some(msg) = v.get("message") {
                                if let Some(role) = msg.get("role").and_then(|r| r.as_str()) {
                                    let content = msg.get("content")
                                        .and_then(|c| c.as_array())
                                        .and_then(|arr| arr.iter().find(|i| i.get("type").and_then(|t| t.as_str()) == Some("text")))
                                        .and_then(|t| t.get("text").and_then(|x| x.as_str()))
                                        .unwrap_or("");
                                    
                                    messages.push(serde_json::json!({
                                        "role": role,
                                        "content": content,
                                        "timestamp": v.get("timestamp").and_then(|t| t.as_str()).unwrap_or("")
                                    }));
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    messages.sort_by(|a, b| b["timestamp"].as_str().unwrap_or("").cmp(a["timestamp"].as_str().unwrap_or("")));
    messages.truncate(50);
    
    Ok(Json(serde_json::json!({ "success": true, "messages": messages })))
}


// Quick Action API - 快捷操作
pub async fn quick_action(Json(data): Json<serde_json::Value>) -> Result<Json<serde_json::Value>, String> {
    let action = data.get("action").and_then(|v| v.as_str()).unwrap_or("");
    
    let output = std::process::Command::new("bash")
        .arg("-c")
        .arg(action)
        .output()
        .map_err(|e| e.to_string())?;
    
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    
    if output.status.success() {
        Ok(Json(serde_json::json!({ "success": true, "output": stdout })))
    } else {
        Ok(Json(serde_json::json!({ "success": false, "error": stderr, "output": stdout })))
    }
}


// Install API - 一键安装
pub async fn do_install(Json(data): Json<serde_json::Value>) -> Result<Json<serde_json::Value>, String> {
    let install_type = data.get("type").and_then(|v| v.as_str()).unwrap_or("docker");
    let mut logs = Vec::new();
    
    match install_type {
        "docker" => {
            logs.push("正在检查 Docker...".to_string());
            
            // 检查 docker
            let docker_check = std::process::Command::new("docker")
                .arg("--version")
                .output();
            
            if docker_check.is_err() {
                return Ok(Json(serde_json::json!({ "success": false, "error": "Docker 未安装", "logs": logs })));
            }
            
            logs.push("✅ Docker 已安装".to_string());
            logs.push("正在拉取镜像...".to_string());
            
            // 拉取镜像
            let pull = std::process::Command::new("docker")
                .args(&["pull", "openclaw/openclaw:latest"])
                .output();
            
            if pull.is_err() {
                return Ok(Json(serde_json::json!({ "success": false, "error": "镜像拉取失败", "logs": logs })));
            }
            
            logs.push("✅ 镜像拉取成功".to_string());
            logs.push("OpenClaw 安装完成！".to_string());
        },
        "npm" => {
            logs.push("正在检查 Node.js...".to_string());
            
            let node_check = std::process::Command::new("node")
                .arg("--version")
                .output();
            
            if node_check.is_err() {
                return Ok(Json(serde_json::json!({ "success": false, "error": "Node.js 未安装", "logs": logs })));
            }
            
            logs.push("✅ Node.js 已安装".to_string());
            logs.push("正在安装 OpenClaw...".to_string());
            
            // 这里只是模拟，实际npm安装需要交互
            logs.push("请在终端运行: npm install -g openclaw@latest".to_string());
        },
        _ => {}
    }
    
    Ok(Json(serde_json::json!({ "success": true, "logs": logs })))
}


// Install Check API - 环境检测
pub async fn check_install_env() -> Result<Json<serde_json::Value>, String> {
    let docker = std::process::Command::new("docker")
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);
    
    let docker_running = std::process::Command::new("docker")
        .args(&["info"])
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);
    
    let openclaw_container = std::process::Command::new("docker")
        .args(&["ps", "-a", "-q", "--filter", "name=openclaw"])
        .output()
        .map(|o| !String::from_utf8_lossy(&o.stdout).trim().is_empty())
        .unwrap_or(false);
    
    let npm_installed = std::process::Command::new("bash")
        .args(&["-c", "which openclaw"])
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);
    
    let gateway_running = std::process::Command::new("bash")
        .args(&["-c", "pgrep -f openclaw-gateway"])
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);
    
    let env = serde_json::json!({
        "docker": docker,
        "dockerRunning": docker_running,
        "openclawContainer": openclaw_container,
        "npmInstalled": npm_installed,
        "gatewayRunning": gateway_running
    });
    
    Ok(Json(serde_json::json!({ "success": true, "env": env })))
}
