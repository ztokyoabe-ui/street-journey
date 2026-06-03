import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'

// ─────────────────────────────────────────────
// カラーテーマ定数
// ─────────────────────────────────────────────
const C = {
  base: '#f7f9f8',
  accent: '#2a9d8f',
  accentDark: '#1f7d72',
  text: '#1a2420',
  sub: '#6b8880',
  card: '#ffffff',
  border: '#dde8e5',
}

// ─────────────────────────────────────────────
// Travel Mode SVG アイコン（size='sm'|'lg'）
// ─────────────────────────────────────────────
function WalkIcon({ size = 'sm', active = false }) {
  const s = size === 'lg' ? 32 : 20
  const color = active ? '#ffffff' : C.accent
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="4" r="2" fill={color} />
      <path d="M10 8.5L8 14l2 1.5-1.5 5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M14 8.5L16 14l-2 1.5 1.5 5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M8.5 11h7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function BikeIcon({ size = 'sm', active = false }) {
  const s = size === 'lg' ? 32 : 20
  const color = active ? '#ffffff' : C.accent
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="16" r="3" stroke={color} strokeWidth="1.8" />
      <circle cx="18.5" cy="16" r="3" stroke={color} strokeWidth="1.8" />
      <path d="M5.5 16L10 9h4l2 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 9l4.5 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14" cy="5.5" r="1.5" fill={color} />
      <path d="M12 7l2-1.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function DriveIcon({ size = 'sm', active = false }) {
  const s = size === 'lg' ? 32 : 20
  const color = active ? '#ffffff' : C.accent
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 11l2.5-5h9L19 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="11" width="18" height="7" rx="2" stroke={color} strokeWidth="1.8" />
      <circle cx="7" cy="18" r="2" fill={color} />
      <circle cx="17" cy="18" r="2" fill={color} />
      <path d="M3 14h18" stroke={color} strokeWidth="1.2" />
    </svg>
  )
}

// ─────────────────────────────────────────────
// L字フローティングアイコン（rAF制御 6462ms/周）
// ─────────────────────────────────────────────
const ANIM_DURATION = 6462

