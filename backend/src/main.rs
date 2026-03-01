mod api;
mod db;
mod memory;

use axum::{
    routing::{get, post, delete},
    Router,
};
use std::net::SocketAddr;
#[tokio::main]
async fn main() {
    // 初始化日志
    tracing_subscriber::fmt::init();
    tracing::info!("OpenClaw Console starting...");
    // 初始化数据库
    let db = db::init_db().expect("Failed to initialize database");
    // 创建应用状态
    let state = api::AppState::new(db);
    // 构建路由
    let app = Router::new()
        // 健康检查
        .route("/api/health", get(api::health))
        // 记忆管理
        .route("/api/memory/remember", post(api::remember))
        .route("/api/memory/keypoint", post(api::remember_keypoint))
        .route("/api/memory/compress", post(api::compress_memory))
        .route("/api/memory", get(api::read_memory))
        // 平台配置
        .route("/api/platforms", get(api::list_platforms))
        .route("/api/platforms", post(api::save_platform))
        .route("/api/platforms/:name", get(api::get_platform))
        .route("/api/platforms/:name/toggle", post(api::toggle_platform))
        // 模型配置
        .route("/api/models", get(api::list_models))
        .route("/api/models", post(api::save_model))
        .route("/api/models/:id", get(api::get_model))
        .route("/api/models/:id", delete(api::delete_model))
        // Skills
        .route("/api/skills", get(api::list_skills))
        .route("/api/skills/install", post(api::install_skill))
        .route("/api/skills/:name/uninstall", post(api::uninstall_skill))
        // 系统配置
        .route("/api/config", get(api::get_full_config))
        .route("/api/config", post(api::save_config))
        .route("/api/backup", post(api::backup_config))
        // Gateway 管理
        .route("/api/gateway/status", get(api::gateway_status))
        .route("/api/gateway/restart", post(api::gateway_restart))
        .route("/api/logs", get(api::get_logs))
        .route("/api/system/status", get(api::get_system_status))
        .route("/api/agent", get(api::get_agent))
        .route("/api/agent", post(api::save_agent))
        .route("/api/cron", get(api::list_cron))
        .route("/api/cron/logs", get(api::get_cron_logs))
        // OpenClaw 更新
        .route("/api/openclaw/version", get(api::openclaw_version))
        .route("/api/openclaw/update", post(api::openclaw_update))
        // Sessions 会话管理
        .route("/api/sessions", get(api::list_sessions))
        .route("/api/sessions/:id", get(api::get_session))
        .route("/api/sessions/:id", delete(api::delete_session))
        // 使用统计
        .route("/api/stats", get(api::get_stats))
        // 实时监控
        .route("/api/monitor", get(api::get_recent_messages))
        // 快捷操作
        .route("/api/quick/action", post(api::quick_action))
        // 一键安装
        .route("/api/install", post(api::do_install))
        .route("/api/install/check", get(api::check_install_env))
        .with_state(state);
    // 启动服务
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::info!("Server running on http://{}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
