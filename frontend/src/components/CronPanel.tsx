import { useState, useEffect } from 'react';

interface CronJob {
  schedule: string;
  command: string;
  enabled: boolean;
}

export default function CronPanel() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newJob, setNewJob] = useState({ schedule: '', command: '' });
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => { loadJobs(); }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 2000);
  };

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
    if (!newJob.schedule || !newJob.command) {
      showToast('请填写完整', 'error');
      return;
    }
    try {
      await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      setShowAdd(false);
      setNewJob({ schedule: '', command: '' });
      loadJobs();
      showToast('添加成功');
    } catch (e) {
      showToast('添加失败', 'error');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>⏰ 定时任务</h2>
        <button onClick={loadJobs} className="btn-glow">🔄 刷新</button>
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <div className="glass-card p-8 text-center" style={{ color: 'var(--text-muted)' }}>暂无定时任务，请添加</div>
        ) : jobs.map((job, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono text-sm mb-1" style={{ color: 'var(--primary)' }}>{job.schedule}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{job.command}</div>
              </div>
              <span className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--success)' }}>✅ 启用</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>💡 定时任务从系统 crontab 读取</p>
      </div>
    </div>
  );
}
