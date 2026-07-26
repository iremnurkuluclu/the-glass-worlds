
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Shop from './Shop.jsx'
import './App.css'
const snowglobe =
  'https://res.cloudinary.com/nbjbftgp/image/upload/v1784720794/snowglobe_laglkr.png'

const workshopTable =
  'https://res.cloudinary.com/nbjbftgp/image/upload/v1784720781/workshop-table_aydwhd.png'

const snowglobeVideo =
  'https://res.cloudinary.com/nbjbftgp/video/upload/v1784720748/snowglobe_qmtput.mp4'

const mansionGlobe =
  'https://res.cloudinary.com/nbjbftgp/image/upload/v1784720723/mansion-globe_ad7ubu.png'
function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
const location = useLocation()
const navigate = useNavigate()
const isPanelRoute = location.pathname === '/panel'
const isShopRoute = location.pathname === '/shop'
const [profileData, setProfileData] = useState({ full_name: '', avatar_url: '' })
const [profileStatus, setProfileStatus] = useState('')
const [userMessages, setUserMessages] = useState([])
  const [formStatus, setFormStatus] = useState('')
const [session, setSession] = useState(null)
const [sessionChecked, setSessionChecked] = useState(false)

const [authMode, setAuthMode] = useState('')

const [authData, setAuthData] = useState({
  email: '',
  password: '',
})

const [otpCode, setOtpCode] = useState('')
const [newPassword, setNewPassword] = useState('')

const [authMessage, setAuthMessage] = useState('')
const [authLanguage, setAuthLanguage] = useState('en')

const loadPanelData = async (currentSession) => {
  if (!currentSession) return

  const user = currentSession.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (profile) {
    setProfileData({
      full_name: profile.full_name || '',
      avatar_url: profile.avatar_url || '',
    })
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('name, email, message, created_at')
    .eq('email', user.email)
    .order('created_at', { ascending: false })

  setUserMessages(messages || [])
}
  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    setFormStatus(t.sending)

    const { error } = await supabase.from('messages').insert([
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      },
    ])

    if (error) {
      setFormStatus(t.formError)
      return
    }

    setFormStatus(t.formSuccess)
    setFormData({
      name: '',
      email: '',
      message: '',
    })
  }
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session)
    setSessionChecked(true)
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, newSession) => {
    setSession(newSession)
    setSessionChecked(true)
  })

  return () => subscription.unsubscribe()
}, [])

useEffect(() => {
  if (session) {
    loadPanelData(session)
  } else {
    setProfileData({ full_name: '', avatar_url: '' })
    setUserMessages([])
  }
}, [session])

useEffect(() => {
  if (sessionChecked && (isPanelRoute || isShopRoute) && !session) {
    navigate('/', { replace: true })
  }
}, [sessionChecked, isPanelRoute, isShopRoute, session, navigate])

const handleProfileInputChange = (event) => {
  const { name, value } = event.target

  setProfileData((currentData) => ({
    ...currentData,
    [name]: value,
  }))
}

