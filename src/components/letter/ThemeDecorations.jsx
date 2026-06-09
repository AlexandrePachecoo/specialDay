'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Decorações por tema. Cada `kind` renderiza uma camada de fundo
// (atrás do conteúdo) com elementos animados. Posicionamento é
// determinístico (não usa Math.random), pra evitar mismatch SSR/CSR.

const COUNT = 14

function seeded(i, mod = 100) {
  return ((i * 1297 + 31) % mod) / mod
}

export function ThemeDecorations({ kind }) {
  if (!kind || kind === 'none') {
    return <CornerFlourish />
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {kind === 'hearts' && <Hearts />}
      {kind === 'stars' && <Stars />}
      {kind === 'sakura' && <Sakura />}
      {kind === 'confetti' && <Confetti />}
      {kind === 'paper' && <Paper />}
      {kind === 'cupido' && <Cupido />}
      {kind === 'galaxy' && <LoveGalaxy />}
      <CornerFlourish />
    </div>
  )
}

/* ----- corner ornaments (todos os temas) ----- */

function CornerFlourish() {
  return (
    <>
      {[
        { pos: 'left-0 top-0', rotate: 0 },
        { pos: 'right-0 top-0', rotate: 90 },
        { pos: 'right-0 bottom-0', rotate: 180 },
        { pos: 'left-0 bottom-0', rotate: 270 },
      ].map((c) => (
        <svg
          key={c.pos}
          aria-hidden
          viewBox="0 0 120 120"
          className={`pointer-events-none absolute h-24 w-24 sm:h-32 sm:w-32 ${c.pos}`}
          style={{
            color: 'var(--letter-accent-soft, currentColor)',
            opacity: 0.35,
            transform: `rotate(${c.rotate}deg)`,
          }}
        >
          <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <path d="M10 10 Q 38 14, 50 32 T 80 52" />
            <path d="M10 10 Q 22 38, 32 50 T 52 80" />
            <circle cx="50" cy="32" r="2" fill="currentColor" />
            <circle cx="32" cy="50" r="2" fill="currentColor" />
            <circle cx="80" cy="52" r="1.5" fill="currentColor" />
            <circle cx="52" cy="80" r="1.5" fill="currentColor" />
          </g>
        </svg>
      ))}
    </>
  )
}

/* ----- hearts (romantic) ----- */

function Hearts() {
  return (
    <>
      {Array.from({ length: COUNT }).map((_, i) => {
        const x = seeded(i, 100) * 100
        const y = seeded(i + 9, 100) * 100
        const size = 10 + (i % 4) * 6
        const delay = (i * 0.4) % 5
        const duration = 7 + (i % 4)
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              color: 'var(--letter-accent, #e11d74)',
              opacity: 0.18 + (i % 3) * 0.08,
            }}
            animate={{
              y: [0, -16, 0],
              rotate: [0, 8, -6, 0],
              scale: [1, 1.08, 1],
            }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              fill="currentColor"
              d="M12 21s-7-4.5-9.5-9C.5 7.5 4 3 8 3c2 0 3.5 1 4 2 .5-1 2-2 4-2 4 0 7.5 4.5 5.5 9-2.5 4.5-9.5 9-9.5 9z"
            />
          </motion.svg>
        )
      })}
    </>
  )
}

/* ----- stars (dark) ----- */

