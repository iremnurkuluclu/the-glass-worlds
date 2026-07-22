import { motion } from 'framer-motion'
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
  return (
    <main className="page">
      <nav className="navbar">
        <div className="brand">
          <span className="brand-icon">*</span>
          <span>The Glass Worlds</span>
        </div>

        <div className="nav-links">
          <a href="#process">The process</a>
          <a href="#gallery">Gallery</a>
          <a href="#details">Workshop details</a>
        </div>

        <motion.button
          className="book-button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
        >
          Book a seat
        </motion.button>
      </nav>

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
      </footer>    </main>
  )
}
export default App
