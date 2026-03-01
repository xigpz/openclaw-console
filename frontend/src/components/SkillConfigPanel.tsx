import { useState, useEffect } from 'react';

interface SkillConfig {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

export default function SkillConfigPanel() {
  const [skills, setSkills] = useState<SkillConfig[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) {
        // 为每个技能添加默认配置
        const skillsWithConfig = (data.skills || []).map((s: any) => ({
          name: s.name,
          enabled: true,
          config: getDefaultConfig(s.name)
        }));
        setSkills(skillsWithConfig);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getDefaultConfig = (name: string) => {
    const defaults: Record<string, Record<string, any>> = {
      'github': { repo: '', token: '', auto_sync: false },
      'browser-automation': { headless: true, timeout: 30000 },
      'weather': { location: 'beijing', unit: 'celsius' },
      'stock-pick': { push_time: '14:30', top_n: 5 },
      'cron-manager': { max_jobs: 10 },
    };
    return defaults[name] || {};
  };

  const updateConfig = (name: string, key: string, value: any) => {
    setSkills(skills.map(s => {
      if (s.name === name) {
        return { ...s, config: { ...s.config, [key]: value }};
      }
      return s;
    }));
  };

  const saveSkillConfig = async (name: string) => {
    const skill = skills.find(s => s.name === name);
    if (!skill) return;
    
    try {
      await fetch('/api/skills/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, config: skill.config })
      });
      alert(`✅ ${name} 配置已保存`);
    } catch (e) {
      alert('❌ 保存失败');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>⚙️ 技能配置</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 技能列表 */}
        <div className="glass-card p-4">
          <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>技能列表 ({skills.length})</h3>
          <div className="space-y-2 max-h-96 overflow-auto">
            {skills.map(skill => (
              <div 
                key={skill.name}
                onClick={() => setSelected(skill.name)}
                className="p-3 rounded-lg cursor-pointer transition-colors"
                style={{ 
                  background: selected === skill.name ? 'var(--primary)' : 'var(--bg-primary)',
                  color: selected === skill.name ? 'white' : 'var(--text-secondary)'
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-xs opacity-60">{Object.keys(skill.config).length} 项配置</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 配置详情 */}
        <div className="glass-card p-4">
          <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            {selected ? `${selected} 配置` : '选择技能查看配置'}
          </h3>
          
          {selected ? (
            <div className="space-y-4">
              {Object.entries(skills.find(s => s.name === selected)?.config || {}).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{key}</label>
                  {typeof value === 'boolean' ? (
                    <button
                      onClick={() => updateConfig(selected, key, !value)}
                      className="w-full p-2 rounded-lg text-left"
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
                    >
                      {value ? '✅ 启用' : '❌ 禁用'}
                    </button>
                  ) : typeof value === 'number' ? (
                    <input
                      type="number"
                      value={value}
                      onChange={e => updateConfig(selected, key, parseInt(e.target.value))}
                      className="input-glass w-full"
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={e => updateConfig(selected, key, e.target.value)}
                      className="input-glass w-full"
                    />
                  )}
                </div>
              ))}
              
              <button onClick={() => saveSkillConfig(selected)} className="btn-glow w-full">
                💾 保存配置
              </button>
            </div>
          ) : (
            <div className="text-center py-12 opacity-50" style={{ color: 'var(--text-muted)' }}>
              点击左侧技能查看配置
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
