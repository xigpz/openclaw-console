import { useState, useEffect } from 'react';
import type { Skill, ApiResponse } from '../types';

export default function SkillPanel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [installName, setInstallName] = useState('');
  const [installSpec, setInstallSpec] = useState('');
  const [installing, setInstalling] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const data: ApiResponse<Skill[]> = await res.json();
      if (data.success) {
        setSkills(data.data);
      }
    } catch (e) {
      console.error('Failed to load skills:', e);
    }
    setLoading(false);
  };

  const installSkill = async () => {
    if (!installName || !installSpec) return;
    setInstalling(true);
    try {
      await fetch('/api/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: installName, spec: installSpec }),
      });
      setInstallName('');
      setInstallSpec('');
      loadSkills();
    } catch (e) {
      console.error('Failed to install skill:', e);
    }
    setInstalling(false);
  };

  const uninstallSkill = async (name: string) => {
    if (!confirm(`确定卸载 ${name}？`)) return;
    try {
      await fetch(`http://localhost:8080/api/skills/${name}/uninstall`, { method: 'POST' });
      loadSkills();
      showToast('卸载成功');
    } catch (e) {
      console.error('Failed to uninstall skill:', e);
      showToast('卸载失败', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.msg}
        </div>
      )}

      <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Skills 管理</h2>

      {/* 安装新 Skill */}
      <div className="rounded-lg p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>安装新 Skill</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={installName}
            onChange={(e) => setInstallName(e.target.value)}
            placeholder="Skill 名称"
            className="rounded px-3 py-2"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          />
          <input
            type="text"
            value={installSpec}
            onChange={(e) => setInstallSpec(e.target.value)}
            placeholder="npm 包名，如: @sliverp/qqbot"
            className="rounded px-3 py-2"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          />
        </div>
        <button
          onClick={installSkill}
          disabled={installing || !installName || !installSpec}
          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-50"
        >
          {installing ? '安装中...' : '安装'}
        </button>
      </div>

      {/* 已安装的 Skills */}
      <div className="grid gap-3">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="rounded-lg p-4 flex items-center justify-between"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{skill.name}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {skill.source} • {skill.version || '未知版本'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded ${skill.installed ? 'bg-green-600' : 'bg-gray-500'}`}>
                {skill.installed ? '已安装' : '未安装'}
              </span>
              {skill.installed && (
                <button
                  onClick={() => uninstallSkill(skill.name)}
                  className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded"
                >
                  卸载
                </button>
              )}
            </div>
          </div>
        ))}
        {skills.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            暂无技能，请从市场安装
          </div>
        )}
      </div>
    </div>
  );
}
