import { useState } from 'react';

interface Instance {
  id: string;
  name: string;
  url: string;
  status: 'online' | 'offline' | 'unknown';
  description: string;
}

export default function InstancePanel() {
  const [instances, setInstances] = useState<Instance[]>([
    { id: 'local', name: '本地实例', url: 'http://localhost:8080', status: 'online', description: '当前服务器上的OpenClaw' },
  ]);
  const [selected, setSelected] = useState<string | null>('local');
  const [showAdd, setShowAdd] = useState(false);
  const [newInstance, setNewInstance] = useState({ name: '', url: '', description: '' });

  const addInstance = () => {
    if (!newInstance.name || !newInstance.url) return;
    const instance: Instance = {
      id: Date.now().toString(),
      ...newInstance,
      status: 'unknown'
    };
    setInstances([...instances, instance]);
    setNewInstance({ name: '', url: '', description: '' });
    setShowAdd(false);
  };

  const removeInstance = (id: string) => {
    if (!confirm('确定删除该实例？')) return;
    setInstances(instances.filter(i => i.id !== id));
    if (selected === id) setSelected('local');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>🌐 多实例管理</h2>
        <button onClick={() => setShowAdd(true)} className="btn-glow">➕ 添加实例</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {instances.map(instance => (
          <div 
            key={instance.id}
            onClick={() => setSelected(instance.id)}
            className="glass-card p-4 cursor-pointer transition-all"
            style={{ 
              borderColor: selected === instance.id ? 'var(--primary)' : 'var(--border-subtle)',
              background: selected === instance.id ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)'
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{instance.name}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{instance.url}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{instance.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${instance.status === 'online' ? 'bg-green-500' : instance.status === 'offline' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                {instance.id !== 'local' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeInstance(instance.id); }}
                    className="text-xs opacity-50 hover:opacity-100"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 添加实例弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-96">
            <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>添加新实例</h3>
            <div className="space-y-3">
              <input
                value={newInstance.name}
                onChange={e => setNewInstance({...newInstance, name: e.target.value})}
                placeholder="实例名称"
                className="input-glass w-full"
              />
              <input
                value={newInstance.url}
                onChange={e => setNewInstance({...newInstance, url: e.target.value})}
                placeholder="API地址 (如 http://192.168.1.100:8080)"
                className="input-glass w-full"
              />
              <input
                value={newInstance.description}
                onChange={e => setNewInstance({...newInstance, description: e.target.value})}
                placeholder="描述 (可选)"
                className="input-glass w-full"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 btn-secondary">取消</button>
              <button onClick={addInstance} className="flex-1 btn-glow">添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
