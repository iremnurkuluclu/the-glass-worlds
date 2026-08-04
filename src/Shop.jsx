/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import makingProcessPhoto from './assets/editorial/snow-globe-making-process.png'
import workshopGroupPhoto from './assets/editorial/workshop-group-wide.png'
import studioInteriorPhoto from './assets/editorial/artisan-studio-interior.jpg'
import miniatureScenePhoto from './assets/editorial/miniature-winter-scene.jpg'
import productBallerina from './assets/editorial/product-ballerina.png'
import productFish from './assets/editorial/product-tropical-fish.png'
import productBear from './assets/editorial/product-christmas-bear.png'
import productPrince from './assets/editorial/product-little-prince.png'
import AnimatedGlobeLogo from './AnimatedGlobeLogo'

const placeholderImage =
  'https://res.cloudinary.com/nbjbftgp/image/upload/v1784720794/snowglobe_laglkr.png'


const shopText = {
  en: {
    myPanel: 'My Panel',
    menuWorkshops: 'Workshop booking',
    menuGuide: '🛠️ How it\u2019s made',
    menuKits: '📦 Snow globe kits',
    menuMakers: '🎨 Maker globes',
    menuFavorites: '❤️ Favorites',
    menuCart: '🛒 Cart & checkout',
    reviewsTitle: 'Notes from the workshop table',
    reviewsDesc: 'Honest reflections from people who made a little world with us.',
    reviewName: 'Your name',
    reviewText: 'What did you enjoy most?',
    reviewSubmit: 'Share your experience',
    reviewSuccess: 'Thank you — your note has been shared.',
    sold: 'Sold',
    back: 'Back to homepage',
    bookingTitle: 'Book a snow globe workshop',
    bookingDesc: 'Choose a studio session and make a glass world of your own.',
    bookingDuration: '2-hour guided workshop',
    bookingIncludes: 'Glass dome, materials, hot drink and gift packaging included',
    bookingSeats: 'places left',
    bookingPeople: 'Guests',
    bookingPrice: 'per person',
    bookingButton: 'Reserve your place',
    bookingSuccess: 'Your workshop place has been reserved. You can follow it from My Panel.',

    guideTitle: 'How our snow globes are made',
    guideDesc: 'The same method we use in every workshop \u2014 a real glass dome, not a jam jar.',
    guidePhotoCaption: 'Our workshop begins with a professionally formed glass dome; you build the miniature world inside it.',
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
    addedToCart: 'Added to cart',
    continueShopping: 'Continue shopping',

    makersTitle: 'Made by our makers',
    makersDesc: 'Real globes, made by real hands at our workshop.',
    sellTitle: 'Sell your own globe',
    sellHelp: 'Made a globe at our workshop? Share its story and list it in the maker marketplace.',
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
    madeBy: 'Made by',
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
    orderError: 'The order could not be saved. Please try again.',
    closeModal: 'Close',
  },
  tr: {
    myPanel: 'Hesabım',
    menuWorkshops: 'Atölye Rezervasyonu',
    menuGuide: '🛠️ Kar Küresi Nasıl Yapılır?',
    menuKits: '📦 Kar Küresi Kitleri',
    menuMakers: '🎨 Üretici Kar Küreleri',
    menuFavorites: '❤️ Favorilerim',
    menuCart: '🛒 Sepetim ve Ödeme',
    reviewsTitle: 'Atölye masasından notlar',
    reviewsDesc: 'Bizimle küçük bir dünya kuran katılımcıların gerçek deneyimleri.',
    reviewName: 'Adın',
    reviewText: 'Atölyede en çok neyi sevdin?',
    reviewSubmit: 'Deneyimini paylaş',
    reviewSuccess: 'Teşekkürler — görüşün paylaşıldı.',
    sold: 'Satıldı',
    back: 'Ana sayfaya dön',
    bookingTitle: 'Kar küresi atölyesine yerini ayır',
    bookingDesc: 'Atölye seansını seç ve kendi cam dünyanı bizimle birlikte hazırla.',
    bookingDuration: '2 saatlik rehberli atölye',
    bookingIncludes: 'Cam kubbe, tüm malzemeler, sıcak içecek ve hediye paketi dahil',
    bookingSeats: 'yer kaldı',
    bookingPeople: 'Kişi sayısı',
    bookingPrice: 'kişi başı',
    bookingButton: 'Yerini ayır',
    bookingSuccess: 'Atölye kaydın oluşturuldu. Hesabım bölümünden takip edebilirsin.',

    guideTitle: 'Kar kürelerimiz nasıl yapılıyor',
    guideDesc: 'Her atölyede kullandığımız gerçek yöntem \u2014 reçel kavanozu değil, gerçek bir cam kubbe.',
    guidePhotoCaption: 'Atölyemiz profesyonel olarak şekillendirilmiş cam kubbeyle başlar; içindeki minyatür dünyayı sen kurarsın.',
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
    addedToCart: 'Sepete eklendi',
    continueShopping: 'Alışverişe devam et',

    makersTitle: 'Üreticilerimizin elinden',
    makersDesc: 'Atölyemizde gerçek insanların elleriyle yapılmış gerçek küreler.',
    sellTitle: 'Kendi küreni sat',
    sellHelp: 'Atölyemizde bir küre mi yaptın? Hikâyesini paylaş ve üretici pazarında satışa çıkar.',
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
    madeBy: 'Yapan',
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
    orderError: 'Sipariş kaydedilemedi. Lütfen tekrar dene.',
    closeModal: 'Kapat',
  },
}

