/**
 * Memory - 记忆管理系统 (后端 API)
 * 每次对话后自动保存，定期压缩成重要信息
 */

use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;

const MEMORY_DIR: &str = "memory";

/**
 * 获取今天的记忆文件路径
 */
fn get_today_file() -> PathBuf {
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    PathBuf::from(MEMORY_DIR).join(format!("{}.md", today))
}

/**
 * 初始化记忆目录
 */
fn init_memory() {
    if !std::path::Path::new(MEMORY_DIR).exists() {
        let _ = fs::create_dir(MEMORY_DIR);
    }
}

/**
 * 写入对话记录到记忆
 */
pub fn remember(role: &str, content: &str) {
    init_memory();
    
    let now = chrono::Local::now();
    let time = now.format("%H:%M:%S").to_string();
    let file = get_today_file();
    
    let prefix = if role == "user" { "👤" } else { "🤖" };
    let line = format!("\n{} {} {}\n", time, prefix, content);
    
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&file)
        .unwrap();
    
    let _ = file.write_all(line.as_bytes());
}

/**
 * 记忆重要信息（关键点）
 */
pub fn remember_keypoint(key: &str, value: &str) {
    init_memory();
    
    let file = get_today_file();
    let line = format!("\n⭐ {}: {}\n", key, value);
    
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&file)
        .unwrap();
    
    let _ = file.write_all(line.as_bytes());
}

/**
 * 压缩记忆 - 提取重要信息到 MEMORY.md
 */
pub fn compress_memory() {
    let memory_file = PathBuf::from("/root/.openclaw/workspace/MEMORY.md");
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let today_file = get_today_file();
    
    if !today_file.exists() {
        return;
    }
    
    let content = fs::read_to_string(&today_file).unwrap_or_default();
    
    // 提取关键点（⭐ 标记的）
    let key_points: Vec<String> = content
        .lines()
        .filter(|line| line.contains("⭐"))
        .map(|line| line.replace("⭐ ", ""))
        .collect();
    
    if key_points.is_empty() {
        return;
    }
    
    // 读取 MEMORY.md
    let mut existing = String::new();
    if memory_file.exists() {
        existing = fs::read_to_string(&memory_file).unwrap_or_default();
    }
    
    // 添加压缩后的记忆
    let header = format!("\n## {} 重要信息\n", today);
    let new_content = existing + &header + &key_points.join("\n") + "\n";
    
    let _ = fs::write(&memory_file, new_content);
}

/**
 * 读取记忆
 */
pub fn read_memory() -> String {
    let memory_file = PathBuf::from("/root/.openclaw/workspace/MEMORY.md");
    if memory_file.exists() {
        fs::read_to_string(&memory_file).unwrap_or_default()
    } else {
        String::new()
    }
}
