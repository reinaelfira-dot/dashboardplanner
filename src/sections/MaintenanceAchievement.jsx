import { AlertCircle, CircleDollarSign, Clock3, Gauge } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, MetricCard, SectionHeading } from '../components/Shared.jsx'

const RED = '#e30613'
const GRAY = '#a4a4a4'
const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

function EmptyChart() { return <div className="empty-chart">Tidak ada data pada filter yang dipilih</div> }

export default function MaintenanceAchievement({ data, months, config }) {
  const activeMonths = months.map((month, index) => ({ month, index })).filter(({ index }) => data.some((item) => Number(item.receivedDate.slice(5, 7)) === index + 1))
  const paTrend = activeMonths.map(({ month, index }) => ({ month, actual: config.paActual[index], target: config.paTarget[index] }))
  const actualPA = paTrend.length ? paTrend.at(-1).actual : 0
  const achievement = config.targetPA ? (actualPA / config.targetPA) * 100 : 0
  const totalCost = data.reduce((sum, item) => sum + item.maintenanceCost, 0)
  const costTrend = months.map((month, index) => ({ month, cost: data.filter((item) => Number(item.receivedDate.slice(5, 7)) === index + 1).reduce((sum, item) => sum + item.maintenanceCost, 0) })).filter((item) => item.cost > 0)
  const costByHub = [...new Set(data.map((item) => item.hub))].map((hub) => ({ hub, cost: data.filter((item) => item.hub === hub).reduce((sum, item) => sum + item.maintenanceCost, 0) }))
  const completed = data.filter((item) => item.readyDate)
  const leadTimes = completed.map((item) => ({ ...item, leadTime: Math.round((new Date(`${item.readyDate}T00:00:00`) - new Date(`${item.receivedDate}T00:00:00`)) / 86400000) }))
  const averageLead = leadTimes.length ? leadTimes.reduce((sum, item) => sum + item.leadTime, 0) / leadTimes.length : 0
  const leadTrend = months.map((month, index) => {
    const records = leadTimes.filter((item) => Number(item.receivedDate.slice(5, 7)) === index + 1)
    return { month, actual: records.length ? records.reduce((sum, item) => sum + item.leadTime, 0) / records.length : null, target: config.leadTimeTarget }
  }).filter((item) => item.actual !== null)
  const leadHub = [...new Set(leadTimes.map((item) => item.hub))].map((hub) => {
    const records = leadTimes.filter((item) => item.hub === hub)
    return { hub, average: records.reduce((sum, item) => sum + item.leadTime, 0) / records.length }
  })
  const highestLead = [...leadTimes].sort((a, b) => b.leadTime - a.leadTime)[0]
  const performance = paTrend.map((item, index) => ({ month: item.month, actual: [88, 91, 89, 92, 94, 90, 93, 92][activeMonths[index]?.index ?? 0], target: config.performanceTarget }))
  return <section className="dashboard-section" id="maintenance">
    <SectionHeading number="03" title="Maintenance Achievement & Performance" detail="Kinerja unit, biaya, dan kecepatan penyelesaian breakdown" />
    <div className="maintenance-grid">
      <article className="panel maintenance-panel">
        <div className="panel-heading"><div className="panel-title-icon"><span className="metric-icon"><Gauge size={17} /></span><div><h3>Physical Availability (PA)</h3><p>Formula menunggu denominator KPI resmi perusahaan</p></div></div><span className="demo-chip">DEMO</span></div>
        <div className="mini-metrics"><div><span>Actual PA</span><strong>{actualPA.toFixed(1)}%</strong></div><div><span>Target PA</span><strong>{config.targetPA}%</strong></div><div><span>Achievement</span><strong>{achievement.toFixed(1)}%</strong></div><div><span>Selisih</span><strong className={actualPA >= config.targetPA ? 'positive' : 'negative'}>{(actualPA - config.targetPA).toFixed(1)} pp</strong></div></div>
        <ChartCard title="PA Trend per Month" note="Actual vs target · seri demonstrasi"><ResponsiveContainer width="100%" height={200}><LineChart data={paTrend} margin={{ left: -20, right: 12, top: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><YAxis domain={[80, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><Tooltip formatter={(value) => `${value}%`} /><Legend /><Line type="monotone" dataKey="actual" name="Actual PA" stroke={RED} strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="target" name="Target PA" stroke={GRAY} strokeWidth={2} strokeDasharray="5 5" dot={false} /></LineChart></ResponsiveContainer></ChartCard>
      </article>
      <article className="panel maintenance-panel">
        <div className="panel-heading"><div className="panel-title-icon"><span className="metric-icon"><CircleDollarSign size={17} /></span><div><h3>Maintenance Cost</h3><p>Estimasi biaya pada data breakdown terfilter</p></div></div><span className="demo-chip">DEMO</span></div>
        <div className="cost-total"><span>Total Maintenance Cost</span><strong>{money(totalCost)}</strong><small>Average cost per unit <b>{money(data.length ? totalCost / data.length : 0)}</b></small></div>
        <ChartCard title="Monthly Maintenance Cost" note="Biaya berdasarkan bulan received"><ResponsiveContainer width="100%" height={200}><ComposedChart data={costTrend} margin={{ left: 0, right: 10, top: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}jt`} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#777' }} /><Tooltip formatter={(value) => money(value)} /><Bar dataKey="cost" name="Biaya" fill={RED} radius={[3, 3, 0, 0]} /></ComposedChart></ResponsiveContainer></ChartCard>
        <div className="hub-cost-list">{costByHub.map((item) => <div key={item.hub}><span>{item.hub}</span><b>{money(item.cost)}</b></div>)}</div>
      </article>
      <article className="panel maintenance-panel">
        <div className="panel-heading"><div className="panel-title-icon"><span className="metric-icon"><Clock3 size={17} /></span><div><h3>Breakdown Lead Time</h3><p>Ready date dikurangi received date</p></div></div><span className="demo-chip">DEMO</span></div>
        <div className="mini-metrics"><div><span>Average Lead Time</span><strong>{averageLead.toFixed(1)} <small>hari</small></strong></div><div><span>Target Lead Time</span><strong>{config.leadTimeTarget} <small>hari</small></strong></div><div><span>Actual vs Target</span><strong className={averageLead <= config.leadTimeTarget ? 'positive' : 'negative'}>{averageLead ? `${averageLead <= config.leadTimeTarget ? '−' : '+'}${Math.abs(averageLead - config.leadTimeTarget).toFixed(1)} hari` : '—'}</strong></div></div>
        <ChartCard title="Monthly Lead Time Trend" note="Hanya kejadian dengan tanggal ready"><ResponsiveContainer width="100%" height={185}><LineChart data={leadTrend} margin={{ left: -20, right: 12, top: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><YAxis unit=" hari" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#777' }} /><Tooltip formatter={(value) => `${Number(value).toFixed(1)} hari`} /><Legend /><Line type="monotone" dataKey="actual" name="Actual" stroke={RED} strokeWidth={2.5} connectNulls /><Line type="monotone" dataKey="target" name="Target" stroke={GRAY} strokeDasharray="5 5" /></LineChart></ResponsiveContainer></ChartCard>
        <div className="lead-footer"><div><span>Lead time tertinggi</span><strong>{highestLead ? `${highestLead.leadTime} hari · ${highestLead.unit}` : 'Tidak ada data ready'}</strong></div><div><span>Rata-rata per hub</span><strong>{leadHub.length ? leadHub.map((item) => `${item.hub} ${item.average.toFixed(1)}h`).join(' · ') : '—'}</strong></div></div>
      </article>
      <article className="panel maintenance-panel">
        <div className="panel-heading"><div className="panel-title-icon"><span className="metric-icon"><AlertCircle size={17} /></span><div><h3>Maintenance Performance</h3><p>Belum menerapkan formula komposit</p></div></div><span className="demo-chip">DEMO</span></div>
        <div className="performance-summary"><span>Achievement Target</span><strong>{(performance.length ? performance[performance.length - 1].actual / config.performanceTarget * 100 : 0).toFixed(1)}%</strong><small>Target demonstrasi {config.performanceTarget}% · definisi resmi diperlukan</small></div>
        <ChartCard title="Performance Trend" note="Actual vs target per bulan"><ResponsiveContainer width="100%" height={220}><LineChart data={performance} margin={{ left: -20, right: 12, top: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><YAxis domain={[75, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><Tooltip formatter={(value) => `${value}%`} /><Legend /><Line type="monotone" dataKey="actual" name="Actual" stroke={RED} strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="target" name="Target" stroke={GRAY} strokeDasharray="5 5" dot={false} /></LineChart></ResponsiveContainer></ChartCard>
        <p className="formula-notice">Nilai performance hanya untuk tampilan demonstrasi dan tidak mewakili perhitungan KPI resmi.</p>
      </article>
    </div>
  </section>
}