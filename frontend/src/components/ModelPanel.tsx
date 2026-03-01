import { useState, useEffect } from 'react';

interface Model { 
  id: string; 
  name: string; 
  provider: string; 
  model_id: string; 
  api_key?: string; 
  base_url?: string; 
  enabled: boolean; 
}

export default function ModelPanel() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ apiKey: '', baseUrl: '', modelId: '' });
  const [showKey, setShowKey] = useState(false);

  useEffect(() => { loadModels(); }, []);

  const loadModels = async () => {
    setLoading(true);
    try { 
      const res = await fetch('/api/models'); 
      const data = await res.json(); 
      if (data.success) setModels(data.data); 
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggleModel = async (id: string) => { 
    await fetch('/api/models/' + id + '/toggle', { method: 'POST' }); 
    loadModels(); 
  };

  const openEditor = (model: Model) => {
    setEditing(model.id);
    setFormData({ 
      apiKey: model.api_key || '', 
      baseUrl: model.base_url || '', 
      modelId: model.model_id || '' 
    });
    setShowKey(false);
  };

  const saveModel = async () => {
    await fetch('/api/models', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        id: editing, 
        apiKey: formData.apiKey, 
        baseUrl: formData.baseUrl, 
        modelId: formData.modelId 
      }) 
    });
    setEditing(null);
    loadModels();
  };

  const getProviderIcon = (p: string) => {
    if (p === 'minimax') return '🔷';
    if (p === 'openai') return '🟢';
    if (p === 'deepseek') return '🟡';
    if (p === 'anthropic') return '🔵';
    return '🤖';
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🤖 模型管理</h2>

      <div className="grid gap-4">
        {models.map((model) => (
          <div key={model.id} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: model.enabled ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))' : 'var(--bg-elevated)', border: model.enabled ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-subtle)' }}>
                  {getProviderIcon(model.provider)}
                </div>
                <div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{model.name}</div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{model.model_id}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openEditor(model)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>⚙️ 配置</button>
                <button onClick={() => toggleModel(model.id)} className="px-5 py-2.5 rounded-xl font-medium" style={{ background: model.enabled ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: model.enabled ? '#ef4444' : 'white', boxShadow: model.enabled ? 'none' : '0 4px 16px var(--primary-glow)' }}>{model.enabled ? '禁用' : '启用'}</button>
              </div>
            </div>

            {editing === model.id && (
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <h4 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>配置 {model.name}</h4>
                
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Model ID</label>
                    <input value={formData.modelId} onChange={e => setFormData({...formData, modelId: e.target.value})} className="input-glass" />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>API Key</label>
                    <div className="relative">
                      <input type={showKey ? 'text' : 'password'} value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} placeholder="填写API密钥" className="input-glass pr-10" />
                      <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-3 top-3 text-lg" style={{ color: 'var(--text-muted)' }}>
                        {showKey ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Base URL（可选）</label>
                    <input value={formData.baseUrl} onChange={e => setFormData({...formData, baseUrl: e.target.value})} placeholder="留空使用默认" className="input-glass" />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={saveModel} className="btn-glow">保存</button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>取消</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
