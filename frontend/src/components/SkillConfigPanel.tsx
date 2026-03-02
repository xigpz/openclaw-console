import { useState, useEffect } from 'react';

interface Skill {
  name: string;
  version: string;
  installed: boolean;
  enabled: boolean;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
}

export default function SkillConfigPanel() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [skillsRes, modelsRes] = await Promise.all([
        fetch('/api/skills'),
        fetch('/api/models')
      ]);
      const skillsData = await skillsRes.json();
      const modelsData = await modelsRes.json();
      if (skillsData.success) setSkills(skillsData.data || []);
      if (modelsData.success) setModels(modelsData.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // 当前启用的模型
  const currentModel = models.find(m => m.enabled);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>⚙️ 技能与模型</h2>

      {/* 当前生效模型 */}
      <div className="glass-card p-4">
        <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>🤖 当前模型</h3>
        {currentModel ? (
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{currentModel.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentModel.provider}</div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg text-center" style={{ color: 'var(--text-muted)' }}>未选择模型</div>
        )}
      </div>

      {/* 技能列表 */}
      <div className="glass-card p-4">
        <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>📦 已安装技能 ({skills.length})</h3>
        
        <div className="grid gap-2 md:grid-cols-2 max-h-96 overflow-auto">
          {skills.map(skill => (
            <div 
              key={skill.name}
              className="p-3 rounded-lg"
              style={{ 
                background: skill.enabled ? 'rgba(16,185,129,0.1)' : 'var(--bg-primary)',
                borderLeft: skill.enabled ? '3px solid var(--success)' : '3px solid transparent'
              }}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{skill.name}</div>
                {skill.enabled && <span className="text-xs" style={{ color: 'var(--success)' }}>✅</span>}
              </div>
              <div className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {skill.version || '无描述'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
