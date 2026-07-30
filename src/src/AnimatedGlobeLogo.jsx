import { motion } from 'framer-motion'

export default function AnimatedGlobeLogo({ compact = false }) {
  const scale = compact ? .82 : 1
  const flakes = [
    { top: '2px', left: '8px', size: '8px' },
    { top: '7px', right: '5px', size: '7px' },
    { top: '14px', left: '18px', size: '8px' },
    { bottom: '5px', left: '9px', size: '7px' },
    { bottom: '3px', right: '8px', size: '6px' },
  ]

  return (
    <span className="animated-brand-globe" style={{ transform: `scale(${scale})` }} aria-hidden="true">
      <span className="animated-brand-dome">
        <motion.span
          className="animated-brand-snow"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
        >
          {flakes.map((flake, index) => (
            <i key={index} style={{ ...flake, fontSize: flake.size }}>*</i>
          ))}
        </motion.span>
      </span>
      <span className="animated-brand-base" />
    </span>
  )
}
