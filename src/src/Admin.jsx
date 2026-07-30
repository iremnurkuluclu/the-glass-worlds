import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import AnimatedGlobeLogo from './AnimatedGlobeLogo'

const adminText = {
  en: {
    title: 'Admin panel',
    back: 'Back to homepage',
    deskTitle: 'Studio desk',
    metricProducts: 'Products',
    metricMessages: 'Messages',
    metricOrders: 'Orders',
    metricWorkshop: 'Workshop',
    tabDashboard: 'Overview',
    tabProducts: 'Products',
    tabMessages: 'Messages',
    tabSupport: 'Support requests',
    tabOrders: 'Orders',
    tabMembers: 'Members',
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
    noMessages: 'No messages yet.',

    noSupport: 'No support requests yet.',
    markResolved: 'Mark resolved',
    reopened: 'Reopen',
    subjectLabel: 'Subject',
    from: 'From',

    noOrders: 'No orders yet.',
    total: 'Total',
    membersTitle: 'Member management',
    membersSearch: 'Search by name or email',
    noMembers: 'No members found.',
    memberActive: 'Active',
    memberDisabled: 'Disabled',
    memberDisable: 'Disable account',
    memberEnable: 'Enable account',
    memberDelete: 'Delete member',
    memberOwner: 'Owner account',
    memberOrders: 'orders',
    memberBookings: 'workshop registrations',
    memberConfirmDisable: 'Disable this member account?',
    memberConfirmEnable: 'Enable this member account?',
    memberConfirmDelete: 'Permanently delete this member? This action cannot be undone.',
    memberActionSuccess: 'Member account updated.',
    memberDeleteSuccess: 'Member was deleted.',
    memberActionError: 'The operation could not be completed. Check the Supabase function setup.',

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
    back: 'Ana sayfaya dön',
    deskTitle: 'Atölye yönetimi',
    metricProducts: 'Ürünler',
    metricMessages: 'Mesajlar',
    metricOrders: 'Siparişler',
    metricWorkshop: 'Atölye',
    tabDashboard: 'Genel bakış',
    tabProducts: 'Ürünler',
    tabMessages: 'Mesajlar',
    tabSupport: 'Destek talepleri',
    tabOrders: 'Siparişler',
    tabMembers: 'Üyeler',
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
    noMessages: 'Henüz mesaj yok.',

    noSupport: 'Henüz destek talebi yok.',
    markResolved: 'Çözüldü olarak işaretle',
    reopened: 'Yeniden aç',
    subjectLabel: 'Konu',
    from: 'Gönderen',

    noOrders: 'Henüz sipariş yok.',
    total: 'Toplam',
    membersTitle: 'Üye yönetimi',
    membersSearch: 'İsim veya e-posta ile ara',
    noMembers: 'Üye bulunamadı.',
    memberActive: 'Aktif',
    memberDisabled: 'Pasif',
    memberDisable: 'Hesabı pasife al',
    memberEnable: 'Hesabı etkinleştir',
    memberDelete: 'Üyeyi sil',
    memberOwner: 'Yönetici hesabı',
    memberOrders: 'sipariş',
    memberBookings: 'etkinlik kaydı',
    memberConfirmDisable: 'Bu üyenin hesabı pasife alınsın mı?',
    memberConfirmEnable: 'Bu üyenin hesabı yeniden etkinleştirilsin mi?',
    memberConfirmDelete: 'Bu üye kalıcı olarak silinsin mi? Bu işlem geri alınamaz.',
    memberActionSuccess: 'Üye hesabı güncellendi.',
    memberDeleteSuccess: 'Üye silindi.',
    memberActionError: 'İşlem tamamlanamadı. Supabase fonksiyon kurulumunu kontrol et.',

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
  ['dashboard', 'tabDashboard'],
  ['products', 'tabProducts'],
  ['messages', 'tabMessages'],
  ['orders', 'tabOrders'],
  ['members', 'tabMembers'],
  ['support', 'tabSupport'],
  ['stats', 'tabStats'],
]

function Admin({ language, onLanguageChange, onBack }) {
  const t = adminText[language] || adminText.en
  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-GB'
  const location = useLocation()
  const navigate = useNavigate()
  const adminViews = tabs.map(([key]) => key)
  const routeView = location.pathname.split('/')[2]
  const view = adminViews.includes(routeView) ? routeView : 'dashboard'
  const setView = (nextView) => navigate(`/admin/${nextView}`)

  const [kits, setKits] = useState([])
  const [messages, setMessages] = useState([])
  const [kitForm, setKitForm] = useState({ name: '', description: '', price: '', image_url: '', materials: '' })
  const [kitStatus, setKitStatus] = useState('')

  const [supportRequests, setSupportRequests] = useState([])
  const [orders, setOrders] = useState([])
  const [members, setMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [memberStatus, setMemberStatus] = useState('')
  const [memberBusy, setMemberBusy] = useState('')

  const [newMembersCount, setNewMembersCount] = useState(0)
  const [sessions, setSessions] = useState([])
  const [sessionForm, setSessionForm] = useState({ session_date: '', attendee_count: '', note: '' })
  const [sessionStatus, setSessionStatus] = useState('')

  const loadAdminData = async () => {
    const [kitsRes, messagesRes, supportRes, ordersRes, sessionsRes] = await Promise.all([
      supabase.from('kits').select('*').order('id'),
      supabase.from('messages').select('id, name, email, message, created_at').order('created_at', { ascending: false }),
      supabase.from('support_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('workshop_sessions').select('*').order('session_date', { ascending: false }),
    ])

    if (kitsRes.data) setKits(kitsRes.data)
    if (messagesRes.data) setMessages(messagesRes.data)
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

  const loadMembers = async () => {
    setMemberStatus('')
    const { data, error } = await supabase.functions.invoke('hyper-responder', {
      body: { action: 'list' },
    })
    if (error || data?.error) {
      setMemberStatus(t.memberActionError)
      return
    }
    setMembers(data?.users || [])
  }

  useEffect(() => {
    if (view === 'members') loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  const manageMember = async (member, action) => {
    const confirmText = action === 'delete'
      ? t.memberConfirmDelete
      : member.is_disabled ? t.memberConfirmEnable : t.memberConfirmDisable
    if (!window.confirm(confirmText)) return

    setMemberBusy(member.id)
    setMemberStatus('')
    const { data, error } = await supabase.functions.invoke('hyper-responder', {
      body: { action, user_id: member.id, disabled: !member.is_disabled },
    })
    setMemberBusy('')

    if (error || data?.error) {
      setMemberStatus(data?.error || t.memberActionError)
      return
    }

    setMemberStatus(action === 'delete' ? t.memberDeleteSuccess : t.memberActionSuccess)
    if (action === 'delete') {
      setMembers((current) => current.filter((item) => item.id !== member.id))
    } else {
      setMembers((current) => current.map((item) => (
        item.id === member.id ? { ...item, is_disabled: !member.is_disabled } : item
      )))
    }
  }

  const filteredMembers = members.filter((member) => {
    const query = memberSearch.trim().toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-GB')
    if (!query) return true
    return `${member.full_name || ''} ${member.email || ''}`.toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-GB').includes(query)
  })

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
    <section className="admin-page">
      <aside className="admin-sidebar">
        <button type="button" className="admin-sidebar-brand admin-brand-button" onClick={onBack}>
          <AnimatedGlobeLogo compact />
          <span className="admin-brand-copy">
          <span>The Glass Worlds</span>
          <strong>{t.deskTitle}</strong>
          </span>
        </button>
        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          {tabs.map(([key, labelKey]) => (
            <button
              key={key}
              type="button"
              className={view === key ? 'active' : ''}
              onClick={() => setView(key)}
            >
              {t[labelKey]}
            </button>
          ))}
        </nav>
      </aside>
      <main className="admin-workspace">
      <div className="admin-card">
        <div className="admin-header">
          <div>
            <span>The Glass Worlds</span>
            <h2>{t.title}</h2>
          </div>
        </div>

        <div className="admin-tabs admin-tabs-mobile">
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
{view === 'dashboard' && (
  <motion.div
    key="dashboard"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
  >
    <div className="dashboard-grid">

      <div className="dashboard-card">
        <h3>{t.metricProducts}</h3>
        <strong>{kits.length}</strong>
      </div>

      <div className="dashboard-card">
        <h3>{t.metricMessages}</h3>
        <strong>{messages.length}</strong>
      </div>

      <div className="dashboard-card">
        <h3>{t.metricOrders}</h3>
        <strong>{orders.length}</strong>
      </div>

      <div className="dashboard-card">
        <h3>{t.metricWorkshop}</h3>
        <strong>{attendanceThisMonth}</strong>
      </div>

    </div>
  </motion.div>
)}
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

          {view === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {messages.length === 0 ? (
                <p className="panel-empty">{t.noMessages}</p>
              ) : (
                <div className="admin-list">
                  {messages.map((message) => (
                    <div className="admin-row admin-row-wide" key={message.id}>
                      <div>
                        <strong>{message.name || message.email}</strong>
                        <p className="admin-message">{message.message}</p>
                        <span>{message.email} · {new Date(message.created_at).toLocaleDateString(dateLocale)}</span>
                      </div>
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
                        <span>{new Date(order.created_at).toLocaleDateString(dateLocale)}</span>
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

          {view === 'members' && (
            <motion.div
              key="members"
              className="admin-members-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="admin-members-heading">
                <div>
                  <span>The Glass Worlds</span>
                  <h3>{t.membersTitle}</h3>
                </div>
                <span className="admin-member-count">{members.length}</span>
              </div>

              <label className="admin-member-search">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  placeholder={t.membersSearch}
                />
              </label>

              {memberStatus && <p className="panel-status">{memberStatus}</p>}

              {filteredMembers.length === 0 ? (
                <p className="panel-empty">{t.noMembers}</p>
              ) : (
                <div className="admin-member-list">
                  {filteredMembers.map((member) => (
                    <article className={`admin-member-card${member.is_disabled ? ' is-disabled' : ''}`} key={member.id}>
                      <div className="admin-member-avatar">
                        {(member.full_name || member.email || '?').trim()[0]?.toUpperCase()}
                      </div>
                      <div className="admin-member-details">
                        <div className="admin-member-name-row">
                          <strong>{member.full_name || member.email}</strong>
                          <span className={member.is_disabled ? 'disabled' : 'active'}>
                            {member.is_owner ? t.memberOwner : member.is_disabled ? t.memberDisabled : t.memberActive}
                          </span>
                        </div>
                        <p>{member.email}</p>
                        <small>
                          {member.order_count || 0} {t.memberOrders} · {member.booking_count || 0} {t.memberBookings}
                        </small>
                      </div>
                      {!member.is_owner && (
                        <div className="admin-member-actions">
                          <button
                            type="button"
                            className="admin-member-toggle"
                            disabled={memberBusy === member.id}
                            onClick={() => manageMember(member, 'toggle_disabled')}
                          >
                            {member.is_disabled ? t.memberEnable : t.memberDisable}
                          </button>
                          <button
                            type="button"
                            className="admin-member-delete"
                            disabled={memberBusy === member.id}
                            onClick={() => manageMember(member, 'delete')}
                          >
                            {t.memberDelete}
                          </button>
                        </div>
                      )}
                    </article>
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
                        <strong>{new Date(s.session_date).toLocaleDateString(dateLocale)}</strong>
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
      </main>
    </section>
  )
}

export default Admin
