import { useEffect, useState } from 'react'
import './App.css'

const api = (import.meta.env.VITE_API_URL || 'https://tatkal-booking-system.onrender.com/api').replace(/\/$/, '')
const cacheTtl = 30_000
const responseCache = new Map()
const pendingRequests = new Map()
const tabs = [
  ['assignments', 'Assign coaches', '', '', []],
  ['trains', 'Trains', '/trains', 'number', ['name']],
  ['stations', 'Stations', '/stations', 'code', ['name']],
  ['trips', 'Trips', '/trips', 'id', ['travelDate', 'trainNumber']],
  ['coaches', 'Coaches', '/coaches', 'id', ['code', 'classCode', 'tripId']],
  ['seats', 'Seats', '/seats', 'id', ['seatNumber', 'berthType', 'status', 'coachId']],
  ['bookings', 'Bookings', '/bookings', 'id', ['userId', 'tripId', 'fromSeq', 'toSeq', 'classCode', 'amountPaise']],
  ['passengers', 'Passengers', '/passengers', 'id', ['name', 'age', 'gender', 'booking']],
  ['payments', 'Payments', '/payments', 'id', ['bookingId', 'amountPaise']],
  ['stops', 'Train stops', '/train-stops', 'id', ['seq', 'arrivalTime', 'departureTime', 'trainNumber', 'stationCode']],
  ['users', 'Users', '/users', 'id', ['name', 'email', 'password']],
]

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const useCache = method === 'GET' && options.cache !== 'no-store'
    const cached = responseCache.get(path) || null
  if (useCache && cached && Date.now() - cached.createdAt < cacheTtl) return cached.data
  if (useCache && pendingRequests.has(path)) return pendingRequests.get(path)

  const fetchRequest = (async () => {
    let response
    try {
      response = await fetch(`${api}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
    } catch {
      throw new Error(`Unable to reach the API at ${api}. Check that the backend is deployed and CORS is configured.`)
    }
    const text = await response.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch { data = text }
    if (!response.ok) throw new Error(data?.message || (data?.validationErrors && Object.entries(data.validationErrors).map(([key, value]) => `${key}: ${value}`).join(' | ')) || String(data) || `Request failed (${response.status})`)
    if (method === 'GET') responseCache.set(path, { data, createdAt: Date.now() })
    else responseCache.clear()
    return data
  })()

  if (useCache) {
    pendingRequests.set(path, fetchRequest)
      fetchRequest.then(() => pendingRequests.delete(path), () => pendingRequests.delete(path))
  }
  return fetchRequest
}

function App() {
  const [active, setActive] = useState('trains')
  const [rows, setRows] = useState([])
  const [message, setMessage] = useState('')
  const [latestBooking, setLatestBooking] = useState(null)
  const tab = tabs.find((item) => item[0] === active)
  useEffect(() => { if (active !== 'assignments') load(tab[2]) }, [active])
  async function load(path, fresh = false) { try { const data = await request(path, fresh ? { cache: 'no-store' } : {}); setRows(Array.isArray(data) ? data : data ? [data] : []); setMessage(''); return true } catch (error) { setRows([]); setMessage(error.message); return false } }
  async function handleBookingCreated(booking) { const seat = booking.seat ? await request(`/seats/${booking.seat}`, { cache: 'no-store' }).catch(() => null) : null; setLatestBooking({ booking, seat }) }
  return <div className="app-shell"><header className="topbar"><p className="eyebrow">Tatkal railway system</p><h1>Operations console</h1></header><nav className="tabs">{tabs.map((item) => <button className={item[0] === active ? 'tab active' : 'tab'} key={item[0]} onClick={() => setActive(item[0])}>{item[1]}</button>)}</nav><main className="workspace">{active === 'assignments' ? <CoachAssignments /> : <Crud key={active} tab={tab} rows={rows} setRows={setRows} message={message} setMessage={setMessage} load={load} onBookingCreated={handleBookingCreated} />}{latestBooking && <BookingFollowup bookingInfo={latestBooking} setBookingInfo={setLatestBooking} />}<ServiceViewer /></main></div>
}

function CoachAssignments() {
  const [coaches, setCoaches] = useState([]); const [trips, setTrips] = useState([]); const [coachId, setCoachId] = useState(''); const [tripId, setTripId] = useState(''); const [message, setMessage] = useState('')
  const load = async () => { try { const [coachData, tripData] = await Promise.all([request('/coaches'), request('/trips')]); setCoaches(Array.isArray(coachData) ? coachData : []); setTrips(Array.isArray(tripData) ? tripData : []); setMessage('') } catch (error) { setMessage(error.message) } }
  useEffect(() => { load() }, [])
  const assign = async (event) => { event.preventDefault(); try { await request(`/coaches/${coachId}/assign/${tripId}`, { method: 'POST' }); setMessage('Coach assigned successfully.'); setCoachId(''); setTripId(''); load() } catch (error) { setMessage(error.message) } }
  const unassigned = coaches.filter((coach) => !coach.tripId)
  return <><section className="section-heading"><div><p className="eyebrow">Resource / assignments</p><h2>Assign coaches to trips</h2></div><button className="refresh" onClick={load}>Refresh</button></section><section className="assignment-layout"><section className="panel assignment-form"><h3>Make assignment</h3><p className="hint">Only unassigned coaches can be selected. A coach cannot be reused after assignment.</p><form onSubmit={assign}><label>Available coach<select value={coachId} onChange={(event) => setCoachId(event.target.value)} required><option value="">Select coach</option>{unassigned.map((coach) => <option key={coach.id} value={coach.id}>{coach.code} · {coach.classCode} · #{coach.id}</option>)}</select></label><label>Train trip<select value={tripId} onChange={(event) => setTripId(event.target.value)} required><option value="">Select trip</option>{trips.map((trip) => <option key={trip.id} value={trip.id}>Trip #{trip.id} · Train {trip.trainNumber} · {trip.travelDate}</option>)}</select></label><button className="primary">Assign coach</button></form></section><section className="panel assignment-list"><div className="panel-title"><h3>Coach inventory <span className="count">{coaches.length}</span></h3></div>{coaches.length ? <table><thead><tr><th>Coach</th><th>Class</th><th>Trip assignment</th></tr></thead><tbody>{coaches.map((coach) => <tr key={coach.id}><td>{coach.code} · #{coach.id}</td><td>{coach.classCode}</td><td>{coach.tripId ? `Trip #${coach.tripId}` : <span className="unassigned">Unassigned</span>}</td></tr>)}</tbody></table> : <div className="empty">No coaches found.</div>}</section></section>{message && <div className="notice error">{message}</div>}</>
}

function Crud({ tab, rows, setRows, message, setMessage, load, onBookingCreated }) {
  const [form, setForm] = useState({}); const [editing, setEditing] = useState(null); const [lookup, setLookup] = useState(''); const [lookupField, setLookupField] = useState(''); const [seatCount, setSeatCount] = useState(0); const [berthType, setBerthType] = useState('LOWER'); const [filterSuccess, setFilterSuccess] = useState(false)
  const [key, label, path, id, fields] = tab
  const filterOptions = {
    trains: [{ key: 'number', label: 'Train number', type: 'number', path: (value) => `/trains/${value}` }],
    stations: [{ key: 'name', label: 'Station name', type: 'search', path: (value) => `/stations?search=${encodeURIComponent(value)}` }, { key: 'code', label: 'Station code', type: 'number', path: (value) => `/stations/${value}` }],
    trips: [{ key: 'travelDate', label: 'Travel date', type: 'date', path: (value) => `/trips/date/${value}` }, { key: 'trainNumber', label: 'Train number', type: 'number', path: (value) => `/trips/train/${value}` }],
    coaches: [{ key: 'id', label: 'Coach ID', type: 'number', path: (value) => `/coaches/${value}` }, { key: 'tripId', label: 'Trip ID', type: 'number', path: (value) => `/coaches/trip/${value}` }],
    seats: [{ key: 'id', label: 'Seat ID', type: 'number', path: (value) => `/seats/${value}` }, { key: 'coachId', label: 'Coach ID', type: 'number', path: (value) => `/seats/coach/${value}` }, { key: 'availableCoachId', label: 'Available seats by coach', type: 'number', path: (value) => `/seats/available/${value}` }],
    bookings: [{ key: 'id', label: 'Booking ID', type: 'number', path: (value) => `/bookings/${value}` }, { key: 'userId', label: 'User ID', type: 'number', path: (value) => `/bookings/user/${value}` }, { key: 'tripId', label: 'Trip ID', type: 'number', path: (value) => `/bookings/trip/${value}` }],
    passengers: [{ key: 'id', label: 'Passenger ID', type: 'number', path: (value) => `/passengers/${value}` }, { key: 'bookingId', label: 'Booking ID', type: 'number', path: (value) => `/bookings/${value}/passengers` }],
    payments: [{ key: 'id', label: 'Payment ID', type: 'number', path: (value) => `/payments/${value}` }, { key: 'bookingId', label: 'Booking ID', type: 'number', path: (value) => `/bookings/${value}/payment` }],
    stops: [{ key: 'id', label: 'Stop ID', type: 'number', path: (value) => `/train-stops/${value}` }, { key: 'trainNumber', label: 'Train number', type: 'number', path: (value) => `/train-stops/train/${value}` }],
  }
  const availableFilters = filterOptions[key] || [];
  const selectedFilter = availableFilters.find((filter) => filter.key === lookupField) || availableFilters[0]
  function value(name) { return form[name] ?? '' }
  async function submit(event) { event.preventDefault(); try { const payload = Object.fromEntries(fields.filter((field) => value(field) !== '').map((field) => [field, ['number', 'id', 'userId', 'tripId', 'coachId', 'booking', 'bookingId', 'trainNumber', 'stationCode', 'fromSeq', 'toSeq', 'amountPaise', 'seq', 'age', 'seatNumber'].includes(field) ? Number(value(field)) : value(field)])); const requestPath = key === 'payments' && !editing ? `/bookings/${payload.bookingId}/payment` : editing ? `${path}/${editing}` : path; const result = await request(requestPath, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(key === 'payments' ? { amountPaise: payload.amountPaise } : payload) }); if (key === 'coaches' && !editing && seatCount > 0) await request(`/coaches/${result.id}/seats/bulk?count=${seatCount}&berthType=${berthType}`, { method: 'POST' }); setRows((current) => editing ? current.map((row) => row[id] === editing ? result : row) : [result, ...current]); if (key === 'bookings' && !editing) onBookingCreated(result); setEditing(null); setForm({}); setSeatCount(0); setMessage(key === 'coaches' && seatCount > 0 ? `${label} and ${seatCount} seats created` : `${label} saved`) } catch (error) { setMessage(error.message) } }
  async function remove(itemId) { if (!window.confirm(`Delete ${label} ${itemId}?`)) return; try { await request(`${path}/${itemId}`, { method: 'DELETE' }); setRows((current) => current.filter((row) => row[id] !== itemId)); setMessage(`${label} deleted`) } catch (error) { setMessage(error.message) } }
  const specialPath = selectedFilter ? selectedFilter.path(lookup) : ''
    async function applyFilter(event) { event.preventDefault(); if (!lookup || !selectedFilter) return; setFilterSuccess(await load(specialPath)) }
  return <><section className="section-heading"><div><p className="eyebrow">Resource / {key}</p><h2>{label}</h2></div><button className="refresh" onClick={() => load(path)}>Refresh</button></section><div className="content-grid"><section className="panel form-panel"><h3>{editing ? `Edit ${label}` : `Add ${label}`}</h3><form onSubmit={submit}>{fields.map((field) => <label key={field}>{field}<input list={key === 'coaches' && field === 'classCode' ? 'class-code-options' : undefined} type={field === 'password' ? 'password' : ['travelDate'].includes(field) ? 'date' : ['arrivalTime', 'departureTime'].includes(field) ? 'time' : ['name', 'code', 'classCode', 'berthType', 'status', 'email'].includes(field) ? 'text' : 'number'} value={value(field)} onChange={(event) => setForm({ ...form, [field]: event.target.value })} required={field !== 'password' && !(key === 'coaches' && field === 'tripId') || (field === 'password' && !editing)} minLength={field === 'password' ? 8 : undefined} /></label>)}{key === 'coaches' && <datalist id="class-code-options"><option value="1A" /><option value="2A" /><option value="3A" /><option value="CC" /><option value="EC" /><option value="SL" /><option value="2S" /></datalist>}{key === 'coaches' && !editing && <div className="bulk-seats"><label>Seats to create<input type="number" min="0" max="500" value={seatCount} onChange={(event) => setSeatCount(Number(event.target.value))} /></label><label>Default berth<select value={berthType} onChange={(event) => setBerthType(event.target.value)}><option>LOWER</option><option>MIDDLE</option><option>UPPER</option><option>SIDE_LOWER</option><option>SIDE_UPPER</option></select></label></div>}<button className="primary">{editing ? 'Save changes' : `Create ${label}`}</button></form></section><section className="panel table-panel"><div className="panel-title"><h3>{label} <span className="count">{rows.length}</span></h3></div>{selectedFilter && <form className="lookup" onSubmit={applyFilter}><select aria-label="Filter field" value={selectedFilter.key} onChange={(event) => { setLookupField(event.target.value); setFilterSuccess(false) }}>{availableFilters.map((filter) => <option key={filter.key} value={filter.key}>{filter.label}</option>)}</select><input placeholder="Filter value" value={lookup} onChange={(event) => { setLookup(event.target.value); setFilterSuccess(false) }} /><button className={filterSuccess ? 'secondary filter-success' : 'secondary'}>Run GET</button></form>}<div className="table-wrap">{rows.length ? <table><thead><tr>{[id, ...fields.filter((field) => field !== 'password')].map((column) => <th key={column}>{column}</th>)}<th>Actions</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row[id] ?? index}>{[id, ...fields.filter((field) => field !== 'password')].map((column) => <td key={column}>{format(row[column])}</td>)}<td className="actions"><button onClick={() => { setEditing(row[id]); setForm(row) }}>Edit</button>{key !== 'payments' && <button className="danger" onClick={() => remove(row[id])}>Delete</button>}</td></tr>)}</tbody></table> : <div className="empty">No records returned.</div>}</div></section></div>{message && <div className="notice error">{message}</div>}</>
}

