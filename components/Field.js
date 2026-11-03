// Campos de formulário com o visual do Borali (funcionam em páginas de servidor).
export function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required = false,
  hint,
  placeholder,
  autoComplete,
  min,
  max,
  step,
  minLength,
  rows = 4,
  disabled = false,
}) {
  const id = `f-${name}`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {type === 'textarea' ? (
        <textarea id={id} name={name} rows={rows} defaultValue={defaultValue ?? ''} placeholder={placeholder} required={required} />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          defaultValue={defaultValue ?? ''}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          minLength={minLength}
          disabled={disabled}
        />
      )}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function Check({ label, name, defaultChecked = false }) {
  const id = `f-${name}`;
  return (
    <div className="field field-check">
      <input id={id} name={name} type="checkbox" defaultChecked={defaultChecked} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
