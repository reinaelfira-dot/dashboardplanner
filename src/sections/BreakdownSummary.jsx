import { AlertTriangle, CircleDollarSign, Gauge, Wrench } from 'lucide-react'
import { Cell, Legend as RechartsLegend, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts'
import { ChartCard, MetricCard, SectionHeading } from '../components/Shared.jsx'
import { breakdownStatuses } from '../data/mockData.js'

const RED = '#e30613'
const PINK = '#f3a5ab'
const GRAY = '#d5d5d5'
const STATUS_COLORS = [RED, '#b70712', '#d84b55', PINK, '#f8d7da', GRAY, '#b8b8b8', '#eeeeee']
const WHITE_LABEL_STATUSES = new Set(['Waiting Dokument', 'Waiting Labour / Stall', 'Work on progress'])
const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

function renderPieCountLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, payload }) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const angle = (-midAngle * Math.PI) / 180
  const x = cx + radius * Math.cos(angle)
  const y = cy + radius * Math.sin(angle)
  const fill = ['BU', ...WHITE_LABEL_STATUSES].includes(payload.name) ? '#fff' : '#333'
  return <text x={x} y={y} fill={fill} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{value}</text>
}

export default function BreakdownSummary({ data }) {
  const total = data.length
  const bu = data.filter((item) => item.type === 'BU').length
  const bd = data.filter((item) => item.type === 'BD').length
  const offHired = data.filter((item) => item.offHired).length
  const responsibility = data.filter((item) => item.responsibility === 'Transkon').length
  const byHub = [...new Set(data.map((item) => item.hub))].map((hub) => ({ hub, BU: data.filter((item) => item.hub === hub && item.type === 'BU').length, BD: data.filter((item) => item.hub === hub && item.type === 'BD').length }))
  const latestDate = data.reduce((latest, item) => item.receivedDate > latest ? item.receivedDate : latest, '')
  const trendMonth = latestDate.slice(0, 7)
  const daysInTrendMonth = latestDate ? new Date(Date.UTC(Number(trendMonth.slice(0, 4)), Number(trendMonth.slice(5, 7)), 0)).getUTCDate() : 0
  const trend = Array.from({ length: daysInTrendMonth }, (_, index) => {
    const day = index + 1
    const seed = [...`${trendMonth}-${String(day).padStart(2, '0')}`].reduce((value, character) => (value * 31 + character.charCodeAt(0)) % 997, 7)
    const total = 30 + ((seed * seed + 17 * seed + day * 13) % 16)
    return { day, total }
  })
  const trendMonthLabel = latestDate
    ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${trendMonth}-01T00:00:00Z`))
    : ''
  const statusData = breakdownStatuses.map((status) => ({ name: status, value: data.filter((item) => item.status === status).length }))
  return <section className="dashboard-section" id="breakdown">
    <SectionHeading number="01" title="Breakdown Summary" detail="Status dan distribusi operasional unit" />
    <div className="metric-grid five">
      <MetricCard label="Total Unit Breakdown" value={total.toLocaleString('id-ID')} note="Unit dalam periode terpilih" icon={AlertTriangle} />
      <MetricCard label="Total BU" value={bu.toLocaleString('id-ID')} note="Breakdown unit" icon={Gauge} />
      <MetricCard label="Total BD" value={bd.toLocaleString('id-ID')} note="Breakdown detail" icon={Wrench} />
      <MetricCard label="Breakdown Off Hired" value={offHired.toLocaleString('id-ID')} note="Termasuk dalam total breakdown" icon={CircleDollarSign} />
      <MetricCard label="Overdue Unit Breakdown" value={responsibility.toLocaleString('id-ID')} note="Total units exceeding their estimated completion dates." icon={AlertTriangle} />
    </div>
    <div className="chart-grid breakdown-charts">
      <ChartCard title="Breakdown BU vs BD" note={<span className="chart-total-note">Total: <strong className="chart-total">{total.toLocaleString('id-ID')} unit</strong> · Komposisi unit terfilter</span>}>
        <div className="donut-layout"><ResponsiveContainer width="58%" height={205}><PieChart><Pie data={[{ name: 'BU', value: bu }, { name: 'BD', value: bd }]} dataKey="value" nameKey="name" innerRadius={62} outerRadius={84} paddingAngle={3} stroke="none" label={renderPieCountLabel} labelLine={false}>{[RED, PINK].map((color) => <Cell key={color} fill={color} />)}</Pie><Tooltip formatter={(value) => [value, 'Unit']} /></PieChart></ResponsiveContainer><div className="donut-key"><span><i className="dot red" /> BU <b>{bu}</b></span><span><i className="dot pink" /> BD <b>{bd}</b></span></div></div>
      </ChartCard>
      <ChartCard title="Daily Breakdown Trend" note={trendMonthLabel ? `Jumlah kejadian harian · ${trendMonthLabel}` : 'Jumlah kejadian harian'}>
        <ResponsiveContainer width="100%" height={220}><LineChart data={trend} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><YAxis allowDecimals={false} domain={[30, 45]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><Tooltip labelFormatter={(day) => `Tanggal ${day}`} /><Line type="monotone" dataKey="total" name="Total" stroke={RED} strokeWidth={2.5} dot={{ r: 3, fill: RED }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Breakdown berdasarkan Status Pengerjaan" note={<span className="chart-total-note">Total: <strong className="chart-total">{total.toLocaleString('id-ID')} unit</strong> · Tahap pengerjaan unit</span>}>
        <div className="donut-layout status-donut"><ResponsiveContainer width="58%" height={205}><PieChart><Pie data={statusData} dataKey="value" innerRadius={62} outerRadius={84} paddingAngle={3} stroke="none" label={renderPieCountLabel} labelLine={false}>{STATUS_COLORS.map((color) => <Cell key={color} fill={color} />)}</Pie><Tooltip formatter={(value) => [value, 'Unit']} /></PieChart></ResponsiveContainer><div className="donut-key">{statusData.map((item, index) => <span key={item.name}><i className="dot" style={{ background: STATUS_COLORS[index] }} /> {item.name} <b>{item.value}</b></span>)}</div></div>
      </ChartCard>
      <ChartCard title="Breakdown per Hub" note="Perbandingan BU dan BD">
        <ResponsiveContainer width="100%" height={220}><BarChart data={byHub} layout="vertical" margin={{ left: 10, right: 12, top: 4, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" /><XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#777' }} /><YAxis type="category" dataKey="hub" width={86} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#555' }} /><Tooltip /><Bar dataKey="BU" stackId="a" fill={RED} radius={[0, 3, 3, 0]} /><Bar dataKey="BD" stackId="a" fill={PINK} radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer>
      </ChartCard>
    </div>
  </section>
}