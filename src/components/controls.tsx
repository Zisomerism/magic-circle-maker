import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  value?: ReactNode;
}

export function Field({ label, hint, children, value }: FieldProps) {
  return (
    <label className="field" title={hint}>
      <span className="field-label">
        {label}
        {value !== undefined && <span className="field-value">{value}</span>}
      </span>
      {children}
    </label>
  );
}

interface SliderProps {
  label: string;
  hint?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

export function Slider({
  label,
  hint,
  min,
  max,
  step = 1,
  value,
  onChange,
  format,
}: SliderProps) {
  return (
    <Field label={label} hint={hint} value={format ? format(value) : value}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

interface TextInputProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}

export function TextInput({ label, hint, value, onChange, textarea }: TextInputProps) {
  return (
    <Field label={label} hint={hint}>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

interface ColorInputProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}

export function ColorInput({ label, hint, value, onChange }: ColorInputProps) {
  return (
    <Field label={label} hint={hint} value={value}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

interface ToggleProps {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, hint, value, onChange }: ToggleProps) {
  return (
    <label className="toggle" title={hint}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

interface SelectProps {
  label: string;
  hint?: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

export function Select({ label, hint, value, options, onChange }: SelectProps) {
  return (
    <Field label={label} hint={hint}>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
