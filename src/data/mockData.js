const hubs = ['BALIKPAPAN', 'BATU HIJAU', 'BERAU', 'KALSEL', 'KAL-TENG', 'MELAK', 'SULAWESI', 'HALMAHERA', 'SANGATTA']
const sites = [
  'TRJA HO',
  'Tabang',
  'BUMA Tabang',
  'TCI MSJ',
  'PAMA Jembayan',
  'HPU Damai',
  'HPU MSJ',
  'PPA MHU',
  'Martabe',
  'Wetar',
  'Batu Kajang',
  'Samarinda',
  'THEP',
  'TRJA Batu Hijau',
  'Memco',
  'Memco Mining',
  'TRJA Berau',
  'BUMA Lati',
  'BUMA Binungan',
  'BC Lati',
  'HPU KJB',
  'HPU HAA',
  'Gurimbang',
  'Sambarata',
  'Labanan',
  'BC Binungan',
  'TRJA Sebamban',
  'KEL Sungai Durian',
  'Senakin',
  'Hilcon Kota Baru',
  'PPA Sebamban',
  'BUMA SDJ',
  'Wahana Satui',
  'Rantau',
  'Adaro Tanjung',
  'Banjarbaru',
  'CK Sebamban',
  'Indocement',
  'TRJA Puruk Cahu',
  'Jangkang',
  'DMP Kuala Kurun',
  'PPA Gn Mas',
  'AMC Lahai & Maruwai',
  'HPU MGM & SAB',
  'THIESS KBU',
  'HPMU KDA Kalbar',
  'Borneo Prima',
  'TRJA Melak',
  'Trust BEK',
  'Riung',
  'PAMA TCM',
  'PAMA BEK',
  'TSA Melak',
  'BSS Melak Seberang',
  'Melak Gunung Bayan',
  'Morowali',
  'SCM Konawe',
  'SMA Bakan',
  'Langgikima Konut',
  'MTI Morowali',
  'Toka Tindung',
  'Gunung Pani Gorontalo',
  'TRJA Halmahera',
  'STM Halmahera',
  'CKB Halmahera',
  'Petrosea Halmahera',
  'TRJA Sangatta',
  'GPE Kaubun',
  'BDE Kaubun',
  'Thiess Sangatta',
  'PAMA Bengalon',
  'Bengalon',
  'Bus TRJA Sangatta',
]
const customers = ['PT Kaltim Prima Coal', 'PT Bayan Resources', 'PT Adaro Indonesia', 'PT BUMA', 'Internal']
const categories = ['Engine', 'Electrical', 'Hydraulic', 'Tyre', 'Preventive']
export const jobSheetResponsibilities = ['Workshop', 'Fleet', 'Warehouse', 'Planner']
const kpiTypes = ['WO', 'MR', 'Warranty', 'BCH']
export const breakdownStatuses = [
  'Waiting Dokument',
  'Waiting Labour / Stall',
  'Work on progress',
  'Waiting Movement',
  'Waiting Part',
  'Waiting Approval',
  'Waiting Commisioning',
  'Ready For Use',
]
const distribute = (items, counts) => items.flatMap((item, index) => Array(counts[index] ?? 0).fill(item))
const jobSheetHubs = distribute(hubs, [18, 15, 13, 11, 10, 9, 8, 7, 5])
const jobSheetCustomers = distribute(customers, [24, 22, 20, 17, 13])
const jobSheetSites = distribute(sites, [16, 13, 10, 7, 5, ...Array(45).fill(1)])
const jobSheetResponsibilityValues = distribute(jobSheetResponsibilities, [34, 27, 21, 14])
const jobSheetKpiTypes = distribute(kpiTypes, [30, 24, 22, 20])
const breakdownStatusValues = distribute(breakdownStatuses, [9, 7, 6, 5, 5, 4, 3, 3])
const addDays = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10)

