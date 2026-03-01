import { useState, useEffect } from 'react';

export default function WelcomePanel() {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem('welcome_dismissed') === 'true');
  }, []);

  if (dismissed) return null;

  const steps = [
    { title: '欢迎使用 OpenClaw Console', content: '这是您的AI助手管理后台，可以可视化配置所有功能' },
    { title: '平台配置', content: '管理飞书、Telegram、QQ等消息渠道的连接配置' },
    { title: '模型管理', content: '选择AI模型，配置API Key。推荐使用MiniMax M2.5 highspeed。' },
    { title: '技能市场', content: '安装和管理各种扩展技能' },
    { title: '定时任务', content: '设置自动化任务' },
  ];

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('welcome_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 glass-card p-4 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {steps[step].title}
        </h3>
        <button onClick={handleDismiss} className="text-sm" style={{ color: 'var(--text-muted)' }}>
          ×
        </button>
      </div>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        {steps[step].content}
      </p>
      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: i === step ? 'var(--primary)' : 'var(--border-subtle)' }} />
          ))}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
              上一步
            </button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="text-xs px-3 py-1 rounded" style={{ background: 'var(--primary)', color: 'white' }}>
              下一步
            </button>
          ) : (
            <button onClick={handleDismiss} className="text-xs px-3 py-1 rounded" style={{ background: 'var(--primary)', color: 'white' }}>
              开始使用
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
