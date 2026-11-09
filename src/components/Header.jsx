import { Activity, CalendarDays, ChevronDown, Download, SlidersHorizontal } from 'lucide-react'
import { DemoTag, FilterSelect } from './Shared.jsx'
import headerBanner from '../../header-banner.png'
import transkonLogo from '../../logo transkon.png'

export default function Header({ filters, setFilter, optionData }) {
  return <>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Transkon Rent dashboard">
        <img className="brand-logo" src={transkonLogo} alt="Transkon Rent" />
      </a>
      <div className="topbar-divider" />
      <div className="header-title"><h1>DASHBOARD</h1><p>MONITORING BREAKDOWN &amp; JOB SHEET</p></div>
      <div className="header-actions"><span className="operational-label"><Activity size={15} /> Operational Performance <b>/</b> Maintenance Achievement</span><button className="export-button" onClick={() => window.print()}><Download size={15} /> Export</button><button className="avatar-button" aria-label="User menu">TS <ChevronDown size={13} /></button></div>
    </header>
    <section className="hero-banner" id="top">
      <img src={headerBanner} alt="Kendaraan operasional di area pertambangan" />
      <div className="hero-shade" />
      <div className="hero-copy"><span className="hero-kicker">PT TRANSKON JAYA TBK</span><h2>Operational<br />Performance</h2><p>Monitoring armada. Menjaga produktivitas.</p></div>
      <DemoTag />
      <div className="hero-meta"><span>ASSET &amp; FLEET MONITORING</span><span>2026 <i /></span></div>
    </section>
    <section className="filter-bar" aria-label="Global filters">
      <div className="filter-intro"><SlidersHorizontal size={17} /><div><strong>Global Filter</strong><small>Persempit data dashboard</small></div></div>
      <div className="filters">
        <FilterSelect label="Periode" value={filters.period} onChange={(value) => setFilter('period', value)} options={[{ value: 'all', label: 'Semua periode' }, { value: '30', label: '30 hari terakhir' }, { value: '90', label: '90 hari terakhir' }, { value: 'ytd', label: 'Tahun berjalan' }]} />
        <label className="filter-control date-filter"><span>Rentang tanggal</span><div className="date-inputs"><CalendarDays size={15} /><input type="date" value={filters.startDate} onChange={(event) => setFilter('startDate', event.target.value)} aria-label="Tanggal mulai" /><span>—</span><input type="date" value={filters.endDate} onChange={(event) => setFilter('endDate', event.target.value)} aria-label="Tanggal akhir" /></div></label>
        <FilterSelect label="Hub" value={filters.hub} onChange={(value) => setFilter('hub', value)} options={optionData.hubs} />
        <FilterSelect label="Site" value={filters.site} onChange={(value) => setFilter('site', value)} options={optionData.sites} />
        <FilterSelect label="Customer" value={filters.customer} onChange={(value) => setFilter('customer', value)} options={optionData.customers} />
        <FilterSelect label="Kategori problem" value={filters.category} onChange={(value) => setFilter('category', value)} options={optionData.categories} />
      </div>
    </section>
  </>
}