function Stars() {
  // pontos pra constelação
  const constellation = [
    { x: 15, y: 20 },
    { x: 25, y: 30 },
    { x: 38, y: 28 },
    { x: 48, y: 38 },
    { x: 70, y: 22 },
    { x: 82, y: 35 },
    { x: 72, y: 70 },
    { x: 60, y: 78 },
    { x: 45, y: 72 },
    { x: 25, y: 75 },
    { x: 15, y: 60 },
  ]
  const lines = [
    [0, 1],
    [1, 2],
    [2, 3],
    [4, 5],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
  ]

  return (
    <>
      {/* linhas das constelações */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {lines.map(([a, b], i) => (
          <line
            key={i}
            x1={constellation[a].x}
            y1={constellation[a].y}
            x2={constellation[b].x}
            y2={constellation[b].y}
            stroke="var(--letter-accent-soft, #c4b5fd)"
            strokeWidth="0.08"
            strokeDasharray="0.4 0.8"
            opacity="0.5"
          />
        ))}
      </svg>

      {/* estrelas grandes da constelação */}
      {constellation.map((p, i) => (
        <motion.div
          key={`c-${i}`}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 3 + (i % 3),
            delay: (i * 0.3) % 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg
            viewBox="0 0 16 16"
            width={i % 3 === 0 ? 18 : 12}
            height={i % 3 === 0 ? 18 : 12}
            style={{ filter: 'drop-shadow(0 0 6px var(--letter-accent-glow))' }}
          >
            <path
              d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z"
              fill="var(--letter-accent, #fbbf24)"
            />
          </svg>
        </motion.div>
      ))}

      {/* dust de estrelas pequenas */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = seeded(i + 100, 100) * 100
        const y = seeded(i + 200, 100) * 100
        const size = 1 + (i % 3)
        return (
          <motion.span
            key={`d-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              background: 'var(--letter-accent-soft, white)',
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 2 + (i % 4),
              delay: (i * 0.1) % 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </>
  )
}

/* ----- sakura (anime) ----- */

function Sakura() {
  const PETAL_PATH =
    'M12 2 C 8 6, 6 10, 8 14 C 10 18, 14 18, 16 14 C 18 10, 16 6, 12 2 Z'

  return (
    <>
      {Array.from({ length: 18 }).map((_, i) => {
        const x = seeded(i, 100) * 100
        const startY = -10 - seeded(i + 33, 100) * 30
        const endY = 100 + seeded(i + 77, 100) * 20
        const size = 14 + (i % 5) * 4
        const duration = 14 + (i % 6) * 2
        const delay = (i * 0.5) % 8
        const rotateDir = i % 2 === 0 ? 1 : -1
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{ left: `${x}%`, width: size, height: size }}
            initial={{ top: `${startY}%`, rotate: 0, opacity: 0 }}
            animate={{
              top: `${endY}%`,
              rotate: rotateDir * 720,
              opacity: [0, 0.85, 0.85, 0],
              x: [0, 18, -14, 22, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1],
            }}
          >
            <path
              fill="var(--letter-accent-soft, #fbcfe8)"
              d={PETAL_PATH}
            />
            <circle cx="12" cy="10" r="1.5" fill="var(--letter-accent, #ec4899)" opacity="0.6" />
          </motion.svg>
        )
      })}
    </>
  )
}

/* ----- confetti (birthday) ----- */

function Confetti() {
  const colors = ['#dc2626', '#fbbf24', '#10b981', '#3b82f6', '#a855f7', '#fb7185']
  const shapes = ['rect', 'circle', 'triangle', 'rect']

  return (
    <>
      {Array.from({ length: 24 }).map((_, i) => {
        const x = seeded(i, 100) * 100
        const startY = -15 - seeded(i + 17, 100) * 20
        const endY = 100 + seeded(i + 41, 100) * 15
        const size = 6 + (i % 4) * 3
        const duration = 10 + (i % 5) * 2
        const delay = (i * 0.3) % 6
        const color = colors[i % colors.length]
        const shape = shapes[i % shapes.length]
        const rotateDir = i % 2 === 0 ? 1 : -1

        return (
          <motion.svg
            key={i}
            viewBox="0 0 12 12"
            className="absolute"
            style={{ left: `${x}%`, width: size, height: size }}
            initial={{ top: `${startY}%`, rotate: 0, opacity: 0 }}
            animate={{
              top: `${endY}%`,
              rotate: rotateDir * 540,
              opacity: [0, 0.9, 0.9, 0],
              x: [0, 14, -10, 18, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1],
            }}
          >
            {shape === 'rect' && <rect width="12" height="6" y="3" fill={color} rx="1" />}
            {shape === 'circle' && <circle cx="6" cy="6" r="5" fill={color} />}
            {shape === 'triangle' && (
              <polygon points="6,1 11,11 1,11" fill={color} />
            )}
          </motion.svg>
        )
      })}
    </>
  )
}

/* ----- paper (vintage) ----- */

function Paper() {
  return (
    <>
      {/* grain de papel */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.35,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(122,92,57,0.22) 0, transparent 55%), radial-gradient(circle at 80% 70%, rgba(122,92,57,0.18) 0, transparent 55%), radial-gradient(circle at 50% 90%, rgba(122,92,57,0.15) 0, transparent 50%)',
        }}
      />
      {/* manchas de tempo */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = seeded(i + 5, 100) * 100
        const y = seeded(i + 11, 100) * 100
        const size = 30 + (i % 4) * 20
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              background:
                'radial-gradient(circle, rgba(122,92,57,0.12) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}
    </>
  )
}

/* ----- interação compartilhada (cursor + clique) -----
   Captura mouse/toque na window e converte pra coords relativas
   ao container da decoração. Usado pelos temas interativos. */

const HEART_PATH =
  'M12 21s-7-4.5-9.5-9C.5 7.5 4 3 8 3c2 0 3.5 1 4 2 .5-1 2-2 4-2 4 0 7.5 4.5 5.5 9-2.5 4.5-9.5 9-9.5 9z'

function useInteraction(ref) {
  const [cursor, setCursor] = useState({ x: -200, y: -200, active: false })
  const [bursts, setBursts] = useState([])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0

    const toLocal = (clientX, clientY) => {
      const r = el.getBoundingClientRect()
      return { x: clientX - r.left, y: clientY - r.top }
    }

    const onMove = (e) => {
      const point = 'touches' in e ? e.touches[0] : e
      if (!point) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const { x, y } = toLocal(point.clientX, point.clientY)
        setCursor({ x, y, active: true })
      })
    }

    const onLeave = () => setCursor((c) => ({ ...c, active: false }))

    const onClick = (e) => {
      const point = 'changedTouches' in e ? e.changedTouches[0] : e
      if (!point) return
      const { x, y } = toLocal(point.clientX, point.clientY)
      const id = `${Date.now()}-${Math.round(x)}-${Math.round(y)}`
      setBursts((b) => [...b, { id, x, y }])
      window.setTimeout(
        () => setBursts((b) => b.filter((it) => it.id !== id)),
        1100
      )
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('mouseleave', onLeave)
    window.addEventListener('click', onClick)
    window.addEventListener('touchend', onClick, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('click', onClick)
      window.removeEventListener('touchend', onClick)
      cancelAnimationFrame(raf)
    }
  }, [ref])

  return { cursor, bursts }
}

/* explosão de corações a partir de um ponto (clique/toque) */
function HeartBurst({ x, y, accent = 'var(--letter-accent)' }) {
  const pieces = Array.from({ length: 10 })
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * Math.PI * 2
        const dist = 48 + (i % 3) * 22
        const size = 12 + (i % 3) * 6
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              width: size,
              height: size,
              color: accent,
              filter: 'drop-shadow(0 0 6px var(--letter-accent-glow))',
            }}
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist - 14,
              scale: [0.2, 1.1, 0.6],
              opacity: [1, 1, 0],
              rotate: (i % 2 ? 1 : -1) * 40,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <path fill="currentColor" d={HEART_PATH} />
          </motion.svg>
        )
      })}
    </div>
  )
}

/* ----- cupido (interativo: corações sobem + seguem o cursor) ----- */

function Cupido() {
  const ref = useRef(null)
  const { cursor, bursts } = useInteraction(ref)

  return (
    <div ref={ref} className="absolute inset-0">
      {/* halo radial pulsante ao fundo */}
      <motion.div
        className="absolute left-1/2 top-1/3 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, var(--letter-accent-glow) 0%, transparent 65%)',
          opacity: 0.5,
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* corações de bokeh subindo */}
      {Array.from({ length: 18 }).map((_, i) => {
        const x = seeded(i, 100) * 100
        const size = 14 + (i % 5) * 10
        const duration = 9 + (i % 5) * 2
        const delay = (i * 0.6) % 9
        const blur = (i % 3) * 1.4
        return (
          <motion.svg
            key={i}
            viewBox="0 0 24 24"
            className="absolute"
            style={{
              left: `${x}%`,
              width: size,
              height: size,
              color: 'var(--letter-accent)',
              filter: `blur(${blur}px) drop-shadow(0 0 8px var(--letter-accent-glow))`,
              opacity: 0.22 + (i % 3) * 0.12,
            }}
            initial={{ top: '110%', rotate: 0 }}
            animate={{
              top: '-15%',
              rotate: (i % 2 ? 1 : -1) * 24,
              x: [0, 16, -12, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'easeIn',
            }}
          >
            <path fill="currentColor" d={HEART_PATH} />
          </motion.svg>
        )
      })}

      {/* coração que segue o cursor */}
      <motion.svg
        viewBox="0 0 24 24"
        className="absolute"
        style={{
          width: 30,
          height: 30,
          color: 'var(--letter-accent)',
          filter: 'drop-shadow(0 0 12px var(--letter-accent-glow))',
          marginLeft: -15,
          marginTop: -15,
        }}
        animate={{
          left: cursor.x,
          top: cursor.y,
          opacity: cursor.active ? 0.9 : 0,
          scale: cursor.active ? [1, 1.18, 1] : 0.6,
        }}
        transition={{
          left: { type: 'spring', stiffness: 120, damping: 16 },
          top: { type: 'spring', stiffness: 120, damping: 16 },
          scale: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 0.3 },
        }}
      >
        <path fill="currentColor" d={HEART_PATH} />
      </motion.svg>

      {/* explosões no clique/toque */}
      <AnimatePresence>
        {bursts.map((b) => (
          <HeartBurst key={b.id} x={b.x} y={b.y} />
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ----- galáxia do amor (interativo: parallax + estrelas cadentes) ----- */

function LoveGalaxy() {
  const ref = useRef(null)
  const { cursor, bursts } = useInteraction(ref)

  // offset de parallax normalizado (-1..1) a partir do centro
  const px = ref.current
    ? (cursor.x / ref.current.clientWidth - 0.5) * 2
    : 0
  const py = ref.current
    ? (cursor.y / ref.current.clientHeight - 0.5) * 2
    : 0

  // constelação em forma de coração (curva paramétrica)
  const heartPts = Array.from({ length: 12 }).map((_, i) => {
    const t = (i / 12) * Math.PI * 2
    const hx = 16 * Math.sin(t) ** 3
    const hy =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    return { x: 50 + hx * 1.5, y: 42 - hy * 1.5 }
  })

  return (
    <div ref={ref} className="absolute inset-0">
      {/* nebulosa / aurora ondulante */}
      {[
        { c: 'var(--letter-accent-glow)', s: 70, x: 25, y: 28, d: 14 },
        {
          c: 'rgba(168,85,247,0.35)',
          s: 80,
          x: 75,
          y: 62,
          d: 18,
        },
        { c: 'rgba(99,102,241,0.3)', s: 60, x: 55, y: 20, d: 16 },
      ].map((n, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: `${n.s}vmin`,
            height: `${n.s}vmin`,
            background: `radial-gradient(circle, ${n.c} 0%, transparent 60%)`,
            transform: `translate(-50%, -50%) translate(${px * (i + 1) * 6}px, ${py * (i + 1) * 6}px)`,
            filter: 'blur(8px)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{
            duration: n.d,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* poeira estelar com parallax */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = seeded(i + 100, 100) * 100
        const y = seeded(i + 200, 100) * 100
        const size = 1 + (i % 3)
        const depth = 1 + (i % 4)
        return (
          <motion.span
            key={`d-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              background: 'var(--letter-accent-soft, #fff)',
              transform: `translate(${px * depth * 4}px, ${py * depth * 4}px)`,
            }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{
              duration: 2 + (i % 4),
              delay: (i * 0.1) % 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}

      {/* constelação de coração */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{
          transform: `translate(${px * 8}px, ${py * 8}px)`,
        }}
      >
        {heartPts.map((p, i) => {
          const next = heartPts[(i + 1) % heartPts.length]
          return (
            <line
              key={`l-${i}`}
              x1={p.x}
              y1={p.y}
              x2={next.x}
              y2={next.y}
              stroke="var(--letter-accent-soft)"
              strokeWidth="0.12"
              strokeDasharray="0.5 0.9"
              opacity="0.45"
            />
          )
        })}
      </svg>
      {heartPts.map((p, i) => (
        <motion.div
          key={`hp-${i}`}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `translate(-50%, -50%) translate(${px * 8}px, ${py * 8}px)`,
          }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1.15, 0.85] }}
          transition={{
            duration: 2.6 + (i % 3),
            delay: (i * 0.25) % 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg
            viewBox="0 0 16 16"
            width={i % 4 === 0 ? 16 : 10}
            height={i % 4 === 0 ? 16 : 10}
            style={{ filter: 'drop-shadow(0 0 6px var(--letter-accent-glow))' }}
          >
            <path
              d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z"
              fill="var(--letter-accent)"
            />
          </svg>
        </motion.div>
      ))}

      {/* estrelas cadentes periódicas */}
      {Array.from({ length: 4 }).map((_, i) => {
        const startX = 10 + i * 22
        const delay = 2 + i * 3.5
        return (
          <motion.div
            key={`shoot-${i}`}
            className="absolute h-px"
            style={{
              left: `${startX}%`,
              top: `${5 + (i % 3) * 10}%`,
              width: '14vmin',
              background:
                'linear-gradient(90deg, transparent, var(--letter-accent-soft), #fff)',
              transformOrigin: 'left center',
              rotate: '32deg',
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: ['0vmin', '40vmin'],
              y: ['0vmin', '26vmin'],
            }}
            transition={{
              duration: 1.2,
              delay,
              repeat: Infinity,
              repeatDelay: 9,
              ease: 'easeIn',
            }}
          />
        )
      })}

      {/* brilho que segue o cursor */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          marginLeft: -60,
          marginTop: -60,
          background:
            'radial-gradient(circle, var(--letter-accent-glow) 0%, transparent 70%)',
        }}
        animate={{
          left: cursor.x,
          top: cursor.y,
          opacity: cursor.active ? 0.8 : 0,
        }}
        transition={{
          left: { type: 'spring', stiffness: 90, damping: 18 },
          top: { type: 'spring', stiffness: 90, damping: 18 },
          opacity: { duration: 0.4 },
        }}
      />

      {/* explosões de estrelas/corações no clique */}
      <AnimatePresence>
        {bursts.map((b) => (
          <HeartBurst key={b.id} x={b.x} y={b.y} accent="var(--letter-accent-soft)" />
        ))}
      </AnimatePresence>
    </div>
  )
}
