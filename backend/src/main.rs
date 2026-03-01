use axum::{
    routing::{get, post, delete},
    Router,
};
use std::net::SocketAddr;

mod api;
mod db;

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
        .route("/api/config", get(api::get_config))
        .route("/api/config", post(api::save_config))
        // Gateway 管理
        .route("/api/gateway/status", get(api::gateway_status))
        .route("/api/gateway/restart", post(api::gateway_restart))
        .with_state(state);

    // 启动服务
    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));
    tracing::info!("Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