const menuItems = [
  ['guide', 'menuGuide'],
  ['workshops', 'menuWorkshops'],
  ['kits', 'menuKits'],
  ['makers', 'menuMakers'],
  ['favorites', 'menuFavorites'],
  ['cart', 'menuCart'],
]



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

function Shop({ session, language, onBack, onOrderComplete }) {
  const t = shopText[language] || shopText.en
  const location = useLocation()
  const navigate = useNavigate()
  const shopSections = ['workshops', 'guide', 'kits', 'makers', 'favorites', 'cart']
  const routeSection = location.pathname.split('/')[2]
  const activeSection = shopSections.includes(routeSection) ? routeSection : 'workshops'

  

  const [kits, setKits] = useState([])
  const [makerGlobes, setMakerGlobes] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [bookingCartItems, setBookingCartItems] = useState([])
  const [makerCartItems, setMakerCartItems] = useState([])
  const [cartNotice, setCartNotice] = useState('')
  const [favoriteItems, setFavoriteItems] = useState([])

  const [selectedMaker, setSelectedMaker] = useState(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
const [checkoutStep, setCheckoutStep] = useState(1)
const [orderSuccess, setOrderSuccess] = useState(false)
const [checkoutError, setCheckoutError] = useState('')
  

  const [addressForm, setAddressForm] = useState({
  firstName: '',
  lastName: '',
  email: session?.user?.email || '',
  phone: '',
  city: '',
  district: '',
  address: '',
  postalCode: '',
})
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const [cardFlipped, setCardFlipped] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ name: '', message: '' })
  const [reviewStatus, setReviewStatus] = useState('')
  const [bookingPeople, setBookingPeople] = useState(1)
  const [bookingStatus, setBookingStatus] = useState('')
  const firstSaturday = new Date()
  firstSaturday.setDate(firstSaturday.getDate() + ((6 - firstSaturday.getDay() + 7) % 7 || 7))
  const workshopSlots = Array.from({ length: 4 }, (_, index) => {
    const date = new Date(firstSaturday)
    date.setDate(firstSaturday.getDate() + index * 7)
    return {
      id: `workshop-${date.toISOString().slice(0, 10)}`,
      date,
      time: index % 2 === 0 ? '11:00' : '14:30',
      seats: [6, 4, 8, 5][index],
      price: 45,
    }
  })
 
  const showcaseGlobes = [
    {
      id: 'showcase-ballerina',
      title: language === 'tr' ? 'Beyaz Kuğu' : 'White Swan',
      maker_name: 'Derya',
      note: language === 'tr'
        ? 'Küçükken kuğu gibi süzüldüğüm bale günlerimi hatırlamak için.'
        : 'To remember my childhood ballet days, when I glided like a swan.',
      price: 38,
      image_url: productBallerina,
      sold: true,
      _showcase: true,
    },
    {
      id: 'showcase-fish',
      title: language === 'tr' ? 'Denizden Bir Parça' : 'A Piece of the Sea',
      maker_name: 'Peter',
      note: language === 'tr'
        ? 'Bunu küçük akvaryumum olarak saklayacağım.'
        : 'I will keep this as my little aquarium.',
      price: 24,
      image_url: productFish,
      sold: true,
      _showcase: true,
    },
    {
      id: 'showcase-bear',
      title: language === 'tr' ? 'Noel Ayısı' : 'Christmas Bear',
      maker_name: 'Mia',
      note: language === 'tr' ? 'Çocukluğumdaki Noel sabahlarını hatırlatan sıcak bir parça yaptım.' : 'I made a warm little piece inspired by Christmas mornings from my childhood.',
      price: 34,
      image_url: productBear,
      _showcase: true,
    },
    {
      id: 'showcase-prince',
      title: language === 'tr' ? 'Küçük Prens' : 'The Little Prince',
      maker_name: 'Sophie',
      note: language === 'tr' ? 'Bu küçük dünyayı en sevdiğim hikâyeden esinlenerek hazırladım.' : 'I created this little world after one of my favourite stories.',
      price: 29,
      image_url: productPrince,
      _showcase: true,
    },
  ]
  const displayMakerGlobes = [
  ...showcaseGlobes,
  ...makerGlobes.filter(
    (globe) =>
      !showcaseGlobes.some(
        (showcase) => String(showcase.id) === String(globe.id)
      )
  ),
]

  const loadShopData = async () => {
    const [kitsRes, globesRes, cartRes, favRes, reviewsRes] = await Promise.all([
      supabase.from('kits').select('*').order('id'),
      supabase
  .from('secondhand_globes')
  .select('*')
  .eq('approval_status', 'approved')
  .order('created_at', { ascending: false }),
      supabase.from('cart_items').select('*').eq('user_id', session.user.id),
      supabase.from('favorites').select('*').eq('user_id', session.user.id),
      supabase.from('workshop_reviews').select('*').eq('approved', true).order('created_at', { ascending: false }),
    ])

    if (kitsRes.data) setKits(kitsRes.data)
    if (globesRes.data) setMakerGlobes(globesRes.data)
    if (cartRes.data) setCartItems(cartRes.data)
    if (favRes.data) {
      const savedShowcaseFavorites = JSON.parse(localStorage.getItem(`showcase-favorites-${session.user.id}`) || '[]')
      const localFavorites = savedShowcaseFavorites.map((itemId) => ({
        id: `local-favorite-${itemId}`,
        user_id: session.user.id,
        item_type: 'secondhand',
        item_id: itemId,
      }))
      setFavoriteItems([...favRes.data, ...localFavorites])
    }
    setReviews(reviewsRes.data?.length ? reviewsRes.data : [
      { id: 'sample-1', name: language === 'tr' ? 'Amelia, Brighton' : 'Amelia, Brighton', message: language === 'tr' ? 'İlk kez minyatür yaptım. Her adım sakindi ve sonunda gerçekten bana ait bir şeyle ayrıldım.' : 'It was my first time making miniatures. Every step felt calm, and I left with something that genuinely felt mine.' },
      { id: 'sample-2', name: language === 'tr' ? 'Sophie, London' : 'Sophie, London', message: language === 'tr' ? 'Arkadaşlarımla geçirdiğim en güzel öğleden sonralardan biriydi. Ekip çok ilgiliydi.' : 'One of the loveliest afternoons I have spent with friends. The team made everyone feel at ease.' },
      { id: 'sample-3', name: language === 'tr' ? 'Daniel, Bristol' : 'Daniel, Bristol', message: language === 'tr' ? 'Malzemeler çok özenliydi; küçük sahneyi kurarken zamanın nasıl geçtiğini anlamadım.' : 'The materials were beautifully prepared; I completely lost track of time building the little scene.' },
    ])
  }

  useEffect(() => {
    loadShopData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const findItem = (itemType, itemId) => {
    const list = itemType === 'kit' ? kits : displayMakerGlobes
    return list.find((entry) => entry.id === itemId)
  }

  const isFavorite = (itemType, itemId) =>
    favoriteItems.some((fav) => fav.item_type === itemType && fav.item_id === itemId)

  const showCartNotice = (name) => {
    setCartNotice(name || t.addedToCart)
    window.setTimeout(() => setCartNotice(''), 3500)
  }

  const addToCart = async (itemType, itemId) => {
    const item = findItem(itemType, itemId)
    if (itemType === 'secondhand') {
      const globeIndex = makerGlobes.findIndex((globe) => globe.id === itemId)
      const globe = makerGlobes[globeIndex]
     if (globe && (globe.sold === true || globe.status === 'sold')) return
    }
    const existing = cartItems.find((c) => c.item_type === itemType && c.item_id === itemId)

    if (existing) {
      const { data } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
        .select()
      if (data) setCartItems((current) => current.map((c) => (c.id === existing.id ? data[0] : c)))
      showCartNotice(item?.name || item?.title)
      return
    }

    const { data } = await supabase
      .from('cart_items')
      .insert({ user_id: session.user.id, item_type: itemType, item_id: itemId, quantity: 1 })
      .select()

    if (data) {
      setCartItems((current) => [...current, data[0]])
      showCartNotice(item?.name || item?.title)
    }
  }

  const addMakerToCart = (globe) => {
    setMakerCartItems((current) => {
      const existing = current.find((item) => item.id === globe.id)
      if (existing) return current.map((item) => item.id === globe.id ? { ...item, quantity: item.quantity + 1 } : item)
      return [...current, { ...globe, quantity: 1 }]
    })
    showCartNotice(globe.title)
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
    const isShowcase = itemType === 'secondhand' && String(itemId).startsWith('showcase-')

    if (existing) {
      if (!isShowcase) await supabase.from('favorites').delete().eq('id', existing.id)
      if (isShowcase) {
        const saved = JSON.parse(localStorage.getItem(`showcase-favorites-${session.user.id}`) || '[]')
        localStorage.setItem(`showcase-favorites-${session.user.id}`, JSON.stringify(saved.filter((id) => id !== itemId)))
      }
      setFavoriteItems((current) => current.filter((f) => f.id !== existing.id))
      return
    }

    if (isShowcase) {
      const saved = JSON.parse(localStorage.getItem(`showcase-favorites-${session.user.id}`) || '[]')
      localStorage.setItem(`showcase-favorites-${session.user.id}`, JSON.stringify([...new Set([...saved, itemId])]))
      setFavoriteItems((current) => [
        ...current,
        { id: `local-favorite-${itemId}`, user_id: session.user.id, item_type: itemType, item_id: itemId },
      ])
      return
    }

    const { data } = await supabase
      .from('favorites')
      .insert({ user_id: session.user.id, item_type: itemType, item_id: itemId })
      .select()

    if (data) setFavoriteItems((current) => [...current, data[0]])
  } 
  const removeListing = async (id) => {
    await supabase.from('secondhand_globes').delete().eq('id', id)
    setMakerGlobes((current) => current.filter((item) => item.id !== id))
  }

  const cartTotal = cartItems.reduce((sum, cartItem) => {
    const item = findItem(cartItem.item_type, cartItem.item_id)
    return sum + (item ? item.price * cartItem.quantity : 0)
  }, 0)
    + bookingCartItems.reduce((sum, item) => sum + item.price * item.people, 0)
    + makerCartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)

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
    setCheckoutError('')

    const orderItems = cartItems.map((cartItem) => {
      const item = findItem(cartItem.item_type, cartItem.item_id)
      return {
        type: cartItem.item_type,
        id: cartItem.item_id,
        name: item?.name || item?.title || '',
        price: item?.price || 0,
        quantity: cartItem.quantity,
        seller_id: item?.seller_id || null,
        commission_rate: Number(item?.commission_rate || 15),
      }
    }).concat(bookingCartItems.map((item) => ({
      type: 'workshop',
      id: item.id,
      name: item.eventLabel,
      price: item.price,
      quantity: item.people,
   }))).concat(makerCartItems.map((item) => ({
  type: item._showcase ? 'showcase' : 'secondhand',
  id: item.id,
  name: item.title,
  price: Number(item.price),
  quantity: item.quantity,
  seller_id: item.seller_id || null,
  commission_rate: Number(item.commission_rate || 15),
})))

    const orderPayload = {
      user_id: session.user.id,
      items: orderItems,
      total: cartTotal,
      full_name: `${addressForm.firstName} ${addressForm.lastName}`.trim(),
      address: `${addressForm.firstName} ${addressForm.lastName}, ${addressForm.address}, ${addressForm.district}, ${addressForm.city}, ${addressForm.postalCode}`,
    }
    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('id, order_code, created_at, status')
      .single()

    if (orderError || !createdOrder) {
      setCheckoutError(t.orderError)
      return
    }

    const orderItemRows = orderItems.map((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 1)
      const isSellerProduct = item.type === 'secondhand' && Boolean(item.seller_id)
      const commissionRate = isSellerProduct
        ? Number(item.commission_rate || 15)
        : 100
      const adminAmount = isSellerProduct
        ? lineTotal * (commissionRate / 100)
        : lineTotal
      const sellerAmount = isSellerProduct ? lineTotal - adminAmount : 0
      const numericProductId = Number(item.id)

      return {
        order_id: createdOrder.id,
        product_id: Number.isFinite(numericProductId) ? numericProductId : null,
        seller_id: isSellerProduct ? item.seller_id : null,
        product_title: item.name,
        product_type: item.type,
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.price || 0),
        line_total: lineTotal,
        commission_rate: commissionRate,
        admin_amount: adminAmount,
        seller_amount: sellerAmount,
      }
    })

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemRows)

    if (orderItemsError) {
      console.error('Order items could not be saved:', orderItemsError)
      setCheckoutError(t.orderError)
      return
    }

    const soldSellerProductIds = orderItems
      .filter((item) => item.type === 'secondhand' && item.seller_id)
      .map((item) => item.id)

    if (soldSellerProductIds.length > 0) {
      await supabase
        .from('secondhand_globes')
        .update({ sold: true })
        .in('id', soldSellerProductIds)
    }

    for (const item of cartItems) {
      await supabase.from('cart_items').delete().eq('id', item.id)
    }
    for (const workshop of bookingCartItems) {
      await supabase.from('event_rsvps').insert({
        user_id: session.user.id,
        event_label: workshop.eventLabel,
      })
    }
    setCartItems([])
    setBookingCartItems([])
    setMakerCartItems([])
    onOrderComplete?.({
      ...orderPayload,
      id: createdOrder.id,
      order_code: createdOrder.order_code,
      created_at: createdOrder.created_at,
      status: createdOrder.status || 'received',
    })
    setOrderSuccess(true)
  }

  const closeCheckout = () => {
    setCheckoutOpen(false)
    setOrderSuccess(false)
    setCheckoutError('')
    setCardFlipped(false)
  }

  const submitReview = async (event) => {
    event.preventDefault()
    const nextReview = {
      user_id: session.user.id,
      name: reviewForm.name.trim(),
      message: reviewForm.message.trim(),
      approved: true,
    }
    const { data, error } = await supabase.from('workshop_reviews').insert(nextReview).select()
    setReviews((current) => [data?.[0] || { id: `local-${Date.now()}`, ...nextReview }, ...current])
    setReviewForm({ name: '', message: '' })
    setReviewStatus(error ? t.reviewSuccess : t.reviewSuccess)
  }

  const reserveWorkshop = (slot) => {
    const dateLabel = slot.date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const eventLabel = `${language === 'tr' ? 'Kar Küresi Atölyesi' : 'Snow Globe Workshop'} — ${dateLabel}, ${slot.time} — ${bookingPeople} ${language === 'tr' ? 'kişi' : bookingPeople === 1 ? 'guest' : 'guests'}`
    setBookingCartItems((current) => {
      const withoutSameSlot = current.filter((item) => item.id !== slot.id)
      return [...withoutSameSlot, {
        id: slot.id,
        eventLabel,
        dateLabel,
        time: slot.time,
        people: bookingPeople,
        price: slot.price,
      }]
    })
    setBookingStatus(language === 'tr' ? 'Atölye seçimin sepete eklendi.' : 'Your workshop has been added to the cart.')
    navigate('/shop/cart')
  }

  return (
    <div className="shop-app">
      

      <div className="shop-shell">
        <header className="shop-topbar">
          <button type="button" className="shop-brand shop-brand-button" onClick={onBack} aria-label={language === 'tr' ? 'Ana sayfaya dön' : 'Back to homepage'}>
            <AnimatedGlobeLogo />
            The Glass Worlds
          </button>

          <nav className="shop-direct-nav" aria-label={language === 'tr' ? 'Mağaza bölümleri' : 'Shop sections'}>
            {menuItems.filter(([key]) => key !== 'cart').map(([key, labelKey]) => (
              <button
                type="button"
                key={key}
                className={activeSection === key ? 'active' : ''}
                onClick={() => navigate(`/shop/${key}`)}
              >
                {String(t[labelKey]).replace(/^[^\p{L}]+/u, '')}
              </button>
            ))}
          </nav>

          <div className="shop-header-icons">
            <button type="button" onClick={() => navigate('/panel/profile')} aria-label={t.myPanel}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm-7.5 8.5c.45-4.1 3.05-6.25 7.5-6.25s7.05 2.15 7.5 6.25H4.5Z" /></svg>
              <span>{t.myPanel}</span>
            </button>
            <button type="button" onClick={() => navigate('/shop/cart')} aria-label={t.menuCart}>
              <svg className="shop-cart-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 4h2.2l2.1 9.1a2 2 0 0 0 2 1.55h7.85a2 2 0 0 0 1.95-1.55L20.5 7H6" />
                <circle cx="9.4" cy="19" r="1.35" />
                <circle cx="17.2" cy="19" r="1.35" />
              </svg>
              <span>{t.cartTitle}</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeSection === 'workshops' && (
            <motion.section
              key="workshops"
              className="shop-view workshop-booking-view"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <div className="shop-view-heading">
                <span className="booking-eyebrow">THE GLASS WORLDS · LONDON</span>
                <h2>{t.bookingTitle}</h2>
                <p>{t.bookingDesc}</p>
              </div>
              <div className="booking-layout">
                <div className="booking-summary">
                  <span>{t.bookingDuration}</span>
                  <h3>{language === 'tr' ? 'Kendi küçük dünyanı yap.' : 'Make your own little world.'}</h3>
                  <p>{t.bookingIncludes}</p>
                  <label>
                    <span>{t.bookingPeople}</span>
                    <select value={bookingPeople} onChange={(event) => setBookingPeople(Number(event.target.value))}>
                      {[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}</option>)}
                    </select>
                  </label>
                </div>
                <div className="booking-slots">
                  {workshopSlots.map((slot) => (
                    <article className="booking-slot" key={slot.id}>
                      <div className="booking-date">
                        <strong>{slot.date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-GB', { day: '2-digit' })}</strong>
                        <span>{slot.date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-GB', { month: 'short', weekday: 'short' })}</span>
                      </div>
                      <div className="booking-slot-info">
                        <strong>{slot.time}</strong>
                        <span>{slot.seats} {t.bookingSeats}</span>
                      </div>
                      <div className="booking-slot-price">
                        <strong>£{slot.price}</strong>
                        <span>{t.bookingPrice}</span>
                      </div>
                      <button type="button" onClick={() => reserveWorkshop(slot)}>{t.bookingButton}</button>
                    </article>
                  ))}
                  {bookingStatus && <p className="booking-status">{bookingStatus}</p>}
                </div>
              </div>
            </motion.section>
          )}
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

              <div className="editorial-guide-hero">
                <img src={makingProcessPhoto} alt={language === 'tr' ? 'Kar küresi için minyatür sahne hazırlanıyor' : 'A miniature scene being prepared for a snow globe'} />
                <div>
                  <span>01 — {language === 'tr' ? 'EL İŞÇİLİĞİ' : 'MADE BY HAND'}</span>
                  <h3>{language === 'tr' ? 'Her küçük dünya, tek tek kurulur.' : 'Every little world is assembled one detail at a time.'}</h3>
                  <p>{t.guidePhotoCaption}</p>
                </div>
              </div>

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

              <div className="editorial-story-grid">
                <article><img src={studioInteriorPhoto} alt="" /><span>{language === 'tr' ? 'Atölyemiz' : 'Our studio'}</span></article>
                <article><img src={miniatureScenePhoto} alt="" /><span>{language === 'tr' ? 'Minyatür dünyalar' : 'Miniature worlds'}</span></article>
                <article className="wide"><img src={workshopGroupPhoto} alt="" /><span>{language === 'tr' ? 'Birlikte üretmenin keyfi' : 'The joy of making together'}</span></article>
              </div>

              <section className="workshop-reviews">
                <div className="reviews-heading">
                  <span>THE GLASS WORLDS</span>
                  <h3>{t.reviewsTitle}</h3>
                  <p>{t.reviewsDesc}</p>
                </div>
                <div className="review-grid">
                  {reviews.slice(0, 3).map((review) => (
                    <blockquote key={review.id}>
                      <p>“{review.message}”</p>
                      <cite>{review.name}</cite>
                    </blockquote>
                  ))}
                </div>
                <form className="review-form" onSubmit={submitReview}>
                  <input required value={reviewForm.name} onChange={(event) => setReviewForm((current) => ({ ...current, name: event.target.value }))} placeholder={t.reviewName} />
                  <textarea required rows="3" value={reviewForm.message} onChange={(event) => setReviewForm((current) => ({ ...current, message: event.target.value }))} placeholder={t.reviewText} />
                  <button type="submit">{t.reviewSubmit}</button>
                  {reviewStatus && <p>{reviewStatus}</p>}
                </form>
              </section>
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

              <div className="maker-market-layout">
             <motion.aside
  className="glass-card seller-invitation"
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
  <span className="seller-invitation-eyebrow">
    {language === "tr" ? "SATICI PROGRAMI" : "SELLER PROGRAM"}
  </span>

  <h3>
    {language === "tr"
      ? "Kar küreni yeni bir hikâyeye dönüştür."
      : "Turn your snow globe into a new story."}
  </h3>

  <p>
   {language === "tr"
  ? "The Glass Worlds atölyesinde hazırladığın kar küresi için satış başvurusu oluştur. Başvurun incelendikten sonra uygun bulunursa mağazada yayınlanır."
  : "Apply to sell the snow globe you created at a The Glass Worlds workshop. Approved products are published in the shop."}
  </p>

  <div className="seller-invitation-commission">
    <strong>%15</strong>

    <span>
      {language === "tr"
        ? "Şeffaf hizmet komisyonu"
        : "Transparent service commission"}
    </span>
  </div>

  <motion.button
    type="button"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => navigate("/sell")}
  >
    {language === "tr" ? "Kar Küreni Sat" : "Sell Your Snow Globe"}
    <span>→</span>
  </motion.button>