function BookingFollowup({ bookingInfo, setBookingInfo }) {
  const { booking, seat } = bookingInfo
  const [passenger, setPassenger] = useState({ name: '', age: '', gender: 'true' })
  const [payment, setPayment] = useState(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function addPassenger(event) { event.preventDefault(); setBusy(true); try { await request('/passengers', { method: 'POST', body: JSON.stringify({ name: passenger.name, age: Number(passenger.age), gender: passenger.gender === 'true', booking: booking.id }) }); setMessage('Passenger added to this booking.'); setPassenger({ name: '', age: '', gender: 'true' }) } catch (error) { setMessage(error.message) } finally { setBusy(false) } }
  async function startPayment() { setBusy(true); try { const result = await request(`/bookings/${booking.id}/payment`, { method: 'POST', body: JSON.stringify({ amountPaise: booking.amountPaise }) }); setPayment(result); setMessage(`Payment created. Transaction: ${result.transactionId || 'pending'}`) } catch (error) { setMessage(error.message) } finally { setBusy(false) } }
  async function confirmPayment() { if (!payment?.transactionId) { setMessage('The payment has no transaction ID yet.'); return } setBusy(true); try { await request(`/paymentSuccess/${encodeURIComponent(payment.transactionId)}`, { method: 'POST' }); setMessage('Payment successful. Booking confirmed.'); setBookingInfo({ ...bookingInfo, booking: { ...booking, status: 'CONFIRMED' } }) } catch (error) { setMessage(error.message) } finally { setBusy(false) } }
  return <section className="booking-followup panel"><div className="panel-title"><div><p className="eyebrow">Booking created</p><h3>Booking #{booking.id}</h3></div><button className="quiet" onClick={() => setBookingInfo(null)}>Dismiss</button></div><div className="booking-summary"><strong>{seat ? `Seat ${seat.seatNumber}` : `Seat ID ${booking.seat || 'not returned'}`}</strong><span>{seat ? `${seat.berthType} berth · ${seat.status}` : 'Assigned seat details unavailable'}</span><span>Status: {booking.status}</span></div><div className="booking-actions"><form onSubmit={addPassenger}><h4>Add passenger</h4><label>Name<input value={passenger.name} onChange={(event) => setPassenger({ ...passenger, name: event.target.value })} required /></label><label>Age<input type="number" min="1" value={passenger.age} onChange={(event) => setPassenger({ ...passenger, age: event.target.value })} required /></label><label>Gender<select value={passenger.gender} onChange={(event) => setPassenger({ ...passenger, gender: event.target.value })}><option value="true">Male</option><option value="false">Female</option></select></label><button className="primary" disabled={busy}>Save passenger</button></form><div><h4>Payment</h4><p className="hint">Create the payment for this booking, then confirm it after your payment provider reports success.</p><button className="secondary" onClick={startPayment} disabled={busy || Boolean(payment)}>Create payment ({booking.amountPaise} paise)</button>{payment && <button className="primary" onClick={confirmPayment} disabled={busy || booking.status === 'CONFIRMED'}>Confirm payment</button>}</div></div>{message && <div className="notice success">{message}</div>}</section>
}

function ServiceViewer() {
  const [date, setDate] = useState(''); const [trains, setTrains] = useState([]); const [trips, setTrips] = useState([]); const [number, setNumber] = useState(''); const [trip, setTrip] = useState(null); const [train, setTrain] = useState(null); const [coaches, setCoaches] = useState([]); const [stops, setStops] = useState([]); const [stations, setStations] = useState({}); const [status, setStatus] = useState('Choose a trip date.')
  useEffect(() => { request('/trains').then((data) => setTrains(Array.isArray(data) ? data : [])).catch(() => setStatus('Unable to load trains.')) }, [])
  useEffect(() => { setNumber(''); setTrip(null); setTrain(null); setCoaches([]); setStops([]); if (date) request(`/trips/date/${date}`).then((data) => { setTrips(Array.isArray(data) ? data : []); setStatus('Select a train.') }).catch((error) => setStatus(error.message)); else setStatus('Choose a trip date.') }, [date])
  useEffect(() => { const next = trips.find((item) => String(item.trainNumber) === number); setTrip(next || null) }, [number, trips])
  useEffect(() => { if (!number) return; (async () => { try { const [trainData, stopData] = await Promise.all([request(`/trains/${number}`), request(`/trains/${number}/stops`)]); setTrain(trainData); const ordered = [...(stopData || [])].sort((a, b) => a.seq - b.seq); setStops(ordered); const stationList = await Promise.all(ordered.map((stop) => request(`/stations/${stop.stationCode}`).catch(() => null))); const map = {}; ordered.forEach((stop, index) => { if (stationList[index]) map[stop.stationCode] = stationList[index] }); setStations(map); if (trip) { const coachList = await request(`/coaches/trip/${trip.id}`); const detailed = await Promise.all((coachList || []).map(async (coach) => ({ ...coach, seats: await request(`/seats/coach/${coach.id}`).catch(() => []) }))); setCoaches(detailed) } setStatus('Service loaded.') } catch (error) { setStatus(error.message) } })() }, [number, trip])
  return <section className="viewer"><div className="viewer-heading"><div><p className="eyebrow">Live relationship view</p><h2>Service visualizer</h2><p className="viewer-subtitle">Train, trip, coaches, seats and named stops in one view.</p></div><div className="viewer-controls"><label>Trip date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Train<select value={number} onChange={(event) => setNumber(event.target.value)} disabled={!date}><option value="">Select train</option>{trains.filter((item) => trips.some((itemTrip) => String(itemTrip.trainNumber) === String(item.number))).map((item) => <option key={item.number} value={item.number}>{item.number} · {item.name}</option>)}</select></label></div></div>{!train ? <div className="viewer-empty">{status}</div> : <><div className="service-summary"><div className="train-mark">{train.number}</div><div><p className="eyebrow">Selected train</p><h3>{train.name}</h3><p className="muted">Trip {trip?.id} · {date}</p></div><div className="summary-stat"><strong>{coaches.length}</strong><span>coaches</span></div><div className="summary-stat"><strong>{coaches.reduce((sum, coach) => sum + (coach.seats?.filter((seat) => seat.status === 'AVAILABLE').length || 0), 0)}</strong><span>available seats</span></div></div><div className="viewer-grid"><div className="viewer-block"><div className="block-heading"><h3>Coaches & seat availability</h3></div>{coaches.map((coach) => { const total = coach.seats?.length || 0; const free = coach.seats?.filter((seat) => seat.status === 'AVAILABLE').length || 0; return <div className="coach-card" key={coach.id}><div className="coach-top"><strong>{coach.code}</strong><span>{coach.classCode}</span></div><div className="availability-bar"><i style={{ width: total ? `${free / total * 100}%` : '0%' }} /></div><div className="coach-bottom"><b>{free} available</b><span>of {total} seats</span></div></div> })}</div><div className="viewer-block route-block"><div className="block-heading"><h3>Train route</h3><span>{stops.length} stops</span></div><div className="route-line">{stops.map((stop) => <div className="stop" key={stop.seq}><div className="stop-node" /><div><strong>{stations[stop.stationCode]?.name || `Station ${stop.stationCode}`}</strong><span>Stop {stop.seq} · {stop.arrivalTime || '--:--'} → {stop.departureTime || '--:--'}</span><small>Code {stop.stationCode}</small></div></div>)}</div></div></div></>}</section>
}

function format(value) { if (value === null || value === undefined) return '—'; if (typeof value === 'object') return JSON.stringify(value); return String(value) }
export default App
