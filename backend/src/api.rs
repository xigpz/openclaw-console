use axum::{
    extract::{Path, State},
    Json,
};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
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
            Ok(Model {
                id: row.get(0)?,
                name: row.get(1)?,
                provider: row.get(2)?,
                api_key: row.get(3).ok(),
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
    pub spec: String,
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
        rusqlite::params![req.name, source, req.spec, now],
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
