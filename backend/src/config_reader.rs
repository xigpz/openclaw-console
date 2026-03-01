use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct OpenClawConfig {
    pub channels: Option<serde_json::Value>,
    pub models: Option<serde_json::Value>,
}

impl OpenClawConfig {
    pub fn load(path: &str) -> Option<Self> {
        let content = fs::read_to_string(path).ok()?;
        serde_json::from_str(&content).ok()
    }
}

// 读取真实的OpenClaw配置
pub fn get_openclaw_channels() -> Vec<serde_json::Value> {
    if let Some(config) = OpenClawConfig::load("/root/.openclaw/openclaw.json") {
        if let Some(channels) = config.channels {
            return channels
                .as_object()
                .map(|obj| {
                    obj.iter()
                        .map(|(name, value)| {
                            let mut v = serde_json::json!({
                                "name": name,
                                "enabled": value.get("enabled").unwrap_or(&serde_json::json!(false)),
                            });
                            if let Some(config_str) = value.get("appId").and_then(|v| v.as_str()) {
                                v["config"] = serde_json::json!(value);
                            }
                            v
                        })
                        .collect()
                })
                .unwrap_or_default();
        }
    }
    vec![]
}
