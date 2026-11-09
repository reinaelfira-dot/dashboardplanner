import { Activity, Boxes, ShieldCheck, Wallet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, MetricCard, SectionHeading } from '../components/Shared.jsx'

const RED = '#e30613'
const PALE = '#f3a5ab'
const PROCESS_LINE = '#e87983'
const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

function ProcessLegend({ payload = [] }) {
  return <div className="process-chart-legend">
    {payload.map((item) => <span className="process-legend-item" key={item.value}>
      <i className={item.dataKey === 'receivedCount' ? 'process-legend-bar' : 'process-legend-line'} style={{ '--legend-color': item.color }} />
      {item.value}
    </span>)}
  </div>
}

function KpiPanel({ icon: Icon, title, metrics, trend, targetLabel }) {
  const maxReceivedCount = Math.max(0, ...trend.map((item) => item.receivedCount))
  return <article className="panel kpi-panel">
    <div className="panel-heading">
      <div className="panel-title-icon"><span className="metric-icon"><Icon size={17} /></span><div><h3>{title}</h3><p>{targetLabel}</p></div></div>
      <span className="demo-chip">DEMO</span>
    </div>
    <div className={`kpi-metrics ${metrics.length === 5 ? 'five-metrics' : ''}`}>{metrics.map((metric) => <div key={metric.label}><span>{metric.label}</span><strong className={typeof metric.value === 'string' && metric.value.startsWith('Rp') ? 'kpi-money-value' : undefined}>{metric.value}</strong></div>)}</div>
    <ChartCard title={`Penerimaan & Waktu Proses ${title}`} note="Dari laporan diterima site sampai dikirim ke Warehouse">
      <ResponsiveContainer width="100%" height={185}>
        <ComposedChart data={trend} margin={{ left: -18, right: 6, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} />
          <YAxis yAxisId="count" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#777' }} />
          <YAxis yAxisId="days" orientation="right" allowDecimals axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#777' }} />
          <Tooltip formatter={(value, name) => [name === 'Rata-rata waktu proses' ? `${value} hari` : value, name]} />
          <Legend content={ProcessLegend} />
          <Bar yAxisId="count" dataKey="receivedCount" name="Laporan diterima" fill={PALE} radius={[3, 3, 0, 0]}>
            {trend.map((item) => <Cell key={item.month} fill={item.receivedCount === maxReceivedCount ? RED : PALE} />)}
          </Bar>
          <Line yAxisId="days" type="monotone" dataKey="avgProcessDays" name="Rata-rata waktu proses" stroke={PROCESS_LINE} strokeWidth={3} connectNulls dot={{ r: 3.5, fill: PROCESS_LINE, stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 5, fill: PROCESS_LINE, stroke: '#fff', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  </article>
}

export default function KPIMonitoring({ jobs, months }) {
  const uniqueJobs = [...new Map(jobs.map((item) => [item.jobSheetNumber, item])).values()]
  const woJobs = uniqueJobs.filter((item) => item.requestType === 'WO')
  const mrJobs = uniqueJobs.filter((item) => item.requestType === 'MR')
  const warrantyJobs = uniqueJobs.filter((item) => item.requestType === 'Warranty')
  const backcharge = uniqueJobs.filter((item) => item.requestType === 'BCH')
  const count = (base, ratio) => Math.min(base, Math.round(base * ratio))
  const warrantyCost = warrantyJobs.reduce((sum, item) => sum + item.cost, 0)
  const bchNominal = backcharge.reduce((sum, item) => sum + item.cost, 0)
  const processTrend = (records) => months.map((month, index) => {
    const received = records.filter((item) => Number(item.received.slice(5, 7)) === index + 1)
    const completed = received.filter((item) => item.sendWarehouse && item.sendWarehouse >= item.received)
    const elapsedDays = completed.map((item) => {
      const receivedAt = Date.parse(`${item.received}T00:00:00Z`)
      const sentAt = Date.parse(`${item.sendWarehouse}T00:00:00Z`)
      return (sentAt - receivedAt) / 86400000
    })
    return {
      month,
      receivedCount: received.length,
      avgProcessDays: elapsedDays.length ? Number((elapsedDays.reduce((sum, days) => sum + days, 0) / elapsedDays.length).toFixed(1)) : null,
    }
  }).filter((item) => item.receivedCount > 0)
  const woTrend = processTrend(woJobs)
  const mrTrend = processTrend(mrJobs)
  const warrantyTrend = processTrend(warrantyJobs)
  const bchTrend = processTrend(backcharge)
  return <section className="dashboard-section" id="kpi-monitoring">
    <SectionHeading number="04" title="KPI Monitoring" detail="Work order, material request, warranty, dan backcharge" />
    <div className="kpi-grid">
      <KpiPanel icon={Activity} title="Work Order (WO)" targetLabel="Laporan dari site dan waktu proses planner" metrics={[{ label: 'Total WO', value: woJobs.length }, { label: 'Open', value: count(woJobs.length, 0.24) }, { label: 'Closed', value: count(woJobs.length, 0.61) }, { label: 'Pending', value: count(woJobs.length, 0.15) }]} trend={woTrend} processTrend />
      <KpiPanel icon={Boxes} title="Material Request (MR)" targetLabel="Laporan dari site dan waktu proses planner" metrics={[{ label: 'Total MR', value: mrJobs.length }, { label: 'Requested', value: count(mrJobs.length, 0.34) }, { label: 'Approved', value: count(mrJobs.length, 0.25) }, { label: 'Pending', value: count(mrJobs.length, 0.09) }]} trend={mrTrend} processTrend />
      <KpiPanel icon={ShieldCheck} title="Warranty" targetLabel="Klaim, penerimaan laporan, dan waktu proses" metrics={[{ label: 'Total Claim', value: warrantyJobs.length }, { label: 'Submitted', value: count(warrantyJobs.length, 0.78) }, { label: 'Approved', value: count(warrantyJobs.length, 0.58) }, { label: 'Rejected', value: count(warrantyJobs.length, 0.12) }, { label: 'Warranty Cost', value: money(warrantyCost) }]} trend={warrantyTrend} processTrend />
      <KpiPanel icon={Wallet} title="Backcharge (BCH)" targetLabel="Backcharge, penerimaan laporan, dan waktu proses" metrics={[{ label: 'Total BCH', value: backcharge.length }, { label: 'Total Nominal', value: money(bchNominal) }, { label: 'Open', value: Math.round(backcharge.length * 0.31) }, { label: 'In Progress', value: Math.round(backcharge.length * 0.27) }, { label: 'Closed', value: Math.round(backcharge.length * 0.42) }]} trend={bchTrend} processTrend />
    </div>
  </section>
}