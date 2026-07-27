import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabaseClient'

const adminText = {
  en: {
    title: 'Admin panel',
    back: 'Back to site',
    tabProducts: 'Products',
    tabSupport: 'Support requests',
    tabOrders: 'Orders',
    tabStats: 'Stats & workshop',

    addProduct: 'Add a new kit',
    name: 'Name',
    description: 'Description',
    price: 'Price (£)',
    imageUrl: 'Image URL',
    materials: 'Materials',
    addButton: 'Add kit',
    delete: 'Delete',
    noProducts: 'No kits yet.',

    noSupport: 'No support requests yet.',
    markResolved: 'Mark resolved',
    reopened: 'Reopen',
    subjectLabel: 'Subject',
    from: 'From',

    noOrders: 'No orders yet.',
    total: 'Total',

    newMembersTitle: 'New members this month',
    workshopTitle: 'Workshop attendance',
    sessionDate: 'Session date',
    attendeeCount: 'Attendees',
    note: 'Note (optional)',
    addSession: 'Log session',
    totalThisMonth: 'Total this month',
    noSessions: 'No sessions logged yet.',
  },
  tr: {
    title: 'Yönetici paneli',
    back: 'Siteye dön',
    tabProducts: 'Ürünler',
    tabSupport: 'Destek talepleri',
    tabOrders: 'Siparişler',
    tabStats: 'İstatistikler & Atölye',

    addProduct: 'Yeni kit ekle',
    name: 'İsim',
    description: 'Açıklama',
    price: 'Fiyat (£)',
    imageUrl: 'Görsel URL',
    materials: 'Malzemeler',
    addButton: 'Kiti ekle',
    delete: 'Sil',
    noProducts: 'Henüz kit yok.',

    noSupport: 'Henüz destek talebi yok.',
    markResolved: 'Çözüldü olarak işaretle',
    reopened: 'Yeniden aç',
    subjectLabel: 'Konu',
    from: 'Gönderen',

    noOrders: 'Henüz sipariş yok.',
    total: 'Toplam',

    newMembersTitle: 'Bu ay kayıt olan yeni üye',
    workshopTitle: 'Atölye katılımı',
    sessionDate: 'Atölye tarihi',
    attendeeCount: 'Katılımcı sayısı',
    note: 'Not (opsiyonel)',
    addSession: 'Kaydı gir',
    totalThisMonth: 'Bu ay toplam',
    noSessions: 'Henüz kayıt girilmedi.',
  },
}

const tabs = [
  ['products', 'tabProducts'],
  ['support', 'tabSupport'],
  ['orders', 'tabOrders'],
  ['stats', 'tabStats'],
]

