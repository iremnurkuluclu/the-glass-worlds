import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabaseClient'

const placeholderImage =
  'https://res.cloudinary.com/nbjbftgp/image/upload/v1784720794/snowglobe_laglkr.png'

const OWNER_EMAIL = 'nirem587@gmail.com'

const shopText = {
  en: {
    myPanel: 'My Panel',
    menuGuide: '🛠️ How it\u2019s made',
    menuKits: '📦 Snow globe kits',
    menuMakers: '🎨 Maker globes',
    menuFavorites: '❤️ Favorites',
    menuCart: '🛒 Cart & checkout',
    back: 'Back to site',

    guideTitle: 'How our snow globes are made',
    guideDesc: 'The same method we use in every workshop \u2014 a real glass dome, not a jam jar.',
    guideImage: 'https://res.cloudinary.com/nbjbftgp/image/upload/v1784720781/workshop-table_aydwhd.png',
    guideSteps: [
      { icon: '🧰', title: 'Choose your dome & base', desc: 'Every kit starts with a real glass dome and a solid wooden base \u2014 the same ones we use in the studio.' },
      { icon: '🏡', title: 'Place the scene', desc: 'Fix your miniature figures and trees onto the base with waterproof glue, and let them set.' },
      { icon: '💧', title: 'Fill the dome', desc: 'Fill the glass dome with our crystal-clear snow fluid, a pinch of glitter and fine snow flakes.' },
      { icon: '🔒', title: 'Seal it shut', desc: 'Seal the dome onto the base, flip it over gently \u2014 and your little world comes to life.' },
    ],

    kitsTitle: 'Snow globe kits',
    kitsDesc: 'Everything you need arrives in one box.',
    inside: 'Inside the box',
    addToCart: 'Add to cart',

    makersTitle: 'Made by our makers',
    makersDesc: 'Real globes, made by real hands at our workshop.',
    sellTitle: 'Sell your own globe',
    sellName: 'Title',
    sellMaker: 'Made by (their name)',
    sellNote: 'A sweet little note about it',
    sellPrice: 'Price (£)',
    sellImage: 'Photo URL (optional)',
    sellSubmit: 'List it for sale',
    sellSuccess: 'Your globe is now listed!',
    yourListing: 'Yours',
    remove: 'Remove',
    by: 'by',
    viewMore: 'View',

    favoritesTitle: 'Your favorites',
    favoritesEmpty: 'Tap the heart on anything you love \u2014 it\u2019ll show up here.',

    cartTitle: 'Your cart',
    cartEmpty: 'Your cart is empty.',
    total: 'Total',
    checkout: 'Checkout',

    checkoutTitle: 'Delivery & payment',
    checkoutNote: 'A preview checkout \u2014 no real payment is taken.',
    firstName: 'First name',
    lastName: 'Last name',
    address: 'Address',
    city: 'City',
    phone: 'Phone',
    cardNumber: 'Card number',
    cardName: 'Name on card',
    expiry: 'MM/YY',
    cvc: 'CVC',
    payButton: 'Complete payment',
    orderSuccess: 'Payment complete!',
    orderSuccessDesc: 'Your little world is on its way.',
    closeModal: 'Close',
  },
  tr: {
    myPanel: 'Hesabım',
    menuGuide: '🛠️ Kar Küresi Nasıl Yapılır?',
    menuKits: '📦 Kar Küresi Kitleri',
    menuMakers: '🎨 Üretici Kar Küreleri',
    menuFavorites: '❤️ Favorilerim',
    menuCart: '🛒 Sepetim ve Ödeme',
    back: 'Siteye dön',

    guideTitle: 'Kar kürelerimiz nasıl yapılıyor',
    guideDesc: 'Her atölyede kullandığımız gerçek yöntem \u2014 reçel kavanozu değil, gerçek bir cam kubbe.',
    guideImage: 'https://res.cloudinary.com/nbjbftgp/image/upload/v1784720781/workshop-table_aydwhd.png',
    guideSteps: [
      { icon: '🧰', title: 'Kubbe ve tabanı seç', desc: 'Her kit stüdyomuzda kullandığımızla aynı, gerçek bir cam kubbe ve sağlam ahşap bir tabanla başlıyor.' },
      { icon: '🏡', title: 'Sahneni yerleştir', desc: 'Minyatür figürlerini ve ağaçlarını su geçirmez yapıştırıcıyla tabana sabitle, kurumasını bekle.' },
      { icon: '💧', title: 'Kubbeyi doldur', desc: 'Cam kubbeyi berrak kar sıvımızla, bir tutam gliterle ve ince kar taneleriyle doldur.' },
      { icon: '🔒', title: 'Mühürle', desc: 'Kubbeyi tabana sıkıca mühürle, nazikçe ters çevir \u2014 küçük dünyan hayat buluyor.' },
    ],

    kitsTitle: 'Kar Küresi Kitleri',
    kitsDesc: 'İhtiyacın olan her şey tek kutuda.',
    inside: 'Kutunun içinde',
    addToCart: 'Sepete Ekle',

    makersTitle: 'Üreticilerimizin elinden',
    makersDesc: 'Atölyemizde gerçek insanların elleriyle yapılmış gerçek küreler.',
    sellTitle: 'Kendi küreni sat',
    sellName: 'Başlık',
    sellMaker: 'Kimin yaptığı (adı)',
    sellNote: 'Tatlı ve samimi bir not',
    sellPrice: 'Fiyat (£)',
    sellImage: 'Fotoğraf URL (opsiyonel)',
    sellSubmit: 'Satışa çıkar',
    sellSuccess: 'Küren artık satışta!',
    yourListing: 'Senin',
    remove: 'Kaldır',
    by: 'satıcı',
    viewMore: 'Gör',

    favoritesTitle: 'Favorilerim',
    favoritesEmpty: 'Beğendiğin her şeyin kalbine dokun \u2014 burada toplanır.',

    cartTitle: 'Sepetim',
    cartEmpty: 'Sepetin boş.',
    total: 'Toplam',
    checkout: 'Satın Al',

    checkoutTitle: 'Teslimat ve Ödeme',
    checkoutNote: 'Bu bir önizleme ödeme ekranı \u2014 gerçek bir ödeme alınmaz.',
    firstName: 'Ad',
    lastName: 'Soyad',
    address: 'Adres',
    city: 'Şehir',
    phone: 'Telefon',
    cardNumber: 'Kart Numarası',
    cardName: 'Kart Üzerindeki İsim',
    expiry: 'AA/YY',
    cvc: 'CVC',
    payButton: 'Ödemeyi Tamamla',
    orderSuccess: 'Ödeme tamamlandı!',
    orderSuccessDesc: 'Küçük dünyan yola çıktı.',
    closeModal: 'Kapat',
  },
}