const handleProfileUpdate = async (event) => {
  event.preventDefault()
  if (!session) return

  setProfileStatus(authLanguage === 'tr' ? 'Kaydediliyor...' : 'Saving...')

  const { error } = await supabase.from('profiles').upsert({
    id: session.user.id,
    full_name: profileData.full_name,
    avatar_url: profileData.avatar_url,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Profile update error:', error)
    setProfileStatus(
      authLanguage === 'tr' ? 'Bir hata oluştu, tekrar deneyin.' : 'Something went wrong. Please try again.'
    )
    return
  }

  setProfileStatus(authLanguage === 'tr' ? 'Profil güncellendi.' : 'Profile updated.')
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files && event.target.files[0]
  if (!file || !session) return

  setProfileStatus(authLanguage === 'tr' ? 'Fotoğraf yükleniyor...' : 'Uploading photo...')

  const fileExt = file.name.split('.').pop()
  const filePath = `${session.user.id}/avatar.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Avatar upload error:', uploadError)
    setProfileStatus(
      authLanguage === 'tr' ? 'Fotoğraf yüklenemedi. Tekrar deneyin.' : 'Could not upload photo. Please try again.'
    )
    return
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`

  setProfileData((currentData) => ({
    ...currentData,
    avatar_url: publicUrl,
  }))

  const { error: dbError } = await supabase.from('profiles').upsert({
    id: session.user.id,
    full_name: profileData.full_name,
    avatar_url: publicUrl,
    updated_at: new Date().toISOString(),
  })

  if (dbError) {
    console.error('Profile save error:', dbError)
    setProfileStatus(
      authLanguage === 'tr' ? 'Fotoğraf yüklendi ama kaydedilemedi.' : 'Photo uploaded but could not be saved.'
    )
    return
  }

  setProfileStatus(authLanguage === 'tr' ? 'Fotoğraf güncellendi.' : 'Photo updated.')
}

const handleAuthInputChange = (event) => {
  const { name, value } = event.target

  setAuthData((currentData) => ({
    ...currentData,
    [name]: value,
  }))
}

const handleSignUp = async (event) => {
  event.preventDefault()
 setAuthMessage(authLanguage === 'tr' ? 'Hesap oluşturuluyor...' : 'Creating your account...')

  const { error } = await supabase.auth.signUp({
    email: authData.email,
    password: authData.password,
  })

  if (error) {
    setAuthMessage(
      authLanguage === 'tr'
        ? 'Hesap oluşturulamadı. Bilgilerini kontrol et.'
        : 'Could not create your account. Please check your details.'
    )
    return
  }

  setAuthMessage(
    authLanguage === 'tr'
      ? 'E-postana 6 haneli bir kod gönderdik.'
      : "We've sent a 6-digit code to your email."
  )
  setOtpCode('')
  setAuthMode('verify')
}

const handleVerifySignup = async (event) => {
  event.preventDefault()
  setAuthMessage(authLanguage === 'tr' ? 'Doğrulanıyor...' : 'Verifying...')

  const { error } = await supabase.auth.verifyOtp({
    email: authData.email,
    token: otpCode,
    type: 'signup',
  })

  if (error) {
    setAuthMessage(
      authLanguage === 'tr' ? 'Kod hatalı ya da süresi dolmuş.' : 'That code is wrong or has expired.'
    )
    return
  }

  setAuthMessage('')
  setOtpCode('')
  setAuthMode('')
}

const handleForgotPassword = async (event) => {
  event.preventDefault()
  setAuthMessage(authLanguage === 'tr' ? 'Kod gönderiliyor...' : 'Sending code...')

  const { error } = await supabase.auth.resetPasswordForEmail(authData.email)

  if (error) {
    setAuthMessage(
      authLanguage === 'tr' ? 'Kod gönderilemedi. E-postanı kontrol et.' : 'Could not send the code. Check your email.'
    )
    return
  }

  setAuthMessage(
    authLanguage === 'tr'
      ? 'E-postana 6 haneli bir kod gönderdik.'
      : "We've sent a 6-digit code to your email."
  )
  setOtpCode('')
  setNewPassword('')
  setAuthMode('reset')
}

const handleResetPassword = async (event) => {
  event.preventDefault()
  setAuthMessage(authLanguage === 'tr' ? 'Şifre güncelleniyor...' : 'Updating password...')

  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: authData.email,
    token: otpCode,
    type: 'recovery',
  })

  if (verifyError) {
    setAuthMessage(
      authLanguage === 'tr' ? 'Kod hatalı ya da süresi dolmuş.' : 'That code is wrong or has expired.'
    )
    return
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

  if (updateError) {
    setAuthMessage(
      authLanguage === 'tr' ? 'Şifre güncellenemedi. Tekrar dene.' : 'Could not update the password. Try again.'
    )
    return
  }

  setAuthMessage(authLanguage === 'tr' ? 'Şifren güncellendi.' : 'Your password has been updated.')
  setOtpCode('')
  setNewPassword('')
  setAuthMode('')
}

const handleSignIn = async (event) => {
  event.preventDefault()
 setAuthMessage(authLanguage === 'tr' ? 'Giriş yapılıyor...' : 'Logging in...')

  const { error } = await supabase.auth.signInWithPassword({
    email: authData.email,
    password: authData.password,
  })

  if (error) {
    setAuthMessage(
      authLanguage === 'tr'
        ? 'Giriş yapılamadı. E-posta ya da şifre hatalı olabilir.'
        : 'Could not log in. Email or password may be wrong.'
    )
    return
  }

  setAuthMessage('')
  setAuthMode('')
}

