# OpenClaw Console

OpenClaw 可视化管理后台 - 配置管理、模型配置、Skills 管理

## 功能

### 第一期
- 🔌 **平台管理** - 飞书、QQ、钉钉、企业微信配置
- 🤖 **模型管理** - AI 模型配置 (OpenAI, Anthropic, MiniMax, OpenRouter...)
- 📦 **Skills 管理** - 安装、卸载、启用/禁用 Skills
- ⚙️ **系统设置** - Gateway、认证、会话配置

## 技术栈

- 后端：Rust + Axum
- 前端：React 19 + TypeScript + Tailwind CSS
- 数据库：SQLite

## 快速开始

```bash
# 克隆项目
git clone https://github.com/xigpz/openclaw-console.git
cd openclaw-console

# 启动后端
cd backend
cargo run

# 启动前端
cd frontend
pnpm install
pnpm dev
```

访问 http://localhost:3000

## 许可证

MIT
