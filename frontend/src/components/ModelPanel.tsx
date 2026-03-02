import { useState, useEffect } from 'react';

const providerInfo: Record<string, { name: string; icon: string }> = {
  minimax: { name: 'MiniMax', icon: '🟣' },
  openai: { name: 'OpenAI', icon: '🟢' },
  anthropic: { name: 'Anthropic', icon: '🟤' },
  google: { name: 'Google', icon: '🔵' },
};

export default function ModelPanel() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<{apiKey?: string; baseUrl?: string}>({});

  useEffect(() => { loadModels(); }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      if (data.success) setModels(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2000);
  };

  const toggleModel = async (id: string) => {
    const res = await fetch('/api/models/' + id + '/toggle', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setModels(models.map(m => m.id === id ? data.data : m));
      showToast(data.data.enabled ? '✅ 已启用' : '❌ 已禁用');
    } else {
      showToast('操作失败', 'error');
    }
  };

  const saveConfig = async (id: string) => {
    await fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, config: JSON.stringify(formData) })
    });
    setEditing(null);
    loadModels();
  };

  const grouped = models.reduce((acc: any, m) => {
    const p = m.provider || 'other';
    if (!acc[p]) acc[p] = [];
    acc[p].push(m);
    return acc;
  }, {});

  const currentModel = models.find(m => m.enabled);

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.msg}
        </div>
      )}

      <h2 className="text-2xl font-bold">🤖 模型配置</h2>

      {currentModel ? (
        <div className="glass-card p-4" style={{ background: 'rgba(16,185,129,0.1)' }}>
          <h3 className="font-medium mb-2" style={{ color: 'var(--success)' }}>✅ 当前生效</h3>
          <div className="flex items-center gap-2">
            <span className="text-xl">{providerInfo[currentModel.provider]?.icon || '📦'}</span>
            <span className="font-medium">{currentModel.name}</span>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4">
          <h3 className="font-medium mb-2" style={{ color: 'var(--text-muted)' }}>⚠️ 未选择模型</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>请从下方选择一个模型以启用</p>
        </div>
      )}

      {Object.entries(grouped).map(([provider, list]: [string, any]) => (
        <div key={provider} className="glass-card p-4">
          <button onClick={() => setExpanded({...expanded, [provider]: !expanded[provider]})} className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{providerInfo[provider]?.icon || '📦'}</span>
              <h3 className="font-medium">{providerInfo[provider]?.name || provider}</h3>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({list.length})</span>
            </div>
            <span style={{ transform: expanded[provider] ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
          </button>
          
          {expanded[provider] !== false && (
            <div className="grid gap-2 md:grid-cols-2">
              {list.map((model: any) => (
                <div key={model.id} className="p-3 rounded-lg" style={{ background: model.enabled ? 'rgba(16,185,129,0.15)' : 'var(--bg-primary)', borderLeft: model.enabled ? '3px solid var(--success)' : '3px solid transparent' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{model.name}</div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(model.id); setFormData(model.config ? JSON.parse(model.config) : {}); }} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)' }}>⚙️</button>
                      <button onClick={() => toggleModel(model.id)} className="text-xs px-2 py-1 rounded" style={{ background: model.enabled ? 'var(--success)' : 'var(--bg-elevated)', color: model.enabled ? 'white' : 'inherit' }}>{model.enabled ? '✅' : '⭕'}</button>
                    </div>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{model.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-80 max-w-lg">
            <h4 className="font-medium mb-4">{editing} 配置</h4>
            <div className="space-y-3">
              <input type="password" placeholder="API Key" value={formData.apiKey || ''} onChange={e => setFormData({...formData, apiKey: e.target.value})} className="input-glass w-full" />
              <input type="text" placeholder="Base URL (可选)" value={formData.baseUrl || ''} onChange={e => setFormData({...formData, baseUrl: e.target.value})} className="input-glass w-full" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>取消</button>
              <button onClick={() => saveConfig(editing)} className="flex-1 py-2 rounded-lg" style={{ background: 'var(--primary)', color: 'white' }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
