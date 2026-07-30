import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import AnimatedGlobeLogo from './AnimatedGlobeLogo'

const copy = {
  en: {
    eyebrow: 'Account',
    title: 'My studio account',
    back: 'Back to homepage',
    logout: 'Sign out',
    profile: 'Profile details',
    name: 'Full name',
    email: 'Email',
    address: 'Delivery address',
    photo: 'Change photo',
    save: 'Save details',
    visits: 'Workshop registrations',
    visitsEmpty: 'Your workshop registrations will appear here.',
    orders: 'Order history',
    ordersEmpty: 'You have not bought anything yet.',
    orderNumber: 'Order',
    orderTotal: 'Total',
    trackingReceived: 'Order received',
    trackingPreparing: 'Preparing',
    trackingShipped: 'Shipped',
    trackingDelivered: 'Delivered',
    trackingButton: 'View delivery status',
    statusOpen: 'Open',
    statusResolved: 'Resolved',
    support: 'Support',
    help: 'Ask for help',
    return: 'Request a return',
    subject: 'Subject',
    message: 'How can we help?',
    send: 'Send request',
    supportEmpty: 'No support requests yet.',
  },
  tr: {
    eyebrow: 'Hesabım',
    title: 'Atölye hesabım',
    back: 'Ana sayfaya dön',
    logout: 'Çıkış',
    profile: 'Profil bilgileri',
    name: 'Ad soyad',
    email: 'E-posta',
    address: 'Teslimat adresi',
    photo: 'Fotoğrafı değiştir',
    save: 'Bilgileri kaydet',
    visits: 'Etkinlik kayıtlarım',
    visitsEmpty: 'Etkinlik kayıtların burada görünecek.',
    orders: 'Sipariş özetim',
    ordersEmpty: 'Henüz bir alışverişin yok.',
    orderNumber: 'Sipariş',
    orderTotal: 'Toplam',
    trackingReceived: 'Sipariş alındı',
    trackingPreparing: 'Hazırlanıyor',
    trackingShipped: 'Kargoya verildi',
    trackingDelivered: 'Teslim edildi',
    trackingButton: 'Kargo durumunu görüntüle',
    statusOpen: 'Açık',
    statusResolved: 'Çözüldü',
    support: 'Destek',
    help: 'Yardım iste',
    return: 'İade talep et',
    subject: 'Konu',
    message: 'Sana nasıl yardımcı olabiliriz?',
    send: 'Talep gönder',
    supportEmpty: 'Henüz destek talebin yok.',
  },
}