const breakdowns = Array.from({ length: 42 }, (_, index) => {
  const day = (index * 3) % 28 + 1
  const month = (index % 6) + 1
  const receivedDate = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const isReady = index % 7 !== 0
  const leadTime = 1 + ((index * 5) % 13)
  const readyDate = isReady ? new Date(new Date(`${receivedDate}T00:00:00`).getTime() + leadTime * 86400000).toISOString().slice(0, 10) : ''
  return {
    id: `BD-${String(index + 1).padStart(4, '0')}`,
    receivedDate,
    readyDate,
    hub: hubs[index % hubs.length],
    site: sites[(index * 2) % sites.length],
    customer: customers[(index * 3) % customers.length],
    category: categories[(index * 4) % categories.length],
    status: breakdownStatusValues[index],
    unit: `DT-${String(210 + index).padStart(3, '0')}`,
    type: index % 4 === 0 ? 'BU' : 'BD',
    responsibility: index % 5 === 0 ? 'Customer' : 'Transkon',
    offHired: index % 6 === 0,
    maintenanceCost: 1800000 + ((index * 337000) % 7600000),
  }
})

const jobSheets = Array.from({ length: 96 }, (_, index) => {
  const receivedMonth = (index % 8) + 1
  const receivedDay = (index * 7) % 27 + 1
  const registered = index % 11 !== 0
  const sentTechnical = index % 5 !== 0
  const approvedTechnical = index % 4 !== 0
  const sentWarehouse = index % 3 !== 0
  const received = `2026-${String(receivedMonth).padStart(2, '0')}-${String(receivedDay).padStart(2, '0')}`
  const dateToMyob = index % 6 === 0 ? '' : `2026-${String(receivedMonth).padStart(2, '0')}-${String(Math.min(receivedDay + 4, 28)).padStart(2, '0')}`
  return {
    no: index + 1,
    received,
    register: registered ? `2026-${String(receivedMonth).padStart(2, '0')}-${String(Math.min(receivedDay + 1, 28)).padStart(2, '0')}` : '',
    tkNumber: `TK${String(6400 + index)}`,
    jobSheetNumber: index < 48
      ? `JS${String(14351 + index).padStart(6, '0')}`
      : String(528877 + index - 48),
    customer: jobSheetCustomers[index],
    site: jobSheetSites[index],
    hub: jobSheetHubs[index],
    responsibility: jobSheetResponsibilityValues[index],
    requestType: jobSheetKpiTypes[index],
    work: ['Engine overhaul', 'Replace hydraulic hose', 'Electrical diagnosis', 'Scheduled service', 'Brake system repair'][index % 5],
    category: categories[(index * 3) % categories.length],
    dateToMyob,
    sendTechnical: sentTechnical ? `2026-${String(receivedMonth).padStart(2, '0')}-${String(Math.min(receivedDay + 1, 28)).padStart(2, '0')}` : '',
    approveTechnical: approvedTechnical ? `2026-${String(receivedMonth).padStart(2, '0')}-${String(Math.min(receivedDay + 2, 28)).padStart(2, '0')}` : '',
    sendWarehouse: sentWarehouse ? addDays(received, 1 + ((index * 7) % 5)) : '',
    cost: 1250000 + ((index * 181000) % 5200000),
    priority: `P${(index % 3) + 1}`,
    workType: index % 12 === 0 ? 'Petty Cash' : ['Cash on Site', 'Repair', 'Backcharge'][index % 3],
    backchargeType: index % 3 === 2 ? (index % 2 === 0 ? 'BCH OR' : 'BCH all Risk') : '',
    age: (index * 9) % 121,
  }
})

export const mockData = {
  breakdowns,
  jobSheets,
  hubs,
  sites,
  customers,
  categories,
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Agu'],
  maintenance: {
    targetPA: 92,
    paActual: [89.4, 91.2, 90.6, 93.1, 92.4, 94.2, 93.5, 94.1],
    paTarget: [92, 92, 92, 92, 92, 92, 92, 92],
    performanceTarget: 90,
    leadTimeTarget: 5,
  },
  kpis: {
    workOrder: { open: 18, closed: 57, pending: 9, trend: [23, 28, 31, 26, 34, 30, 38, 42] },
    materialRequest: { requested: 52, approved: 38, pending: 14, trend: [12, 16, 14, 19, 17, 22, 21, 25] },
    warranty: { submitted: 14, approved: 9, rejected: 2, cost: 42850000, trend: [1, 2, 3, 2, 4, 3, 5, 4] },
    backcharge: { total: 26, nominal: 176400000, open: 8, inProgress: 7, closed: 11, trend: [3, 5, 4, 6, 3, 7, 5, 8] },
  },
}