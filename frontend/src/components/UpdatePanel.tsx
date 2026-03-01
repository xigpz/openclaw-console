import { useState, useEffect } from 'react';

interface VersionInfo {
  current: string;
  latest: string;
  update_available: boolean;
}

export default function UpdatePanel() {
  const [version, setVersion] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadVersion();
  }, []);

  const loadVersion = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/openclaw/version');
      const data = await res.json();
      if (data.success) {
        setVersion(data.data);
      }
    } catch (e) {
      console.error('Failed to load version:', e);
    }
    setLoading(false);
  };

  const doUpdate = async () => {
    if (!confirm('确定要更新 OpenClaw 吗？')) return;
    
    setUpdating(true);
    try {
      const res = await fetch('http://localhost:8080/api/openclaw/update', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('更新成功！\n' + data.data);
        loadVersion();
      } else {
        alert('更新失败: ' + data.message);
      }
    } catch (e) {
      alert('请求失败');
    }
    setUpdating(false);
  };

  if (loading) {
    return <div className="text-[#a1a1aa]">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">OpenClaw 更新</h2>

      {/* 版本信息 */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center text-2xl">
              🦞
            </div>
            <div>
              <div className="text-lg font-medium">OpenClaw</div>
              <div className="text-sm text-[#a1a1aa]">
                当前版本: <span className="text-white">{version?.current || '未知'}</span>
              </div>
            </div>
          </div>

          {version?.update_available && (
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-yellow-600 text-yellow-100 text-sm rounded">
                可更新: {version.latest}
              </span>
              <button
                onClick={doUpdate}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
              >
                {updating ? '更新中...' : '立即更新'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 版本状态 */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">版本信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#a1a1aa]">当前版本</span>
            <span className="font-mono">{version?.current || '未知'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#a1a1aa]">最新版本</span>
            <span className="font-mono">{version?.latest || '未知'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#a1a1aa]">状态</span>
            <span className={version?.update_available ? 'text-yellow-500' : 'text-green-500'}>
              {version?.update_available ? '有可用更新' : '已是最新版本'}
            </span>
          </div>
        </div>
      </div>

      {/* 手动检查更新 */}
      <button
        onClick={loadVersion}
        className="w-full py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded text-sm"
      >
        手动检查更新
      </button>
    </div>
  );
}
