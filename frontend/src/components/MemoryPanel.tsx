import { useState, useEffect } from 'react';

export default function MemoryPanel() {
  const [memory, setMemory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMemory();
  }, []);

  const loadMemory = async () => {
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      if (data.success) {
        setMemory(data.data || '');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveMemory = async () => {
    setSaving(true);
    try {
      await fetch('/api/memory/compress', { method: 'POST' });
      alert('✅ 记忆已压缩保存');
    } catch (e) {
      alert('❌ 保存失败');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🧠 内存管理</h2>
        <button onClick={saveMemory} disabled={saving} className="btn-glow">
          {saving ? '保存中...' : '💾 压缩保存'}
        </button>
      </div>

      <div className="glass-card p-4">
        <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>长期记忆 (MEMORY.md)</h3>
        <textarea
          value={memory}
          onChange={(e) => setMemory(e.target.value)}
          className="w-full h-64 p-4 rounded-lg text-sm font-mono resize-none"
          style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          placeholder="在这里查看你的长期记忆..."
        />
      </div>

      <div className="glass-card p-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
        <p className="text-sm" style={{ color: 'var(--success)' }}>
          💡 点击"压缩保存"会将重要信息从日常笔记合并到长期记忆中
        </p>
      </div>
    </div>
  );
}
