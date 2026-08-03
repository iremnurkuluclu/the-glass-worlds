import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './supabaseClient'
import AnimatedGlobeLogo from './AnimatedGlobeLogo'

const initialForm = {
  seller_name: '',
  phone: '',
  title: '',
  maker_name: '',
  product_type: '',
  production_year: '',
  condition: '',
  dimensions: '',
  weight: '',
  materials: '',
  features: '',
  note: '',
  flaws: '',
  shipping_region: '',
  price: '',
  terms_accepted: false,
}

const pageText = {
  tr: {
    back: 'Geri dön',
    shop: 'Ürünleri görüntüle',
    eyebrow: 'THE GLASS WORLDS · SATICI PROGRAMI',
    title: 'Hatıranı yeni bir hikâyeye dönüştür.',
   intro:
  'The Glass Worlds atölyesinde hazırladığın kar küresini topluluğumuzda satışa çıkar. Başvurunu gönder; inceleyip uygun bulunması hâlinde mağazada yayınlayalım.',
    start: 'Satış başvurusu yap',
    processTitle: 'Satış süreci nasıl işler?',
    commissionTitle: 'Şeffaf komisyon sistemi',
    commissionText:
      'Gerçekleşen her satıştan %15 hizmet komisyonu alınır. Satış bedelinin %85’i satıcıya aittir.',
    formTitle: 'Kar küren için başvuru oluştur',
    formText:
      'Ürünü doğru değerlendirebilmemiz için bütün alanları eksiksiz doldur ve en az üç net fotoğraf ekle.',
    submit: 'Başvuruyu gönder',
    submitting: 'Başvuru gönderiliyor...',
    success:
      'Başvurun alındı. Ürünün incelendikten sonra sonucu hesabın üzerinden görebileceksin.',
  },

  en: {
    back: 'Go back',
    shop: 'View products',
    eyebrow: 'THE GLASS WORLDS · SELLER PROGRAMME',
    title: 'Give your memory a new story.',
   intro:
  'Sell the snow globe you created at a The Glass Worlds workshop. Submit your application and, once approved, we will publish it in the shop.',
    start: 'Start selling application',
    processTitle: 'How does selling work?',
    commissionTitle: 'Transparent commission',
    commissionText:
      'A 15% service commission is charged on each completed sale. The seller receives 85% of the sale price.',
    formTitle: 'Apply to sell your snow globe',
    formText:
      'Complete every field accurately and upload at least three clear photographs so we can review your globe.',
    submit: 'Send application',
    submitting: 'Sending application...',
    success:
      'Your application has been received. You will be able to follow the result after it has been reviewed.',
  },
}