// フェーズ定義
// Phase A: x=490→300, y=260 (水平左移動)
// Phase B: x=300, y=260→108 (垂直上昇)
// Phase C: x=300→-60, y=108 (水平左移動して消える)
const phaseA = { xStart: 490, xEnd: 300, y: 260, dur: 0.35 }
const phaseB = { x: 300, yStart: 260, yEnd: 108, dur: 0.25 }
const phaseC = { xStart: 300, xEnd: -60, y: 108, dur: 0.40 }

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function FloatingIcon() {
  const posRef = useRef({ x: phaseA.xStart, y: phaseA.y, opacity: 1 })
  const elRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const tick = useCallback((ts) => {
    if (!startRef.current) startRef.current = ts
    const elapsed = (ts - startRef.current) % ANIM_DURATION
    const t = elapsed / ANIM_DURATION // 0..1

    let x, y, opacity
    const thA = phaseA.dur
    const thB = thA + phaseB.dur

    if (t < thA) {
      // Phase A
      const p = easeInOut(t / thA)
      x = phaseA.xStart + (phaseA.xEnd - phaseA.xStart) * p
      y = phaseA.y
      opacity = 1
    } else if (t < thB) {
      // Phase B
      const p = easeInOut((t - thA) / phaseB.dur)
      x = phaseB.x
      y = phaseB.yStart + (phaseB.yEnd - phaseB.yStart) * p
      opacity = 1
    } else {
      // Phase C
      const p = easeInOut((t - thB) / phaseC.dur)
      x = phaseC.xStart + (phaseC.xEnd - phaseC.xStart) * p
      y = phaseC.y
      // フェードアウト後半
      opacity = p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1
    }

    if (elRef.current) {
      elRef.current.style.transform = `translate(${x}px, ${y}px)`
      elRef.current.style.opacity = opacity
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  return (
    <div
      ref={elRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    >
      {/* L字パスの軌跡ガイド（薄く表示） */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="6" y="6" width="24" height="24" rx="6" fill={C.accent} opacity="0.12" />
        <path
          d="M18 10 L26 10 L26 26 L10 26"
          stroke={C.accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        />
        <circle cx="26" cy="18" r="3" fill={C.accent} opacity="0.9" />
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────
// RouteカードUI（Autocomplete付き入力）
// ─────────────────────────────────────────────
function RouteCard({ from, to, onFromChange, onToChange }) {
  return (
    <div style={{
      background: C.card,
      border: `1.5px solid ${C.border}`,
      borderRadius: 16,
      padding: '20px 20px 16px',
      marginBottom: 12,
    }}>
      <div style={{
        fontSize: 10,
        fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.12em',
        color: C.sub,
        marginBottom: 14,
        textTransform: 'uppercase',
      }}>
        Route / ルート
      </div>

      {/* FROM */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 10, color: C.sub, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
          FROM
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}>📍</span>
          <input
            type="text"
            value={from}
            onChange={e => onFromChange(e.target.value)}
            placeholder="出発地 / Start location"
            style={{
              width: '100%',
              padding: '10px 12px 10px 34px',
              border: `1.5px solid ${C.border}`,
              borderRadius: 10,
              fontSize: 13,
              fontFamily: "'DM Mono', monospace",
              color: C.text,
              background: C.base,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* 矢印 */}
      <div style={{ textAlign: 'center', margin: '4px 0', color: C.sub, fontSize: 16 }}>↓</div>

      {/* TO */}
      <div>
        <label style={{ fontSize: 10, color: C.sub, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
          TO
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13 }}>🏁</span>
          <input
            type="text"
            value={to}
            onChange={e => onToChange(e.target.value)}
            placeholder="目的地 / Destination"
            style={{
              width: '100%',
              padding: '10px 12px 10px 34px',
              border: `1.5px solid ${C.border}`,
              borderRadius: 10,
              fontSize: 13,
              fontFamily: "'DM Mono', monospace",
              color: C.text,
              background: C.base,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 10, color: C.sub, fontFamily: "'DM Mono', monospace" }}>
        日本語・英語・住所・施設名対応
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Travel Mode カード
// ─────────────────────────────────────────────
const MODES = [
  { key: 'walk', label: 'Walk', labelJa: '徒歩', Icon: WalkIcon },
  { key: 'bike', label: 'Bike', labelJa: '自転車', Icon: BikeIcon },
  { key: 'drive', label: 'Drive', labelJa: '車', Icon: DriveIcon },
]

function TravelModeCard({ mode, onModeChange }) {
  return (
    <div style={{
      background: C.card,
      border: `1.5px solid ${C.border}`,
      borderRadius: 16,
      padding: '20px 20px 16px',
      marginBottom: 20,
    }}>
      <div style={{
        fontSize: 10,
        fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.12em',
        color: C.sub,
        marginBottom: 14,
        textTransform: 'uppercase',
      }}>
        Travel Mode / 移動手段
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {MODES.map(({ key, label, labelJa, Icon }) => {
          const active = mode === key
          return (
            <button
              key={key}
              onClick={() => onModeChange(key)}
              style={{
                flex: 1,
                padding: '14px 8px',
                border: `1.5px solid ${active ? C.accent : C.border}`,
                borderRadius: 12,
                background: active ? C.accent : C.base,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size="lg" active={active} />
              <div>
                <div style={{
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 600,
                  color: active ? '#ffffff' : C.text,
                  letterSpacing: '0.05em',
                }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 9,
                  color: active ? 'rgba(255,255,255,0.8)' : C.sub,
                  marginTop: 2,
                }}>
                  {labelJa}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Top Screen
// ─────────────────────────────────────────────
function TopScreen({ onStart }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [mode, setMode] = useState('walk')

  const canStart = from.trim() && to.trim()

  return (
    <div style={{
      minHeight: '100vh',
      background: C.base,
      display: 'flex',
      flexDirection: 'column',
      padding: '0 0 40px',
    }}>
      {/* ヘッダー */}
      <header style={{
        padding: '20px 24px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.2em',
          color: C.accent,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          Street Journey
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9,
          color: C.sub,
          background: `${C.accent}18`,
          padding: '3px 8px',
          borderRadius: 20,
          border: `1px solid ${C.accent}30`,
          letterSpacing: '0.1em',
        }}>
          BETA v3
        </div>
      </header>

      {/* ヒーローセクション */}
      <div style={{
        padding: '32px 24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* ヒーローコピー左 */}
        <div style={{ flex: 1, paddingRight: 16 }}>
          <h1 style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 26,
            lineHeight: 1.45,
            color: C.text,
            margin: 0,
            marginBottom: 10,
            fontWeight: 600,
          }}>
            行きたい場所へ、<br />すぐ行こう。
          </h1>
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: C.sub,
            letterSpacing: '0.05em',
            lineHeight: 1.6,
            margin: 0,
          }}>
            Go anywhere.<br />Right now.
          </p>
        </div>

        {/* 右側: フローティングL字アイコンアニメーション */}
        <div style={{
          width: 120,
          height: 100,
          position: 'relative',
          flexShrink: 0,
          overflow: 'visible',
        }}>
          {/* L字パスの静的ガイドライン */}
          <svg
            width="120"
            height="100"
            viewBox="0 0 120 100"
            fill="none"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* 水平線A（右→中） */}
            <line x1="110" y1="72" x2="60" y2="72" stroke={C.accent} strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="4 3" />
            {/* 垂直線B（下→上） */}
            <line x1="60" y1="72" x2="60" y2="18" stroke={C.accent} strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="4 3" />
            {/* 水平線C（中→左消え） */}
            <line x1="60" y1="18" x2="0" y2="18" stroke={C.accent} strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="4 3" />
            {/* 折れ点マーク */}
            <circle cx="60" cy="72" r="3" fill={C.accent} fillOpacity="0.3" />
            <circle cx="60" cy="18" r="3" fill={C.accent} fillOpacity="0.3" />
          </svg>

          {/* アニメーションアイコン（座標はコンテナ相対に換算） */}
          <FloatingIconLocal />
        </div>
      </div>

      {/* コンテンツ */}
      <div style={{ padding: '0 20px', flex: 1 }}>
        <RouteCard
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
        <TravelModeCard mode={mode} onModeChange={setMode} />

        {/* STARTボタン */}
        <button
          onClick={() => canStart && onStart({ from, to, mode })}
          disabled={!canStart}
          style={{
            width: '100%',
            padding: '18px',
            background: canStart ? C.accent : C.border,
            color: canStart ? '#ffffff' : C.sub,
            border: 'none',
            borderRadius: 14,
            fontSize: 14,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 700,
            letterSpacing: '0.15em',
            cursor: canStart ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span>▶</span>
          <span>JOURNEY START</span>
        </button>
        <div style={{
          textAlign: 'center',
          marginTop: 8,
          fontSize: 9,
          color: C.sub,
          fontFamily: "'DM Mono', monospace",
        }}>
          旅を始める
        </div>
      </div>
    </div>
  )
}

// コンテナ相対座標に換算したフローティングアイコン（120×100px内）
// 元の仕様座標: x=490→300, y=260 → コンテナ比率で換算
function FloatingIconLocal() {
  const elRef = useRef(null)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  // コンテナ(120×100)に合わせたフェーズ定義
  // 全体の仕様座標(550wide×280tall)を120×100に縮小
  const scaleX = 120 / 550
  const scaleY = 100 / 280

  const lA = {
    xStart: 490 * scaleX, xEnd: 300 * scaleX,
    y: 260 * scaleY, dur: 0.35,
  }
  const lB = {
    x: 300 * scaleX, yStart: 260 * scaleY, yEnd: 108 * scaleY,
    dur: 0.25,
  }
  const lC = {
    xStart: 300 * scaleX, xEnd: -20,
    y: 108 * scaleY, dur: 0.40,
  }

  const tick = useCallback((ts) => {
    if (!startRef.current) startRef.current = ts
    const elapsed = (ts - startRef.current) % ANIM_DURATION
    const t = elapsed / ANIM_DURATION
    const thA = lA.dur
    const thB = thA + lB.dur

    let x, y, opacity
    if (t < thA) {
      const p = easeInOut(t / thA)
      x = lA.xStart + (lA.xEnd - lA.xStart) * p
      y = lA.y
      opacity = 1
    } else if (t < thB) {
      const p = easeInOut((t - thA) / lB.dur)
      x = lB.x
      y = lB.yStart + (lB.yEnd - lB.yStart) * p
      opacity = 1
    } else {
      const p = easeInOut((t - thB) / lC.dur)
      x = lC.xStart + (lC.xEnd - lC.xStart) * p
      y = lC.y
      opacity = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1
    }

    if (elRef.current) {
      elRef.current.style.transform = `translate(${x - 12}px, ${y - 12}px)`
      elRef.current.style.opacity = opacity
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [lA.dur, lA.xStart, lA.xEnd, lA.y, lB.dur, lB.x, lB.yStart, lB.yEnd, lC.dur, lC.xStart, lC.xEnd, lC.y])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  return (
    <div ref={elRef} style={{
      position: 'absolute',
      top: 0, left: 0,
      pointerEvents: 'none',
      willChange: 'transform, opacity',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" fill={C.accent} opacity="0.15" />
        <path d="M12 6 L18 6 L18 18 L6 18" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="12" r="2.5" fill={C.accent} />
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────
// Viewer Screen（Street View表示画面）
// ─────────────────────────────────────────────
function ViewerScreen({ journey, onBack }) {
  // 昼夜判定：6〜18時が昼
  const getIsDay = () => {
    const h = new Date().getHours()
    return h >= 6 && h < 18
  }

  const [isDay, setIsDay] = useState(getIsDay)
  const [manualOverride, setManualOverride] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const toggleDayNight = () => {
    setTransitioning(true)
    setTimeout(() => {
      setIsDay(v => !v)
      setManualOverride(true)
      setTransitioning(false)
    }, 300)
  }

  // 自動判定（手動上書きなし時のみ）
  useEffect(() => {
    if (manualOverride) return
    const id = setInterval(() => {
      setIsDay(getIsDay())
    }, 60000)
    return () => clearInterval(id)
  }, [manualOverride])

  const nightBg = '#0a0e12'

  return (
    <div style={{
      minHeight: '100vh',
      background: isDay ? C.base : nightBg,
      transition: 'background 0.6s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 夜: 星・月 */}
      {!isDay && <NightSky />}

      {/* ヘッダー */}
      <header style={{
        padding: '20px 20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: `1.5px solid ${isDay ? C.border : '#2a3a4a'}`,
            borderRadius: 10,
            padding: '8px 14px',
            color: isDay ? C.text : '#8aa8c0',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            cursor: 'pointer',
            letterSpacing: '0.08em',
          }}
        >
          ← Back
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: isDay ? C.sub : '#4a6a8a',
            letterSpacing: '0.15em',
          }}>
            JOURNEY
          </div>
          <div style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 13,
            color: isDay ? C.text : '#c0d8f0',
            marginTop: 2,
          }}>
            {journey.from} → {journey.to}
          </div>
        </div>

        {/* 昼夜トグル */}
        <button
          onClick={toggleDayNight}
          style={{
            background: isDay ? '#fff8e0' : '#1a2a3a',
            border: `1.5px solid ${isDay ? '#e8d870' : '#2a4a6a'}`,
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 16,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {isDay ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Street Viewエリア（プレースホルダー） */}
      <div style={{
        margin: '20px',
        height: 240,
        background: isDay
          ? 'linear-gradient(180deg, #b8d4c8 0%, #8cb8a8 40%, #6a9e90 100%)'
          : 'linear-gradient(180deg, #0d1a26 0%, #1a2a3a 50%, #243040 100%)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1.5px solid ${isDay ? C.border : '#1a2a3a'}`,
        transition: 'all 0.6s ease',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          textAlign: 'center',
          color: isDay ? 'rgba(255,255,255,0.7)' : 'rgba(180,210,240,0.5)',
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.1em',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>
            {isDay ? '🏙️' : '🌃'}
          </div>
          Street View
          <div style={{ fontSize: 9, marginTop: 4, opacity: 0.6 }}>
            Google Maps API required
          </div>
        </div>

        {/* 道路線 */}
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 60 }}
          viewBox="0 0 400 60" preserveAspectRatio="none"
        >
          <path
            d="M0 60 L120 20 L280 20 L400 60"
            fill={isDay ? 'rgba(100,80,60,0.3)' : 'rgba(20,30,40,0.6)'}
          />
          <line x1="200" y1="20" x2="200" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="8 6" />
        </svg>
      </div>

      {/* 旅情報カード */}
      <div style={{
        margin: '0 20px',
        padding: '16px 18px',
        background: isDay ? C.card : '#111e2a',
        border: `1.5px solid ${isDay ? C.border : '#1e2e3e'}`,
        borderRadius: 14,
        transition: 'all 0.6s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              color: isDay ? C.sub : '#4a6a8a',
              letterSpacing: '0.1em',
              marginBottom: 4,
            }}>
              TRAVEL MODE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {journey.mode === 'walk' && <WalkIcon active={false} />}
              {journey.mode === 'bike' && <BikeIcon active={false} />}
              {journey.mode === 'drive' && <DriveIcon active={false} />}
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: isDay ? C.text : '#8ab0d0',
                textTransform: 'capitalize',
              }}>
                {journey.mode}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              color: isDay ? C.sub : '#4a6a8a',
              letterSpacing: '0.1em',
              marginBottom: 4,
            }}>
              TIME
            </div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 14,
              color: isDay ? C.accent : '#60a0c0',
            }}>
              {isDay ? '☀️' : '🌙'} {isDay ? 'Day' : 'Night'}
            </div>
          </div>
        </div>
      </div>

      {/* コントロールバー */}
      <div style={{
        margin: '12px 20px 0',
        display: 'flex',
        gap: 10,
      }}>
        {['⏮', '⏪', '▶', '⏩', '⏭'].map((icon, i) => (
          <button
            key={i}
            style={{
              flex: 1,
              padding: '12px 4px',
              background: isDay ? C.card : '#111e2a',
              border: `1.5px solid ${isDay ? C.border : '#1e2e3e'}`,
              borderRadius: 10,
              fontSize: 14,
              cursor: 'pointer',
              color: isDay ? C.text : '#8ab0d0',
              transition: 'all 0.3s ease',
            }}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 夜空（星・月）コンポーネント
// ─────────────────────────────────────────────
function NightSky() {
  const stars = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 60,
      r: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 3,
    }))
  ).current

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: '60%',
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {/* 月 */}
        <circle cx="82" cy="14" r="6" fill="#f0d080" opacity="0.9" />
        <circle cx="85" cy="12" r="5" fill="#0a0e12" />

        {/* 星 */}
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity="0.7">
            <animate
              attributeName="opacity"
              values="0.3;0.9;0.3"
              dur={`${2 + s.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────
// メインページ
// ─────────────────────────────────────────────
export default function Home() {
  const [screen, setScreen] = useState('top') // 'top' | 'viewer'
  const [journey, setJourney] = useState(null)

  const handleStart = (j) => {
    setJourney(j)
    setScreen('viewer')
  }

  const handleBack = () => {
    setScreen('top')
    setJourney(null)
  }

  return (
    <>
      <Head>
        <title>Street Journey</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="擬似旅行タイムラプスアプリ / Virtual Travel Timelapse" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Shippori+Mincho:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div style={{
        maxWidth: 540,
        margin: '0 auto',
        position: 'relative',
        fontFamily: "'DM Mono', monospace",
      }}>
        {screen === 'top' && (
          <TopScreen onStart={handleStart} />
        )}
        {screen === 'viewer' && journey && (
          <ViewerScreen journey={journey} onBack={handleBack} />
        )}
      </div>
    </>
  )
}
