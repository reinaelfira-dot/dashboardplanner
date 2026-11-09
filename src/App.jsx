import { useEffect, useMemo, useState } from 'react'
import { Activity, CircleHelp, RotateCcw } from 'lucide-react'
import transkonLogo from '../logo transkon.png'
import Header from './components/Header.jsx'
import { DemoTag } from './components/Shared.jsx'
import BreakdownSummary from './sections/BreakdownSummary.jsx'
import JobSheetMonitoring from './sections/JobSheetMonitoring.jsx'
import MaintenanceAchievement from './sections/MaintenanceAchievement.jsx'
import KPIMonitoring from './sections/KPIMonitoring.jsx'
import { mockData } from './data/mockData.js'

const initialFilters = { period: 'all', startDate: '', endDate: '', hub: 'all', site: 'all', customer: 'all', category: 'all' }
const options = (values) => [{ value: 'all', label: 'Semua' }, ...values.map((value) => ({ value, label: value }))]
const recordDate = (record) => record.receivedDate ?? record.received

function LoadingView() {
  return <div className="loading-view" aria-label="Memuat dashboard"><div className="loading-mark" /><strong>Menyiapkan dashboard</strong><span>Memuat ringkasan operasional demo...</span></div>
}

export default function App() {
  const [filters, setFilters] = useState(initialFilters)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 420)
    return () => window.clearTimeout(timer)
  }, [])
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const resetFilters = () => setFilters(initialFilters)
  const filtered = useMemo(() => {
    const dates = [...mockData.breakdowns.map(recordDate), ...mockData.jobSheets.map(recordDate)].sort()
    const latest = dates.at(-1) ?? '2026-08-31'
    const periodDays = filters.period === '30' ? 30 : filters.period === '90' ? 90 : null
    const periodStart = periodDays ? new Date(new Date(`${latest}T00:00:00`).getTime() - (periodDays - 1) * 86400000).toISOString().slice(0, 10) : filters.period === 'ytd' ? '2026-01-01' : ''
    const startDate = filters.startDate || periodStart
    const endDate = filters.endDate || latest
    const matches = (item) => {
      const date = recordDate(item)
      return (!startDate || date >= startDate) && (!endDate || date <= endDate) && (filters.hub === 'all' || item.hub === filters.hub) && (filters.site === 'all' || item.site === filters.site) && (filters.customer === 'all' || item.customer === filters.customer) && (filters.category === 'all' || item.category === filters.category)
    }
    return { breakdowns: mockData.breakdowns.filter(matches), jobSheets: mockData.jobSheets.filter(matches) }
  }, [filters])
  const optionData = { hubs: options(mockData.hubs), sites: options(mockData.sites), customers: options(mockData.customers), categories: options(mockData.categories) }
  if (loading) return <LoadingView />
  return <div className="app-shell">
    <Header filters={filters} setFilter={setFilter} optionData={optionData} />
    <main className="main-content">
      <div className="dashboard-intro"><div><div className="eyebrow"><span /> FLEET OPERATIONS INTELLIGENCE</div><h2>Monitoring <em>operasional</em></h2><p>Ringkasan kondisi armada, progres pekerjaan, dan performa maintenance.</p></div><div className="intro-side"><DemoTag /><span>Data diperbarui <b>06 Nov 2026</b></span></div></div>
      {(filtered.breakdowns.length === 0 && filtered.jobSheets.length === 0) && <div className="empty-state"><div><Activity size={20} /></div><strong>Tidak ada data untuk filter ini</strong><span>Ubah periode atau pilihan filter untuk melihat ringkasan lainnya.</span><button onClick={resetFilters}><RotateCcw size={14} /> Reset filter</button></div>}
      <BreakdownSummary data={filtered.breakdowns} months={mockData.months} />
      <JobSheetMonitoring data={filtered.jobSheets} />
      <MaintenanceAchievement data={filtered.breakdowns} months={mockData.months} config={mockData.maintenance} />
      <KPIMonitoring jobs={filtered.jobSheets} months={mockData.months} />
      <footer className="page-footer"><div className="footer-brand"><img className="brand-logo" src={transkonLogo} alt="Transkon Rent" /></div><span>Dashboard monitoring internal · Prototype frontend · Seluruh angka merupakan data demonstrasi</span><button aria-label="Informasi dashboard" title="Informasi dashboard"><CircleHelp size={16} /></button></footer>
    </main>
  </div>
}