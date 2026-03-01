import { useState, useEffect } from 'react';

const platformNames: Record<string, string> = { feishu: '飞书', telegram: 'Telegram', qqbot: 'QQ机器人', ddingtalk: '钉钉', wecom: '企业微信' };
const platformIcons: Record<string, string> = { feishu: '📱', telegram: '✈️', qqbot: '💬', ddingtalk: '💼', wecom: '🏢' };

const platformFields: Record<string, { name: string; label: string; placeholder: string }[]> = {
  feishu: [{ name: 'appId', label: 'App ID', placeholder: 'cli_xxx' }, { name: 'appSecret', label: 'App Secret', placeholder: '填写密钥' }, { name: 'verificationToken', label: 'Verification Token', placeholder: '可选' }],
  telegram: [{ name: 'botToken', label: 'Bot Token', placeholder: '123456:ABC-DEF...' }],
  qqbot: [{ name: 'appId', label: 'App ID', placeholder: '123456789' }, { name: 'token', label: 'Token', placeholder: '填写密钥' }, { name: 'secret', label: 'Secret', placeholder: '填写密钥' }],
  ddingtalk: [{ name: 'agentId', label: 'Agent ID', placeholder: 'xxx' }, { name: 'appKey', label: 'App Key', placeholder: 'xxx' }, { name: 'appSecret', label: 'App Secret', placeholder: '填写密钥' }],
  wecom: [{ name: 'corpId', label: 'Corp ID', placeholder: 'xxx' }, { name: 'agentId', label: 'Agent ID', placeholder: 'xxx' }, { name: 'secret', label: 'Secret', placeholder: '填写密钥' }],
};

interface Platform { id: number; name: string; enabled: boolean; config: string | null; }

export default function PlatformPanel() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  useEffect(() => { loadPlatforms(); }, []);

  const loadPlatforms = async () => {
    setLoading(true);
    try { const res = await fetch('/api/platforms'); const data = await res.json(); if (data.success) setPlatforms(data.data); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const togglePlatform = async (name: string) => { await fetch('/api/platforms/' + name + '/toggle', { method: 'POST' }); loadPlatforms(); };
  const openEditor = (platform: Platform) => { setEditing(platform.name); const config = platform.config ? JSON.parse(platform.config) : {}; setFormData(config); setShowPassword({}); };
  const saveConfig = async (name: string) => { await fetch('/api/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, config: JSON.stringify(formData) }) }); setEditing(null); loadPlatforms(); };

  const fields = editing ? platformFields[editing] || [] : [];
  const isSecret = (name: string) => name.toLowerCase().includes('secret') || name.toLowerCase().includes('token') || name.toLowerCase().includes('key');

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>平台配置</h2>
      <div className="grid gap-4">
        {platforms.map((platform) => (
          <div key={platform.name} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: platform.enabled ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))' : 'var(--bg-elevated)', border: platform.enabled ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-subtle)' }}>
                  {platformIcons[platform.name] || '?'}
                </div>
                <div><div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{platformNames[platform.name] || platform.name}</div><div className="text-sm" style={{ color: 'var(--text-muted)' }}>{platform.name}</div></div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => openEditor(platform)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>⚙️ 配置</button>
                <button onClick={() => togglePlatform(platform.name)} className="px-5 py-2.5 rounded-xl font-medium" style={{ background: platform.enabled ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, var(--primary), #8b5cf6)', color: platform.enabled ? '#ef4444' : 'white', boxShadow: platform.enabled ? 'none' : '0 4px 16px var(--primary-glow)' }}>{platform.enabled ? '禁用' : '启用'}</button>
              </div>
            </div>
            {editing === platform.name && (
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <h4 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>配置 {platformNames[platform.name]}</h4>
                <div className="grid gap-4">
                  {fields.map(field => (
                    <div key={field.name} className="relative">
                      <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                      <div className="relative">
                        <input type={isSecret(field.name) && !showPassword[field.name] ? 'password' : 'text'} value={formData[field.name] || ''} onChange={e => setFormData({...formData, [field.name]: e.target.value})} placeholder={field.placeholder} className="input-glass w-full pr-10" />
                        {isSecret(field.name) && (
                          <button type="button" onClick={() => setShowPassword({...showPassword, [field.name]: !showPassword[field.name]})} className="absolute right-3 top-3 text-lg" style={{ color: 'var(--text-muted)' }}>
                            {showPassword[field.name] ? '👁️' : '👁️‍🗨️'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6"><button onClick={() => saveConfig(platform.name)} className="btn-glow">保存</button><button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>取消</button></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
