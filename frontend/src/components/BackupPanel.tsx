import { useState } from 'react';

export default function BackupPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const backup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ 备份成功！文件已保存');
      } else {
        setMessage('❌ 备份失败: ' + data.message);
      }
    } catch (e) {
      setMessage('❌ 请求失败');
    }
    setLoading(false);
  };

  const restore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/restore', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ 恢复成功！');
      } else {
        setMessage('❌ 恢复失败: ' + data.message);
      }
    } catch (e) {
      setMessage('❌ 请求失败');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>💾 备份与恢复</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* 备份 */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-4">📤 导出配置</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            导出所有平台配置、模型设置、定时任务等
          </p>
          <button onClick={backup} disabled={loading} className="btn-glow w-full">
            {loading ? '处理中...' : '📥 下载备份'}
          </button>
        </div>

        {/* 恢复 */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-4">📥 导入配置</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            从备份文件恢复所有配置
          </p>
          <label className="btn-glow w-full block text-center cursor-pointer">
            {loading ? '处理中...' : '📤 选择文件'}
            <input type="file" accept=".json" onChange={restore} className="hidden" />
          </label>
        </div>
      </div>

      {message && (
        <div className="glass-card p-4 text-center" style={{ color: message.includes('成功') ? 'var(--success)' : 'var(--error)' }}>
          {message}
        </div>
      )}
    </div>
  );
}