function UserPanel({
  session,
  language,
  profileData,
  profileStatus,
  onProfileChange,
  onProfileSubmit,
  onAvatarUpload,
  orders,
  supportRequests,
  supportForm,
  supportStatus,
  onSupportChange,
  onSupportSubmit,
  onSignOut,
  onBack,
}) {
  const t = copy[language] || copy.en
  const location = useLocation()
  const navigate = useNavigate()
  const panelSections = ['profile', 'visits', 'orders', 'support']
  const routeSection = location.pathname.split('/')[2]
  const activeSection = panelSections.includes(routeSection) ? routeSection : 'profile'
  const [bookings, setBookings] = useState([])
  const [expandedTracking, setExpandedTracking] = useState(null)
  const trackingSteps = [
    ['received', t.trackingReceived],
    ['preparing', t.trackingPreparing],
    ['shipped', t.trackingShipped],
    ['delivered', t.trackingDelivered],
  ]

  const getTrackingIndex = (status) => {
    const aliases = {
      pending: 'received',
      paid: 'received',
      processing: 'preparing',
      dispatched: 'shipped',
      completed: 'delivered',
    }
    const normalized = String(status || 'received').toLowerCase()
    const resolved = aliases[normalized] || normalized
    const index = trackingSteps.findIndex(([key]) => key === resolved)
    return index < 0 ? 0 : index
  }

  useEffect(() => {
    const loadBookings = async () => {
      const { data } = await supabase
        .from('event_rsvps')
        .select('id, event_label, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setBookings(data || [])
    }

    loadBookings()
  }, [session.user.id])

  return (
    <main className="account-page studio-account-page">
      <header className="account-topbar">
        <button type="button" className="account-brand account-brand-button" onClick={onBack} aria-label={t.back}><AnimatedGlobeLogo compact />The Glass Worlds</button>
        <div className="account-header-icons">
          <button type="button" className="active" onClick={() => navigate('/panel/profile')} aria-label={t.profile}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm-7.5 8.5c.45-4.1 3.05-6.25 7.5-6.25s7.05 2.15 7.5 6.25H4.5Z" /></svg>
            <span>{language === 'tr' ? 'Hesabım' : 'My account'}</span>
          </button>
          <button type="button" onClick={() => navigate('/shop/cart')} aria-label={language === 'tr' ? 'Sepetim' : 'My cart'}>
            <svg className="account-cart-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 4h2.2l2.1 9.1a2 2 0 0 0 2 1.55h7.85a2 2 0 0 0 1.95-1.55L20.5 7H6" />
              <circle cx="9.4" cy="19" r="1.35" />
              <circle cx="17.2" cy="19" r="1.35" />
            </svg>
            <span>{language === 'tr' ? 'Sepetim' : 'My cart'}</span>
          </button>
        </div>
      </header>

      <div className="account-shell">
      <aside className="account-rail">
        <span>{t.eyebrow}</span>
        <strong>{profileData.full_name || session.user.email.split('@')[0]}</strong>
        <nav>
          <Link className={activeSection === 'profile' ? 'active' : ''} to="/panel/profile">{t.profile}</Link>
          <Link className={activeSection === 'visits' ? 'active' : ''} to="/panel/visits">{t.visits}</Link>
          <Link className={activeSection === 'orders' ? 'active' : ''} to="/panel/orders">{t.orders}</Link>
          <Link className={activeSection === 'support' ? 'active' : ''} to="/panel/support">{t.support}</Link>
        </nav>
        <button type="button" className="account-logout" onClick={onSignOut}>{t.logout}</button>
      </aside>
      <div className="account-content">
      <section className="account-intro">
        <span>{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{profileData.full_name || session.user.email}</p>
      </section>

      <div className="account-layout">
        {activeSection === 'profile' && <form className="account-card account-profile account-page-card" onSubmit={onProfileSubmit}>
          <div className="account-card-heading"><h2>{t.profile}</h2></div>
          <div className="account-avatar-row">
            <div className="account-avatar">
              {profileData.avatar_url ? <img src={profileData.avatar_url} alt="Profile" /> : <span>{session.user.email[0].toUpperCase()}</span>}
            </div>
            <label className="account-photo-button">
              <span className="account-photo-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M8.3 5.5 9.5 4h5l1.2 1.5H19a2 2 0 0 1 2 2v9.25a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2h3.3ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-1.7a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6Z" />
                </svg>
              </span>
              <span>{t.photo}</span>
              <input type="file" accept="image/*" onChange={onAvatarUpload} hidden />
            </label>
          </div>
          <label className="account-field">
            <span>{t.name}</span>
            <input name="full_name" value={profileData.full_name} onChange={onProfileChange} placeholder={t.name} />
          </label>
          <label className="account-field">
            <span>{t.email}</span>
            <input type="email" value={session.user.email} readOnly aria-readonly="true" />
          </label>
          <label className="account-field">
            <span>{t.address}</span>
            <input name="address" value={profileData.address} onChange={onProfileChange} placeholder={t.address} />
          </label>
          <button type="submit" className="account-primary">{t.save}</button>
          {profileStatus && <p className="account-status">{profileStatus}</p>}
        </form>}

        {activeSection === 'visits' && <section className="account-card account-history account-page-card" id="account-visits">
          <div className="account-card-heading"><h2>{t.visits}</h2><span>{bookings.length}</span></div>
          {bookings.length === 0 ? <p className="account-empty">{t.visitsEmpty}</p> : (
            <ul className="account-list">
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <div><strong>{booking.event_label}</strong><span>{new Date(booking.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-GB')}</span></div>
                  <em>{language === 'tr' ? 'Kayıtlı' : 'Registered'}</em>
                </li>
              ))}
            </ul>
          )}
        </section>}

        {activeSection === 'orders' && <section className="account-card account-orders account-page-card" id="account-orders">
          <div className="account-card-heading"><h2>{t.orders}</h2><span>{orders.length}</span></div>
          {orders.length === 0 ? <p className="account-empty">{t.ordersEmpty}</p> : (
            <ul className="account-list account-order-list">
              {orders.map((order) => (
                <li className="account-order-item" key={order.id}>
                  <div className="account-order-summary">
                    <div>
                      <span>{t.orderNumber} #{String(order.id).slice(-8).toUpperCase()}</span>
                      <strong>{order.created_at ? new Date(order.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-GB') : (language === 'tr' ? 'Yeni sipariş' : 'New order')}</strong>
                    </div>
                    <em>{t.orderTotal}: £{Number(order.total).toFixed(2)}</em>
                  </div>
                  <p className="account-order-products">
                    {(order.items || []).map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                  </p>
                  <button
                    type="button"
                    className="order-tracking-toggle"
                    onClick={() => setExpandedTracking((current) => current === order.id ? null : order.id)}
                    aria-expanded={expandedTracking === order.id}
                  >
                    {t.trackingButton}
                    <span aria-hidden="true">{expandedTracking === order.id ? '−' : '+'}</span>
                  </button>
                  {expandedTracking === order.id && (
                    <div className="order-tracking">
                      {trackingSteps.map(([key, label], index) => {
                        const currentIndex = getTrackingIndex(order.status)
                        const isComplete = index <= currentIndex
                        const isCurrent = index === currentIndex
                        return (
                          <div
                            className={`order-tracking-step${isComplete ? ' complete' : ''}${isCurrent ? ' current' : ''}`}
                            key={key}
                          >
                            <span aria-hidden="true">{isComplete ? '✓' : index + 1}</span>
                            <strong>{label}</strong>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>}

        {activeSection === 'support' && <section className="account-card account-support account-page-card" id="account-support">
          <div className="account-card-heading"><h2>{t.support}</h2></div>
          <form onSubmit={onSupportSubmit}>
            <select name="type" value={supportForm.type} onChange={onSupportChange}>
              <option value="help">{t.help}</option><option value="return">{t.return}</option>
            </select>
            <input name="subject" value={supportForm.subject} onChange={onSupportChange} placeholder={t.subject} required />
            <textarea name="message" value={supportForm.message} onChange={onSupportChange} placeholder={t.message} required />
            <button type="submit" className="account-primary">{t.send}</button>
            {supportStatus && <p className="account-status">{supportStatus}</p>}
          </form>
          {supportRequests.length === 0 ? <p className="account-empty">{t.supportEmpty}</p> : (
            <ul className="account-support-list">{supportRequests.map((request) => <li key={request.id}><span>{request.subject}</span><em>{request.status === 'resolved' ? t.statusResolved : t.statusOpen}</em></li>)}</ul>
          )}
        </section>}
      </div>
      </div>
      </div>
    </main>
  )
}

export default UserPanel
