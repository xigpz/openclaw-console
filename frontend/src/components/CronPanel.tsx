import { useState, useEffect } from 'react';

export default function CronPanel() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => { loadJobs(); loadLogs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cron');
      const data = await res.json();
      if (data.success) setJobs(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/cron/logs');
      const data = await res.json();
      if (data.success) setLogs(data.data || []);
    } catch (e) { console.error(e); }
  };

  const toggleJob = async (id: string, enabled: boolean) => {
    await fetch('/api/cron/' + id + '/toggle', { method: 'POST' });
    loadJobs();
  };

  const deleteJob = async (id: string) => {
    if (!confirm('确定删除这个定时任务吗？')) return;
    await fetch('/api/cron/' + id, { method: 'DELETE' });
    loadJobs();
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>⏰ 定时任务</h2>
        <button onClick={() => setShowLogs(!showLogs)} className="btn-glow">
          {showLogs ? '隐藏日志' : '📋 执行日志'}
        </button>
      </div>

      {/* 执行日志 */}
      {showLogs && (
        <div className="glass-card p-4" style={{ maxHeight: '200px', overflow: 'auto' }}>
          <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>最近执行</h3>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>暂无执行记录</div>
          ) : (
            <pre className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
              {logs.join('\n')}
            </pre>
          )}
        </div>
      )}

      {/* 任务列表 */}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="glass-card p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{job.name || job.id}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{job.schedule}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => deleteJob(job.id)} className="px-3 py-1 rounded text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>删除</button>
                <button onClick={() => toggleJob(job.id, !job.enabled)} className="px-4 py-1 rounded text-sm" style={{ background: job.enabled ? 'var(--primary)' : 'var(--bg-elevated)', color: job.enabled ? 'white' : 'var(--text-secondary)' }}>
                  {job.enabled ? '禁用' : '启用'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无定时任务</div>}
      </div>
    </div>
  );
}
