import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './supabaseClient'

const placeholderImages = [
  'https://res.cloudinary.com/nbjbftgp/image/upload/v1784720794/snowglobe_laglkr.png',
]

const shopText = {
  en: {
    tabGuide: 'How it\u2019s made',
    tabKits: 'Buy a kit',
    tabMarket: 'Secondhand globes',
    tabCart: 'Cart',
    tabFavorites: 'Favorites',
    back: 'Back to site',
    guideTitle: 'Make your own snow globe at home',
    guideSteps: [
      ['Choose your scene', 'Pick a small waterproof figure or miniature and a clean, empty glass jar with a tight lid.'],
      ['Glue the figure down', 'Use waterproof glue to fix your figure to the inside of the jar lid. Let it dry completely.'],
      ['Add glitter and glycerin', 'Fill the jar with distilled water, a spoon of glycerin (slows the fall of the snow) and a pinch of fine glitter.'],
      ['Seal and flip', 'Screw the lid on tightly, seal the edge with glue, then carefully flip the jar over. Give it a shake and watch your world come alive.'],
    ],
    kitsTitle: 'Order a kit, skip the shopping',
    kitsDesc: 'Everything you need arrives in one box \u2014 dome, base, figures, glitter and snow fluid.',
    addToCart: 'Add to cart',
    addedToCart: 'Added',
    materials: 'What\u2019s inside',
    marketTitle: 'Globes made by our community',
    marketDesc: 'Once-loved globes from people who came to a workshop and want to pass theirs on.',
    sellTitle: 'Sell your own globe',
    sellName: 'Title',
    sellNote: 'A short note about it',
    sellPrice: 'Price (\u00a3)',
    sellImage: 'Image URL (optional)',
    sellSubmit: 'List it for sale',
    sellSuccess: 'Your globe is now listed.',
    yourListing: 'Your listing',
    remove: 'Remove',
    cartTitle: 'Your cart',
    cartEmpty: 'Your cart is empty.',
    quantity: 'Qty',
    checkoutButton: 'Proceed to checkout',
    total: 'Total',
    favoritesTitle: 'Your favorites',
    favoritesEmpty: 'Nothing saved yet \u2014 tap the heart on anything you like.',
    checkoutTitle: 'Confirm your order',
    checkoutDesc: 'This is a preview checkout \u2014 no real payment is taken.',
    fullName: 'Full name',
    address: 'Delivery address',
    city: 'City',
    postal: 'Postal code',
    paymentMethod: 'Payment method',
    payCard: 'Credit card',
    payCash: 'Cash on delivery',
    placeOrder: 'Place order',
    orderSuccess: 'Thank you! Your order has been placed.',
    backToCart: 'Back to cart',
    seller: 'Seller',
  },
  tr: {
    tabGuide: 'Nasıl yapılır',
    tabKits: 'Kit satın al',
    tabMarket: 'İkinci el küreler',
    tabCart: 'Sepet',
    tabFavorites: 'Favoriler',
    back: 'Siteye dön',
    guideTitle: 'Evde kendi kar küreni yap',
    guideSteps: [
      ['Sahneni seç', 'Küçük, su geçirmez bir figür ya da minyatür ve sıkıca kapanan temiz, boş bir cam kavanoz seç.'],
      ['Figürü yapıştır', 'Su geçirmez yapıştırıcıyla figürünü kavanozun kapağının iç tarafına sabitle. Tamamen kurumasını bekle.'],
      ['Gliter ve gliserin ekle', 'Kavanozu saf suyla doldur, bir kaşık gliserin (karın düşüşünü yavaşlatır) ve bir tutam ince gliter ekle.'],
      ['Kapat ve çevir', 'Kapağı sıkıca kapat, kenarını yapıştırıcıyla mühürle, sonra kavanozu dikkatlice ters çevir. Salla ve dünyanın canlanmasını izle.'],
    ],
    kitsTitle: 'Kit sipariş et, alışverişle uğraşma',
    kitsDesc: 'İhtiyacın olan her şey tek kutuda geliyor \u2014 kubbe, taban, figürler, gliter ve kar sıvısı.',
    addToCart: 'Sepete ekle',
    addedToCart: 'Eklendi',
    materials: 'İçinde neler var',
    marketTitle: 'Topluluğumuzun yaptığı küreler',
    marketDesc: 'Atölyeye gelip kendi küresini yapan ve onu bir başkasına devretmek isteyenlerin küreleri.',
    sellTitle: 'Kendi küreni sat',
    sellName: 'Başlık',
    sellNote: 'Kısa bir not',
    sellPrice: 'Fiyat (\u00a3)',
    sellImage: 'Görsel URL (opsiyonel)',
    sellSubmit: 'Satışa çıkar',
    sellSuccess: 'Küren artık satışta.',
    yourListing: 'İlanın',
    remove: 'Kaldır',
    cartTitle: 'Sepetin',
    cartEmpty: 'Sepetin boş.',
    quantity: 'Adet',
    checkoutButton: 'Sepeti onayla',
    total: 'Toplam',
    favoritesTitle: 'Favorilerin',
    favoritesEmpty: 'Henüz bir şey kaydetmedin \u2014 beğendiğin şeylerin kalbine dokun.',
    checkoutTitle: 'Siparişini onayla',
    checkoutDesc: 'Bu bir önizleme ödeme ekranı \u2014 gerçek bir ödeme alınmaz.',
    fullName: 'Ad Soyad',
    address: 'Teslimat adresi',
    city: 'Şehir',
    postal: 'Posta kodu',
    paymentMethod: 'Ödeme yöntemi',
    payCard: 'Kredi kartı',
    payCash: 'Kapıda ödeme',
    placeOrder: 'Siparişi tamamla',
    orderSuccess: 'Teşekkürler! Siparişin alındı.',
    backToCart: 'Sepete dön',
    seller: 'Satıcı',
  },
}

