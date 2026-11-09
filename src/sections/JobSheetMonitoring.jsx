import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, MetricCard, SectionHeading } from '../components/Shared.jsx'

const RED = '#e30613'
const PINK = '#f3a5ab'
const RESPONSIBILITY_COLORS = [RED, '#ee5d67', PINK, '#b8b8b8']
const columns = [
  ['no', 'NO.'], ['received', 'RECEIVED'], ['register', 'REGISTER'], ['tkNumber', 'TK NUMBER'], ['jobSheetNumber', 'JOBSHEET'], ['customer', 'CUSTOMER'], ['site', 'SITE'], ['hub', 'HUB'], ['work', 'WORK TO BE PERFORMED'], ['category', 'CATEGORY'], ['dateToMyob', 'DATE TO MYOB'], ['sendTechnical', 'SEND TECHNICAL'], ['approveTechnical', 'APPROVE TECHNICAL'], ['sendWarehouse', 'SEND WAREHOUSE'], ['cost', 'COST ESTIMATION'],
]
const stages = [['Received', 'received'], ['Register', 'register'], ['Send Technical', 'sendTechnical'], ['Approve Technical', 'approveTechnical'], ['Send to Warehouse', 'sendWarehouse']]
const formatMoney = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

function ChartBars({ rows, field, title }) {
  const data = [...new Set(rows.map((item) => item[field]))].map((name) => ({ name, total: rows.filter((item) => item[field] === name).length })).sort((a, b) => b.total - a.total).slice(0, 5).sort((a, b) => a.name.localeCompare(b.name, 'id'))
  const maxTotal = Math.max(0, ...data.map((item) => item.total))
  return <ChartCard title={title} note="Top 5 berdasarkan jumlah job sheet"><ResponsiveContainer width="100%" height={190}><BarChart data={data} margin={{ top: 6, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#777' }} interval={0} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><Tooltip /><Bar dataKey="total" name="Job sheet" radius={[4, 4, 0, 0]}>{data.map((entry) => <Cell key={entry.name} fill={entry.total === maxTotal ? RED : PINK} />)}</Bar></BarChart></ResponsiveContainer></ChartCard>
}

export default function JobSheetMonitoring({ data }) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState('received')
  const [direction, setDirection] = useState('desc')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const uniqueJobs = useMemo(() => [...new Map(data.map((item) => [item.jobSheetNumber, item])).values()], [data])
  const searched = uniqueJobs.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase())))
  const sorted = [...searched].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey]), 'id', { numeric: true }) * (direction === 'asc' ? 1 : -1))
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize)
  const setSort = (key) => { setPage(1); if (key === sortKey) setDirection(direction === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setDirection('asc') } }
  const workflow = stages.map(([label, key]) => ({ label, count: uniqueJobs.filter((item) => item[key]).length }))
  const aging = [{ label: '≤30 hari', count: uniqueJobs.filter((item) => item.age <= 30).length }, { label: '31–60 hari', count: uniqueJobs.filter((item) => item.age > 30 && item.age <= 60).length }, { label: '61–90 hari', count: uniqueJobs.filter((item) => item.age > 60 && item.age <= 90).length }, { label: '> 90 hari', count: uniqueJobs.filter((item) => item.age > 90).length }]
  const responsibility = [...new Set(uniqueJobs.map((item) => item.responsibility))].map((name) => ({ name, total: uniqueJobs.filter((item) => item.responsibility === name).length }))
  const jobTypeCount = (type) => uniqueJobs.filter((item) => item.workType === type).length
  const priorityCount = (priority) => uniqueJobs.filter((item) => item.priority === priority).length
  return <section className="dashboard-section" id="job-sheet">
    <SectionHeading number="02" title="Job Sheet Monitoring" detail="Alur pekerjaan, aging, dan rincian job sheet terdaftar" />
    <div className="metric-grid seven">
      <MetricCard label="Total Job Sheet" value={uniqueJobs.length} note="Jobsheet unik" />
      <MetricCard label="Job Sheet P1" value={priorityCount('P1')} note="Prioritas 1" />
      <MetricCard label="Job Sheet P2" value={priorityCount('P2')} note="Prioritas 2" />
      <MetricCard label="Job Sheet P3" value={priorityCount('P3')} note="Prioritas 3" />
      <MetricCard label="Cash on Site" value={jobTypeCount('Cash on Site')} note="Work type" />
      <MetricCard label="Repair" value={jobTypeCount('Repair')} note="Work type" />
      <MetricCard label="Backcharge" value={jobTypeCount('Backcharge')} note="Work type" />
    </div>
    <div className="chart-grid job-charts">
      <ChartBars rows={uniqueJobs} field="hub" title="Job Sheet berdasarkan Hub" />
      <ChartBars rows={uniqueJobs} field="site" title="Job Sheet berdasarkan Site" />
      <ChartBars rows={uniqueJobs} field="customer" title="Job Sheet berdasarkan Customer" />
    </div>
    <div className="panel workflow-panel">
      <div className="panel-heading"><div><h3>Workflow Job Sheet</h3><p>Jumlah item yang telah melewati setiap tahap</p></div><span className="panel-kicker">{stages.length} TAHAP</span></div>
      <div className="workflow-track">{workflow.map((step, index) => <div className="workflow-step" key={step.label}><div className={`workflow-node ${index === workflow.length - 1 ? 'last' : ''}`}><strong>{step.count}</strong><span>{step.label}</span></div>{index < workflow.length - 1 && <div className="workflow-connector" />}</div>)}</div>
    </div>
    <div className="aging-responsibility-grid">
      <ChartCard title="Aging Job Sheet" note="Umur pekerjaan sejak tanggal received">
        <ResponsiveContainer width="100%" height={205}><BarChart data={aging} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><YAxis type="category" dataKey="label" width={76} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#555' }} /><Tooltip /><Bar dataKey="count" name="Job sheet" radius={[0, 4, 4, 0]} barSize={28}>{aging.map((item, index) => <Cell key={item.label} fill={RESPONSIBILITY_COLORS[index]} />)}</Bar></BarChart></ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Job Sheet berdasarkan Responsibility" note="Jumlah pekerjaan per responsibility">
        <ResponsiveContainer width="100%" height={205}><BarChart data={responsibility} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" /><XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><YAxis type="category" dataKey="name" width={76} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#555' }} /><Tooltip /><Bar dataKey="total" name="Job sheet" radius={[0, 4, 4, 0]}>{responsibility.map((item, index) => <Cell key={item.name} fill={RESPONSIBILITY_COLORS[index]} />)}</Bar></BarChart></ResponsiveContainer>
      </ChartCard>
    </div>
    <div className="panel detail-panel">
      <div className="panel-heading detail-heading"><div><h3>Detail Job Sheet</h3><p>{searched.length} dari {uniqueJobs.length} pekerjaan · Jobsheet dihitung unik</p></div><label className="search-box"><Search size={16} /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Cari nomor, customer, site..." /></label></div>
      <div className="table-wrap detail-table-wrap"><table className="detail-table"><thead><tr>{columns.map(([key, label]) => <th key={key}><button onClick={() => setSort(key)}>{label}{sortKey === key && (direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button></th>)}</tr></thead><tbody>{visible.map((row) => <tr key={row.jobSheetNumber}>{columns.map(([key]) => <td key={key}>{key === 'cost' ? formatMoney(row[key]) : row[key] || <span className="dash">—</span>}</td>)}</tr>)}{visible.length === 0 && <tr><td className="empty-cell" colSpan={columns.length}>Tidak ada job sheet yang sesuai dengan pencarian dan filter.</td></tr>}</tbody></table></div>
      <div className="pagination"><span>Menampilkan {sorted.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, sorted.length)} dari {sorted.length}</span><div><button disabled={page <= 1} aria-label="Halaman sebelumnya" onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button><strong>{page} / {pageCount}</strong><button disabled={page >= pageCount} aria-label="Halaman selanjutnya" onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button></div></div>
    </div>
  </section>
}