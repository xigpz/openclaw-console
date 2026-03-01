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

type TabId = 'platforms' | 'models' | 'skills' | 'gateway' | 'update' | 'config' | 'agent' | 'cron' | 'market' | 'logs';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'platforms', label: '平台', icon: '🔌' },
  { id: 'models', label: '模型', icon: '🤖' },
  { id: 'skills', label: '技能', icon: '📦' },
  { id: 'market', label: '市场', icon: '🛒' },
  { id: 'cron', label: '定时', icon: '⏰' },
  { id: 'logs', label: '日志', icon: '📋' },
  { id: 'backup', label: '备份', icon: '💾' },
  { id: 'system', label: '状态', icon: '🖥️' },
  { id: 'agent', label: '人格', icon: '🧠' },
  { id: 'gateway', label: '网关', icon: '⚡' },
  { id: 'update', label: '更新', icon: '🔄' },
  { id: 'config', label: '配置', icon: '⚙️' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('platforms');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('logged_in') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('logged_in');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* 顶部导航 */}
      <header 
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                boxShadow: '0 0 20px var(--primary-glow)'
              }}
            >
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                OpenClaw Console
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                可视化管理后台
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              API: {import.meta.env.VITE_API_BASE?.replace(':8080','') || 'localhost'}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{ 
                background: 'rgba(239, 68, 68, 0.15)', 
                color: '#ef4444' 
              }}
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Tab导航 */}
      <nav 
        className="px-8 py-2"
        style={{
          background: 'rgba(18, 18, 26, 0.5)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap"
              style={{
                ...(activeTab === tab.id 
                  ? { 
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))',
                      color: 'var(--text-primary)',
                      borderBottom: 'none'
                    }
                  : { 
                      color: 'var(--text-secondary)',
                      background: 'transparent'
                    })
              }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="p-8 animate-in">
        {activeTab === 'platforms' && <PlatformPanel />}
        {activeTab === 'models' && <ModelPanel />}
        {activeTab === 'skills' && <SkillPanel />}
        {activeTab === 'market' && <MarketPanel />}
        {activeTab === 'logs' && <LogPanel />}
        {activeTab === 'backup' && <BackupPanel />}
        {activeTab === 'system' && <SystemPanel />}
        {activeTab === 'cron' && <CronPanel />}
        {activeTab === 'agent' && <AgentPanel />}
        {activeTab === 'gateway' && <GatewayPanel />}
        {activeTab === 'update' && <UpdatePanel />}
        {activeTab === 'config' && <ConfigPanel />}
      </main>
    </div>
  );
}

export default App;
