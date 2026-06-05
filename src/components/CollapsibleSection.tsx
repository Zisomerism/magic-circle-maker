import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`section ${open ? "open" : ""}`}>
      <button
        type="button"
        className="section-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="section-chevron">{open ? "\u25be" : "\u25b8"}</span>
        {title}
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}
