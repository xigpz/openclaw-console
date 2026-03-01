import { useState } from 'react';

export default function BackupPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const backup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/backup', { method: 'GET' });
      const blob = await response.blob();
      const filename = `openclaw-backup-${new Date().toISOString().slice(0,10)}.json`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMessage('✅ 备份成功并已下载');
    } catch (e) {
      setMessage('❌ 请求失败');
    }
    setLoading(false);
  };

  const restore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setMessage('');
    const file = e.target.files?.[0];
    if (!file) { setLoading(false); return; }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/restore', { method: 'GET', body: formData });
      const data = await res.json();
      setMessage(data.success ? '✅ 恢复成功！' : '❌ 恢复失败: ' + data.message);
    } catch (e) {
      setMessage('❌ 请求失败');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>💾 备份与恢复</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-4">📤 导出配置</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>导出所有配置到JSON文件</p>
          <button onClick={backup} disabled={loading} className="btn-glow w-full">
            {loading ? '处理中...' : '📥 下载备份'}
          </button>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-medium mb-4">📥 导入配置</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>从备份文件恢复配置</p>
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
