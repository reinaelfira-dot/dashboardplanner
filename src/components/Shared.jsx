import { ChevronDown, Info } from 'lucide-react'

export function SectionHeading({ number, title, detail }) {
  return <div className="section-heading">
    <div className="section-number">{number}</div>
    <div><h2>{title}</h2>{detail && <p>{detail}</p>}</div>
  </div>
}

export function MetricCard({ label, value, note, icon: Icon, tone = 'red' }) {
  return <article className="metric-card">
    <div className="metric-top"><span>{label}</span>{Icon && <span className={`metric-icon ${tone}`}><Icon size={17} /></span>}</div>
    <strong className="metric-value">{value}</strong>
    {note && <span className="metric-note">{note}</span>}
  </article>
}

export function ChartCard({ title, note, children, className = '' }) {
  return <article className={`panel chart-panel ${className}`}>
    <div className="panel-heading"><div><h3>{title}</h3>{note && <p>{note}</p>}</div><Info size={15} className="muted-icon" /></div>
    {children}
  </article>
}

export function FilterSelect({ label, value, options, onChange }) {
  return <label className="filter-control"><span>{label}</span><div className="select-wrap">
    <select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={15} />
  </div></label>
}

export function Legend({ items }) {
  return <div className="chart-legend">{items.map((item) => <span key={item.label}><i style={{ background: item.color }} />{item.label}</span>)}</div>
}

export function DemoTag() { return <span className="demo-tag"><span /> DEMO DATA</span> }