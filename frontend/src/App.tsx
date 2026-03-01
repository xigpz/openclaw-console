import { useState, useEffect } from 'react';
import PlatformPanel from './components/PlatformPanel';
import ModelPanel from './components/ModelPanel';
import SkillPanel from './components/SkillPanel';
import ConfigPanel from './components/ConfigPanel';
import GatewayPanel from './components/GatewayPanel';
import UpdatePanel from './components/UpdatePanel';
import AgentPanel from './components/AgentPanel';
import CronPanel from './components/CronPanel';
import LogPanel from './components/LogPanel';
import BackupPanel from './components/BackupPanel';
import SystemPanel from './components/SystemPanel';
import MarketPanel from './components/MarketPanel';
import Login from './pages/Login';
import WelcomePanel from './components/WelcomePanel';
import HelpPanel from './components/HelpPanel';
import InstallPanel from './components/InstallPanel';
import RemotePanel from './components/RemotePanel';
import TemplatePanel from './components/TemplatePanel';
import AlertPanel from './components/AlertPanel';
import SessionPanel from './components/SessionPanel';
import MemoryPanel from './components/MemoryPanel';
import StatsPanel from './components/StatsPanel';
import MonitorPanel from './components/MonitorPanel';
import QuickPanel from './components/QuickPanel';
import InstancePanel from './components/InstancePanel';
import SkillConfigPanel from './components/SkillConfigPanel';

type TabId = 'platforms' | 'models' | 'skills' | 'gateway' | 'update' | 'config' | 'agent' | 'cron' | 'market' | 'logs' | 'backup' | 'system' | 'help' | 'install' | 'remote' | 'template' | 'alert' | 'session' | 'memory' | 'stats' | 'monitor' | 'quick' | 'instance' | 'skill-config';

interface MenuItem {
  id: TabId;
  label: string;
  icon: string;
}

interface MenuGroup {
  label: string;
  icon: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  { label: '安装', icon: '📥', items: [
    { id: 'install', label: '一键安装', icon: '📥' },
    { id: 'template', label: '快速模板', icon: '💡' },
  ]},
  { label: '核心', icon: '🔌', items: [
    { id: 'platforms', label: '平台', icon: '🔌' },
    { id: 'models', label: '模型', icon: '🤖' },
    { id: 'skills', label: '技能', icon: '📦' },
  ]},
  { label: '扩展', icon: '🛒', items: [
    { id: 'market', label: '市场', icon: '🛒' },
    { id: 'cron', label: '定时', icon: '⏰' },
  ]},
  { label: '运维', icon: '📋', items: [
    { id: 'logs', label: '日志', icon: '📋' },
    { id: 'backup', label: '备份', icon: '💾' },
    { id: 'system', label: '状态', icon: '🖥️' },
    { id: 'alert', label: '告警', icon: '🔔' },
  ]},
  { label: '数据', icon: '💬', items: [
    { id: 'session', label: '会话', icon: '💬' },
    { id: 'memory', label: '记忆', icon: '🧠' },
    { id: 'stats', label: '统计', icon: '📊' },
    { id: 'monitor', label: '监控', icon: '📡' },
  ]},
  { label: '工具', icon: '⚡', items: [
    { id: 'quick', label: '快捷', icon: '⚡' },
    { id: 'instance', label: '实例', icon: '🌐' },
  ]},
  { label: '设置', icon: '⚙️', items: [
    { id: 'agent', label: '人格', icon: '🧠' },
    { id: 'skill-config', label: '技能配置', icon: '⚙️' },
    { id: 'gateway', label: '网关', icon: '⚡' },
    { id: 'update', label: '更新', icon: '🔄' },
    { id: 'config', label: '配置', icon: '⚙️' },
  ]},
  { label: '帮助', icon: '📖', items: [
    { id: 'help', label: '帮助', icon: '📖' },
    { id: 'install', label: '安装', icon: '📥' },
    { id: 'remote', label: '远程', icon: '🔗' },
    { id: 'template', label: '模板', icon: '💡' },
  ]},
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('platforms');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(['install', 'core', 'ext', 'ops', 'data', 'tools', 'config', 'help']);

  useEffect(() => {
    const loggedIn = localStorage.getItem('logged_in') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('logged_in');
    setIsLoggedIn(false);
  };

  const toggleGroup = (key: string) => {
    setOpenKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const renderMenu = () => (
    <ul className="menu-root">
      {menuGroups.map((group, idx) => {
        const groupKey = ['install', 'core', 'ext', 'ops', 'data', 'tools', 'config', 'help'][idx];
        const isOpen = openKeys.includes(groupKey);
        
        return (
          <li key={groupKey} className="menu-group">
            <div 
              className="menu-group-title"
              onClick={() => toggleGroup(groupKey)}
            >
              <span className="menu-group-icon">{group.icon}</span>
              <span className="menu-group-label">{group.label}</span>
              <span className={`menu-arrow ${isOpen ? 'open' : ''}`}>▶</span>
            </div>
            
            {isOpen && (
              <ul className="menu-sub">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <aside className="w-52 shrink-0 flex flex-col" style={{ background: 'var(--bg-elevated)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>OpenClaw</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Console</p>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          {renderMenu()}
        </nav>
        
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={handleLogout} className="text-sm" style={{ color: 'var(--text-muted)' }}>
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {activeTab === 'platforms' && <PlatformPanel />}
        {activeTab === 'models' && <ModelPanel />}
        {activeTab === 'skills' && <SkillPanel />}
        {activeTab === 'market' && <MarketPanel />}
        {activeTab === 'cron' && <CronPanel />}
        {activeTab === 'logs' && <LogPanel />}
        {activeTab === 'backup' && <BackupPanel />}
        {activeTab === 'system' && <SystemPanel />}
        {activeTab === 'agent' && <AgentPanel />}
        {activeTab === 'gateway' && <GatewayPanel />}
        {activeTab === 'update' && <UpdatePanel />}
        {activeTab === 'config' && <ConfigPanel />}
        {activeTab === 'help' && <HelpPanel />}
        {activeTab === 'install' && <InstallPanel />}
        {activeTab === 'remote' && <RemotePanel />}
        {activeTab === 'template' && <TemplatePanel />}
        {activeTab === 'alert' && <AlertPanel />}
        {activeTab === 'session' && <SessionPanel />}
        {activeTab === 'memory' && <MemoryPanel />}
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'monitor' && <MonitorPanel />}
        {activeTab === 'quick' && <QuickPanel />}
        {activeTab === 'instance' && <InstancePanel />}
        {activeTab === 'skill-config' && <SkillConfigPanel />}
      </main>
      <WelcomePanel />
    </div>
  );
}

export default App;
