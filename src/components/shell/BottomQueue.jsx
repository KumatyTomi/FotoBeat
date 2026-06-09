import { AlertTriangle, Gauge, ListChecks, LifeBuoy } from 'lucide-react';

const ITEMS = [
  { id: 'queue', label: 'Queue', icon: <ListChecks size={16} /> },
  { id: 'warnings', label: 'Warnings', icon: <AlertTriangle size={16} /> },
  { id: 'performance', label: 'Performance', icon: <Gauge size={16} /> },
  { id: 'support', label: 'Support Status', icon: <LifeBuoy size={16} /> }
];

export default function BottomQueue({ collapsed, onToggle }) {
  return (
    <footer className={`bottom-queue ${collapsed ? 'collapsed' : 'expanded'}`}>
      <button className="bottom-queue-toggle" onClick={onToggle}>{collapsed ? 'Queue' : 'Collapse queue'}</button>
      <div className="bottom-queue-items">
        {ITEMS.map((item) => (
          <span key={item.id}>{item.icon}{item.label}</span>
        ))}
      </div>
    </footer>
  );
}