function SellerPage({ session, language = 'tr', onBack, onShop }) {
  const t = pageText[language] || pageText.tr

  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const price = Number(form.price) || 0
  const commission = price * 0.15
  const sellerEarning = price * 0.85

  const formatMoney = (value) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value)

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))

    setError('')
    setStatus('')
  }

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || [])

    if (selectedFiles.length < 3) {
      setError(
        language === 'tr'
          ? 'Lütfen en az üç ürün fotoğrafı seç.'
          : 'Please select at least three product photographs.'
      )
      setFiles(selectedFiles)
      return
    }

    if (selectedFiles.length > 6) {
      setError(
        language === 'tr'
          ? 'En fazla altı fotoğraf yükleyebilirsin.'
          : 'You can upload a maximum of six photographs.'
      )
      return
    }

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024
    )

    if (invalidFile) {
      setError(
        language === 'tr'
          ? 'Fotoğraflar görsel formatında ve en fazla 5 MB olmalıdır.'
          : 'Each photograph must be an image and no larger than 5 MB.'
      )
      return
    }

    setFiles(selectedFiles)
    setError('')
  }

  const uploadImages = async () => {
    const uploadedUrls = []

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${crypto.randomUUID()}.${extension}`
      const filePath = `${session.user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath)

      uploadedUrls.push(data.publicUrl)
    }

    return uploadedUrls
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget

    setStatus('')
    setError('')

    if (!session) {
      setError(
        language === 'tr'
          ? 'Satış başvurusu yapabilmek için giriş yapmalısın.'
          : 'You must sign in before submitting a selling application.'
      )
      return
    }

    if (files.length < 3) {
      setError(
        language === 'tr'
          ? 'Lütfen en az üç ürün fotoğrafı ekle.'
          : 'Please add at least three product photographs.'
      )
      return
    }

    if (!form.terms_accepted) {
      setError(
        language === 'tr'
          ? 'Devam etmek için satış ve komisyon koşullarını kabul etmelisin.'
          : 'You must accept the selling and commission terms to continue.'
      )
      return
    }

    setSubmitting(true)

    try {
      const imageUrls = await uploadImages()

      const { error: insertError } = await supabase
        .from('secondhand_globes')
        .insert({
          seller_id: session.user.id,
          seller_name: form.seller_name.trim(),
          seller_email: session.user.email,
          phone: form.phone.trim(),
          title: form.title.trim(),
          maker_name: form.maker_name.trim(),
          product_type: form.product_type,
          production_year: form.production_year.trim(),
          condition: form.condition,
          dimensions: form.dimensions.trim(),
          weight: form.weight.trim(),
          materials: form.materials.trim(),
          features: form.features.trim(),
          note: form.note.trim(),
          flaws: form.flaws.trim(),
          shipping_region: form.shipping_region.trim(),
          price,
          image_url: imageUrls[0],
          image_urls: imageUrls,
          approval_status: 'pending',
          commission_rate: 15,
          terms_accepted: true,
        })

      if (insertError) {
        throw insertError
      }

      setForm(initialForm)
      setFiles([])
      formElement.reset()
      setStatus(t.success)
   } catch (submitError) {
  console.error('Seller application error:', submitError)

  const errorMessage =
    submitError?.message ||
    submitError?.error_description ||
    'Bilinmeyen bir hata oluştu.'

  setError(
    language === 'tr'
      ? `Başvuru gönderilemedi: ${errorMessage}`
      : `The application could not be submitted: ${errorMessage}`
  )
}
     finally {
      setSubmitting(false)
    }
  }

  const steps =
    language === 'tr'
      ? [
          {
            number: '01',
            title: 'Ürününü anlat',
            text: 'Kar kürenin bilgilerini, hikâyesini, kondisyonunu ve varsa kusurlarını eksiksiz yaz.',
          },
          {
            number: '02',
            title: 'Fotoğrafları yükle',
            text: 'Ürünün ön, arka ve detay görüntülerini içeren en az üç net fotoğraf ekle.',
          },
          {
            number: '03',
            title: 'İncelemeye gönder',
            text: 'Başvurun yönetici paneline düşer. Bilgiler ve fotoğraflar kontrol edilir.',
          },
          {
            number: '04',
            title: 'Mağazada yayınlansın',
            text: 'Onaylanan ürün Üretici Kar Küreleri bölümünde satışa açılır.',
          },
          {
            number: '05',
            title: 'Satış bilgisi al',
            text: 'Ürünün satıldığında hesabına bildirim gönderilir ve gönderim süreci başlar.',
          },
          {
            number: '06',
            title: 'Kazancını al',
            text: '%15 hizmet komisyonu ayrılır; satış fiyatının %85’i satıcı kazancı olarak hesaplanır.',
          },
        ]
      : [
          {
            number: '01',
            title: 'Describe your globe',
            text: 'Provide its details, story, condition and any visible flaws.',
          },
          {
            number: '02',
            title: 'Upload photographs',
            text: 'Add at least three clear photographs showing the front, back and details.',
          },
          {
            number: '03',
            title: 'Send for review',
            text: 'Your application is delivered to the administrator for review.',
          },
          {
            number: '04',
            title: 'Get published',
            text: 'Approved products appear in the Maker Globes marketplace.',
          },
          {
            number: '05',
            title: 'Receive the sale notice',
            text: 'You will be notified when your globe is sold.',
          },
          {
            number: '06',
            title: 'Receive your earnings',
            text: 'The 15% service commission is deducted and 85% is calculated as seller earnings.',
          },
        ]

  const faqs =
    language === 'tr'
      ? [
          {
            question: 'Başvurum hemen yayınlanır mı?',
            answer:
              'Hayır. Her başvuru ürün bilgileri, fotoğraflar ve satış koşulları açısından incelenir. Yalnızca onaylanan ürünler mağazada yayınlanır.',
          },
          {
            question: 'Komisyon nasıl hesaplanır?',
            answer:
              'The Glass Worlds tamamlanan satış fiyatının %15’ini hizmet komisyonu olarak alır. Kalan %85 satıcının kazancıdır.',
          },
          {
            question: 'Fiyatı kim belirler?',
            answer:
              'Başlangıç fiyatını satıcı belirler. Gerçekçi olmayan veya ürünle uyuşmayan fiyatlar için yönetici düzenleme önerebilir.',
          },
          {
            question: 'Hangi ürünleri satabilirim?',
            answer:
              'El yapımı, vintage veya koleksiyonluk kar küreleri kabul edilir. Güvensiz, ciddi şekilde kırık, taklit veya yanlış bilgiyle sunulan ürünler kabul edilmez.',
          },
          {
            question: 'Üründeki kusurları belirtmeli miyim?',
            answer:
              'Evet. Çizik, çatlak, sıvı kaybı, çalışmayan müzik veya ışık gibi bütün kusurlar açıkça belirtilmelidir.',
          },
          {
            question: 'Ürün satıldığında ne olur?',
            answer:
              'Satıcıya bildirim gönderilir. Ürün güvenli şekilde paketlenir ve belirtilen gönderim sürecine göre alıcıya ulaştırılır.',
          },
          {
            question: 'Alıcı ürünü iade ederse ne olur?',
            answer:
              'Ürün açıklamayla uyuşmuyorsa veya hasarlı ulaştıysa inceleme yapılır. İade tamamlanmadan satıcı ödemesi kesinleşmez.',
          },
          {
            question: 'İlanımı kaldırabilir miyim?',
            answer:
              'Ürün henüz satılmadıysa hesabın üzerinden kaldırma talebi oluşturabilirsin.',
          },
        ]
      : [
          {
            question: 'Will my application be published immediately?',
            answer:
              'No. Each application is reviewed. Only approved products are published.',
          },
          {
            question: 'How is commission calculated?',
            answer:
              'The Glass Worlds receives 15% of the completed sale price and the seller receives 85%.',
          },
          {
            question: 'Who sets the price?',
            answer:
              'The seller proposes the price. The administrator may suggest an adjustment.',
          },
          {
            question: 'What products can I sell?',
            answer:
              'Handmade, vintage and collectible snow globes may be submitted.',
          },
          {
            question: 'Should I declare flaws?',
            answer:
              'Yes. Scratches, cracks, fluid loss and non-working features must be described.',
          },
          {
            question: 'What happens after a sale?',
            answer:
              'The seller is notified and the secure shipping process begins.',
          },
          {
            question: 'What happens if the buyer returns it?',
            answer:
              'The return is reviewed before seller payment is finalised.',
          },
          {
            question: 'Can I remove my listing?',
            answer:
              'You can request removal while the item remains unsold.',
          },
        ]

  return (
    <main className="seller-page">
      <header className="seller-topbar">
        <button type="button" className="seller-brand" onClick={onBack}>
          <AnimatedGlobeLogo />
          <span>The Glass Worlds</span>
        </button>

        <div className="seller-topbar-actions">
          <button type="button" onClick={onShop}>
            {t.shop}
          </button>

          <button
            type="button"
            className="seller-back-arrow"
            aria-label={t.back}
            title={t.back}
            style={{
              width: '42px',
              height: '42px',
              display: 'grid',
              placeItems: 'center',
              padding: 0,
              borderRadius: '50%',
              fontSize: '1.45rem',
              lineHeight: 1,
            }}
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back()
              } else {
                onShop?.()
              }
            }}
          >
            <span aria-hidden="true">←</span>
          </button>
        </div>
      </header>

      <section className="seller-hero">
        <motion.div
          className="seller-hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>

          <a href="#seller-application">{t.start}</a>
        </motion.div>

        <div className="seller-commission-card">
          <span>THE GLASS WORLDS</span>
          <strong>%15</strong>
          <p>{t.commissionTitle}</p>
          <small>{t.commissionText}</small>
        </div>
      </section>

      <section className="seller-process">
        <div className="seller-section-heading">
          <span>01 — PROCESS</span>
          <h2>{t.processTitle}</h2>
        </div>

        <div className="seller-step-grid">
          {steps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seller-calculator">
        <div>
          <span>02 — COMMISSION</span>
          <h2>{t.commissionTitle}</h2>
          <p>{t.commissionText}</p>
        </div>

        <div className="seller-calculation-card">
          <label>
            <span>
              {language === 'tr'
                ? 'Planladığın satış fiyatı'
                : 'Your planned selling price'}
            </span>

            <div className="seller-price-input">
              <span>£</span>
              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </label>

          <div>
            <span>
              {language === 'tr'
                ? 'Hizmet komisyonu (%15)'
                : 'Service commission (15%)'}
            </span>
            <strong>{formatMoney(commission)}</strong>
          </div>

          <div className="seller-earning">
            <span>
              {language === 'tr'
                ? 'Tahmini kazancın (%85)'
                : 'Estimated earnings (85%)'}
            </span>
            <strong>{formatMoney(sellerEarning)}</strong>
          </div>
        </div>
      </section>

      <section className="seller-application" id="seller-application">
        <div className="seller-section-heading">
          <span>03 — APPLICATION</span>
          <h2>{t.formTitle}</h2>
          <p>{t.formText}</p>
        </div>

        <form className="seller-form" onSubmit={handleSubmit}>
          <div className="seller-form-grid">
            <label>
              <span>{language === 'tr' ? 'Ad soyad' : 'Full name'} *</span>
              <input
                required
                name="seller_name"
                value={form.seller_name}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>{language === 'tr' ? 'E-posta' : 'Email'} *</span>
              <input
                disabled
                value={session?.user?.email || ''}
              />
            </label>

            <label>
              <span>{language === 'tr' ? 'Telefon' : 'Phone'} *</span>
              <input
                required
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>{language === 'tr' ? 'Ürün adı' : 'Product title'} *</span>
              <input
                required
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>{language === 'tr' ? 'Ürünü yapan kişi' : 'Maker'} *</span>
              <input
                required
                name="maker_name"
                value={form.maker_name}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>{language === 'tr' ? 'Ürün türü' : 'Product type'} *</span>
             <input
  type="text"
  name="product_type"
  value={
    language === 'tr'
      ? 'Atölyede yapılan kar küresi'
      : 'Snow globe made at a workshop'
  }
  readOnly
/>
            </label>

            <label>
              <span>{language === 'tr' ? 'Yapım/edinme yılı' : 'Year'} *</span>
              <input
                required
                name="production_year"
                value={form.production_year}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>{language === 'tr' ? 'Kondisyon' : 'Condition'} *</span>
              <select
                required
                name="condition"
                value={form.condition}
                onChange={handleChange}
              >
                <option value="">
                  {language === 'tr' ? 'Seçiniz' : 'Select'}
                </option>
                <option value="new">
                  {language === 'tr' ? 'Yeni gibi' : 'Like new'}
                </option>
                <option value="very-good">
                  {language === 'tr' ? 'Çok iyi' : 'Very good'}
                </option>
                <option value="good">
                  {language === 'tr' ? 'İyi' : 'Good'}
                </option>
                <option value="worn">
                  {language === 'tr' ? 'Yıpranmış' : 'Worn'}
                </option>
              </select>
            </label>

            <label>
              <span>{language === 'tr' ? 'Ölçüler' : 'Dimensions'} *</span>
              <input
                required
                name="dimensions"
                value={form.dimensions}
                onChange={handleChange}
                placeholder="Örn. 12 × 12 × 18 cm"
              />
            </label>

            <label>
              <span>{language === 'tr' ? 'Ağırlık' : 'Weight'} *</span>
              <input
                required
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="Örn. 850 g"
              />
            </label>

            <label>
              <span>{language === 'tr' ? 'Materyaller' : 'Materials'} *</span>
              <input
                required
                name="materials"
                value={form.materials}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>
                {language === 'tr'
                  ? 'Işık/müzik gibi özellikler'
                  : 'Light, music or other features'}
              </span>
              <input
                name="features"
                value={form.features}
                onChange={handleChange}
              />
            </label>

            <label className="seller-form-wide">
              <span>{language === 'tr' ? 'Ürünün hikâyesi' : 'Product story'} *</span>
              <textarea
                required
                rows="4"
                name="note"
                value={form.note}
                onChange={handleChange}
              />
            </label>

            <label className="seller-form-wide">
              <span>
                {language === 'tr'
                  ? 'Kusur ve hasar açıklaması'
                  : 'Flaws and damage'} *
              </span>
              <textarea
                required
                rows="3"
                name="flaws"
                value={form.flaws}
                onChange={handleChange}
                placeholder={
                  language === 'tr'
                    ? 'Kusur yoksa “Yok” yaz.'
                    : 'Write “None” if there are no flaws.'
                }
              />
            </label>

            <label>
              <span>
                {language === 'tr'
                  ? 'Gönderim yapabileceğin bölge'
                  : 'Shipping region'} *
              </span>
              <input
                required
                name="shipping_region"
                value={form.shipping_region}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>{language === 'tr' ? 'Satış fiyatı (£)' : 'Price (£)'} *</span>
              <input
                required
                type="number"
                min="1"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
            </label>

            <label className="seller-form-wide seller-photo-field">
              <span>
                {language === 'tr'
                  ? 'Ürün fotoğrafları'
                  : 'Product photographs'} *
              </span>

              <input
                required
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
              />

              <small>
                {language === 'tr'
                  ? 'En az 3, en fazla 6 fotoğraf. Her fotoğraf en fazla 5 MB.'
                  : 'Minimum 3 and maximum 6 photographs. Maximum 5 MB each.'}
              </small>

              {files.length > 0 && (
                <p>
                  {files.length}{' '}
                  {language === 'tr'
                    ? 'fotoğraf seçildi.'
                    : 'photographs selected.'}
                </p>
              )}
            </label>
          </div>

          <div className="seller-form-summary">
            <div>
              <span>
                {language === 'tr' ? 'Satış fiyatı' : 'Selling price'}
              </span>
              <strong>{formatMoney(price)}</strong>
            </div>

            <div>
              <span>
                {language === 'tr'
                  ? 'The Glass Worlds komisyonu'
                  : 'The Glass Worlds commission'}
              </span>
              <strong>-{formatMoney(commission)}</strong>
            </div>

            <div>
              <span>
                {language === 'tr'
                  ? 'Tahmini satıcı kazancı'
                  : 'Estimated seller earnings'}
              </span>
              <strong>{formatMoney(sellerEarning)}</strong>
            </div>
          </div>

          <label className="seller-terms">
            <input
              type="checkbox"
              name="terms_accepted"
              checked={form.terms_accepted}
              onChange={handleChange}
            />

            <span>
              {language === 'tr'
                ? 'Ürün bilgilerinin doğru olduğunu, kusurları eksiksiz belirttiğimi ve tamamlanan satıştan %15 hizmet komisyonu alınmasını kabul ediyorum.'
                : 'I confirm that the product information is accurate, all flaws are declared and a 15% service commission will be deducted from a completed sale.'}
            </span>
          </label>

          {error && <p className="seller-error">{error}</p>}
          {status && <p className="seller-success">{status}</p>}

          <motion.button
            className="seller-submit"
            type="submit"
            disabled={submitting}
            whileHover={submitting ? {} : { y: -2 }}
            whileTap={submitting ? {} : { scale: 0.98 }}
          >
            {submitting ? t.submitting : t.submit}
          </motion.button>
        </form>
      </section>

      <section className="seller-faq">
        <div className="seller-section-heading">
          <span>04 — FAQ</span>
          <h2>
            {language === 'tr'
              ? 'Satıcıların merak ettiği sorular'
              : 'Questions sellers often ask'}
          </h2>
        </div>

        <div className="seller-faq-grid">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="seller-footer">
        <AnimatedGlobeLogo />

        <div>
          <strong>The Glass Worlds</strong>
          <p>
            {language === 'tr'
              ? 'Küçük dünyalar ve yeni hikâyeler.'
              : 'Little worlds and new stories.'}
          </p>
        </div>
      </footer>
    </main>
  )
}

export default SellerPage