const handleSignOut = async () => {
  await supabase.auth.signOut()
  setAuthMessage('')
  setAuthMode('')
}
const authText = {
  en: {
    login: 'Log in',
    signup: 'Sign up',
    logout: 'log out',
    welcome: 'Welcome',
    member: 'Member access',
    email: 'Email',
    password: 'Password',
    switch: 'TR',
    myPanel: 'My panel',
    panelTitle: 'Your panel',
    profileSection: 'Profile',
    fullName: 'Full name',
    avatarUrl: 'Avatar URL',
    changePhoto: 'Change photo',
    save: 'Save changes',
    messagesSection: 'Your messages',
    noMessages: "You haven't sent a message yet.",
    back: 'Back to site',

    heroTag: 'Snow Globe Atelier',
    heroTagline: 'A little world of your own',
    heroEst: 'Est. 2026',
    heroTitle: 'Welcome to your magical little world that will always stay the same.',
    heroDesc: 'Step into our cozy studio for a guided masterclass in building a magical, one-of-a-kind snow globe.',
    bookSeatLine1: 'Book',
    bookSeatLine2: 'a seat',
    nextClass: 'Next class',
    nextClassTime: 'Saturday - 11:00 AM',

    processLabel: 'Our process',
    processTitleLine1: 'From tiny pieces',
    processTitleLine2: 'to',
    processTitleEm: 'pure magic.',
    processDesc: 'No experience needed. We guide you through every detail while leaving plenty of room for your imagination.',
    processSteps: [
      ['Step 01', 'Choose Your Scene', 'Select miniature trees, tiny figures, woodland characters, and a story that feels entirely yours.', 'brown'],
      ['Step 02', 'Set the Magic', 'Arrange each detail, secure your scene, then choose from our custom glitters and soft snowflakes.', 'gold'],
      ['Step 03', 'Seal & Take Home', 'Fill your globe with our crystal-clear fluid, seal the glass dome, and carry your miniature world home.', 'green'],
    ],

    galleryTitle: 'Make your own',
    galleryTitleEm: 'world',
    galleryTag: 'Guest creations · Winter 2026',
    galleryNoteLine1: 'Small worlds.',
    galleryNoteEm: 'Big wonder.',

    afternoonLabel: 'Your afternoon with us',
    includedLine1: "Everything's",
    includedEm: 'included.',
    includedList: [
      'All premium materials and a glass dome',
      'A warm drink of your choice',
      'Seasonal homemade snacks',
      'Two hours of guided studio time',
    ],
    detailsFooter: 'London, United Kingdom · Ages 12+ · Small groups of 10',
    upcomingDates: 'Upcoming dates',
    dates: [
      ['7 February', '11:00 AM · 3 seats left'],
      ['8 December', '6:30 PM · 3 seats left'],
      ['26 September', '11:00 AM · 4 seats left'],
    ],
    pricePerGuest: '£85 per guest · All materials included',

    testimonialQuote: "I made a tiny version of my mum's childhood home. When the snow started falling,",
    testimonialQuoteEm: 'we both cried.',
    testimonialAuthor: 'Clara M. · A Christmas gift',

    privateEvents: 'Private events',
    ctaTitle: "Bring your favorite people. We'll bring the",
    ctaTitleEm: 'magic.',
    ctaDesc: 'Birthdays, team gatherings, and cozy celebrations for groups of 6–20.',
    planWorkshop: 'Plan a private workshop →',

    sendNote: 'Send us a note',
    contactTitle: 'Plan your own',
    contactTitleEm: 'glass world.',
    contactDesc: 'Tell us who you are, when you would like to visit, or what kind of snow globe you dream of making.',
    yourName: 'Your name',
    yourEmail: 'Your email',
    yourMessage: 'Your message',
    sendMessage: 'Send message',
    sending: 'Sending...',
    formError: 'Something went wrong. Please try again.',
    formSuccess: 'Your message has been saved.',

    footerTagline: 'Tiny worlds, made slowly and with wonder.',
    studio: 'Studio',
    studioAddress1: '18 Willow Street',
    studioAddress2: 'London, United Kingdom',
    contactLabel: 'Contact',
    navProcess: 'The process',
    navGallery: 'Gallery',
    navDetails: 'Workshop details',

    forgotPassword: 'Forgot password?',
    verifyTitle: 'Check your email',
    verifyDesc: "Enter the 6-digit code we sent to {email}.",
    otpPlaceholder: '6-digit code',
    verifyButton: 'Verify',
    resetTitle: 'Reset your password',
    resetDesc: 'Enter the code we sent to {email} and choose a new password.',
    newPasswordPlaceholder: 'New password',
    sendCode: 'Send code',
    resetButton: 'Update password',
    backToLogin: 'Back to login',
  },
  tr: {
     login: 'Giriş Yap',
     signup: 'Kayıt Ol',
    logout: 'Çıkış',
    welcome: 'Hoş geldin',
    member: 'Üye girişi',
    email: 'E-posta',
    password: 'Şifre',
    switch: 'EN',
    myPanel: 'Panelim',
    panelTitle: 'Panelin',
    profileSection: 'Profil',
    fullName: 'Ad Soyad',
    avatarUrl: 'Avatar URL',
    changePhoto: 'Fotoğrafı değiştir',
    save: 'Değişiklikleri kaydet',
    messagesSection: 'Mesajların',
    noMessages: 'Henüz mesaj göndermedin.',
    back: 'Siteye dön',

    heroTag: 'Kar Küresi Atölyesi',
    heroTagline: 'Kendine ait küçük bir dünya',
    heroEst: '2026\'dan beri',
    heroTitle: 'Sonsuza dek aynı kalacak büyülü küçük dünyana hoş geldin.',
    heroDesc: 'Kendine özel, büyülü bir kar küresi yapmayı öğreneceğin rehberli bir atölye için sıcacık stüdyomuza gel.',
    bookSeatLine1: 'Yer',
    bookSeatLine2: 'ayırt',
    nextClass: 'Sıradaki atölye',
    nextClassTime: 'Cumartesi - 11:00',

    processLabel: 'Sürecimiz',
    processTitleLine1: 'Küçük parçalardan',
    processTitleLine2: '',
    processTitleEm: 'saf büyüye.',
    processDesc: 'Deneyim gerekmiyor. Hayal gücüne bolca yer bırakarak her detayda sana rehberlik ediyoruz.',
    processSteps: [
      ['1. Adım', 'Sahneni Seç', 'Minik ağaçlar, küçük figürler, orman karakterleri ve tamamen sana ait hissettiren bir hikaye seç.', 'brown'],
      ['2. Adım', 'Büyüyü Kur', 'Her detayı yerleştir, sahneni sabitle, sonra özel simlerimizden ve yumuşak kar tanelerinden seç.', 'gold'],
      ['3. Adım', 'Kapat ve Eve Götür', 'Küreni berrak sıvımızla doldur, cam kubbeyi kapat ve minik dünyanı evine götür.', 'green'],
    ],

    galleryTitle: 'Kendi',
    galleryTitleEm: 'dünyanı yarat',
    galleryTag: 'Misafir eserleri · Kış 2026',
    galleryNoteLine1: 'Küçük dünyalar.',
    galleryNoteEm: 'Büyük hayranlık.',

    afternoonLabel: 'Bizimle geçireceğin öğleden sonra',
    includedLine1: 'Her şey',
    includedEm: 'dahil.',
    includedList: [
      'Tüm premium malzemeler ve bir cam kubbe',
      'Seçtiğin sıcak bir içecek',
      'Mevsimlik ev yapımı atıştırmalıklar',
      'İki saatlik rehberli stüdyo zamanı',
    ],
    detailsFooter: 'Londra, Birleşik Krallık · 12 yaş ve üzeri · 10 kişilik küçük gruplar',
    upcomingDates: 'Yaklaşan tarihler',
    dates: [
      ['7 Şubat', '11:00 · 3 yer kaldı'],
      ['8 Aralık', '18:30 · 3 yer kaldı'],
      ['26 Eylül', '11:00 · 4 yer kaldı'],
    ],
    pricePerGuest: 'Kişi başı £85 · Tüm malzemeler dahil',

    testimonialQuote: 'Annemin çocukluk evinin minik bir versiyonunu yaptım. Kar yağmaya başladığında,',
    testimonialQuoteEm: 'ikimiz de ağladık.',
    testimonialAuthor: 'Clara M. · Bir Noel hediyesi',

    privateEvents: 'Özel etkinlikler',
    ctaTitle: 'Sevdiklerini getir, büyüyü biz',
    ctaTitleEm: 'getirelim.',
    ctaDesc: '6-20 kişilik gruplar için doğum günleri, ekip buluşmaları ve sıcacık kutlamalar.',
    planWorkshop: 'Özel atölye planla →',

    sendNote: 'Bize not bırak',
    contactTitle: 'Kendi',
    contactTitleEm: 'cam dünyanı planla.',
    contactDesc: 'Bize kim olduğunu, ne zaman gelmek istediğini ya da nasıl bir kar küresi hayal ettiğini anlat.',
    yourName: 'Adın',
    yourEmail: 'E-postan',
    yourMessage: 'Mesajın',
    sendMessage: 'Mesaj gönder',
    sending: 'Gönderiliyor...',
    formError: 'Bir hata oluştu. Tekrar deneyin.',
    formSuccess: 'Mesajın kaydedildi.',

    footerTagline: 'Küçük dünyalar, yavaşça ve hayranlıkla yapılır.',
    studio: 'Stüdyo',
    studioAddress1: '18 Willow Sokak',
    studioAddress2: 'Londra, Birleşik Krallık',
    contactLabel: 'İletişim',
    navProcess: 'Süreç',
    navGallery: 'Galeri',
    navDetails: 'Atölye detayları',

    forgotPassword: 'Şifremi unuttum?',
    verifyTitle: 'E-postanı kontrol et',
    verifyDesc: '{email} adresine gönderdiğimiz 6 haneli kodu gir.',
    otpPlaceholder: '6 haneli kod',
    verifyButton: 'Doğrula',
    resetTitle: 'Şifreni sıfırla',
    resetDesc: '{email} adresine gönderdiğimiz kodu gir ve yeni bir şifre seç.',
    newPasswordPlaceholder: 'Yeni şifre',
    sendCode: 'Kod gönder',
    resetButton: 'Şifreyi güncelle',
    backToLogin: 'Girişe dön',
  },
}

