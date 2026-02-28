import { useState, useEffect } from 'react';
import type { ApiResponse } from '../types';

interface ConfigItem {
  key: string;
  value: string;
}

export default function ConfigPanel() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/config');
      const data: ApiResponse<ConfigItem[]> = await res.json();
      if (data.success) {
        setConfigs(data.data);
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
    setLoading(false);
  };

  const saveConfig = async () => {
    if (!key || !value) return;
    try {
      await fetch('http://localhost:8080/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      setKey('');
      setValue('');
      loadConfigs();
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  };

  if (loading) {
    return <div className="text-[#a1a1aa]">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">系统配置</h2>

      {/* 添加配置 */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">添加配置</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="配置键"
            className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="配置值"
            className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2"
          />
        </div>
        <button
          onClick={saveConfig}
          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          保存
        </button>
      </div>

      {/* 配置列表 */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">当前配置</h3>
        {configs.length > 0 ? (
          <div className="space-y-2">
            {configs.map((config) => (
              <div key={config.key} className="flex justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                <span className="text-[#a1a1aa]">{config.key}</span>
                <span className="font-mono">{config.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[#a1a1aa] text-center py-4">
            暂无配置
          </div>
        )}
      </div>
    </div>
  );
}
