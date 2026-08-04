/* eslint-disable react-hooks/set-state-in-effect */
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
    tabApplications: 'Seller Applications',
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
    tabApplications: 'Satış Başvuruları',
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
  ['applications', 'tabApplications'],
  ['members', 'tabMembers'],
  ['support', 'tabSupport'],
  ['stats', 'tabStats'],
]

function Admin({ language, onBack }) {
  const t = adminText[language] || adminText.en
  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-GB'
  const location = useLocation()
  const navigate = useNavigate()
  const adminViews = tabs.map(([key]) => key)
  const routeView = location.pathname.split('/')[2]
  const view = adminViews.includes(routeView) ? routeView : 'dashboard'
  const setView = (nextView) => navigate(`/admin/${nextView}`)

  const getOrderCode = (order) => {
    if (order.order_code) return order.order_code
    const date = new Date(order.created_at)
    const datePart = Number.isNaN(date.getTime())
      ? 'ORDER'
      : date.toISOString().slice(0, 10).replaceAll('-', '')
    return `TGW-${datePart}-${String(order.id).padStart(4, '0')}`
  }

  const [kits, setKits] = useState([])
  const [messages, setMessages] = useState([])
  const [kitForm, setKitForm] = useState({ name: '', description: '', price: '', image_url: '', materials: '' })
  const [kitStatus, setKitStatus] = useState('')

  const [supportRequests, setSupportRequests] = useState([])
  const [supportActionStatus, setSupportActionStatus] = useState('')
  const [orders, setOrders] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState([])
  const [orderDetailLoading, setOrderDetailLoading] = useState(false)
  const [orderActionStatus, setOrderActionStatus] = useState('')
  const [orderStatusBusy, setOrderStatusBusy] = useState(false)
  const [sellerApplications, setSellerApplications] = useState([])
  const [applicationBusy, setApplicationBusy] = useState('')
const [applicationStatus, setApplicationStatus] = useState('')
  const [members, setMembers] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [memberStatus, setMemberStatus] = useState('')
  const [memberBusy, setMemberBusy] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [memberProfile, setMemberProfile] = useState(null)
  const [memberOrders, setMemberOrders] = useState([])
  const [memberBookings, setMemberBookings] = useState([])
  const [memberDetailLoading, setMemberDetailLoading] = useState(false)
  const [memberDetailStatus, setMemberDetailStatus] = useState('')

  const [newMembersCount, setNewMembersCount] = useState(0)
  const [sessions, setSessions] = useState([])
  const [sessionForm, setSessionForm] = useState({ session_date: '', attendee_count: '', note: '' })
  const [sessionStatus, setSessionStatus] = useState('')
  const [privateWorkshopRequests, setPrivateWorkshopRequests] = useState([])
  const [privateWorkshopStatus, setPrivateWorkshopStatus] = useState('')
  const [privateWorkshopBusy, setPrivateWorkshopBusy] = useState('')
  const [siteVisits, setSiteVisits] = useState([])

  const loadAdminData = async () => {
   const [
  kitsRes,
  messagesRes,
  supportRes,
  ordersRes,
  orderItemsRes,
  sessionsRes,
  sellerApplicationsRes,
  privateWorkshopRes,
  siteVisitsRes,
] = await Promise.all([
      supabase.from('kits').select('*').order('id'),
      supabase.from('messages').select('id, name, email, message, created_at').order('created_at', { ascending: false }),
      supabase.from('support_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase
        .from('order_items')
        .select('*'),
      supabase.from('workshop_sessions').select('*').order('session_date', { ascending: false }),
      supabase
  .from('secondhand_globes')
  .select('*')
  .order('created_at', { ascending: false }),
      supabase
        .from('private_workshop_requests')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('site_visits')
        .select('visitor_key, visited_at')
        .order('visited_at', { ascending: false }),
    ])

    if (kitsRes.data) setKits(kitsRes.data)
    if (messagesRes.data) setMessages(messagesRes.data)
    if (supportRes.data) setSupportRequests(supportRes.data)
    if (ordersRes.data) setOrders(ordersRes.data)
    if (orderItemsRes.data) setOrderItems(orderItemsRes.data)
    if (sessionsRes.data) setSessions(sessionsRes.data)
      if (sellerApplicationsRes.data) {
  setSellerApplications(sellerApplicationsRes.data)
}
    if (privateWorkshopRes.data) setPrivateWorkshopRequests(privateWorkshopRes.data)
    if (siteVisitsRes.data) setSiteVisits(siteVisitsRes.data)

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    setNewMembersCount(count || 0)
  }

  const changePrivateWorkshopField = (id, field, value) => {
    setPrivateWorkshopRequests((current) => current.map((request) => (
      request.id === id ? { ...request, [field]: value } : request
    )))
  }

  const updatePrivateWorkshopRequest = async (request, status) => {
    setPrivateWorkshopBusy(request.id)
    setPrivateWorkshopStatus('')

    const confirmedDate = request.confirmed_date || request.requested_date
    const confirmedTime = request.confirmed_time || request.requested_time
    const { data, error } = await supabase
      .from('private_workshop_requests')
      .update({
        status,
        confirmed_date: status === 'approved' ? confirmedDate : null,
        confirmed_time: status === 'approved' ? confirmedTime : null,
        admin_note: request.admin_note || null,
      })
      .eq('id', request.id)
      .select()
      .single()

    setPrivateWorkshopBusy('')
    if (error) {
      setPrivateWorkshopStatus(language === 'tr' ? 'Talep güncellenemedi.' : 'The request could not be updated.')
      return
    }

    setPrivateWorkshopRequests((current) => current.map((item) => (
      item.id === request.id ? data : item
    )))
    setPrivateWorkshopStatus(language === 'tr' ? 'Özel randevu talebi güncellendi.' : 'Private workshop request updated.')
  }
const updateSellerApplication = async (application, nextStatus) => {
  const actionText =
    nextStatus === 'approved'
      ? language === 'tr'
        ? 'Bu satış başvurusunu onaylamak istiyor musun?'
        : 'Do you want to approve this seller application?'
      : language === 'tr'
        ? 'Bu satış başvurusunu reddetmek istiyor musun?'
        : 'Do you want to reject this seller application?'

  if (!window.confirm(actionText)) return

  setApplicationBusy(application.id)
  setApplicationStatus('')

  const { data, error } = await supabase
    .from('secondhand_globes')
    .update({
      approval_status: nextStatus,
      approved_at:
        nextStatus === 'approved' ? new Date().toISOString() : null,
    })
    .eq('id', application.id)
    .select()
    .single()

  setApplicationBusy('')

  if (error) {
    setApplicationStatus(
      language === 'tr'
        ? `İşlem gerçekleştirilemedi: ${error.message}`
        : `Action failed: ${error.message}`
    )
    return
  }

  setSellerApplications((current) =>
    current.map((item) => (item.id === application.id ? data : item))
  )

  setApplicationStatus(
    nextStatus === 'approved'
      ? language === 'tr'
        ? 'Başvuru onaylandı ve ürün mağazada yayınlandı.'
        : 'The application was approved and published in the shop.'
      : language === 'tr'
        ? 'Başvuru reddedildi.'
        : 'The application was rejected.'
  )
}
  useEffect(() => {
    loadAdminData()
  }, [])

  const totalSalesRevenue = orderItems.reduce(
    (sum, item) => sum + Number(item.line_total || 0),
    0
  )
  const totalAdminEarnings = orderItems.reduce(
    (sum, item) => sum + Number(item.admin_amount || 0),
    0
  )
  const totalSellerEarnings = orderItems.reduce(
    (sum, item) => sum + Number(item.seller_amount || 0),
    0
  )

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

  const openMemberDetails = async (member) => {
    setSelectedMember(member)
    setMemberProfile(null)
    setMemberOrders([])
    setMemberBookings([])
    setMemberDetailStatus('')
    setMemberDetailLoading(true)

    const [profileResult, ordersResult, bookingsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', member.id).maybeSingle(),
      supabase.from('orders').select('*').eq('user_id', member.id).order('created_at', { ascending: false }),
      supabase.from('event_rsvps').select('*').eq('user_id', member.id).order('created_at', { ascending: false }),
    ])

    setMemberDetailLoading(false)
    if (profileResult.error || ordersResult.error || bookingsResult.error) {
      console.error('Member detail could not be loaded:', {
        profile: profileResult.error,
        orders: ordersResult.error,
        bookings: bookingsResult.error,
      })
      setMemberDetailStatus(
        language === 'tr'
          ? 'Üye ayrıntıları yüklenemedi. Admin RLS izinlerini kontrol et.'
          : 'Member details could not be loaded. Check the admin RLS policies.'
      )
      return
    }

    setMemberProfile(profileResult.data || null)
    setMemberOrders(ordersResult.data || [])
    setMemberBookings(bookingsResult.data || [])
  }

  const openOrderDetails = async (order) => {
    setSelectedOrder(order)
    setSelectedOrderItems([])
    setOrderActionStatus('')
    setOrderDetailLoading(true)

    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
      .order('id', { ascending: true })

    setOrderDetailLoading(false)
    if (error) {
      console.error('Order detail could not be loaded:', error)
      setOrderActionStatus(
        language === 'tr' ? 'Sipariş ayrıntısı yüklenemedi.' : 'Order details could not be loaded.'
      )
      return
    }

    setSelectedOrderItems(data || [])
  }

  const updateOrderStatus = async (status) => {
    if (!selectedOrder) return
    setOrderStatusBusy(true)
    setOrderActionStatus('')

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', selectedOrder.id)
      .select()
      .single()

    setOrderStatusBusy(false)
    if (error) {
      console.error('Order status could not be updated:', error)
      setOrderActionStatus(
        language === 'tr' ? 'Sipariş durumu güncellenemedi.' : 'Order status could not be updated.'
      )
      return
    }

    setSelectedOrder(data)
    setOrders((current) => current.map((order) => (order.id === data.id ? data : order)))
    setOrderActionStatus(
      language === 'tr' ? 'Sipariş durumu güncellendi.' : 'Order status updated.'
    )
  }

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
    setSupportActionStatus('')
    const { data, error } = await supabase
      .from('support_requests')
      .update({ status: newStatus })
      .eq('id', request.id)
      .select()

    if (error) {
      console.error('Support request could not be updated:', error)
      setSupportActionStatus(
        language === 'tr' ? 'Destek talebi güncellenemedi.' : 'Support request could not be updated.'
      )
      return
    }

    if (data?.[0]) {
      setSupportRequests((current) => current.map((r) => (r.id === request.id ? data[0] : r)))
      setSupportActionStatus(
        language === 'tr' ? 'Destek talebi güncellendi.' : 'Support request updated.'
      )
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

  const todayKey = now.toISOString().slice(0, 10)
  const monthKey = todayKey.slice(0, 7)
  const visitorsToday = new Set(
    siteVisits
      .filter((visit) => String(visit.visited_at || '').slice(0, 10) === todayKey)
      .map((visit) => visit.visitor_key)
  ).size
  const visitorsThisMonth = new Set(
    siteVisits
      .filter((visit) => String(visit.visited_at || '').slice(0, 7) === monthKey)
      .map((visit) => visit.visitor_key)
  ).size
  const totalVisitors = new Set(siteVisits.map((visit) => visit.visitor_key)).size
  const pendingPrivateWorkshopCount = privateWorkshopRequests.filter(
    (request) => request.status === 'pending'
  ).length

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

      <div className="dashboard-card dashboard-money-card">
        <h3>{language === 'tr' ? 'Gerçekleşen toplam satış' : 'Total sales revenue'}</h3>
        <strong>£{totalSalesRevenue.toFixed(2)}</strong>
      </div>

      <div className="dashboard-card dashboard-money-card">
        <h3>{language === 'tr' ? 'Toplam admin kazancı' : 'Total admin earnings'}</h3>
        <strong>£{totalAdminEarnings.toFixed(2)}</strong>
      </div>

      <div className="dashboard-card dashboard-money-card seller">
        <h3>{language === 'tr' ? 'Satıcılara düşen toplam' : 'Total seller earnings'}</h3>
        <strong>£{totalSellerEarnings.toFixed(2)}</strong>
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
              {supportActionStatus && <p className="panel-status">{supportActionStatus}</p>}
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
                        <strong>
                          {language === 'tr' ? 'Sipariş' : 'Order'} #{getOrderCode(order)}
                        </strong>
                        <span>{order.full_name || order.user_email || (language === 'tr' ? 'Kayıtlı müşteri' : 'Registered customer')}</span>
                        <p className="admin-message">
                          {(order.items || []).map((item) => `${item.name} ×${item.quantity}`).join(', ')}
                        </p>
                        <span>{new Date(order.created_at).toLocaleDateString(dateLocale)}</span>
                      </div>
                      <div className="admin-order-row-actions">
                        <span className="admin-total">
                          {t.total}: £{Number(order.total).toFixed(2)}
                        </span>
                        <button type="button" className="admin-member-toggle" onClick={() => openOrderDetails(order)}>
                          {language === 'tr' ? 'Sipariş ayrıntısı' : 'Order details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedOrder && (
                <div className="admin-detail-overlay" role="presentation" onMouseDown={() => setSelectedOrder(null)}>
                  <section className="admin-detail-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                    <button type="button" className="admin-detail-close" onClick={() => setSelectedOrder(null)} aria-label={language === 'tr' ? 'Kapat' : 'Close'}>×</button>
                    <span className="admin-detail-eyebrow">{language === 'tr' ? 'Sipariş yönetimi' : 'Order management'}</span>
                    <h3>{language === 'tr' ? 'Sipariş' : 'Order'} #{getOrderCode(selectedOrder)}</h3>

                    <div className="admin-detail-summary">
                      <p><strong>{language === 'tr' ? 'Müşteri' : 'Customer'}:</strong> {selectedOrder.full_name || selectedOrder.user_email || selectedOrder.user_id}</p>
                      <p><strong>{language === 'tr' ? 'Adres' : 'Address'}:</strong> {selectedOrder.address || '—'}</p>
                      <p><strong>{language === 'tr' ? 'Tarih' : 'Date'}:</strong> {new Date(selectedOrder.created_at).toLocaleString(dateLocale)}</p>
                      <p><strong>{t.total}:</strong> £{Number(selectedOrder.total || 0).toFixed(2)}</p>
                    </div>

                    <label className="admin-detail-field">
                      <span>{language === 'tr' ? 'Sipariş durumu' : 'Order status'}</span>
                      <select value={selectedOrder.status || 'received'} disabled={orderStatusBusy} onChange={(event) => updateOrderStatus(event.target.value)}>
                        <option value="received">{language === 'tr' ? 'Sipariş alındı' : 'Received'}</option>
                        <option value="preparing">{language === 'tr' ? 'Hazırlanıyor' : 'Preparing'}</option>
                        <option value="shipped">{language === 'tr' ? 'Kargoya verildi' : 'Shipped'}</option>
                        <option value="delivered">{language === 'tr' ? 'Teslim edildi' : 'Delivered'}</option>
                      </select>
                    </label>
                    {orderActionStatus && <p className="panel-status">{orderActionStatus}</p>}

                    <h4>{language === 'tr' ? 'Ürünler' : 'Items'}</h4>
                    {orderDetailLoading ? (
                      <p className="panel-empty">{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
                    ) : selectedOrderItems.length === 0 ? (
                      <div className="admin-detail-items">
                        {(selectedOrder.items || []).map((item, index) => (
                          <div className="admin-detail-item" key={`${item.id || item.name}-${index}`}>
                            <strong>{item.name}</strong>
                            <span>{item.quantity} × £{Number(item.price || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="admin-detail-items">
                        {selectedOrderItems.map((item) => (
                          <div className="admin-detail-item" key={item.id}>
                            <div>
                              <strong>{item.product_title}</strong>
                              <span>{item.product_type} · {item.quantity} × £{Number(item.unit_price || 0).toFixed(2)}</span>
                            </div>
                            <div className="admin-detail-money">
                              <span>{language === 'tr' ? 'Satır toplamı' : 'Line total'}: £{Number(item.line_total || 0).toFixed(2)}</span>
                              <span>{language === 'tr' ? 'Admin' : 'Admin'}: £{Number(item.admin_amount || 0).toFixed(2)}</span>
                              <span>{language === 'tr' ? 'Satıcı' : 'Seller'}: £{Number(item.seller_amount || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </motion.div>
          )}
{view === 'applications' && (
  <motion.div
    key="applications"
    className="admin-applications-view"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.25 }}
  >
    <div className="admin-applications-heading">
      <div>
       
        <h3>
          {language === 'tr'
            ? 'Satış Başvuruları'
            : 'Seller Applications'}
        </h3>
       
      </div>

      <strong>
        {
          sellerApplications.filter(
            (application) =>
              application.approval_status === 'pending'
          ).length
        }
      </strong>
    </div>

    {applicationStatus && (
      <p className="panel-status">{applicationStatus}</p>
    )}

    {sellerApplications.length === 0 ? (
      <p className="panel-empty">
        {language === 'tr'
          ? 'Henüz satış başvurusu bulunmuyor.'
          : 'There are no seller applications yet.'}
      </p>
    ) : (
      <div className="admin-application-list">
        {sellerApplications.map((application) => {
          const applicationPhotos =
            Array.isArray(application.image_urls) &&
            application.image_urls.length > 0
              ? application.image_urls
              : application.image_url
                ? [application.image_url]
                : []

          const productPrice = Number(application.price || 0)
          const commissionRate = Number(
            application.commission_rate || 15
          )
          const companyAmount =
            productPrice * (commissionRate / 100)
          const sellerAmount = productPrice - companyAmount

          const statusText =
            application.approval_status === 'approved'
              ? language === 'tr'
                ? 'Onaylandı'
                : 'Approved'
              : application.approval_status === 'rejected'
                ? language === 'tr'
                  ? 'Reddedildi'
                  : 'Rejected'
                : language === 'tr'
                  ? 'Onay bekliyor'
                  : 'Pending'

          return (
            <article
              className={`admin-application-card status-${
                application.approval_status || 'pending'
              }`}
              key={application.id}
            >
              <div className="admin-application-top">
                <div>
                  <span className="admin-application-eyebrow">
                    {language === 'tr'
                      ? 'ATÖLYE KAR KÜRESİ'
                      : 'WORKSHOP SNOW GLOBE'}
                  </span>

                  <h4>{application.title}</h4>

                  <p>
                    {application.note ||
                      (language === 'tr'
                        ? 'Ürün hikâyesi belirtilmedi.'
                        : 'No product story was provided.')}
                  </p>
                </div>

                <span
                  className={`admin-application-status ${
                    application.approval_status || 'pending'
                  }`}
                >
                  {statusText}
                </span>
              </div>

              {applicationPhotos.length > 0 && (
                <div className="admin-application-photos">
                  {applicationPhotos.map((photo, index) => (
                    <a
                      href={photo}
                      target="_blank"
                      rel="noreferrer"
                      key={`${application.id}-${index}`}
                    >
                      <img
                        src={photo}
                        alt={`${application.title} ${index + 1}`}
                        style={{
                          width: '180px',
                          height: '160px',
                          maxWidth: '180px',
                          display: 'block',
                          objectFit: 'cover',
                          borderRadius: '12px',
                        }}
                      />
                    </a>
                  ))}
                </div>
              )}

              <div className="admin-application-details">
                <div>
                  <span>
                    {language === 'tr' ? 'Satıcı' : 'Seller'}
                  </span>
                  <strong>
                    {application.seller_name ||
                      application.maker_name ||
                      '—'}
                  </strong>
                  <small>{application.seller_email || '—'}</small>
                  <small>{application.phone || '—'}</small>
                </div>

                <div>
                  <span>
                    {language === 'tr'
                      ? 'Ürün bilgileri'
                      : 'Product details'}
                  </span>
                  <strong>
                    {language === 'tr'
                      ? 'Atölyede yapılan kar küresi'
                      : 'Workshop snow globe'}
                  </strong>
                  <small>
                    {application.production_year || '—'} ·{' '}
                    {application.condition || '—'}
                  </small>
                  <small>{application.dimensions || '—'}</small>
                </div>

                <div>
                  <span>
                    {language === 'tr'
                      ? 'Malzeme ve kusurlar'
                      : 'Materials and flaws'}
                  </span>
                  <strong>{application.materials || '—'}</strong>
                  <small>
                    {application.flaws ||
                      (language === 'tr'
                        ? 'Kusur belirtilmedi'
                        : 'No flaws reported')}
                  </small>
                </div>

                <div>
                  <span>
                    {language === 'tr'
                      ? 'Gönderim'
                      : 'Shipping'}
                  </span>
                  <strong>
                    {application.shipping_region || '—'}
                  </strong>
                  <small>
                    {application.weight
                      ? `${application.weight}`
                      : '—'}
                  </small>
                </div>
              </div>

              <div className="admin-application-finance">
                <div>
                  <span>
                    {language === 'tr'
                      ? 'Satış fiyatı'
                      : 'Sale price'}
                  </span>
                  <strong>£{productPrice.toFixed(2)}</strong>
                </div>

                <div>
                  <span>
                    {language === 'tr'
                      ? `Şirket komisyonu (%${commissionRate})`
                      : `Company commission (${commissionRate}%)`}
                  </span>
                  <strong>£{companyAmount.toFixed(2)}</strong>
                </div>

                <div>
                  <span>
                    {language === 'tr'
                      ? 'Satıcı kazancı'
                      : 'Seller earnings'}
                  </span>
                  <strong>£{sellerAmount.toFixed(2)}</strong>
                </div>
              </div>

              <div className="admin-application-actions">
                <button
                  type="button"
                  className="application-reject"
                  disabled={
                    applicationBusy === application.id ||
                    application.approval_status === 'rejected'
                  }
                  onClick={() =>
                    updateSellerApplication(
                      application,
                      'rejected'
                    )
                  }
                >
                  {language === 'tr' ? 'Reddet' : 'Reject'}
                </button>

                <button
                  type="button"
                  className="application-approve"
                  disabled={
                    applicationBusy === application.id ||
                    application.approval_status === 'approved'
                  }
                  onClick={() =>
                    updateSellerApplication(
                      application,
                      'approved'
                    )
                  }
                >
                  {applicationBusy === application.id
                    ? language === 'tr'
                      ? 'İşleniyor...'
                      : 'Processing...'
                    : language === 'tr'
                      ? 'Onayla ve Yayınla'
                      : 'Approve and Publish'}
                </button>
              </div>
            </article>
          )
        })}
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
                        <button type="button" className="admin-member-profile-button" onClick={() => openMemberDetails(member)}>
                          {language === 'tr' ? 'Profili görüntüle' : 'View profile'}
                        </button>
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

              {selectedMember && (
                <div className="admin-detail-overlay" role="presentation" onMouseDown={() => setSelectedMember(null)}>
                  <section className="admin-detail-modal admin-member-detail-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                    <button type="button" className="admin-detail-close" onClick={() => setSelectedMember(null)} aria-label={language === 'tr' ? 'Kapat' : 'Close'}>×</button>
                    <span className="admin-detail-eyebrow">{language === 'tr' ? 'Üye profili' : 'Member profile'}</span>
                    <h3>{selectedMember.full_name || selectedMember.email}</h3>
                    <p>{selectedMember.email}</p>

                    {memberDetailLoading ? (
                      <p className="panel-empty">{language === 'tr' ? 'Üye bilgileri yükleniyor...' : 'Loading member details...'}</p>
                    ) : memberDetailStatus ? (
                      <p className="panel-status">{memberDetailStatus}</p>
                    ) : (
                      <>
                        <div className="admin-detail-summary">
                          <p><strong>{language === 'tr' ? 'Ad soyad' : 'Full name'}:</strong> {memberProfile?.full_name || selectedMember.full_name || '—'}</p>
                          <p><strong>{language === 'tr' ? 'Teslimat adresi' : 'Delivery address'}:</strong> {memberProfile?.address || '—'}</p>
                          <p><strong>{language === 'tr' ? 'Hesap durumu' : 'Account status'}:</strong> {selectedMember.is_disabled ? t.memberDisabled : t.memberActive}</p>
                          <p><strong>{language === 'tr' ? 'Kayıt tarihi' : 'Registration date'}:</strong> {selectedMember.created_at ? new Date(selectedMember.created_at).toLocaleDateString(dateLocale) : '—'}</p>
                        </div>

                        <h4>{language === 'tr' ? 'Sipariş geçmişi' : 'Order history'} ({memberOrders.length})</h4>
                        {memberOrders.length === 0 ? (
                          <p className="panel-empty">{t.noOrders}</p>
                        ) : (
                          <div className="admin-detail-items">
                            {memberOrders.map((order) => (
                              <button
                                type="button"
                                className="admin-detail-item admin-detail-item-button"
                                key={order.id}
                                onClick={() => {
                                  setSelectedMember(null)
                                  openOrderDetails(order)
                                  setView('orders')
                                }}
                              >
                                <strong>#{getOrderCode(order)}</strong>
                                <span>{new Date(order.created_at).toLocaleDateString(dateLocale)} · £{Number(order.total || 0).toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <h4>{language === 'tr' ? 'Atölye kayıtları' : 'Workshop registrations'} ({memberBookings.length})</h4>
                        {memberBookings.length === 0 ? (
                          <p className="panel-empty">{language === 'tr' ? 'Atölye kaydı yok.' : 'No workshop registrations.'}</p>
                        ) : (
                          <div className="admin-detail-items">
                            {memberBookings.map((booking) => (
                              <div className="admin-detail-item" key={booking.id}>
                                <strong>{booking.event_label}</strong>
                                <span>{new Date(booking.created_at).toLocaleDateString(dateLocale)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </section>
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
                  <span>{language === 'tr' ? 'Bugünkü ziyaretçi' : "Today's visitors"}</span>
                  <strong>{visitorsToday}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>{language === 'tr' ? 'Bu ay ziyaretçi' : 'Visitors this month'}</span>
                  <strong>{visitorsThisMonth}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>{language === 'tr' ? 'Toplam ziyaretçi' : 'Total visitors'}</span>
                  <strong>{totalVisitors}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>{t.newMembersTitle}</span>
                  <strong>{newMembersCount}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>{t.totalThisMonth}</span>
                  <strong>{attendanceThisMonth}</strong>
                </div>
                <div className="admin-stat-card">
                  <span>{language === 'tr' ? 'Bekleyen özel randevu' : 'Pending private workshops'}</span>
                  <strong>{pendingPrivateWorkshopCount}</strong>
                </div>
              </div>

              <section className="admin-private-workshops">
                <div className="admin-members-heading">
                  <div>
                    <h3>{language === 'tr' ? 'Özel atölye talepleri' : 'Private workshop requests'}</h3>
                    <p>{language === 'tr' ? 'Tarihi düzenleyip talebi onaylayabilir veya reddedebilirsin.' : 'Set the date, then approve or reject each request.'}</p>
                  </div>
                  <span className="admin-member-count">{privateWorkshopRequests.length}</span>
                </div>

                {privateWorkshopStatus && <p className="panel-status">{privateWorkshopStatus}</p>}

                {privateWorkshopRequests.length === 0 ? (
                  <p className="panel-empty">{language === 'tr' ? 'Henüz özel atölye talebi yok.' : 'No private workshop requests yet.'}</p>
                ) : (
                  <div className="admin-private-workshop-list">
                    {privateWorkshopRequests.map((request) => (
                      <article className={`admin-private-workshop-card status-${request.status || 'pending'}`} key={request.id}>
                        <div className="admin-private-workshop-summary">
                          <div>
                            <strong>{request.full_name}</strong>
                            <p>{request.email}{request.phone ? ` · ${request.phone}` : ''}</p>
                          </div>
                          <span className={`admin-private-workshop-status ${request.status || 'pending'}`}>
                            {request.status === 'approved'
                              ? (language === 'tr' ? 'Onaylandı' : 'Approved')
                              : request.status === 'rejected'
                                ? (language === 'tr' ? 'Reddedildi' : 'Rejected')
                                : (language === 'tr' ? 'Onay bekliyor' : 'Pending')}
                          </span>
                        </div>

                        <div className="admin-private-workshop-info">
                          <span>{language === 'tr' ? 'İstenen tarih' : 'Requested date'}: <strong>{request.requested_date || '—'} {request.requested_time || ''}</strong></span>
                          <span>{language === 'tr' ? 'Kişi sayısı' : 'Guests'}: <strong>{request.guest_count || '—'}</strong></span>
                        </div>

                        {request.message && <p className="admin-message">{request.message}</p>}

                        <div className="admin-private-workshop-fields">
                          <label>
                            <span>{language === 'tr' ? 'Onaylanacak tarih' : 'Confirmed date'}</span>
                            <input
                              type="date"
                              value={request.confirmed_date || request.requested_date || ''}
                              onChange={(event) => changePrivateWorkshopField(request.id, 'confirmed_date', event.target.value)}
                            />
                          </label>
                          <label>
                            <span>{language === 'tr' ? 'Saat' : 'Time'}</span>
                            <input
                              type="time"
                              value={request.confirmed_time || request.requested_time || ''}
                              onChange={(event) => changePrivateWorkshopField(request.id, 'confirmed_time', event.target.value)}
                            />
                          </label>
                          <label className="admin-private-workshop-note">
                            <span>{language === 'tr' ? 'Yönetici notu' : 'Admin note'}</span>
                            <input
                              type="text"
                              value={request.admin_note || ''}
                              placeholder={language === 'tr' ? 'Kullanıcıya gösterilecek not' : 'Note shown to the user'}
                              onChange={(event) => changePrivateWorkshopField(request.id, 'admin_note', event.target.value)}
                            />
                          </label>
                        </div>

                        <div className="admin-private-workshop-actions">
                          <button
                            type="button"
                            className="admin-member-delete"
                            disabled={privateWorkshopBusy === request.id}
                            onClick={() => updatePrivateWorkshopRequest(request, 'rejected')}
                          >
                            {language === 'tr' ? 'Reddet' : 'Reject'}
                          </button>
                          <button
                            type="button"
                            className="admin-member-toggle"
                            disabled={privateWorkshopBusy === request.id}
                            onClick={() => updatePrivateWorkshopRequest(request, 'approved')}
                          >
                            {language === 'tr' ? 'Tarihi onayla' : 'Approve date'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

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