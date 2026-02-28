import { useState, useEffect } from 'react';
import type { Model, ApiResponse } from '../types';

const providers = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'minimax', name: 'MiniMax' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'azure', name: 'Azure OpenAI' },
];

export default function ModelPanel() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    provider: 'openai',
    api_key: '',
    base_url: '',
    model_id: '',
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/models');
      const data: ApiResponse<Model[]> = await res.json();
      if (data.success) {
        setModels(data.data);
      }
    } catch (e) {
      console.error('Failed to load models:', e);
    }
    setLoading(false);
  };

  const saveModel = async () => {
    try {
      await fetch('http://localhost:8080/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ name: '', provider: 'openai', api_key: '', base_url: '', model_id: '' });
      loadModels();
    } catch (e) {
      console.error('Failed to save model:', e);
    }
  };

  const deleteModel = async (id: string) => {
    if (!confirm('确定删除此模型？')) return;
    try {
      await fetch(`http://localhost:8080/api/models/${id}`, { method: 'DELETE' });
      loadModels();
    } catch (e) {
      console.error('Failed to delete model:', e);
    }
  };

  if (loading) {
    return <div className="text-[#a1a1aa]">加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">模型管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        >
          {showForm ? '取消' : '+ 添加模型'}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1">模型名称</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="如: GPT-4"
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1">提供商</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-[#a1a1aa] mb-1">API Key</label>
              <input
                type="password"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1">Base URL (可选)</label>
              <input
                type="text"
                value={form.base_url}
                onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-[#a1a1aa] mb-1">模型 ID</label>
              <input
                type="text"
                value={form.model_id}
                onChange={(e) => setForm({ ...form, model_id: e.target.value })}
                placeholder="gpt-4"
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2"
              />
            </div>
          </div>
          <button
            onClick={saveModel}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            保存
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{model.name}</div>
              <div className="text-sm text-[#a1a1aa]">
                {providers.find(p => p.id === model.provider)?.name} • {model.model_id}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded ${model.enabled ? 'bg-green-600' : 'bg-[#2a2a2a]'}`}>
                {model.enabled ? '启用' : '禁用'}
              </span>
              <button
                onClick={() => deleteModel(model.id)}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded"
              >
                删除
              </button>
            </div>
          </div>
        ))}
        {models.length === 0 && !showForm && (
          <div className="text-[#a1a1aa] text-center py-8">
            暂无模型，点击"添加模型"开始配置
          </div>
        )}
      </div>
    </div>
  );
}