const t = authText[authLanguage]
  return (
    <main className="page">
      <nav className="navbar">
<div className="brand">
<motion.div
  style={{
    width: '46px',
    height: '50px',
    minWidth: '46px',
    position: 'relative',
    display: 'inline-block',
    marginRight: '10px',
  }}
>  
    <div
      style={{
        width: '40px',
        height: '35px',
        margin: '0 auto',
        borderRadius: '50%',
        border: '2px solid white',
        background: 'linear-gradient(180deg, #dff5ff, #77a5bd)',
        boxShadow: 'inset 0 -7px 10px rgba(5, 28, 54, 0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
<motion.div
  style={{
    position: 'absolute',
    inset: '5px',
    borderRadius: '50%',
  }}
  animate={{ rotate: 360 }}
  transition={{
    repeat: Infinity,
    duration: 2.8,
    ease: 'linear',
  }}
>
  {[
    { top: '2px', left: '8px', size: '8px' },
    { top: '7px', right: '5px', size: '7px' },
    { top: '14px', left: '18px', size: '8px' },
    { bottom: '5px', left: '9px', size: '7px' },
    { bottom: '3px', right: '8px', size: '6px' },
  ].map((flake, index) => (
    <span
      key={index}
      style={{
        position: 'absolute',
        ...flake,
        color: 'white',
        fontSize: flake.size,
        lineHeight: 1,
        fontWeight: 700,
      }}
    >
     {'*'}
    </span>
  ))}
</motion.div>
   

</div>

    <div
      style={{
        width: '30px',
        height: '8px',
        margin: '-2px auto 0',
        borderRadius: '4px 4px 8px 8px',
        background: 'linear-gradient(135deg, #a8663d, #4f2a1a)',
      }}
    />
  </motion.div>

  <span>The Glass Worlds</span>
</div>
{!isPanelRoute && !isShopRoute && (
<div className="nav-links">
          <a href="#process">{t.navProcess}</a>
          <a href="#gallery">{t.navGallery}</a>
          <a href="#details">{t.navDetails}</a>
          <motion.button
            className="mini-language-toggle"
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setAuthLanguage(authLanguage === 'en' ? 'tr' : 'en')}
          >
            {t.switch}
          </motion.button>
        </div>
)}

        <div className="auth-actions">
  {session ? (
    <>
      <span className="welcome-text">{t.welcome}, {profileData.full_name || session.user.email.split('@')[0]}</span>
      <motion.button
        className="book-button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleSignOut}
      >
{t.logout}
      </motion.button>
      <motion.button
        className="auth-link panel-toggle"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate(isPanelRoute ? '/' : '/panel')}
      >
{t.myPanel}
      </motion.button>
      <motion.button
        className="auth-link panel-toggle"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate(isShopRoute ? '/' : '/shop')}
      >
        {authLanguage === 'tr' ? 'Mağaza' : 'Shop'}
      </motion.button>
    </>
  ) : (
    <>
      <motion.button
        className="auth-link"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setAuthMode('login')}
      >
      {t.login}
      </motion.button>

      <motion.button
        className="book-button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setAuthMode('register')}
      >
       {t.signup}
      </motion.button>
    </>
  )}