const menuItems = [
  ['guide', 'menuGuide'],
  ['kits', 'menuKits'],
  ['makers', 'menuMakers'],
  ['favorites', 'menuFavorites'],
  ['cart', 'menuCart'],
]

function Snowfall() {
  const flakes = useMemo(
    () =>
      Array.from({ length: 40 }).map(() => ({
        left: Math.random() * 100,
        size: 3 + Math.random() * 5,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 10,
        drift: Math.random() * 40 - 20,
      })),
    []
  )

  return (
    <div className="shop-snowfall" aria-hidden="true">
      {flakes.map((flake, index) => (
        <motion.span
          key={index}
          className="shop-snowflake"
          style={{ left: `${flake.left}%`, width: flake.size, height: flake.size }}
          animate={{ y: ['-5vh', '105vh'], x: [0, flake.drift] }}
          transition={{ duration: flake.duration, delay: flake.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

function CardPreview({ card, flipped, t }) {
  const digits = card.number.replace(/\D/g, '').padEnd(16, '•')
  const grouped = digits.match(/.{1,4}/g)?.join(' ') || digits

  return (
    <div className="card-preview-wrap">
      <motion.div
        className="card-preview"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="card-face card-front">
          <div className="card-chip">▢▢</div>
          <div className="card-number">{grouped}</div>
          <div className="card-bottom">
            <div>
              <span>{t.cardName}</span>
              <strong>{card.name || '••••••••'}</strong>
            </div>
            <div>
              <span>{t.expiry}</span>
              <strong>{card.expiry || '••/••'}</strong>
            </div>
          </div>
        </div>
        <div className="card-face card-back">
          <div className="card-stripe" />
          <div className="card-cvc">{card.cvc || '•••'}</div>
        </div>
      </motion.div>
    </div>
  )
}

function Shop({ session, language, onLanguageChange, onBack }) {
  const t = shopText[language] || shopText.en

  const [activeSection, setActiveSection] = useState('guide')
  const [menuOpen, setMenuOpen] = useState(false)

  const [kits, setKits] = useState([])
  const [makerGlobes, setMakerGlobes] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [favoriteItems, setFavoriteItems] = useState([])

  const [selectedMaker, setSelectedMaker] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const [listingForm, setListingForm] = useState({ title: '', maker_name: '', note: '', price: '', image_url: '' })
  const [listingStatus, setListingStatus] = useState('')

  const [addressForm, setAddressForm] = useState({ firstName: '', lastName: '', address: '', city: '', phone: '' })
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [cardFlipped, setCardFlipped] = useState(false)

  const loadShopData = async () => {
    const [kitsRes, globesRes, cartRes, favRes] = await Promise.all([
      supabase.from('kits').select('*').order('id'),
      supabase.from('secondhand_globes').select('*').order('created_at', { ascending: false }),
      supabase.from('cart_items').select('*').eq('user_id', session.user.id),
      supabase.from('favorites').select('*').eq('user_id', session.user.id),
    ])

    if (kitsRes.data) setKits(kitsRes.data)
    if (globesRes.data) setMakerGlobes(globesRes.data)
    if (cartRes.data) setCartItems(cartRes.data)
    if (favRes.data) setFavoriteItems(favRes.data)
  }

  useEffect(() => {
    loadShopData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const findItem = (itemType, itemId) => {
    const list = itemType === 'kit' ? kits : makerGlobes
    return list.find((entry) => entry.id === itemId)
  }

  const isFavorite = (itemType, itemId) =>
    favoriteItems.some((fav) => fav.item_type === itemType && fav.item_id === itemId)

  const addToCart = async (itemType, itemId) => {
    const existing = cartItems.find((c) => c.item_type === itemType && c.item_id === itemId)

    if (existing) {
      const { data } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
        .select()
      if (data) setCartItems((current) => current.map((c) => (c.id === existing.id ? data[0] : c)))
      return
    }

    const { data } = await supabase
      .from('cart_items')
      .insert({ user_id: session.user.id, item_type: itemType, item_id: itemId, quantity: 1 })
      .select()

    if (data) setCartItems((current) => [...current, data[0]])
  }

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return
    const { data } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId).select()
    if (data) setCartItems((current) => current.map((c) => (c.id === cartItemId ? data[0] : c)))
  }

  const removeFromCart = async (cartItemId) => {
    await supabase.from('cart_items').delete().eq('id', cartItemId)
    setCartItems((current) => current.filter((c) => c.id !== cartItemId))
  }

  const toggleFavorite = async (itemType, itemId) => {
    const existing = favoriteItems.find((f) => f.item_type === itemType && f.item_id === itemId)

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id)
      setFavoriteItems((current) => current.filter((f) => f.id !== existing.id))
      return
    }

    const { data } = await supabase
      .from('favorites')
      .insert({ user_id: session.user.id, item_type: itemType, item_id: itemId })
      .select()

    if (data) setFavoriteItems((current) => [...current, data[0]])
  }

  const handleListingChange = (event) => {
    const { name, value } = event.target
    setListingForm((current) => ({ ...current, [name]: value }))
  }

  const submitListing = async (event) => {
    event.preventDefault()
    setListingStatus('...')

    const { data, error } = await supabase
      .from('secondhand_globes')
      .insert({
        seller_id: session.user.id,
        title: listingForm.title,
        maker_name: listingForm.maker_name,
        note: listingForm.note,
        price: Number(listingForm.price),
        image_url: listingForm.image_url,
      })
      .select()

    if (error) {
      setListingStatus('error')
      return
    }

    setMakerGlobes((current) => [data[0], ...current])
    setListingForm({ title: '', maker_name: '', note: '', price: '', image_url: '' })
    setListingStatus(t.sellSuccess)
  }

  const removeListing = async (id) => {
    await supabase.from('secondhand_globes').delete().eq('id', id)
    setMakerGlobes((current) => current.filter((item) => item.id !== id))
  }

  const cartTotal = cartItems.reduce((sum, cartItem) => {
    const item = findItem(cartItem.item_type, cartItem.item_id)
    return sum + (item ? item.price * cartItem.quantity : 0)
  }, 0)

  const handleCardChange = (event) => {
    const { name, value } = event.target
    setCardForm((current) => ({ ...current, [name]: value }))
    if (name === 'cvc') setCardFlipped(true)
  }

  const handleAddressChange = (event) => {
    const { name, value } = event.target
    setAddressForm((current) => ({ ...current, [name]: value }))
  }

  const handlePlaceOrder = async (event) => {
    event.preventDefault()
    for (const item of cartItems) {
      await supabase.from('cart_items').delete().eq('id', item.id)
    }
    setCartItems([])
    setOrderSuccess(true)
  }

  const closeCheckout = () => {
    setCheckoutOpen(false)
    setOrderSuccess(false)
    setCardFlipped(false)
  }

  return (
    <div className="shop-app">
      <Snowfall />

      <div className="shop-shell">
        <header className="shop-topbar">
          <div className="shop-brand">
            <span className="shop-brand-dot" />
            The Glass Worlds
          </div>

          <div className="shop-topbar-actions">
            {onLanguageChange && (
              <motion.button
                className="shop-lang-switch"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onLanguageChange(language === 'en' ? 'tr' : 'en')}
              >
                {language === 'en' ? 'TR' : 'EN'}
              </motion.button>
            )}

            <motion.button
              className="shop-lang"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onBack}
            >
              {t.back}
            </motion.button>

            <div className="shop-menu-wrap">
              <motion.button
                className="shop-panel-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.myPanel}
              </motion.button>

              <motion.button
                className="shop-dots"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen((open) => !open)}
              >
                •••
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    className="shop-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                  >
                    {menuItems.map(([key, labelKey]) => (
                      <button
                        key={key}
                        className={activeSection === key ? 'active' : ''}
                        onClick={() => {
                          setActiveSection(key)
                          setMenuOpen(false)
                        }}
                      >
                        {t[labelKey]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeSection === 'guide' && (
            <motion.section
              key="guide"
              className="shop-view"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="shop-view-heading">
                <h2>{t.guideTitle}</h2>
                <p>{t.guideDesc}</p>
              </div>

              <motion.img
                className="guide-hero-photo"
                src={t.guideImage}
                alt="Workshop table with glass dome and wooden base"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />

              <motion.div
                className="guide-grid"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
              >
                {t.guideSteps.map((step, index) => (
                  <motion.div
                    className="glass-card guide-card"
                    key={step.title}
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <span className="guide-icon">{step.icon}</span>
                    <span className="guide-step-no">0{index + 1}</span>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {activeSection === 'kits' && (
            <motion.section
              key="kits"
              className="shop-view"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="shop-view-heading">
                <h2>{t.kitsTitle}</h2>
                <p>{t.kitsDesc}</p>
              </div>

              <motion.div
                className="kit-grid"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {kits.map((kit) => (
                  <motion.div
                    className="glass-card kit-card"
                    key={kit.id}
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="kit-box">
                      <img src={kit.image_url || placeholderImage} alt={kit.name} />
                      <motion.button
                        className={`heart-btn ${isFavorite('kit', kit.id) ? 'active' : ''}`}
                        whileTap={{ scale: [1, 1.4, 1] }}
                        onClick={() => toggleFavorite('kit', kit.id)}
                      >
                        ❤
                      </motion.button>
                    </div>

                    <h3>{kit.name}</h3>
                    <p className="kit-desc">{kit.description}</p>

                    {kit.materials && (
                      <div className="kit-materials">
                        <span>{t.inside}</span>
                        <p>{kit.materials}</p>
                      </div>
                    )}

                    <div className="kit-footer">
                      <strong>£{kit.price}</strong>
                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => addToCart('kit', kit.id)}
                      >
                        {t.addToCart}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {activeSection === 'makers' && (
            <motion.section
              key="makers"
              className="shop-view"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="shop-view-heading">
                <h2>{t.makersTitle}</h2>
                <p>{t.makersDesc}</p>
              </div>

              {session.user.email === OWNER_EMAIL && (
              <motion.form
                className="glass-card sell-form"
                onSubmit={submitListing}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3>{t.sellTitle}</h3>
                <input name="title" placeholder={t.sellName} value={listingForm.title} onChange={handleListingChange} required />
                <input name="maker_name" placeholder={t.sellMaker} value={listingForm.maker_name} onChange={handleListingChange} required />
                <input name="note" placeholder={t.sellNote} value={listingForm.note} onChange={handleListingChange} />
                <input name="price" type="number" min="0" step="0.01" placeholder={t.sellPrice} value={listingForm.price} onChange={handleListingChange} required />
                <input name="image_url" placeholder={t.sellImage} value={listingForm.image_url} onChange={handleListingChange} />
                <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {t.sellSubmit}
                </motion.button>
                {listingStatus && <p className="shop-status">{listingStatus}</p>}
              </motion.form>
              )}

              <motion.div
                className="kit-grid"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {makerGlobes.map((globe) => (
                  <motion.div
                    className="glass-card kit-card"
                    key={globe.id}
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="kit-box" onClick={() => setSelectedMaker(globe)}>
                      <img src={globe.image_url || placeholderImage} alt={globe.title} />
                      <motion.button
                        className={`heart-btn ${isFavorite('secondhand', globe.id) ? 'active' : ''}`}
                        whileTap={{ scale: [1, 1.4, 1] }}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleFavorite('secondhand', globe.id)
                        }}
                      >
                        ❤
                      </motion.button>
                    </div>

                    <h3>{globe.title}</h3>
                    {globe.maker_name && (
                      <p className="kit-desc">
                        {t.by} {globe.maker_name}
                      </p>
                    )}

                    <div className="kit-footer">
                      <strong>£{globe.price}</strong>
                      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => setSelectedMaker(globe)}>
                        {t.viewMore}
                      </motion.button>
                    </div>

                    {globe.seller_id === session.user.id && (
                      <button type="button" className="remove-link" onClick={() => removeListing(globe.id)}>
                        {t.remove}
                      </button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {activeSection === 'favorites' && (
            <motion.section
              key="favorites"
              className="shop-view"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="shop-view-heading">
                <h2>{t.favoritesTitle}</h2>
              </div>

              {favoriteItems.length === 0 ? (
                <p className="shop-empty">{t.favoritesEmpty}</p>
              ) : (
                <motion.div
                  className="kit-grid"
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                >
                  {favoriteItems.map((fav) => {
                    const item = findItem(fav.item_type, fav.item_id)
                    if (!item) return null
                    return (
                      <motion.div
                        className="glass-card kit-card"
                        key={fav.id}
                        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -6 }}
                      >
                        <div className="kit-box">
                          <img src={item.image_url || placeholderImage} alt={item.name || item.title} />
                          <motion.button
                            className="heart-btn active"
                            whileTap={{ scale: [1, 1.4, 1] }}
                            onClick={() => toggleFavorite(fav.item_type, fav.item_id)}
                          >
                            ❤
                          </motion.button>
                        </div>
                        <h3>{item.name || item.title}</h3>
                        <div className="kit-footer">
                          <strong>£{item.price}</strong>
                          <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => addToCart(fav.item_type, fav.item_id)}
                          >
                            {t.addToCart}
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </motion.section>
          )}

          {activeSection === 'cart' && (
            <motion.section
              key="cart"
              className="shop-view"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="shop-view-heading">
                <h2>{t.cartTitle}</h2>
              </div>

              {cartItems.length === 0 ? (
                <p className="shop-empty">{t.cartEmpty}</p>
              ) : (
                <>
                  <motion.div
                    className="cart-list"
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                  >
                    {cartItems.map((cartItem) => {
                      const item = findItem(cartItem.item_type, cartItem.item_id)
                      if (!item) return null
                      return (
                        <motion.div
                          className="glass-card cart-row"
                          key={cartItem.id}
                          variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                        >
                          <img src={item.image_url || placeholderImage} alt={item.name || item.title} />
                          <div className="cart-row-info">
                            <strong>{item.name || item.title}</strong>
                            <span>£{item.price}</span>
                          </div>
                          <div className="cart-qty">
                            <button onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}>−</button>
                            <span>{cartItem.quantity}</span>
                            <button onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}>+</button>
                          </div>
                          <button className="remove-link" onClick={() => removeFromCart(cartItem.id)}>
                            {t.remove}
                          </button>
                        </motion.div>
                      )
                    })}
                  </motion.div>

                  <div className="glass-card cart-summary">
                    <span>{t.total}</span>
                    <strong>£{cartTotal.toFixed(2)}</strong>
                  </div>

                  <motion.button
                    className="checkout-cta"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setCheckoutOpen(true)}
                  >
                    {t.checkout}
                  </motion.button>
                </>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedMaker && (
          <motion.div
            className="shop-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMaker(null)}
          >
            <motion.div
              className="glass-card maker-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedMaker(null)}>
                ✕
              </button>
              <img className="maker-photo" src={selectedMaker.image_url || placeholderImage} alt={selectedMaker.title} />
              <h3>{selectedMaker.title}</h3>
              <div className="maker-by">
                <span className="maker-avatar-fallback">
                  {(selectedMaker.maker_name || '?')[0]?.toUpperCase()}
                </span>
                <span>{selectedMaker.maker_name || t.by}</span>
              </div>
              {selectedMaker.note && <p className="maker-note">“{selectedMaker.note}”</p>}
              <div className="kit-footer">
                <strong>£{selectedMaker.price}</strong>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    addToCart('secondhand', selectedMaker.id)
                    setSelectedMaker(null)
                  }}
                >
                  {t.addToCart}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            className="shop-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card checkout-modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            >
              {!orderSuccess ? (
                <>
                  <button className="modal-close" onClick={closeCheckout}>
                    ✕
                  </button>
                  <h3>{t.checkoutTitle}</h3>
                  <p className="shop-status" style={{ marginBottom: 14 }}>{t.checkoutNote}</p>

                  <CardPreview card={cardForm} flipped={cardFlipped} t={t} />

                  <form className="checkout-form" onSubmit={handlePlaceOrder}>
                    <div className="checkout-row">
                      <input name="firstName" placeholder={t.firstName} value={addressForm.firstName} onChange={handleAddressChange} required />
                      <input name="lastName" placeholder={t.lastName} value={addressForm.lastName} onChange={handleAddressChange} required />
                    </div>
                    <input name="address" placeholder={t.address} value={addressForm.address} onChange={handleAddressChange} required />
                    <div className="checkout-row">
                      <input name="city" placeholder={t.city} value={addressForm.city} onChange={handleAddressChange} required />
                      <input name="phone" placeholder={t.phone} value={addressForm.phone} onChange={handleAddressChange} required />
                    </div>

                    <input
                      name="number"
                      placeholder={t.cardNumber}
                      value={cardForm.number}
                      maxLength={19}
                      onFocus={() => setCardFlipped(false)}
                      onChange={handleCardChange}
                      required
                    />
                    <input name="name" placeholder={t.cardName} value={cardForm.name} onFocus={() => setCardFlipped(false)} onChange={handleCardChange} required />
                    <div className="checkout-row">
                      <input name="expiry" placeholder={t.expiry} value={cardForm.expiry} onFocus={() => setCardFlipped(false)} onChange={handleCardChange} required />
                      <input name="cvc" placeholder={t.cvc} value={cardForm.cvc} maxLength={3} onFocus={() => setCardFlipped(true)} onChange={handleCardChange} required />
                    </div>

                    <div className="cart-summary" style={{ margin: '4px 0' }}>
                      <span>{t.total}</span>
                      <strong>£{cartTotal.toFixed(2)}</strong>
                    </div>

                    <motion.button type="submit" className="pay-button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      {t.payButton}
                    </motion.button>
                  </form>
                </>
              ) : (
                <motion.div
                  className="order-success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                >
                  <motion.span
                    className="success-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 14 }}
                  >
                    ✓
                  </motion.span>
                  <h3>{t.orderSuccess}</h3>
                  <p>{t.orderSuccessDesc}</p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeCheckout}>
                    {t.closeModal}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Shop
