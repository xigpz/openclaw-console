import { useState, useEffect } from 'react';
import type { Skill, ApiResponse } from '../types';

export default function SkillPanel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [installName, setInstallName] = useState('');
  const [installSpec, setInstallSpec] = useState('');
  const [installing, setInstalling] = useState(false);

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
    } catch (e) {
      console.error('Failed to uninstall skill:', e);
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
      <h2 className="text-lg font-medium">Skills 管理</h2>

      {/* 安装新 Skill */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">安装新 Skill</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={installName}
            onChange={(e) => setInstallName(e.target.value)}
            placeholder="Skill 名称"
            className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2"
          />
          <input
            type="text"
            value={installSpec}
            onChange={(e) => setInstallSpec(e.target.value)}
            placeholder="npm 包名，如: @sliverp/qqbot"
            className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2"
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
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{skill.name}</div>
              <div className="text-sm text-[#a1a1aa]">
                {skill.source} • {skill.version || '未知版本'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded ${skill.installed ? 'bg-green-600' : 'bg-[#2a2a2a]'}`}>
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
          <div className="text-[#a1a1aa] text-center py-8">
            暂无技能，请从市场安装
          </div>
        )}
      </div>
    </div>
  );
}