function Admin({ session, language, onLanguageChange, onBack }) {
  const t = adminText[language] || adminText.en

  const [view, setView] = useState('products')

  const [kits, setKits] = useState([])
  const [kitForm, setKitForm] = useState({ name: '', description: '', price: '', image_url: '', materials: '' })
  const [kitStatus, setKitStatus] = useState('')

  const [supportRequests, setSupportRequests] = useState([])
  const [orders, setOrders] = useState([])

  const [newMembersCount, setNewMembersCount] = useState(0)
  const [sessions, setSessions] = useState([])
  const [sessionForm, setSessionForm] = useState({ session_date: '', attendee_count: '', note: '' })
  const [sessionStatus, setSessionStatus] = useState('')

  const loadAdminData = async () => {
    const [kitsRes, supportRes, ordersRes, sessionsRes] = await Promise.all([
      supabase.from('kits').select('*').order('id'),
      supabase.from('support_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('workshop_sessions').select('*').order('session_date', { ascending: false }),
    ])

    if (kitsRes.data) setKits(kitsRes.data)
    if (supportRes.data) setSupportRequests(supportRes.data)
    if (ordersRes.data) setOrders(ordersRes.data)
    if (sessionsRes.data) setSessions(sessionsRes.data)

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    setNewMembersCount(count || 0)
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const handleKitChange = (event) => {
    const { name, value } = event.target
    setKitForm((current) => ({ ...current, [name]: value }))
  }

  const submitKit = async (event) => {
    event.preventDefault()
    setKitStatus('...')

    const { data, error } = await supabase
      .from('kits')
      .insert({
        name: kitForm.name,
        description: kitForm.description,
        price: Number(kitForm.price),
        image_url: kitForm.image_url,
        materials: kitForm.materials,
      })
      .select()

    if (error) {
      setKitStatus('error')
      return
    }

    setKits((current) => [...current, data[0]])
    setKitForm({ name: '', description: '', price: '', image_url: '', materials: '' })
    setKitStatus('')
  }

  const deleteKit = async (id) => {
    await supabase.from('kits').delete().eq('id', id)
    setKits((current) => current.filter((k) => k.id !== id))
  }

  const toggleSupportStatus = async (request) => {
    const newStatus = request.status === 'resolved' ? 'open' : 'resolved'
    const { data } = await supabase
      .from('support_requests')
      .update({ status: newStatus })
      .eq('id', request.id)
      .select()

    if (data) {
      setSupportRequests((current) => current.map((r) => (r.id === request.id ? data[0] : r)))
    }
  }

  const handleSessionChange = (event) => {
    const { name, value } = event.target
    setSessionForm((current) => ({ ...current, [name]: value }))
  }

  const submitSession = async (event) => {
    event.preventDefault()
    setSessionStatus('...')

    const { data, error } = await supabase
      .from('workshop_sessions')
      .insert({
        session_date: sessionForm.session_date,
        attendee_count: Number(sessionForm.attendee_count),
        note: sessionForm.note,
      })
      .select()

    if (error) {
      setSessionStatus('error')
      return
    }

    setSessions((current) => [data[0], ...current])
    setSessionForm({ session_date: '', attendee_count: '', note: '' })
    setSessionStatus('')
  }

  const now = new Date()
  const attendanceThisMonth = sessions
    .filter((s) => {
      const d = new Date(s.session_date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, s) => sum + (s.attendee_count || 0), 0)

  return (
    <section className="admin-section">
      <div className="admin-card">
        <div className="admin-header">
          <div>
            <span>The Glass Worlds</span>
            <h2>{t.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {onLanguageChange && (
              <motion.button
                className="mini-language-toggle"
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onLanguageChange(language === 'en' ? 'tr' : 'en')}
              >
                {language === 'en' ? 'TR' : 'EN'}
              </motion.button>
            )}
            <motion.button
              className="panel-back"
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={onBack}
            >
              {t.back}
            </motion.button>
          </div>
        </div>

        <div className="admin-tabs">
          {tabs.map(([key, labelKey]) => (
            <motion.button
              key={key}
              type="button"
              className={`admin-tab ${view === key ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView(key)}
            >
              {t[labelKey]}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {view === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <form className="admin-form" onSubmit={submitKit}>
                <h3>{t.addProduct}</h3>
                <input name="name" placeholder={t.name} value={kitForm.name} onChange={handleKitChange} required />
                <input name="description" placeholder={t.description} value={kitForm.description} onChange={handleKitChange} />
                <input name="price" type="number" min="0" step="0.01" placeholder={t.price} value={kitForm.price} onChange={handleKitChange} required />
                <input name="image_url" placeholder={t.imageUrl} value={kitForm.image_url} onChange={handleKitChange} />
                <input name="materials" placeholder={t.materials} value={kitForm.materials} onChange={handleKitChange} />
                <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {t.addButton}
                </motion.button>
                {kitStatus && <p className="panel-status">{kitStatus}</p>}
              </form>

              {kits.length === 0 ? (
                <p className="panel-empty">{t.noProducts}</p>
              ) : (
                <div className="admin-list">
                  {kits.map((kit) => (
                    <div className="admin-row" key={kit.id}>
                      <div>
                        <strong>{kit.name}</strong>
                        <span>£{kit.price}</span>
                      </div>
                      <button className="admin-remove" onClick={() => deleteKit(kit.id)}>
                        {t.delete}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {supportRequests.length === 0 ? (
                <p className="panel-empty">{t.noSupport}</p>
              ) : (
                <div className="admin-list">
                  {supportRequests.map((req) => (
                    <div className="admin-row admin-row-wide" key={req.id}>
                      <div>
                        <strong>{req.subject}</strong>
                        <p className="admin-message">{req.message}</p>
                        <span>
                          {t.from}: {req.user_email || req.user_id}
                        </span>
                      </div>
                      <button className="admin-remove" onClick={() => toggleSupportStatus(req)}>
                        {req.status === 'resolved' ? t.reopened : t.markResolved}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {orders.length === 0 ? (
                <p className="panel-empty">{t.noOrders}</p>
              ) : (
                <div className="admin-list">
                  {orders.map((order) => (
                    <div className="admin-row admin-row-wide" key={order.id}>
                      <div>
                        <strong>{order.user_email || order.user_id}</strong>
                        <p className="admin-message">
                          {(order.items || []).map((item) => `${item.name} ×${item.quantity}`).join(', ')}
                        </p>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="admin-total">
                        {t.total}: £{Number(order.total).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <span>{t.newMembersTitle}</span>
                  <strong>{newMembersCount}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>{t.totalThisMonth}</span>
                  <strong>{attendanceThisMonth}</strong>
                </div>
              </div>

              <form className="admin-form" onSubmit={submitSession}>
                <h3>{t.workshopTitle}</h3>
                <input
                  name="session_date"
                  type="date"
                  value={sessionForm.session_date}
                  onChange={handleSessionChange}
                  required
                />
                <input
                  name="attendee_count"
                  type="number"
                  min="0"
                  placeholder={t.attendeeCount}
                  value={sessionForm.attendee_count}
                  onChange={handleSessionChange}
                  required
                />
                <input name="note" placeholder={t.note} value={sessionForm.note} onChange={handleSessionChange} />
                <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {t.addSession}
                </motion.button>
                {sessionStatus && <p className="panel-status">{sessionStatus}</p>}
              </form>

              {sessions.length === 0 ? (
                <p className="panel-empty">{t.noSessions}</p>
              ) : (
                <div className="admin-list">
                  {sessions.map((s) => (
                    <div className="admin-row" key={s.id}>
                      <div>
                        <strong>{new Date(s.session_date).toLocaleDateString()}</strong>
                        <span>{s.attendee_count} {t.attendeeCount.toLowerCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default Admin

