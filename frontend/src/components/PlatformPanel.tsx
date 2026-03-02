import { useState, useEffect } from 'react';

// 按优先级排序：飞书、QQ、其他
const platformOrder = ['feishu', 'qqbot', 'telegram', 'whatsapp', 'signal', 'discord', 'slack', 'googlechat', 'irc', 'sms', 'ddingtalk', 'wecom', 'imessage', 'adp-openclaw'];

const platformNames: Record<string, string> = {
  feishu: '飞书', qqbot: 'QQ机器人', telegram: 'Telegram', whatsapp: 'WhatsApp',
  signal: 'Signal', discord: 'Discord', slack: 'Slack', googlechat: 'Google Chat',
  irc: 'IRC', sms: '短信', ddingtalk: '钉钉', wecom: '企业微信', imessage: 'iMessage',
  'adp-openclaw': 'ADP'
};

const platformIcons: Record<string, string> = {
  feishu: '📱', qqbot: '💬', telegram: '✈️', whatsapp: '💭',
  signal: '🔒', discord: '🎮', slack: '💼', googlechat: '💬',
  irc: '📟', sms: '📱', ddingtalk: '💼', wecom: '🏢', imessage: '🍎',
  'adp-openclaw': '🔗'
};

const platformFields: Record<string, { name: string; label: string; placeholder: string }[]> = {
  feishu: [{ name: 'appId', label: 'App ID', placeholder: 'cli_xxx' }, { name: 'appSecret', label: 'App Secret', placeholder: '填写密钥' }, { name: 'verificationToken', label: 'Verification Token', placeholder: '可选' }],
  telegram: [{ name: 'botToken', label: 'Bot Token', placeholder: '123456:ABC-DEF...' }],
  qqbot: [{ name: 'appId', label: 'App ID', placeholder: '123456789' }, { name: 'token', label: 'Token', placeholder: '填写密钥' }, { name: 'secret', label: 'Secret', placeholder: '填写密钥' }],
  whatsapp: [{ name: 'phoneNumberId', label: 'Phone Number ID', placeholder: 'xxx' }, { name: 'accessToken', label: 'Access Token', placeholder: '填写密钥' }, { name: 'businessAccountId', label: 'Business ID', placeholder: '可选' }],
  signal: [{ name: 'phoneNumber', label: 'Phone Number', placeholder: '+1234567890' }, { name: 'signalCliPath', label: 'Signal-CLI Path', placeholder: '/usr/local/bin/signal-cli' }],
  discord: [{ name: 'botToken', label: 'Bot Token', placeholder: 'xxx' }],
  slack: [{ name: 'botToken', label: 'Bot Token', placeholder: 'xoxb-xxx' }, { name: 'signingSecret', label: 'Signing Secret', placeholder: 'xxx' }],
  googlechat: [{ name: 'serviceAccount', label: 'Service Account', placeholder: 'JSON内容' }],
  irc: [{ name: 'server', label: 'Server', placeholder: 'irc.libera.chat' }, { name: 'nickname', label: 'Nickname', placeholder: 'YourNick' }, { name: 'channel', label: 'Channel', placeholder: '#channel' }],
  sms: [{ name: 'accountSid', label: 'Account SID', placeholder: 'xxx' }, { name: 'authToken', label: 'Auth Token', placeholder: '填写密钥' }, { name: 'fromNumber', label: 'From Number', placeholder: '+1234567890' }],
  ddingtalk: [{ name: 'agentId', label: 'Agent ID', placeholder: 'xxx' }, { name: 'appKey', label: 'App Key', placeholder: 'xxx' }, { name: 'appSecret', label: 'App Secret', placeholder: '填写密钥' }],
  wecom: [{ name: 'corpId', label: 'Corp ID', placeholder: 'xxx' }, { name: 'agentId', label: 'Agent ID', placeholder: 'xxx' }, { name: 'secret', label: 'Secret', placeholder: '填写密钥' }],
  imessage: [{ name: 'bluebubblesUrl', label: 'BlueBubbles URL', placeholder: 'http://xxx' }, { name: 'bluebubblesToken', label: 'API Token', placeholder: '填写密钥' }],
  'adp-openclaw': [],
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

  // 按优先级排序
  const sortedPlatforms = [...platforms].sort((a, b) => {
    const aIdx = platformOrder.indexOf(a.name);
    const bIdx = platformOrder.indexOf(b.name);
    const aOrder = aIdx === -1 ? 999 : aIdx;
    const bOrder = bIdx === -1 ? 999 : bIdx;
    return aOrder - bOrder;
  });

  const fields = editing ? platformFields[editing] || [] : [];
  const isSecret = (name: string) => name.toLowerCase().includes('secret') || name.toLowerCase().includes('token') || name.toLowerCase().includes('key');

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🔌 平台配置</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {sortedPlatforms.map(platform => (
          <div key={platform.name} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platformIcons[platform.name] || '📦'}</span>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{platformNames[platform.name] || platform.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{platform.enabled ? '✅ 已启用' : '❌ 已禁用'}</p>
                </div>
              </div>
              <button onClick={() => togglePlatform(platform.name)} className={`px-3 py-1 rounded text-sm ${platform.enabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                {platform.enabled ? '禁用' : '启用'}
              </button>
            </div>
            <button onClick={() => openEditor(platform)} className="w-full py-2 rounded-lg text-sm" style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
              {platform.config ? '✏️ 编辑配置' : '➕ 添加配置'}
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>{platformNames[editing] || editing} 配置</h3>
            <div className="space-y-3">
              {fields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
                  <div className="relative">
                    <input type={isSecret(field.name) && !showPassword[field.name] ? 'password' : 'text'} value={formData[field.name] || ''} onChange={e => setFormData({...formData, [field.name]: e.target.value})} placeholder={field.placeholder} className="input-glass w-full pr-10" />
                    {isSecret(field.name) && <button type="button" onClick={() => setShowPassword({...showPassword, [field.name]: !showPassword[field.name]})} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>{showPassword[field.name] ? '🙈' : '👁️'}</button>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>取消</button>
              <button onClick={() => saveConfig(editing)} className="flex-1 py-2 rounded-lg" style={{ background: 'var(--primary)', color: 'white' }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
