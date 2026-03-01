import { useState, useEffect } from 'react';

interface CronJob {
  schedule: string;
  command: string;
  name: string;
}

export default function CronPanel() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newJob, setNewJob] = useState({ schedule: '', command: '', name: '' });

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cron');
      const data = await res.json();
      if (data.success) setJobs(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const addJob = async () => {
    if (!newJob.schedule || !newJob.command) return;
    try {
      await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      setShowAdd(false);
      setNewJob({ schedule: '', command: '', name: '' });
      loadJobs();
    } catch (e) { console.error(e); }
  };

  const deleteJob = async (cmd: string) => {
    if (!confirm('确定删除这个定时任务吗？')) return;
    try {
      await fetch('/api/cron?command=' + encodeURIComponent(cmd), { method: 'DELETE' });
      loadJobs();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>⏰ 定时任务</h2>
        <button onClick={() => setShowAdd(true)} className="btn-glow">➕ 添加任务</button>
      </div>

      {/* 添加任务弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>添加定时任务</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>任务名称</label>
                <input value={newJob.name} onChange={e => setNewJob({...newJob, name: e.target.value})} className="input-glass" placeholder="如：同步记忆" />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>执行周期 (Cron表达式)</label>
                <input value={newJob.schedule} onChange={e => setNewJob({...newJob, schedule: e.target.value})} className="input-glass" placeholder="如：*/30 * * * *" />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>执行命令</label>
                <input value={newJob.command} onChange={e => setNewJob({...newJob, command: e.target.value})} className="input-glass" placeholder="如：/root/xxx.sh >> /root/xxx.log" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={addJob} className="btn-glow flex-1">添加</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 任务列表 */}
      <div className="grid gap-4">
        {jobs.map((job, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{job.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{job.schedule}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{job.command}</div>
              </div>
              <button onClick={() => deleteJob(job.command)} className="px-3 py-1 rounded text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>删除</button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && <div className="glass-card p-6 text-center" style={{ color: 'var(--text-muted)' }}>暂无定时任务</div>}
      </div>
    </div>
  );
}
