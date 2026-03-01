import { useState, useEffect } from 'react';
import type { Platform, ApiResponse } from '../types';

const platformNames: Record<string, string> = {
  feishu: '飞书',
  telegram: 'Telegram',
  qqbot: 'QQ 机器人',
  ddingtalk: '钉钉',
  wecom: '企业微信',
};

const platformIcons: Record<string, string> = {
  feishu: '📱',
  telegram: '✈️',
  qqbot: '💬',
  ddingtalk: '💼',
  wecom: '🏢',
};

export default function PlatformPanel() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [config, setConfig] = useState('');

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/platforms');
      const data: ApiResponse<Platform[]> = await res.json();
      if (data.success) {
        setPlatforms(data.data);
      }
    } catch (e) {
      console.error('Failed to load platforms:', e);
    }
    setLoading(false);
  };

  const togglePlatform = async (name: string) => {
    try {
      await fetch(`http://localhost:8080/api/platforms/${name}/toggle`, { method: 'POST' });
      loadPlatforms();
    } catch (e) {
      console.error('Failed to toggle platform:', e);
    }
  };

  const savePlatform = async (name: string) => {
    try {
      await fetch('http://localhost:8080/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          enabled: platforms.find(p => p.name === name)?.enabled || false,
          config,
        }),
      });
      setEditing(null);
      loadPlatforms();
    } catch (e) {
      console.error('Failed to save platform:', e);
    }
  };

  if (loading) {
    return <div className="text-[#a1a1aa]">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">平台配置</h2>
      
      <div className="grid gap-4">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center text-lg">
                  {platformIcons[platform.name] || '📱'}
                  {platformIcons[platform.name] || '💬'}
                  {platform.name === 'ddingtalk' && '�钉'}
                  {platformIcons[platform.name] || '💼'}
                </div>
                <div>
                  <div className="font-medium">{platformNames[platform.name] || platform.name}</div>
                  <div className="text-sm text-[#a1a1aa]">{platform.name}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditing(platform.name);
                    setConfig(platform.config || '');
                  }}
                  className="px-3 py-1.5 text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded transition-colors"
                >
                  配置
                </button>
                <button
                  onClick={() => togglePlatform(platform.name)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    platform.enabled
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                  }`}
                >
                  {platform.enabled ? '已启用' : '已禁用'}
                </button>
              </div>
            </div>

            {editing === platform.name && (
              <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                <textarea
                  value={config}
                  onChange={(e) => setConfig(e.target.value)}
                  placeholder="输入配置 (JSON 格式)"
                  className="w-full h-32 bg-[#0f0f0f] border border-[#2a2a2a] rounded p-3 text-sm font-mono resize-none"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => savePlatform(platform.name)}
                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-3 py-1.5 text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