</div>
      </nav>
{authMode && (
  <motion.div
    className="auth-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <AnimatePresence mode="wait">
    {(authMode === 'login' || authMode === 'register') && (
    <motion.form
      key="credentials"
      className="auth-card"
      onSubmit={authMode === 'login' ? handleSignIn : handleSignUp}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <button
        className="auth-close"
        type="button"
        onClick={() => {
          setAuthMode('')
          setAuthMessage('')
        }}
      >
       <span className="auth-close-icon">x</span>
      </button>

      <span>{t.member}</span>
     <h2>{authMode === 'login' ? t.login : t.signup}</h2>

      <input
        type="email"
        name="email"
        placeholder={t.email}
        value={authData.email}
        onChange={handleAuthInputChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder={t.password}
        value={authData.password}
        onChange={handleAuthInputChange}
        required
      />

      <button type="submit">
       {authMode === 'login' ? t.login : t.signup}
      </button>

      {authMode === 'login' && (
        <button
          type="button"
          className="auth-link-button"
          onClick={() => {
            setAuthMessage('')
            setAuthMode('forgot')
          }}
        >
          {t.forgotPassword}
        </button>
      )}

      {authMessage && <p>{authMessage}</p>}
    </motion.form>
    )}

    {authMode === 'verify' && (
      <motion.form
        key="verify"
        className="auth-card"
        onSubmit={handleVerifySignup}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <button
          className="auth-close"
          type="button"
          onClick={() => {
            setAuthMode('')
            setAuthMessage('')
          }}
        >
         <span className="auth-close-icon">x</span>
        </button>

        <span>{t.member}</span>
        <h2>{t.verifyTitle}</h2>
        <p className="auth-hint">{t.verifyDesc.replace('{email}', authData.email)}</p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={t.otpPlaceholder}
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          required
        />

        <button type="submit">{t.verifyButton}</button>

        {authMessage && <p>{authMessage}</p>}
      </motion.form>
    )}

    {authMode === 'forgot' && (
      <motion.form
        key="forgot"
        className="auth-card"
        onSubmit={handleForgotPassword}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <button
          className="auth-close"
          type="button"
          onClick={() => {
            setAuthMode('')
            setAuthMessage('')
          }}
        >
         <span className="auth-close-icon">x</span>
        </button>

        <span>{t.member}</span>
        <h2>{t.resetTitle}</h2>

        <input
          type="email"
          name="email"
          placeholder={t.email}
          value={authData.email}
          onChange={handleAuthInputChange}
          required
        />

        <button type="submit">{t.sendCode}</button>

        <button
          type="button"
          className="auth-link-button"
          onClick={() => {
            setAuthMessage('')
            setAuthMode('login')
          }}
        >
          {t.backToLogin}
        </button>

        {authMessage && <p>{authMessage}</p>}
      </motion.form>
    )}

    {authMode === 'reset' && (
      <motion.form
        key="reset"
        className="auth-card"
        onSubmit={handleResetPassword}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <button
          className="auth-close"
          type="button"
          onClick={() => {
            setAuthMode('')
            setAuthMessage('')
          }}
        >
         <span className="auth-close-icon">x</span>
        </button>

        <span>{t.member}</span>
        <h2>{t.resetTitle}</h2>
        <p className="auth-hint">{t.resetDesc.replace('{email}', authData.email)}</p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder={t.otpPlaceholder}
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder={t.newPasswordPlaceholder}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />

        <button type="submit">{t.resetButton}</button>

        {authMessage && <p>{authMessage}</p>}
      </motion.form>
    )}
    </AnimatePresence>
  </motion.div>
)}

<AnimatePresence mode="wait">
{isShopRoute && session ? (
  <motion.div
    key="shop"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
  >
    <Shop session={session} language={authLanguage} onBack={() => navigate('/')} />
  </motion.div>
) : isPanelRoute && session ? (
  <motion.section
    key="panel"
    className="panel-section"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.35, ease: 'easeOut' }}
  >
    <motion.div
      className="panel-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
    >
      <div className="panel-header">
        <div>
          <span>{t.member}</span>
          <h2>{t.panelTitle}</h2>
        </div>
        <motion.button
          className="panel-back"
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/')}
        >
          {t.back}
        </motion.button>
      </div>

      <motion.div
        className="panel-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
        }}
      >
        <motion.form
          className="panel-profile"
          onSubmit={handleProfileUpdate}
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
        >
          <h3>{t.profileSection}</h3>

          <div className="avatar-upload">
            <div className="avatar-preview">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt="Avatar" />
              ) : (
                <span>{(session.user.email || '?')[0].toUpperCase()}</span>
              )}
            </div>
            <label className="avatar-upload-button">
              {t.changePhoto}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                hidden
              />
            </label>
          </div>

          <input
            type="text"
            name="full_name"
            placeholder={t.fullName}
            value={profileData.full_name}
            onChange={handleProfileInputChange}
          />

          <motion.button
            type="submit"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
          >
            {t.save}
          </motion.button>

          {profileStatus && <p className="panel-status">{profileStatus}</p>}
        </motion.form>

        <motion.div
          className="panel-messages"
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
        >
          <h3>{t.messagesSection}</h3>

          {userMessages.length === 0 ? (
            <p className="panel-empty">{t.noMessages}</p>
          ) : (
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
              }}
            >
              {userMessages.map((msg, index) => (
                <motion.li
                  key={index}
                  variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(170, 59, 255, 0.06)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <strong>{new Date(msg.created_at).toLocaleDateString()}</strong>
                  <p>{msg.message}</p>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.section>
) : (
  <motion.div
    key="landing"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
      <section className="hero">
        <motion.div
          className="hero-copy card"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="hero-meta">
            <div>
              <span>{t.heroTag}</span>
              <em>{t.heroTagline}</em>
            </div>
            <span>{t.heroEst}</span>
          </div>

          <h1>
            {t.heroTitle}
          </h1>

          <div className="hero-bottom">
            <p>
              {t.heroDesc}
            </p>

            <motion.button
              className="round-button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
            >
              {t.bookSeatLine1}<br />{t.bookSeatLine2}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual card"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        >
     <video
  src={snowglobeVideo}
  autoPlay
  muted
  loop
  playsInline
  className="snowglobe-video"
/>
                <div className="class-strip">
            <div>
              <span>{t.nextClass}</span>
              <strong>{t.nextClassTime}</strong>
            </div>
            <motion.button
              className="arrow-button"
              whileHover={{ scale: 1.12, rotate: -8 }}
              whileTap={{ scale: 0.94 }}
            >
              ↘
            </motion.button>
          </div>
        </motion.div>
      </section>
      <section id="process" className="process-section">
        <motion.div
          className="section-heading"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div>
            <span>{t.processLabel}</span>
            <h2>
              {t.processTitleLine1} <br /> {t.processTitleLine2} <em>{t.processTitleEm}</em>
            </h2>
          </div>
          <p>
            {t.processDesc}
          </p>
        </motion.div>

        <div className="process-grid">
          {t.processSteps.map((card, index) => (
            <motion.article
              className={`process-card ${card[3]}`}
              key={card[1]}
            initial={{ opacity: 0, y: 70, scale: 0.94 }}
whileInView={{ opacity: 1, y: 0, scale: 1 }}
viewport={{ once: false, amount: 0.35 }}
transition={{ duration: 0.75, delay: index * 0.18, ease: 'easeOut' }}
              whileHover={{ y: -8 }}
            >
              <div className="step-top">
                <span>{card[0]}</span>
                <strong>*</strong>
              </div>
              <div>
                <h3>{card[1]}</h3>
                <p>{card[2]}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
<section id="gallery" className="gallery-section">
        <motion.div
          className="gallery-heading"
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
whileInView={{ opacity: 1, y: 0, scale: 1 }}
viewport={{ once: false, amount: 0.35 }}
transition={{ duration: 0.75, ease: 'easeOut' }}
        >
          <h2>
            {t.galleryTitle} <em>{t.galleryTitleEm}</em>
          </h2>
          <span>{t.galleryTag}</span>
        </motion.div>

        <div className="gallery-grid">
          <motion.div
            className="gallery-card tall"
            whileHover={{ scale: 1.025 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <img src={snowglobe} alt="Finished snow globe creation" />
          </motion.div>

          <motion.div
            className="gallery-card wide"
            whileHover={{ scale: 1.025 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <img src={mansionGlobe} alt="Mansion snow globe creation" />
          </motion.div>

          <motion.div
            className="gallery-card red-note"
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <span>*</span>
            <h3>
              {t.galleryNoteLine1} <br />
              <em>{t.galleryNoteEm}</em>
            </h3>
          </motion.div>
<motion.div
  className="gallery-card workshop photo-card"
  whileHover={{ scale: 1.025 }}
  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
>
  <img src={workshopTable} alt="Workshop table with a handmade globe" />
</motion.div>        </div>
      </section>
      <section id="details" className="details-section">
        <motion.div
          className="details-card"
         initial={{ opacity: 0, y: 70, scale: 0.96 }}
whileInView={{ opacity: 1, y: 0, scale: 1 }}
viewport={{ once: false, amount: 0.25 }}
transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="included-panel">
            <span>{t.afternoonLabel}</span>
            <h2>
              {t.includedLine1} <br />
              <em>{t.includedEm}</em>
            </h2>

            <ul>
              {t.includedList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p>{t.detailsFooter}</p>
          </div>

          <div className="dates-panel">
            <div className="dates-title">
              <span>{t.upcomingDates}</span>
              <strong>*</strong>
            </div>

            {t.dates.map((date) => (
              <motion.button
                className="date-row"
                key={date[0]}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <strong>{date[0]}</strong>
                  <span>{date[1]}</span>
                </div>
                <em>→</em>
              </motion.button>
            ))}

            <p>{t.pricePerGuest}</p>
          </div>
        </motion.div>
      </section>
      <section className="testimonial-section">
        <motion.div
          className="testimonial"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span>*</span>
          <blockquote>
            “{t.testimonialQuote} <em>{t.testimonialQuoteEm}</em>”
          </blockquote>
          <p>{t.testimonialAuthor}</p>
        </motion.div>
      </section>

      <section className="cta-section">
        <motion.div
          className="cta-card"
         initial={{ opacity: 0, y: 70, scale: 0.94 }}
whileInView={{ opacity: 1, y: 0, scale: 1 }}
viewport={{ once: false, amount: 0.35 }}
transition={{ duration: 0.8, ease: 'easeOut' }}        >
          <div>
            <span>{t.privateEvents}</span>
            <h2>
              {t.ctaTitle} <em>{t.ctaTitleEm}</em>
            </h2>
          </div>
          <div className="cta-side">
            <p>
              {t.ctaDesc}
            </p>
            <motion.button
              className="private-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              {t.planWorkshop}
            </motion.button>
          </div>
        </motion.div>
      </section>
<section className="contact-section" id="contact">
  <motion.div
    className="contact-card"
    initial={{ opacity: 0, y: 70, scale: 0.96 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: false, amount: 0.25 }}
    transition={{ duration: 0.75, ease: 'easeOut' }}
  >
    <div className="contact-copy">
      <span>{t.sendNote}</span>
      <h2>
        {t.contactTitle} <em>{t.contactTitleEm}</em>
      </h2>
      <p>
        {t.contactDesc}
      </p>
    </div>

    <motion.form
      className="contact-form"
      onSubmit={handleFormSubmit}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      <motion.input
        type="text"
        name="name"
        placeholder={t.yourName}
        value={formData.name}
        onChange={handleInputChange}
        required
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      />

      <motion.input
        type="email"
        name="email"
        placeholder={t.yourEmail}
        value={formData.email}
        onChange={handleInputChange}
        required
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      />

      <motion.textarea
        name="message"
        placeholder={t.yourMessage}
        value={formData.message}
        onChange={handleInputChange}
        required
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      />

      <motion.button
        type="submit"
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        {t.sendMessage}
      </motion.button>

      {formStatus && (
        <motion.p
          className="form-status"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {formStatus}
        </motion.p>
      )}
    </motion.form>
  </motion.div>
</section>
      <footer className="footer">
        <div>
          <strong>The Glass Worlds</strong>
          <p>{t.footerTagline}</p>
        </div>

        <div>
          <span>{t.studio}</span>
          <p>
            {t.studioAddress1}<br />
            {t.studioAddress2}
          </p>
        </div>

        <div>
          <span>{t.contactLabel}</span>
          <p>hello@theglassworlds.studio</p>
          <p>Instagram</p>
        </div>
      </footer>
  </motion.div>
)}
</AnimatePresence>
</main>
  )
}
export default App
