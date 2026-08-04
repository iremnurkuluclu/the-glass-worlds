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
    privateWorkshops: 'Private workshop requests',
    privateWorkshopsEmpty: 'You have not submitted a private workshop request yet.',
    orders: 'Order history',
    ordersEmpty: 'You have not bought anything yet.',
    applications: 'My seller applications',
applicationsEmpty: 'You have not submitted a snow globe yet.',
applicationPending: 'Pending review',
applicationApproved: 'Approved and published',
applicationRejected: 'Rejected',
sellerEarning: 'Your estimated earnings',
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
    privateWorkshops: 'Özel atölye taleplerim',
    privateWorkshopsEmpty: 'Henüz özel atölye talebin yok.',
    orders: 'Sipariş özetim',
    ordersEmpty: 'Henüz bir alışverişin yok.',
    applications: 'Satış başvurularım',
applicationsEmpty: 'Henüz bir kar küresi satış başvurun yok.',
applicationPending: 'Onay bekliyor',
applicationApproved: 'Onaylandı ve yayınlandı',
applicationRejected: 'Reddedildi',
sellerEarning: 'Tahmini kazancın',
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
 const panelSections = [
  'profile',
  'visits',
  'orders',
  'applications',
  'support',
]
  const routeSection = location.pathname.split('/')[2]
  const activeSection = panelSections.includes(routeSection) ? routeSection : 'profile'

  const getOrderCode = (order) => {
    if (order.order_code) return order.order_code
    const date = new Date(order.created_at)
    const datePart = Number.isNaN(date.getTime())
      ? 'ORDER'
      : date.toISOString().slice(0, 10).replaceAll('-', '')
    return `TGW-${datePart}-${String(order.id).padStart(4, '0')}`
  }
  const [bookings, setBookings] = useState([])
  const [privateWorkshopRequests, setPrivateWorkshopRequests] = useState([])
  const [sellerApplications, setSellerApplications] = useState([])
  const [sellerOrderItems, setSellerOrderItems] = useState([])
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
  const loadPanelData = async () => {
    const [bookingsResult, applicationsResult, salesResult, privateWorkshopResult] = await Promise.all([
      supabase
        .from('event_rsvps')
        .select('id, event_label, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false }),

      supabase
        .from('secondhand_globes')
        .select(
          'id, title, price, image_url, image_urls, approval_status, commission_rate, rejection_reason, created_at'
        )
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false }),

      supabase
        .from('order_items')
        .select('id, product_id, quantity, line_total, admin_amount, seller_amount')
        .eq('seller_id', session.user.id),

      supabase
        .from('private_workshop_requests')
        .select('id, requested_date, requested_time, guest_count, message, status, confirmed_date, confirmed_time, admin_note, created_at')
        .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
        .order('created_at', { ascending: false }),
    ])

    setBookings(bookingsResult.data || [])
    setSellerApplications(applicationsResult.data || [])
    setSellerOrderItems(salesResult.data || [])
    setPrivateWorkshopRequests(privateWorkshopResult.data || [])
  }

  loadPanelData()
}, [session.user.id])
  return (
  <main
  className="account-page studio-account-page"
  style={{
    display: "block",
    width: "100vw",
    maxWidth: "none",
    margin: 0,
  }}
>
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

      <div
  className="account-shell"
  style={{
    display: "grid",
    gridTemplateColumns: "230px minmax(0, 1fr)",
    width: "min(1180px, calc(100% - 40px))",
    maxWidth: "1180px",
    margin: "0 auto",
    gap: "34px",
  }}
>
      <aside className="account-rail">
        <span>{t.eyebrow}</span>
        <strong>{profileData.full_name || session.user.email.split('@')[0]}</strong>
        <nav>
          <Link className={activeSection === 'profile' ? 'active' : ''} to="/panel/profile">{t.profile}</Link>
          <Link className={activeSection === 'visits' ? 'active' : ''} to="/panel/visits">{t.visits}</Link>
          <Link className={activeSection === 'orders' ? 'active' : ''} to="/panel/orders">{t.orders}</Link>
          <Link
  className={activeSection === 'applications' ? 'active' : ''}
  to="/panel/applications"
>
  {t.applications}
</Link>
          <Link className={activeSection === 'support' ? 'active' : ''} to="/panel/support">{t.support}</Link>
        </nav>
        <button
  type="button"
  className="account-logout"
  onClick={onSignOut}
  style={{
    color: "#c44444",
    WebkitTextFillColor: "#c44444",
  }}
>
  {t.logout}
</button>
      </aside>
     <div
  className="account-content"
  style={{
    gridColumn: "2",
    width: "100%",
    minWidth: 0,
  }}
>
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

          <div className="account-private-workshops">
            <div className="account-card-heading account-private-workshops-heading">
              <h2>{t.privateWorkshops}</h2>
              <span>{privateWorkshopRequests.length}</span>
            </div>
            {privateWorkshopRequests.length === 0 ? (
              <p className="account-empty">{t.privateWorkshopsEmpty}</p>
            ) : (
              <div className="account-private-workshop-list">
                {privateWorkshopRequests.map((request) => {
                  const status = request.status || 'pending'
                  const statusLabel = status === 'approved'
                    ? (language === 'tr' ? 'Onaylandı' : 'Approved')
                    : status === 'rejected'
                      ? (language === 'tr' ? 'Reddedildi' : 'Rejected')
                      : (language === 'tr' ? 'Onay bekliyor' : 'Pending')
                  const shownDate = status === 'approved' ? (request.confirmed_date || request.requested_date) : request.requested_date
                  const shownTime = status === 'approved' ? (request.confirmed_time || request.requested_time) : request.requested_time

                  return (
                    <article className={`account-private-workshop status-${status}`} key={request.id}>
                      <div className="account-private-workshop-top">
                        <div>
                          <strong>{language === 'tr' ? 'Özel kar küresi atölyesi' : 'Private snow globe workshop'}</strong>
                          <span>{shownDate || '—'} {shownTime || ''}</span>
                        </div>
                        <em className={`account-private-workshop-status ${status}`}>{statusLabel}</em>
                      </div>
                      <p>{language === 'tr' ? 'Kişi sayısı' : 'Guests'}: {request.guest_count || '—'}</p>
                      {request.message && <p>{request.message}</p>}
                      {request.admin_note && (
                        <p className="account-private-workshop-note">
                          <strong>{language === 'tr' ? 'Atölye notu:' : 'Studio note:'}</strong> {request.admin_note}
                        </p>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>}

        {activeSection === 'orders' && <section className="account-card account-orders account-page-card" id="account-orders">
          <div className="account-card-heading"><h2>{t.orders}</h2><span>{orders.length}</span></div>
          {orders.length === 0 ? <p className="account-empty">{t.ordersEmpty}</p> : (
            <ul className="account-list account-order-list">
              {orders.map((order) => (
                <li className="account-order-item" key={order.id}>
                  <div className="account-order-summary">
                    <div>
                      <span>{t.orderNumber} #{getOrderCode(order)}</span>
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

{activeSection === 'applications' && (
  <section
    className="account-card account-applications account-page-card"
    id="account-applications"
  >
    <div className="account-card-heading">
      <h2>{t.applications}</h2>
      <span>{sellerApplications.length}</span>
    </div>

    {sellerApplications.length === 0 ? (
      <div className="seller-application-empty">
        <p className="account-empty">{t.applicationsEmpty}</p>

        <button
          type="button"
          onClick={() => navigate('/sell')}
        >
          {language === 'tr'
            ? 'Kar Küreni Sat'
            : 'Sell Your Snow Globe'}
        </button>
      </div>
    ) : (
      <div className="seller-application-account-list">
        {sellerApplications.map((application) => {
          const status =
            application.approval_status || 'pending'

          const statusLabel =
            status === 'approved'
              ? t.applicationApproved
              : status === 'rejected'
                ? t.applicationRejected
                : t.applicationPending

          const price = Number(application.price || 0)
          const commissionRate = Number(
            application.commission_rate || 15
          )
          const estimatedEarning =
            price * ((100 - commissionRate) / 100)

          const applicationSales = sellerOrderItems.filter(
            (item) => String(item.product_id) === String(application.id)
          )
          const soldQuantity = applicationSales.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
          )
          const totalSales = applicationSales.reduce(
            (sum, item) => sum + Number(item.line_total || 0),
            0
          )
          const totalCommission = applicationSales.reduce(
            (sum, item) => sum + Number(item.admin_amount || 0),
            0
          )
          const actualEarning = applicationSales.reduce(
            (sum, item) => sum + Number(item.seller_amount || 0),
            0
          )

          const applicationImage =
            Array.isArray(application.image_urls) &&
            application.image_urls.length > 0
              ? application.image_urls[0]
              : application.image_url

          return (
            <article
              className={`seller-account-card status-${status}`}
              key={application.id}
            >
              <div className="seller-account-image">
                {applicationImage ? (
                  <img
                    src={applicationImage}
                    alt={application.title}
                  />
                ) : (
                  <span aria-hidden="true">◌</span>
                )}
              </div>

              <div className="seller-account-content">
                <div className="seller-account-title-row">
                  <div>
                    <small>
                      {language === 'tr'
                        ? 'ATÖLYE KAR KÜRESİ'
                        : 'WORKSHOP SNOW GLOBE'}
                    </small>

                    <h3>{application.title}</h3>
                  </div>

                  <span className={`seller-account-status ${status}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="seller-account-finance">
                  <div>
                    <span>
                      {language === 'tr'
                        ? 'Satış fiyatı'
                        : 'Sale price'}
                    </span>
                    <strong>£{price.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>{t.sellerEarning}</span>
                    <strong>
                      £{estimatedEarning.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {language === 'tr'
                        ? 'Başvuru tarihi'
                        : 'Application date'}
                    </span>
                    <strong>
                      {application.created_at
                        ? new Date(
                            application.created_at
                          ).toLocaleDateString(
                            language === 'tr'
                              ? 'tr-TR'
                              : 'en-GB'
                          )
                        : '—'}
                    </strong>
                  </div>
                </div>

                <div
                  className="seller-account-finance seller-account-sales-summary"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}
                >
                  <div>
                    <span>{language === 'tr' ? 'Satılan adet' : 'Units sold'}</span>
                    <strong>{soldQuantity}</strong>
                  </div>

                  <div>
                    <span>{language === 'tr' ? 'Toplam satış' : 'Total sales'}</span>
                    <strong>£{totalSales.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>{language === 'tr' ? 'Kesilen komisyon' : 'Commission'}</span>
                    <strong>£{totalCommission.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>{language === 'tr' ? 'Gerçek kazancım' : 'Actual earnings'}</span>
                    <strong>£{actualEarning.toFixed(2)}</strong>
                  </div>
                </div>

                {status === 'pending' && (
                  <p className="seller-account-message">
                    {language === 'tr'
                      ? 'Başvurun inceleniyor. Sonuç burada güncellenecek.'
                      : 'Your application is being reviewed. Its status will be updated here.'}
                  </p>
                )}

                {status === 'approved' && (
                  <button
                    type="button"
                    className="seller-account-shop-button"
                    onClick={() => navigate('/shop/makers')}
                  >
                    {language === 'tr'
                      ? 'Mağazada Gör'
                      : 'View in Shop'}
                    <span>→</span>
                  </button>
                )}

                {status === 'rejected' && (
                  <div className="seller-account-rejection">
                    <strong>
                      {language === 'tr'
                        ? 'Başvuru sonucu'
                        : 'Application result'}
                    </strong>

                    <p>
                      {application.rejection_reason ||
                        (language === 'tr'
                          ? 'Başvurun mağazada yayınlanmak için uygun bulunmadı.'
                          : 'Your application was not approved for publication.')}
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate('/sell')}
                    >
                      {language === 'tr'
                        ? 'Yeni Başvuru Oluştur'
                        : 'Create a New Application'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    )}
  </section>
)}
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