</motion.aside>

              <motion.div
                className="kit-grid maker-globe-grid"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              >
                {displayMakerGlobes.map((globe) => {
                  const sold = globe.sold === true || globe.status === 'sold'
                  return (
                  <motion.div
                    className={`glass-card kit-card ${sold ? 'is-sold' : ''}`}
                    key={globe.id}
                    variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="kit-box" onClick={() => setSelectedMaker(globe)}>
                      <img
                        src={globe.image_url || placeholderImage}
                        alt={globe.title}
                      />
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
                      <div className="maker-card-story">
                        <p><strong>{t.madeBy}:</strong> {globe.maker_name}</p>
                        {globe.note && <p className="maker-card-note">“{globe.note}”</p>}
                      </div>
                    )}

                    <div className="kit-footer">
                      <strong>£{globe.price}</strong>
                      <motion.button disabled={sold} whileHover={sold ? {} : { scale: 1.06 }} whileTap={sold ? {} : { scale: 0.94 }} onClick={() => !sold && setSelectedMaker(globe)}>
                        {sold ? t.sold : t.viewMore}
                      </motion.button>
                    </div>

                    {globe.seller_id === session.user.id && (
                      <button type="button" className="remove-link" onClick={() => removeListing(globe.id)}>
                        {t.remove}
                      </button>
                    )}
                  </motion.div>
                )})}
              </motion.div>
              </div>
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
                            onClick={() => item._showcase
                              ? addMakerToCart(item)
                              : addToCart(fav.item_type, fav.item_id)}
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

              {cartItems.length === 0 && bookingCartItems.length === 0 && makerCartItems.length === 0 ? (
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
                    {bookingCartItems.map((workshop) => (
                      <motion.div
                        className="glass-card cart-row workshop-cart-row"
                        key={workshop.id}
                        variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                      >
                        <div className="workshop-cart-icon" aria-hidden="true">✦</div>
                        <div className="cart-row-info">
                          <strong>{language === 'tr' ? 'Kar Küresi Atölyesi' : 'Snow Globe Workshop'}</strong>
                          <span>{workshop.dateLabel} · {workshop.time} · {workshop.people} {language === 'tr' ? 'kişi' : workshop.people === 1 ? 'guest' : 'guests'}</span>
                        </div>
                        <strong className="workshop-cart-price">£{(workshop.price * workshop.people).toFixed(2)}</strong>
                        <button className="remove-link" onClick={() => setBookingCartItems((current) => current.filter((item) => item.id !== workshop.id))}>
                          {t.remove}
                        </button>
                      </motion.div>
                    ))}
                    {makerCartItems.map((item) => (
                      <motion.div
                        className="glass-card cart-row"
                        key={`maker-${item.id}`}
                        variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                      >
                        <img src={item.image_url || placeholderImage} alt={item.title} />
                        <div className="cart-row-info">
                          <strong>{item.title}</strong>
                          <span>£{item.price}</span>
                        </div>
                        <div className="cart-qty">
                          <button onClick={() => setMakerCartItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => setMakerCartItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry))}>+</button>
                        </div>
                        <button className="remove-link" onClick={() => setMakerCartItems((current) => current.filter((entry) => entry.id !== item.id))}>
                          {t.remove}
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="glass-card cart-summary">
                    <span>{t.total}</span>
                    <strong>£{cartTotal.toFixed(2)}</strong>
                  </div>

                  <div className="cart-actions">
                    <button type="button" className="continue-shopping" onClick={() => navigate('/shop/kits')}>{t.continueShopping}</button>
                    <motion.button
                      className="checkout-cta"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                     onClick={() => {
  setCheckoutStep(1)
  setCheckoutError("")
  setCheckoutOpen(true)
}}
                    >
                      {t.checkout}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {cartNotice && (
          <motion.aside
            className="cart-added-notice"
            initial={{ opacity: 0, y: 18, scale: .96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: .96 }}
          >
            <span className="cart-added-check">✓</span>
            <div>
              <strong>{t.addedToCart}</strong>
              <p>{cartNotice}</p>
            </div>
            <button type="button" onClick={() => setCartNotice('')}>{t.continueShopping}</button>
          </motion.aside>
        )}
      </AnimatePresence>

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
                <span>{t.madeBy}: {selectedMaker.maker_name || t.by}</span>
              </div>
              {selectedMaker.note && <p className="maker-note">“{selectedMaker.note}”</p>}
              <div className="kit-footer">
                <strong>£{selectedMaker.price}</strong>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    addMakerToCart(selectedMaker)
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
                  

                  

                 <form
  className="checkout-form checkout-form-detailed"
  onSubmit={handlePlaceOrder}
>
  {/* Üstteki adım göstergesi */}
  <div className="checkout-progress">
    {[
      language === "tr" ? "Kullanıcı" : "Customer",
      language === "tr" ? "Teslimat" : "Delivery",
      language === "tr" ? "Kart" : "Card",
      language === "tr" ? "Onay" : "Confirm",
    ].map((label, index) => {
      const stepNumber = index + 1

      return (
        <div
          key={label}
          className={`checkout-progress-step ${
            checkoutStep === stepNumber ? "active" : ""
          } ${checkoutStep > stepNumber ? "complete" : ""}`}
        >
          <span>{checkoutStep > stepNumber ? "✓" : stepNumber}</span>
          <small>{label}</small>
        </div>
      )
    })}
  </div>

  {/* 1 — Kullanıcı bilgileri */}
  {checkoutStep === 1 && (
    <motion.section
      className="checkout-section"
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="checkout-section-heading">
        <span className="checkout-step-number">1</span>

        <div>
          <h4>
            {language === "tr"
              ? "Kullanıcı Bilgileri"
              : "Customer Information"}
          </h4>
          <p>
            {language === "tr"
              ? "Siparişiniz hakkında size ulaşabilmemiz için bilgilerinizi girin."
              : "Enter your contact details so we can reach you about the order."}
          </p>
        </div>
      </div>

      <div className="checkout-row">
        <label className="checkout-field">
          <span>{language === "tr" ? "Ad" : "First name"}</span>
          <input
            name="firstName"
            value={addressForm.firstName}
            onChange={handleAddressChange}
            placeholder={t.firstName}
            autoComplete="given-name"
          />
        </label>

        <label className="checkout-field">
          <span>{language === "tr" ? "Soyad" : "Last name"}</span>
          <input
            name="lastName"
            value={addressForm.lastName}
            onChange={handleAddressChange}
            placeholder={t.lastName}
            autoComplete="family-name"
          />
        </label>
      </div>

      <label className="checkout-field">
        <span>{language === "tr" ? "E-posta" : "Email"}</span>
        <input
          name="email"
          type="email"
          value={addressForm.email}
          onChange={handleAddressChange}
          placeholder="ornek@mail.com"
          autoComplete="email"
        />
      </label>

      <label className="checkout-field">
        <span>{language === "tr" ? "Telefon" : "Phone"}</span>
        <input
          name="phone"
          type="tel"
          value={addressForm.phone}
          onChange={handleAddressChange}
          placeholder={t.phone}
          autoComplete="tel"
        />
      </label>

      <div className="checkout-navigation checkout-navigation-end">
        <button
          type="button"
          className="checkout-next"
          disabled={
            !addressForm.firstName.trim() ||
            !addressForm.lastName.trim() ||
            !addressForm.email.trim() ||
            !addressForm.phone.trim()
          }
          onClick={() => {
            setCheckoutError("")
            setCheckoutStep(2)
          }}
        >
          {language === "tr"
            ? "Teslimat Bilgilerine Devam Et"
            : "Continue to Delivery"}
          <span>→</span>
        </button>
      </div>
    </motion.section>
  )}

  {/* 2 — Teslimat bilgileri */}
  {checkoutStep === 2 && (
    <motion.section
      className="checkout-section"
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="checkout-section-heading">
        <span className="checkout-step-number">2</span>

        <div>
          <h4>
            {language === "tr"
              ? "Teslimat Bilgileri"
              : "Delivery Information"}
          </h4>
          <p>
            {language === "tr"
              ? "Kar kürenizin teslim edileceği adresi eksiksiz girin."
              : "Enter the complete delivery address for your snow globe."}
          </p>
        </div>
      </div>

      <div className="checkout-row">
        <label className="checkout-field">
          <span>{language === "tr" ? "Şehir" : "City"}</span>
          <input
            name="city"
            value={addressForm.city}
            onChange={handleAddressChange}
            placeholder={t.city}
            autoComplete="address-level1"
          />
        </label>

        <label className="checkout-field">
          <span>{language === "tr" ? "İlçe" : "District"}</span>
          <input
            name="district"
            value={addressForm.district}
            onChange={handleAddressChange}
            placeholder={language === "tr" ? "İlçe" : "District"}
            autoComplete="address-level2"
          />
        </label>
      </div>

      <label className="checkout-field">
        <span>{language === "tr" ? "Adres" : "Address"}</span>
        <textarea
          name="address"
          value={addressForm.address}
          onChange={handleAddressChange}
          placeholder={
            language === "tr"
              ? "Mahalle, cadde, sokak, bina ve daire numarası"
              : "Street, building and apartment number"
          }
          autoComplete="street-address"
          rows="4"
        />
      </label>

      <label className="checkout-field">
        <span>{language === "tr" ? "Posta kodu" : "Postal code"}</span>
        <input
          name="postalCode"
          value={addressForm.postalCode}
          onChange={handleAddressChange}
          placeholder={language === "tr" ? "Posta kodu" : "Postal code"}
          autoComplete="postal-code"
        />
      </label>

      <div className="checkout-navigation">
        <button
          type="button"
          className="checkout-back"
          onClick={() => setCheckoutStep(1)}
        >
          <span>←</span>
          {language === "tr" ? "Geri" : "Back"}
        </button>

        <button
          type="button"
          className="checkout-next"
          disabled={
            !addressForm.city.trim() ||
            !addressForm.district.trim() ||
            !addressForm.address.trim() ||
            !addressForm.postalCode.trim()
          }
          onClick={() => {
            setCheckoutError("")
            setCheckoutStep(3)
          }}
        >
          {language === "tr"
            ? "Kart Bilgilerine Devam Et"
            : "Continue to Card"}
          <span>→</span>
        </button>
      </div>
    </motion.section>
  )}

  {/* 3 — Kart bilgileri */}
  {checkoutStep === 3 && (
    <motion.section
      className="checkout-section"
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="checkout-section-heading">
        <span className="checkout-step-number">3</span>

        <div>
          <h4>
            {language === "tr" ? "Kart Bilgileri" : "Card Information"}
          </h4>
          <p>
            {language === "tr"
              ? "Bu bir önizleme ekranıdır; gerçek ödeme alınmaz."
              : "This is a preview screen; no real payment will be charged."}
          </p>
        </div>
      </div>

      <CardPreview card={cardForm} flipped={cardFlipped} t={t} />

      <label className="checkout-field">
        <span>{language === "tr" ? "Kart numarası" : "Card number"}</span>
        <input
          name="number"
          inputMode="numeric"
          value={cardForm.number}
          onChange={handleCardChange}
          onFocus={() => setCardFlipped(false)}
          placeholder={t.cardNumber}
          maxLength={19}
          autoComplete="cc-number"
        />
      </label>

      <label className="checkout-field">
        <span>
          {language === "tr"
            ? "Kart üzerindeki isim"
            : "Name on card"}
        </span>
        <input
          name="name"
          value={cardForm.name}
          onChange={handleCardChange}
          onFocus={() => setCardFlipped(false)}
          placeholder={t.cardName}
          autoComplete="cc-name"
        />
      </label>

      <div className="checkout-row">
        <label className="checkout-field">
          <span>
            {language === "tr"
              ? "Son kullanma tarihi"
              : "Expiry date"}
          </span>
          <input
            name="expiry"
            value={cardForm.expiry}
            onChange={handleCardChange}
            onFocus={() => setCardFlipped(false)}
            placeholder={t.expiry}
            maxLength={5}
            autoComplete="cc-exp"
          />
        </label>

        <label className="checkout-field">
          <span>CVC</span>
          <input
            name="cvc"
            inputMode="numeric"
            value={cardForm.cvc}
            onChange={handleCardChange}
            onFocus={() => setCardFlipped(true)}
            placeholder={t.cvc}
            maxLength={3}
            autoComplete="cc-csc"
          />
        </label>
      </div>

      <div className="checkout-navigation">
        <button
          type="button"
          className="checkout-back"
          onClick={() => setCheckoutStep(2)}
        >
          <span>←</span>
          {language === "tr" ? "Geri" : "Back"}
        </button>

        <button
          type="button"
          className="checkout-next"
          disabled={
            cardForm.number.replace(/\s/g, "").length < 16 ||
            !cardForm.name.trim() ||
            cardForm.expiry.length < 5 ||
            cardForm.cvc.length < 3
          }
          onClick={() => {
            setCheckoutError("")
            setCheckoutStep(4)
          }}
        >
          {language === "tr" ? "Siparişi İncele" : "Review Order"}
          <span>→</span>
        </button>
      </div>
    </motion.section>
  )}

  {/* 4 — Sipariş özeti ve ödeme */}
  {checkoutStep === 4 && (
    <motion.section
      className="checkout-section checkout-confirmation"
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="checkout-section-heading">
        <span className="checkout-step-number">4</span>

        <div>
          <h4>
            {language === "tr"
              ? "Sipariş Özeti ve Onay"
              : "Order Review"}
          </h4>
          <p>
            {language === "tr"
              ? "Bilgilerinizi kontrol edip ödemenizi tamamlayın."
              : "Review your information and complete the payment."}
          </p>
        </div>
      </div>

      <div className="checkout-review-grid">
        <article>
          <span>{language === "tr" ? "Müşteri" : "Customer"}</span>
          <strong>
            {addressForm.firstName} {addressForm.lastName}
          </strong>
          <p>{addressForm.email}</p>
          <p>{addressForm.phone}</p>

          <button type="button" onClick={() => setCheckoutStep(1)}>
            {language === "tr" ? "Düzenle" : "Edit"}
          </button>
        </article>

        <article>
          <span>{language === "tr" ? "Teslimat" : "Delivery"}</span>
          <strong>
            {addressForm.district}, {addressForm.city}
          </strong>
          <p>{addressForm.address}</p>
          <p>{addressForm.postalCode}</p>

          <button type="button" onClick={() => setCheckoutStep(2)}>
            {language === "tr" ? "Düzenle" : "Edit"}
          </button>
        </article>

        <article>
          <span>{language === "tr" ? "Ödeme" : "Payment"}</span>
          <strong>
            •••• {cardForm.number.replace(/\s/g, "").slice(-4)}
          </strong>
          <p>{cardForm.name}</p>

          <button type="button" onClick={() => setCheckoutStep(3)}>
            {language === "tr" ? "Düzenle" : "Edit"}
          </button>
        </article>
      </div>

      <div className="checkout-order-total">
        <span>{t.total}</span>
        <strong>£{cartTotal.toFixed(2)}</strong>
      </div>

      <label className="checkout-approval">
        <input type="checkbox" required />
        <span>
          {language === "tr"
            ? "Teslimat, kart ve sipariş bilgilerimin doğru olduğunu onaylıyorum."
            : "I confirm that my delivery, card and order information is correct."}
        </span>
      </label>

      {checkoutError && (
        <p className="checkout-error" role="alert">
          {checkoutError}
        </p>
      )}

      <div className="checkout-navigation">
        <button
          type="button"
          className="checkout-back"
          onClick={() => setCheckoutStep(3)}
        >
          <span>←</span>
          {language === "tr" ? "Geri" : "Back"}
        </button>

        <motion.button
          type="submit"
          className="pay-button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t.payButton}
        </motion.button>
      </div>
    </motion.section>
  )}
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
