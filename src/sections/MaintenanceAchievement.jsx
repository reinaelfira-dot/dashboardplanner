import { AlertCircle, CircleDollarSign, Clock3, Gauge } from 'lucide-react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, SectionHeading } from '../components/Shared.jsx'

const RED = '#e30613'
const GRAY = '#a4a4a4'
const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

function EmptyChart() { return <div className="empty-chart">Tidak ada data pada filter yang dipilih</div> }

function PAIndicator({ title, tone, actual, target }) {
  const achievement = actual === null ? null : (actual / target) * 100
  const variance = actual === null ? null : actual - target
  const performanceClass = variance === null ? '' : variance >= 0 ? 'positive' : 'negative'
  return <article className={`pa-indicator ${tone}`}>
    <div className="pa-indicator-main">
      <span className="pa-indicator-icon"><Gauge size={19} /></span>
      <div className="pa-indicator-copy"><h4>{title}</h4></div>
      <strong className="pa-indicator-value">{actual === null ? 'N/A' : `${actual.toFixed(2)}%`}</strong>
    </div>
    <div className="pa-indicator-details">
      <div><span>Target</span><strong>{target.toFixed(2)}%</strong></div>
      <div><span>Achievement</span><strong className={performanceClass}>{achievement === null ? 'N/A' : `${achievement.toFixed(2)}%`}</strong></div>
      <div><span>Variance</span><strong className={performanceClass}>{variance === null ? 'N/A' : `${variance >= 0 ? '+' : ''}${variance.toFixed(2)} pp`}</strong></div>
    </div>
  </article>
}

export default function MaintenanceAchievement({ data, months, config }) {
  const activeMonths = months.map((month, index) => ({ month, index })).filter(({ index }) => data.some((item) => Number(item.receivedDate.slice(5, 7)) === index + 1))
  const latestActiveMonth = activeMonths.at(-1)?.index
  const paTrend = activeMonths.map(({ month, index }) => {
    const rentalOffset = ((index * 17 + 11) % 9 + 2) / 10
    const unitOffset = ((index * 13 + 7) % 19 - 9) / 10
    return {
      month,
      rental: config.paRentalTarget + rentalOffset,
      unit: index === latestActiveMonth ? 94.63 : config.paUnitTarget + unitOffset,
      rentalTarget: config.paRentalTarget,
      unitTarget: config.paUnitTarget,
    }
  })
  const latestPA = paTrend.at(-1)
  const actualRentalPA = latestPA?.rental ?? null
  const actualUnitPA = latestPA?.unit ?? null
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
  const performance = activeMonths.map(({ month, index }) => ({ month, actual: [88, 91, 89, 92, 94, 90, 93, 92][index], target: config.performanceTarget }))
  return <section className="dashboard-section" id="maintenance">
    <SectionHeading number="03" title="Maintenance Achievement & Performance" detail="Kinerja unit, biaya, dan kecepatan penyelesaian breakdown" />
    <div className="maintenance-grid">
    <div className="pa-overview panel">
      <div className="pa-overview-header">
        <div className="pa-overview-title">
          <span className="pa-overview-icon"><Gauge size={22} /></span>
          <div><h3>Physical Availability (PA)</h3><p>Ketersediaan armada rental (dengan backup spare unit) dan ketersediaan unit aktual</p></div>
        </div>
        <span className="demo-chip">DEMO</span>
      </div>
      <div className="pa-indicators">
        <PAIndicator title="PA Rental" tone="rental" actual={actualRentalPA} target={config.paRentalTarget} />
        <PAIndicator title="PA Unit" tone="unit" actual={actualUnitPA} target={config.paUnitTarget} />
      </div>
      <ChartCard title="Monthly PA Performance Trend" note="Perbandingan tren PA Rental dan PA Unit terhadap target bulanan">
        <div className="pa-trend-legend">
          <span><i className="pa-legend-line rental" />PA Rental</span>
          <span><i className="pa-legend-line unit" />PA Unit</span>
          <span><i className="pa-legend-line target" />Target PA Rental</span>
          <span><i className="pa-legend-line target unit-target" />Target PA Unit</span>
        </div>
        {paTrend.length
          ? <ResponsiveContainer width="100%" height={155}>
            <LineChart data={paTrend} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#777' }} />
              <YAxis domain={[90, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#777' }} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Line type="monotone" dataKey="rental" name="PA Rental" stroke={RED} strokeWidth={2.2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="unit" name="PA Unit" stroke="#ef9ca2" strokeWidth={2.2} dot={{ r: 3 }} />
              <Line type="linear" dataKey="rentalTarget" name={`Target PA Rental (${config.paRentalTarget}%)`} stroke="#596276" strokeDasharray="5 5" dot={false} />
              <Line type="linear" dataKey="unitTarget" name={`Target PA Unit (${config.paUnitTarget}%)`} stroke="#b7bac2" strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          : <div className="pa-trend-empty"><strong>N/A</strong><span>Tidak ada breakdown pada periode filter ini.</span></div>}
      </ChartCard>
      <div className="pa-formula-bar">
        <strong><Gauge size={17} /> Rumus Perhitungan:</strong>
        <span><b>PA Rental</b> = Rental Available Time / Total Rental Time × 100%</span>
        <span><b>PA Unit</b> = Actual Available Unit Time / Total Unit Time × 100%</span>
      </div>
      <p className="pa-data-note">Angka aktual dan tren adalah nilai acak demonstrasi yang stabil per bulan, bukan kinerja aktual perusahaan. Target: PA Rental {config.paRentalTarget}%, PA Unit {config.paUnitTarget}%.</p>
    </div>
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