import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function AccordionGroup({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`accordion-group ${open ? 'open' : 'closed'}`}>
      <button className="accordion-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <ChevronRight size={16} />
        <span>{title}</span>
      </button>
      <div className="accordion-content" aria-hidden={!open}>
        {children}
      </div>
    </section>
  );
}
