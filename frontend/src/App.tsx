import { useState } from 'react';
import PlatformPanel from './components/PlatformPanel';
import ModelPanel from './components/ModelPanel';
import SkillPanel from './components/SkillPanel';
import ConfigPanel from './components/ConfigPanel';
import GatewayPanel from './components/GatewayPanel';
import UpdatePanel from './components/UpdatePanel';

type TabId = 'platforms' | 'models' | 'skills' | 'gateway' | 'update' | 'config';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'platforms', label: '平台配置', icon: '🔌' },
  { id: 'models', label: '模型管理', icon: '🤖' },
  { id: 'skills', label: 'Skills', icon: '📦' },
  { id: 'gateway', label: 'Gateway', icon: '⚡' },
  { id: 'update', label: '更新', icon: '🔄' },
  { id: 'config', label: '系统配置', icon: '⚙️' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('platforms');

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] bg-[#1a1a1a] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">OpenClaw Console</h1>
            <p className="text-sm text-[#a1a1aa]">可视化管理后台</p>
          </div>
          <div className="text-sm text-[#a1a1aa]">
            后端运行在 localhost:8080
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-[#2a2a2a] bg-[#1a1a1a] px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-[#a1a1aa] hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'platforms' && <PlatformPanel />}
        {activeTab === 'models' && <ModelPanel />}
        {activeTab === 'skills' && <SkillPanel />}
        {activeTab === 'gateway' && <GatewayPanel />}
        {activeTab === 'update' && <UpdatePanel />}
        {activeTab === 'config' && <ConfigPanel />}
      </main>
    </div>
  );
}

export default App;
