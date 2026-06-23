import { AlertTriangle, CheckCircle2, Gauge, ListChecks, Zap } from 'lucide-react';

const ITEMS = [
  { id: 'queue', label: 'Render Queue: Project 01', icon: <ListChecks size={16} />, tone: 'amber' },
  { id: 'ffmpeg', label: 'FFmpeg Ready', icon: <CheckCircle2 size={16} />, tone: 'green' },
  { id: 'native', label: 'Native MP4', icon: <Zap size={16} />, tone: 'cyan' },
  { id: 'performance', label: 'Performance Stable', icon: <Gauge size={16} />, tone: 'violet' },
  { id: 'warnings', label: '0 Warnings', icon: <AlertTriangle size={16} />, tone: 'muted' }
];

export default function BottomQueue({ collapsed, onToggle }) {
  return (
    <footer className={`bottom-queue cockpit-bottom-queue ${collapsed ? 'collapsed' : 'expanded'}`}>
      <button className="bottom-queue-toggle" onClick={onToggle}>{collapsed ? 'Queue' : 'Collapse queue'}</button>
      <div className="bottom-queue-items">
        {ITEMS.map((item) => (
          <span key={item.id} className={`queue-tone-${item.tone}`}>{item.icon}{item.label}</span>
        ))}
      </div>
    </footer>
  );
}
