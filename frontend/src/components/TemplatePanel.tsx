import { useState } from 'react';

export default function TemplatePanel() {
  const [selected, setSelected] = useState<string | null>(null);

  const templates = [
    { 
      id: 'chatgpt', 
      name: 'ChatGPT平替', 
      desc: '最基础的AI对话助手',
      icon: '💬',
      platforms: ['feishu'],
      model: 'MiniMax-M2.5-highspeed',
      skills: [],
      config: {
        temperature: 0.7,
        max_tokens: 4096,
        system_prompt: '你是一个有帮助的AI助手，简洁准确地回答用户问题。'
      }
    },
    { 
      id: 'assistant', 
      name: '私人助理', 
      desc: '日常生活助手，提醒、查询、记录',
      icon: '👨‍💼',
      platforms: ['feishu'],
      model: 'MiniMax-M2.5-highspeed',
      skills: ['weather', 'cron-manager'],
      config: {
        temperature: 0.5,
        max_tokens: 2048,
        system_prompt: '你是一个贴心的私人助理，帮助用户管理日程、提醒事项、查询信息。'
      }
    },
    { 
      id: 'developer', 
      name: '开发者伙伴', 
      desc: '编程助手，代码审查、Debug、写文档',
      icon: '💻',
      platforms: ['feishu'],
      model: 'MiniMax-M2.5-highspeed',
      skills: ['github', 'browser-automation'],
      config: {
        temperature: 0.3,
        max_tokens: 8192,
        system_prompt: '你是一个专业的开发者助手，擅长编程、代码审查、技术文档撰写。'
      }
    },
    { 
      id: 'researcher', 
      name: '研究员', 
      desc: '文献阅读、资料整理、观点总结',
      icon: '🔬',
      platforms: ['feishu'],
      model: 'MiniMax-M2.5',
      skills: ['web-search', 'web-scraping', 'pdf-reader'],
      config: {
        temperature: 0.4,
        max_tokens: 16384,
        system_prompt: '你是一个研究助手，擅长阅读文献、整理资料、总结观点。'
      }
    },
    { 
      id: 'content', 
      name: '内容创作者', 
      desc: '文案、脚本、创意头脑风暴',
      icon: '✍️',
      platforms: ['feishu'],
      model: 'MiniMax-M2.5-highspeed',
      skills: ['browser-automation'],
      config: {
        temperature: 0.8,
        max_tokens: 4096,
        system_prompt: '你是一个创意十足的内容创作者，擅长文案、脚本、创意头脑风暴。'
      }
    },
    { 
      id: 'trading', 
      name: '量化交易员', 
      desc: 'A股筛选、策略回测、交易信号',
      icon: '📈',
      platforms: ['feishu'],
      model: 'MiniMax-M2.5',
      skills: ['stock-pick'],
      config: {
        temperature: 0.2,
        max_tokens: 4096,
        system_prompt: '你是一个专业的量化交易分析师，擅长A股分析、策略回测、投资建议。'
      }
    },
  ];

  const applyTemplate = async (tpl: any) => {
    const confirmed = confirm(`应用"${tpl.name}"模板？\n\n这将配置：\n- 平台: ${tpl.platforms.join(', ')}\n- 模型: ${tpl.model}\n- 技能: ${tpl.skills.join(', ') || '无'}`);
    if (!confirmed) return;
    
    try {
      // 1. 先备份当前配置
      await fetch('/api/backup', { method: 'POST' });
      
      // 2. 启用平台
      for (const platform of tpl.platforms) {
        await fetch(`/api/platform/${platform}/toggle`, { method: 'POST' });
      }
      
      // 3. 设置默认模型
      const modelRes = await fetch('/api/models');
      const modelData = await modelRes.json();
      const targetModel = modelData.data?.find((m: any) => m.name === tpl.model);
      if (targetModel) {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'default_model', value: tpl.model })
        });
      }
      
      // 4. 安装所需技能
      const skillsRes = await fetch('/api/skills');
      const skillsData = await skillsRes.json();
      const installedSkills = skillsData.data?.map((s: any) => s.name) || [];
      
      for (const skill of tpl.skills || []) {
        if (!installedSkills.includes(skill)) {
          await fetch('/api/skills/install', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: skill })
          });
        }
      }
      
      alert(`✅ 模板"${tpl.name}"应用成功！\n\n已配置：\n- 平台: ${tpl.platforms.join(', ')}\n- 模型: ${tpl.model}\n- 技能: ${tpl.skills.join(', ') || '无'}\n\n请重启Gateway使配置生效。`);
      
      // 提示重启
      if (confirm('是否现在重启Gateway使配置生效？')) {
        await fetch('/api/gateway/restart', { method: 'POST' });
      }
    } catch (e) {
      console.error(e);
      alert('❌ 操作失败: ' + e);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>💡 快速模板</h2>
      
      <div className="glass-card p-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
        <p className="text-sm" style={{ color: 'var(--success)' }}>
          ✅ 选择一个模板，一键配置你的AI助手
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(tpl => (
          <div key={tpl.id} className="glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{tpl.icon}</span>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{tpl.name}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tpl.desc}</p>
              </div>
            </div>
            
            {selected === tpl.id ? (
              <div className="mb-3 p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <pre className="text-xs overflow-auto max-h-40" style={{ color: 'var(--text-muted)' }}>
                  {JSON.stringify({
                    platforms: tpl.platforms,
                    model: tpl.model,
                    skills: tpl.skills,
                    ...tpl.config
                  }, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div>模型: {tpl.model}</div>
                <div>技能: {tpl.skills.join(', ') || '无'}</div>
              </div>
            )}
            
            <div className="flex gap-2">
              <button 
                onClick={() => setSelected(selected === tpl.id ? null : tpl.id)}
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                {selected === tpl.id ? '收起' : '查看'}
              </button>
              <button 
                onClick={() => applyTemplate(tpl)} 
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                ✅ 应用
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
