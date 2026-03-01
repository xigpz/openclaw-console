import { useState, useEffect } from 'react';

interface Skill {
  name: string;
  description: string;
  installed: boolean;
  source?: string;
}

// 模拟应用市场数据 - 实际可对接ClawHub API
const marketSkills = [
  { name: 'feishu-doc', description: '飞书文档操作 - 读写飞书文档、知识库' },
  { name: 'feishu-wiki', description: '飞书知识库导航 - 管理wiki页面' },
  { name: 'feishu-drive', description: '飞书云盘管理 - 文件操作' },
  { name: 'github', description: 'GitHub操作 - Issues、PR、CI/CD' },
  { name: 'weather', description: '天气查询 - 获取天气预报' },
  { name: 'browser-automation', description: '浏览器自动化 - Web测试、数据抓取' },
  { name: 'web-search', description: '网络搜索 - Tavily/Exa AI搜索' },
  { name: 'twitter-automation', description: 'Twitter自动化 - 发推、点赞、关注' },
  { name: 'postgresql-table-design', description: 'PostgreSQL表设计最佳实践' },
  { name: 'sql-optimization', description: 'SQL优化 - 索引、查询优化' },
  { name: 'e2e-testing', description: 'E2E测试 - Playwright/Cypress' },
  { name: 'notion', description: 'Notion集成 - 页面和数据库操作' },
];

export default function MarketPanel() {
  const [installedSkills, setInstalledSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [importName, setImportName] = useState('');
  const [importDesc, setImportDesc] = useState('');

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      if (data.success) setInstalledSkills(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleInstall = async (name: string, description: string) => {
    try {
      const res = await fetch('/api/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, source: 'market' })
      });
      const data = await res.json();
      if (data.success) {
        alert('安装成功！');
        fetchSkills();
      }
    } catch (e) { console.error(e); }
  };

  const handleUninstall = async (name: string) => {
    if (!confirm('确定卸载 ' + name + ' 吗？')) return;
    try {
      await fetch('/api/skills/' + name + '/uninstall', { method: 'POST' });
      fetchSkills();
    } catch (e) { console.error(e); }
  };

  const handleImport = async () => {
    if (!importName) return;
    try {
      const res = await fetch('/api/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: importName, description: importDesc, source: 'manual' })
      });
      if (res.ok) {
        alert('导入成功！');
        setShowImport(false);
        setImportName('');
        setImportDesc('');
        fetchSkills();
      }
    } catch (e) { console.error(e); }
  };

  const installedNames = installedSkills.map(s => s.name);
  const availableSkills = marketSkills.filter(s => !installedNames.includes(s.name));

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🛒 技能市场</h2>
        <button onClick={() => setShowImport(true)} className="btn-glow">➕ 手动导入</button>
      </div>

      {/* 已安装 */}
      <div>
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>已安装 ({installedSkills.length})</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {installedSkills.map(skill => (
            <div key={skill.name} className="glass-card p-4 flex justify-between items-center">
              <div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{skill.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{skill.description}</div>
              </div>
              <button onClick={() => handleUninstall(skill.name)} className="text-red-400 hover:text-red-300">卸载</button>
            </div>
          ))}
        </div>
      </div>

      {/* 市场 */}
      <div>
        <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>可用技能 ({availableSkills.length})</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {availableSkills.map(skill => (
            <div key={skill.name} className="glass-card p-4 flex justify-between items-center">
              <div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{skill.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{skill.description}</div>
              </div>
              <button onClick={() => handleInstall(skill.name, skill.description)} className="btn-glow text-sm py-1 px-3">安装</button>
            </div>
          ))}
        </div>
      </div>

      {/* 导入弹窗 */}
      {showImport && (
        <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-black/70 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md max-h-[80vh] overflow-auto my-auto">
            <h3 className="text-lg font-medium mb-4">手动导入技能</h3>
            <div className="space-y-4">
              <div><label className="block text-sm mb-2">技能名称</label><input value={importName} onChange={e => setImportName(e.target.value)} className="input-glass w-full" placeholder="skill-name" /></div>
              <div><label className="block text-sm mb-2">描述</label><input value={importDesc} onChange={e => setImportDesc(e.target.value)} className="input-glass w-full" placeholder="技能描述" /></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={handleImport} className="btn-glow flex-1">导入</button><button onClick={() => setShowImport(false)} className="px-4 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>取消</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