function Shop({ session, language, onBack }) {
  const s = shopText[language] || shopText.en

  const [view, setView] = useState('guide')
  const [kits, setKits] = useState([])
  const [secondhand, setSecondhand] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [favoriteItems, setFavoriteItems] = useState([])
  const [status, setStatus] = useState('')

  const [listingForm, setListingForm] = useState({ title: '', note: '', price: '', image_url: '' })
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    address: '',
    city: '',
    postal: '',
    paymentMethod: 'card',
  })
  const [orderPlaced, setOrderPlaced] = useState(false)

  const loadShopData = async () => {
    const [kitsRes, secondhandRes, cartRes, favRes] = await Promise.all([
      supabase.from('kits').select('*').order('id'),
      supabase.from('secondhand_globes').select('*').order('created_at', { ascending: false }),
      supabase.from('cart_items').select('*').eq('user_id', session.user.id),
      supabase.from('favorites').select('*').eq('user_id', session.user.id),
    ])

    if (kitsRes.data) setKits(kitsRes.data)
    if (secondhandRes.data) setSecondhand(secondhandRes.data)
    if (cartRes.data) setCartItems(cartRes.data)
    if (favRes.data) setFavoriteItems(favRes.data)
  }

  useEffect(() => {
    loadShopData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const findItem = (itemType, itemId) => {
    const list = itemType === 'kit' ? kits : secondhand
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
    const { data } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
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
    setStatus('...')

    const { data, error } = await supabase
      .from('secondhand_globes')
      .insert({
        seller_id: session.user.id,
        title: listingForm.title,
        note: listingForm.note,
        price: Number(listingForm.price),
        image_url: listingForm.image_url,
      })
      .select()

    if (error) {
      setStatus('error')
      return
    }

    setSecondhand((current) => [data[0], ...current])
    setListingForm({ title: '', note: '', price: '', image_url: '' })
    setStatus(s.sellSuccess)
  }

  const removeListing = async (id) => {
    await supabase.from('secondhand_globes').delete().eq('id', id)
    setSecondhand((current) => current.filter((item) => item.id !== id))
  }

  const handleCheckoutChange = (event) => {
    const { name, value } = event.target
    setCheckoutForm((current) => ({ ...current, [name]: value }))
  }

  const handlePlaceOrder = async (event) => {
    event.preventDefault()
    for (const item of cartItems) {
      await supabase.from('cart_items').delete().eq('id', item.id)
    }
    setCartItems([])
    setOrderPlaced(true)
  }

  const cartTotal = cartItems.reduce((sum, cartItem) => {
    const item = findItem(cartItem.item_type, cartItem.item_id)
    return sum + (item ? item.price * cartItem.quantity : 0)
  }, 0)

  const tabs = [
    ['guide', s.tabGuide],
    ['kits', s.tabKits],
    ['market', s.tabMarket],
    ['cart', `${s.tabCart}${cartItems.length ? ` (${cartItems.length})` : ''}`],
    ['favorites', `${s.tabFavorites}${favoriteItems.length ? ` (${favoriteItems.length})` : ''}`],
  ]

  return (
    <section className="shop-section">
      <div className="shop-card">
        <div className="shop-header">
          <div>
            <span>The Glass Worlds</span>
            <h2>{s.tabGuide === 'Nasıl yapılır' ? 'Mağaza' : 'Shop'}</h2>
          </div>
          <motion.button
            className="panel-back"
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
          >
            {s.back}
          </motion.button>
        </div>

        <div className="shop-tabs">
          {tabs.map(([key, label]) => (
            <motion.button
              key={key}
              type="button"
              className={`shop-tab ${view === key ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setView(key)
                setOrderPlaced(false)
              }}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {view === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="shop-panel"
            >
              <h3>{s.guideTitle}</h3>
              <motion.div
                className="guide-steps"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
              >
                {s.guideSteps.map((step, index) => (
                  <motion.div
                    className="guide-step"
                    key={step[0]}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <span>{index + 1}</span>
                    <div>
                      <h4>{step[0]}</h4>
                      <p>{step[1]}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {view === 'kits' && (
            <motion.div
              key="kits"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="shop-panel"
            >
              <h3>{s.kitsTitle}</h3>
              <p className="shop-desc">{s.kitsDesc}</p>

              <motion.div
                className="product-grid"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {kits.map((kit) => (
                  <motion.div
                    className="product-card"
                    key={kit.id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="product-image">
                      <img src={kit.image_url || placeholderImages[0]} alt={kit.name} />
                      <motion.button
                        type="button"
                        className={`fav-heart ${isFavorite('kit', kit.id) ? 'active' : ''}`}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleFavorite('kit', kit.id)}
                      >
                        ♥
                      </motion.button>
                    </div>
                    <h4>{kit.name}</h4>
                    <p className="product-desc">{kit.description}</p>
                    {kit.materials && (
                      <p className="product-materials">
                        <strong>{s.materials}:</strong> {kit.materials}
                      </p>
                    )}
                    <div className="product-footer">
                      <span className="product-price">£{kit.price}</span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => addToCart('kit', kit.id)}
                      >
                        {s.addToCart}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {view === 'market' && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="shop-panel"
            >
              <h3>{s.marketTitle}</h3>
              <p className="shop-desc">{s.marketDesc}</p>

              <motion.form
                className="sell-form"
                onSubmit={submitListing}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h4>{s.sellTitle}</h4>
                <input
                  type="text"
                  name="title"
                  placeholder={s.sellName}
                  value={listingForm.title}
                  onChange={handleListingChange}
                  required
                />
                <input
                  type="text"
                  name="note"
                  placeholder={s.sellNote}
                  value={listingForm.note}
                  onChange={handleListingChange}
                />
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  placeholder={s.sellPrice}
                  value={listingForm.price}
                  onChange={handleListingChange}
                  required
                />
                <input
                  type="text"
                  name="image_url"
                  placeholder={s.sellImage}
                  value={listingForm.image_url}
                  onChange={handleListingChange}
                />
                <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {s.sellSubmit}
                </motion.button>
                {status && <p className="shop-status">{status}</p>}
              </motion.form>

              <motion.div
                className="product-grid"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {secondhand.map((item) => (
                  <motion.div
                    className="product-card"
                    key={item.id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="product-image">
                      <img src={item.image_url || placeholderImages[0]} alt={item.title} />
                      <motion.button
                        type="button"
                        className={`fav-heart ${isFavorite('secondhand', item.id) ? 'active' : ''}`}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleFavorite('secondhand', item.id)}
                      >
                        ♥
                      </motion.button>
                    </div>
                    <h4>{item.title}</h4>
                    {item.note && <p className="product-desc">{item.note}</p>}
                    <div className="product-footer">
                      <span className="product-price">£{item.price}</span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => addToCart('secondhand', item.id)}
                      >
                        {s.addToCart}
                      </motion.button>
                    </div>
                    {item.seller_id === session.user.id && (
                      <button
                        type="button"
                        className="remove-listing"
                        onClick={() => removeListing(item.id)}
                      >
                        {s.remove}
                      </button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {view === 'cart' && !orderPlaced && (
            <motion.div
              key="cart"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="shop-panel"
            >
              <h3>{s.cartTitle}</h3>

              {cartItems.length === 0 ? (
                <p className="shop-empty">{s.cartEmpty}</p>
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
                          className="cart-row"
                          key={cartItem.id}
                          variants={{ hidden: { opacity: 0, x: 16 }, visible: { opacity: 1, x: 0 } }}
                        >
                          <img src={item.image_url || placeholderImages[0]} alt={item.name || item.title} />
                          <div className="cart-row-info">
                            <strong>{item.name || item.title}</strong>
                            <span>£{item.price}</span>
                          </div>
                          <div className="cart-qty">
                            <button type="button" onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}>
                              −
                            </button>
                            <span>{cartItem.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}>
                              +
                            </button>
                          </div>
                          <button type="button" className="remove-listing" onClick={() => removeFromCart(cartItem.id)}>
                            {s.remove}
                          </button>
                        </motion.div>
                      )
                    })}
                  </motion.div>

                  <div className="cart-summary">
                    <span>{s.total}</span>
                    <strong>£{cartTotal.toFixed(2)}</strong>
                  </div>

                  <motion.button
                    type="button"
                    className="checkout-cta"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setView('checkout')}
                  >
                    {s.checkoutButton}
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {view === 'checkout' && !orderPlaced && (
            <motion.form
              key="checkout"
              className="shop-panel checkout-form"
              onSubmit={handlePlaceOrder}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{s.checkoutTitle}</h3>
              <p className="shop-desc">{s.checkoutDesc}</p>

              <input
                type="text"
                name="fullName"
                placeholder={s.fullName}
                value={checkoutForm.fullName}
                onChange={handleCheckoutChange}
                required
              />
              <input
                type="text"
                name="address"
                placeholder={s.address}
                value={checkoutForm.address}
                onChange={handleCheckoutChange}
                required
              />
              <div className="checkout-row">
                <input
                  type="text"
                  name="city"
                  placeholder={s.city}
                  value={checkoutForm.city}
                  onChange={handleCheckoutChange}
                  required
                />
                <input
                  type="text"
                  name="postal"
                  placeholder={s.postal}
                  value={checkoutForm.postal}
                  onChange={handleCheckoutChange}
                  required
                />
              </div>

              <div className="payment-method">
                <span>{s.paymentMethod}</span>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={checkoutForm.paymentMethod === 'card'}
                    onChange={handleCheckoutChange}
                  />
                  {s.payCard}
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={checkoutForm.paymentMethod === 'cash'}
                    onChange={handleCheckoutChange}
                  />
                  {s.payCash}
                </label>
              </div>

              <div className="cart-summary">
                <span>{s.total}</span>
                <strong>£{cartTotal.toFixed(2)}</strong>
              </div>

              <motion.button type="submit" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                {s.placeOrder}
              </motion.button>

              <button type="button" className="auth-link-button" onClick={() => setView('cart')}>
                {s.backToCart}
              </button>
            </motion.form>
          )}

          {orderPlaced && (view === 'cart' || view === 'checkout') && (
            <motion.div
              key="success"
              className="shop-panel order-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            >
              <span>✓</span>
              <h3>{s.orderSuccess}</h3>
            </motion.div>
          )}

          {view === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="shop-panel"
            >
              <h3>{s.favoritesTitle}</h3>

              {favoriteItems.length === 0 ? (
                <p className="shop-empty">{s.favoritesEmpty}</p>
              ) : (
                <motion.div
                  className="product-grid"
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
                >
                  {favoriteItems.map((fav) => {
                    const item = findItem(fav.item_type, fav.item_id)
                    if (!item) return null
                    return (
                      <motion.div
                        className="product-card"
                        key={fav.id}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -6 }}
                      >
                        <div className="product-image">
                          <img src={item.image_url || placeholderImages[0]} alt={item.name || item.title} />
                          <motion.button
                            type="button"
                            className="fav-heart active"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleFavorite(fav.item_type, fav.item_id)}
                          >
                            ♥
                          </motion.button>
                        </div>
                        <h4>{item.name || item.title}</h4>
                        <div className="product-footer">
                          <span className="product-price">£{item.price}</span>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => addToCart(fav.item_type, fav.item_id)}
                          >
                            {s.addToCart}
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default Shop
