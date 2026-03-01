import { useState, useEffect } from 'react';

interface Identity {
  name: string;
  creature: string;
  vibe: string;
  emoji: string;
}

interface User {
  name: string;
  call_as: string;
  timezone: string;
}

export default function AgentPanel() {
  const [identity, setIdentity] = useState<Identity>({ name: '', creature: '', vibe: '', emoji: '' });
  const [user, setUser] = useState<User>({ name: '', call_as: '', timezone: '' });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent');
      const data = await res.json();
      if (data.success) {
        setIdentity(data.data.identity || { name: '', creature: '', vibe: '', emoji: '' });
        setUser(data.data.user || { name: '', call_as: '', timezone: '' });
      }
    } catch (e) {
      // 使用默认值
      setIdentity({ name: '小乖', creature: 'AI助手', vibe: '风趣、幽默', emoji: '🧠' });
      setUser({ name: '少爷', call_as: '少爷', timezone: 'UTC+8' });
    }
    setLoading(false);
  };

  const saveData = async () => {
    setSaving(true);
    try {
      await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, user })
      });
      setEditing(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🧠 Agent人格管理</h2>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={saveData} disabled={saving} className="btn-glow">{saving ? '保存中...' : '💾 保存'}</button>
            <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>取消</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-glow">✏️ 编辑</button>
        )}
      </div>

      {/* Identity */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>👤 我是谁 (Identity)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>名字 (Name)</label>
            {editing ? (
              <input value={identity.name} onChange={e => setIdentity({...identity, name: e.target.value})} className="input-glass w-full" placeholder="我的名字" />
            ) : (
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>{identity.name || '未设置'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>类型 (Creature)</label>
            {editing ? (
              <input value={identity.creature} onChange={e => setIdentity({...identity, creature: e.target.value})} className="input-glass w-full" placeholder="AI助手" />
            ) : (
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>{identity.creature || '未设置'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}> Emoji</label>
            {editing ? (
              <input value={identity.emoji} onChange={e => setIdentity({...identity, emoji: e.target.value})} className="input-glass w-full" placeholder="🧠" />
            ) : (
              <div className="p-3 rounded-lg text-2xl" style={{ background: 'var(--bg-elevated)' }}>{identity.emoji || '❓'}</div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>风格 (Vibe)</label>
            {editing ? (
              <textarea value={identity.vibe} onChange={e => setIdentity({...identity, vibe: e.target.value})} className="input-glass w-full h-20" placeholder="描述你的性格特点" />
            ) : (
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>{identity.vibe || '未设置'}</div>
            )}
          </div>
        </div>
      </div>

      {/* User */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>👤 主人是谁 (User)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>名字 (Name)</label>
            {editing ? (
              <input value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="input-glass w-full" placeholder="少爷" />
            ) : (
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>{user.name || '未设置'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>称呼 (Call As)</label>
            {editing ? (
              <input value={user.call_as} onChange={e => setUser({...user, call_as: e.target.value})} className="input-glass w-full" placeholder="少爷" />
            ) : (
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>{user.call_as || '未设置'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>时区 (Timezone)</label>
            {editing ? (
              <input value={user.timezone} onChange={e => setUser({...user, timezone: e.target.value})} className="input-glass w-full" placeholder="UTC+8" />
            ) : (
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>{user.timezone || '未设置'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
