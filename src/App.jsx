
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
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
    setFormStatus('Sending...')

    const { error } = await supabase.from('messages').insert([
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
      },
    ])

    if (error) {
      setFormStatus('Something went wrong. Please try again.')
      return
    }

    setFormStatus('Your message has been saved.')
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
  if (sessionChecked && isPanelRoute && !session) {
    navigate('/', { replace: true })
  }
}, [sessionChecked, isPanelRoute, session, navigate])

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
    setAuthMessage('Could not create your account. Please check your details.')
    return
  }

  setAuthMessage('Account created. You can now log in.')
}

const handleSignIn = async (event) => {
  event.preventDefault()
 setAuthMessage(authLanguage === 'tr' ? 'Giriş yapılıyor...' : 'Logging in...')

  const { error } = await supabase.auth.signInWithPassword({
    email: authData.email,
    password: authData.password,
  })

  if (error) {
    setAuthMessage('Could not log in. Email or password may be wrong.')
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
{!isPanelRoute && (
<div className="nav-links">
          <a href="#process">The process</a>
          <a href="#gallery">Gallery</a>
          <a href="#details">Workshop details</a>
        </div>
)}

        <div className="auth-actions">
<button
  className="language-toggle"
  type="button"
  onClick={() => setAuthLanguage(authLanguage === 'en' ? 'tr' : 'en')}
>
  {t.switch}
</button>
  {session ? (
    <>
      <span className="welcome-text">{t.welcome}, {session.user.email}</span>
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
    <motion.form
      className="auth-card"
      onSubmit={authMode === 'login' ? handleSignIn : handleSignUp}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
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

      {authMessage && <p>{authMessage}</p>}
    </motion.form>
  </motion.div>
)}

<AnimatePresence mode="wait">
{isPanelRoute && session ? (
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
              <span>Snow Globe Atelier</span>
              <em>A little world of your own</em>
            </div>
            <span>Est. 2026</span>
          </div>

          <h1>
            Welcome to your magical little world that will always stay the same.
          </h1>

          <div className="hero-bottom">
            <p>
              Step into our cozy studio for a guided masterclass in building a
              magical, one-of-a-kind snow globe.
            </p>

            <motion.button
              className="round-button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
            >
              Book<br />a seat
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
              <span>Next class</span>
              <strong>Saturday - 11:00 AM</strong>
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
            <span>Our process</span>
            <h2>
              From tiny pieces <br /> to <em>pure magic.</em>
            </h2>
          </div>
          <p>
            No experience needed. We guide you through every detail while
            leaving plenty of room for your imagination.
          </p>
        </motion.div>

        <div className="process-grid">
          {[
            ['Step 01', 'Choose Your Scene', 'Select miniature trees, tiny figures, woodland characters, and a story that feels entirely yours.', 'brown'],
            ['Step 02', 'Set the Magic', 'Arrange each detail, secure your scene, then choose from our custom glitters and soft snowflakes.', 'gold'],
            ['Step 03', 'Seal & Take Home', 'Fill your globe with our crystal-clear fluid, seal the glass dome, and carry your miniature world home.', 'green'],
          ].map((card, index) => (
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
            Make your own <em>world</em>
          </h2>
          <span>Guest creations · Winter 2026</span>
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
              Small worlds. <br />
              <em>Big wonder.</em>
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
            <span>Your afternoon with us</span>
            <h2>
              Everything's <br />
              <em>included.</em>
            </h2>

            <ul>
              <li>All premium materials and a glass dome</li>
              <li>A warm drink of your choice</li>
              <li>Seasonal homemade snacks</li>
              <li>Two hours of guided studio time</li>
            </ul>

            <p>London, United Kingdom · Ages 12+ · Small groups of 10</p>
          </div>

          <div className="dates-panel">
            <div className="dates-title">
              <span>Upcoming dates</span>
              <strong>*</strong>
            </div>

            {[
              ['7 February', '11:00 AM · 3 seats left'],
              ['8 December', '6:30 PM · 3 seats left'],
              ['26 September', '11:00 AM · 4 seats left'],
            ].map((date) => (
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

            <p>£85 per guest · All materials included</p>
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
            “I made a tiny version of my mum's childhood home. When the snow
            started falling, <em>we both cried.</em>”
          </blockquote>
          <p>Clara M. · A Christmas gift</p>
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
            <span>Private events</span>
            <h2>
              Bring your favorite people. We'll bring the <em>magic.</em>
            </h2>
          </div>
          <div className="cta-side">
            <p>
              Birthdays, team gatherings, and cozy celebrations for groups of
              6–20.
            </p>
            <motion.button
              className="private-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              Plan a private workshop →
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
      <span>Send us a note</span>
      <h2>
        Plan your own <em>glass world.</em>
      </h2>
      <p>
        Tell us who you are, when you would like to visit, or what kind of snow globe you dream of making.
      </p>
    </div>

    <form className="contact-form" onSubmit={handleFormSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Your name"
        value={formData.name}
        onChange={handleInputChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Your email"
        value={formData.email}
        onChange={handleInputChange}
        required
      />

      <textarea
        name="message"
        placeholder="Your message"
        value={formData.message}
        onChange={handleInputChange}
        required
      />

      <button type="submit">Send message</button>

      {formStatus && <p className="form-status">{formStatus}</p>}
    </form>
  </motion.div>
</section>
      <footer className="footer">
        <div>
          <strong>The Glass Worlds</strong>
          <p>Tiny worlds, made slowly and with wonder.</p>
        </div>

        <div>
          <span>Studio</span>
          <p>
            18 Willow Street<br />
            London, United Kingdom
          </p>
        </div>

        <div>
          <span>Contact</span>
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
