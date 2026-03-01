export default function HelpPanel() {
  const showWelcome = () => {
    localStorage.removeItem('welcome_dismissed');
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>📖 使用帮助</h2>
        <button onClick={showWelcome} className="btn-glow text-sm">重新显示欢迎</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>🔌 平台配置</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            配置消息接收渠道，如飞书、Telegram、QQ等。启用后即可接收消息。
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>🤖 模型管理</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            选择AI模型，配置API Key。推荐使用MiniMax M2.5 highspeed，速度快且便宜。
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>📦 技能市场</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            安装各种技能扩展AI能力，如GitHub、浏览器自动化、天气查询等。
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>⏰ 定时任务</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            设置自动化任务，如每日股票筛选、记忆同步、天气提醒等。
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>💾 备份恢复</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            导出当前配置为JSON文件，或从备份恢复配置。
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>🖥️ 系统状态</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            查看CPU、内存、磁盘使用情况，以及服务运行时间。
          </p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--text-primary)' }}>🔗 快速链接</h3>
        <div className="flex flex-wrap gap-3">
          <a href="https://docs.openclaw.ai" target="_blank" className="btn-glow text-sm">官方文档</a>
          <a href="https://github.com/openclaw/openclaw" target="_blank" className="btn-glow text-sm">GitHub</a>
          <a href="https://clawhub.com" target="_blank" className="btn-glow text-sm">技能市场</a>
        </div>
      </div>
    </div>
  );
}
