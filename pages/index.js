import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

// ── THEME ──────────────────────────────────────────────────────────
const light = {
  bg: '#f7f9f8',
  surface: 'rgba(255,255,255,0.72)',
  surfaceBorder: 'rgba(180,210,200,0.35)',
  text: '#1a2420',
  textSub: '#6b8880',
  textMuted: '#a0b8b0',
  accent: '#2a9d8f',
  accentLight: '#4fc3b4',
  accentBg: 'rgba(42,157,143,0.10)',
  green: '#6dbf9e',
  gold: '#e9c46a',
  danger: '#e76f51',
  vBg: '#f7f9f8',
  vHeader: 'rgba(247,249,248,0.92)',
  vHeaderBorder: 'rgba(180,210,200,0.3)',
  vText: '#1a2420',
  vTextSub: '#6b8880',
  vTextMuted: '#a0b8b0',
  vBottom: '#ffffff',
  vBottomBorder: 'rgba(180,210,200,0.3)',
  vScrubTrack: 'rgba(42,157,143,0.12)',
  vThumb: '#2a9d8f',
  vCtrl: '#6b8880',
  vCtrlMainBg: '#2a9d8f',
  vCtrlMainShadow: 'rgba(42,157,143,0.30)',
  vSpeedBorder: 'rgba(42,157,143,0.2)',
  vSpeedText: '#a0b8b0',
  vSpeedActiveBg: 'rgba(42,157,143,0.10)',
  vSpeedActiveBorder: '#2a9d8f',
  vSpeedActiveText: '#2a9d8f',
  vProgressText: '#1a2420',
  vProgressSub: '#a0b8b0',
  minimapBg: '#ddf0ec',
  minimapBorder: 'rgba(42,157,143,0.25)',
  svLabel: 'rgba(42,157,143,0.6)',
  svLabelBorder: 'rgba(42,157,143,0.2)',
  svCoords: '#a0b8b0',
};

const dark = {
  bg: '#0d1512',
  surface: 'rgba(255,255,255,0.05)',
  surfaceBorder: 'rgba(42,157,143,0.15)',
  text: '#e8f2f0',
  textSub: '#6b8880',
  textMuted: '#3a5550',
  accent: '#2a9d8f',
  accentLight: '#4fc3b4',
  accentBg: 'rgba(42,157,143,0.10)',
  green: '#4a9e80',
  gold: '#e9c46a',
  danger: '#e76f51',
  vBg: '#0d1512',
  vHeader: 'rgba(13,21,18,0.92)',
  vHeaderBorder: 'rgba(42,157,143,0.1)',
  vText: 'rgba(255,255,255,0.88)',
  vTextSub: 'rgba(255,255,255,0.35)',
  vTextMuted: 'rgba(255,255,255,0.22)',
  vBottom: '#0d1512',
  vBottomBorder: 'rgba(42,157,143,0.08)',
  vScrubTrack: 'rgba(255,255,255,0.10)',
  vThumb: '#ffffff',
  vCtrl: 'rgba(255,255,255,0.40)',
  vCtrlMainBg: '#2a9d8f',
  vCtrlMainShadow: 'rgba(42,157,143,0.40)',
  vSpeedBorder: 'rgba(255,255,255,0.12)',
  vSpeedText: 'rgba(255,255,255,0.38)',
  vSpeedActiveBg: 'rgba(42,157,143,0.12)',
  vSpeedActiveBorder: '#2a9d8f',
  vSpeedActiveText: '#4fc3b4',
  vProgressText: 'rgba(255,255,255,0.85)',
  vProgressSub: 'rgba(255,255,255,0.28)',
  minimapBg: '#122018',
  minimapBorder: 'rgba(42,157,143,0.3)',
  svLabel: 'rgba(255,255,255,0.28)',
  svLabelBorder: 'rgba(255,255,255,0.1)',
  svCoords: 'rgba(255,255,255,0.32)',
};

function getDayFlag() {
  const h = new Date().getHours();
  return h >= 6 && h < 18;
}

// ── ICONS (small/large, with animation on large) ──────────────────
const WalkIcon = ({ color, size = 'small' }) => {
  const s = size === 'large';
  const w = s ? 36 : 20, h = s ? 52 : 22;
  const vb = s ? '0 0 36 52' : '0 0 20 22';
  const r = s ? 4 : 2, cx = s ? 18 : 10, cy = s ? 6 : 3.5;
  const sw = s ? 2.5 : 1.7, sw2 = s ? 2 : 1.5;
  const dur = '0.55s';
  if (s) return (
    <svg width={w} height={h} viewBox={vb} fill="none" overflow="visible">
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <line x1="18" y1="10" x2="18" y2="28" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <g style={{ transformOrigin: '18px 28px', animation: `walk-leg-f ${dur} ease-in-out infinite` }}>
        <line x1="18" y1="28" x2="13" y2="40" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1="13" y1="40" x2="10" y2="48" stroke={color} strokeWidth={sw2} strokeLinecap="round" />
      </g>
      <g style={{ transformOrigin: '18px 28px', animation: `walk-leg-b ${dur} ease-in-out infinite` }}>
        <line x1="18" y1="28" x2="23" y2="40" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        <line x1="23" y1="40" x2="26" y2="48" stroke={color} strokeWidth={sw2} strokeLinecap="round" />
      </g>
      <g style={{ transformOrigin: '18px 13px', animation: `walk-arm-f ${dur} ease-in-out infinite` }}>
        <line x1="18" y1="13" x2="10" y2="23" stroke={color} strokeWidth={sw2} strokeLinecap="round" />
      </g>
      <g style={{ transformOrigin: '18px 13px', animation: `walk-arm-b ${dur} ease-in-out infinite` }}>
        <line x1="18" y1="13" x2="26" y2="23" stroke={color} strokeWidth={sw2} strokeLinecap="round" />
      </g>
    </svg>
  );
  return (
    <svg width={w} height={h} viewBox={vb} fill="none">
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <line x1="10" y1="5.5" x2="8" y2="12" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1="8" y1="12" x2="6" y2="18.5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1="8" y1="12" x2="12.5" y2="17" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1="10" y1="5.5" x2="13.5" y2="9.5" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1="7" y1="9" x2="13.5" y2="9" stroke={color} strokeWidth={sw2} strokeLinecap="round" />
    </svg>
  );
};

const BikeIcon = ({ color, size = 'small' }) => {
  const s = size === 'large';
  const w = s ? 64 : 26, h = s ? 44 : 22;
  const vb = s ? '0 0 64 44' : '0 0 26 22';
  const spinDur = '0.5s';
  if (s) return (
    <svg width={w} height={h} viewBox={vb} fill="none" overflow="visible">
      <g style={{ transformOrigin: '13px 30px', animation: `icon-spin ${spinDur} linear infinite` }}>
        <line x1="13" y1="19" x2="13" y2="41" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
        <line x1="2" y1="30" x2="24" y2="30" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
        <line x1="5" y1="22" x2="21" y2="38" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <line x1="21" y1="22" x2="5" y2="38" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      </g>
      <circle cx="13" cy="30" r="12" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="13" cy="30" r="2" fill={color}/>
      <g style={{ transformOrigin: '51px 30px', animation: `icon-spin ${spinDur} linear infinite` }}>
        <line x1="51" y1="19" x2="51" y2="41" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
        <line x1="40" y1="30" x2="62" y2="30" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
        <line x1="43" y1="22" x2="59" y2="38" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
        <line x1="59" y1="22" x2="43" y2="38" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      </g>
      <circle cx="51" cy="30" r="12" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="51" cy="30" r="2" fill={color}/>
      <polyline points="13,30 26,10 38,30 51,30" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="26" y1="10" x2="32" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="34" y1="18" x2="40" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="37" y1="18" x2="38" y2="30" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width={w} height={h} viewBox={vb} fill="none">
      <circle cx="5.5" cy="15.5" r="4" stroke={color} strokeWidth="1.7" />
      <circle cx="20.5" cy="15.5" r="4" stroke={color} strokeWidth="1.7" />
      <polyline points="5.5,15.5 10,7 13,7" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="13,7 20.5,15.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="10,7 13,15.5 20.5,15.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="11" y1="7" x2="15" y2="7" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
};

const CarIcon = ({ color, size = 'small' }) => {
  const s = size === 'large';
  const w = s ? 72 : 28, h = s ? 40 : 22;
  const vb = s ? '0 0 72 40' : '0 0 28 22';
  const spinDur = '0.45s';
  if (s) return (
    <svg width={w} height={h} viewBox={vb} fill="none" overflow="visible">
      <path d="M6 22 L12 10 Q14 8 17 8 L55 8 Q58 8 60 10 L66 22 L66 32 Q66 34 64 34 L8 34 Q6 34 6 32 Z"
        stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round"/>
      <path d="M16 22 L20 11 L52 11 L56 22 Z" stroke={color} strokeWidth="1.4" fill="none" strokeLinejoin="round" opacity="0.5"/>
      <line x1="36" y1="11" x2="36" y2="22" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
      <g style={{ transformOrigin: '18px 34px', animation: `icon-spin ${spinDur} linear infinite` }}>
        <line x1="18" y1="27" x2="18" y2="41" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
        <line x1="11" y1="34" x2="25" y2="34" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
        <line x1="13" y1="29" x2="23" y2="39" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.35"/>
        <line x1="23" y1="29" x2="13" y2="39" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.35"/>
      </g>
      <circle cx="18" cy="34" r="8" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="18" cy="34" r="2.5" fill={color}/>
      <g style={{ transformOrigin: '54px 34px', animation: `icon-spin ${spinDur} linear infinite` }}>
        <line x1="54" y1="27" x2="54" y2="41" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
        <line x1="47" y1="34" x2="61" y2="34" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
        <line x1="49" y1="29" x2="59" y2="39" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.35"/>
        <line x1="59" y1="29" x2="49" y2="39" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.35"/>
      </g>
      <circle cx="54" cy="34" r="8" stroke={color} strokeWidth="2" fill="none"/>
      <circle cx="54" cy="34" r="2.5" fill={color}/>
    </svg>
  );
  return (
    <svg width={w} height={h} viewBox={vb} fill="none">
      <path d="M4 12 L7 6 Q8 5 9.5 5 L18.5 5 Q20 5 21 6 L24 12 L24 17 Q24 18 23 18 L5 18 Q4 18 4 17 Z" stroke={color} strokeWidth="1.7" fill="none" strokeLinejoin="round" />
      <circle cx="9" cy="18" r="2.2" fill={color} />
      <circle cx="19" cy="18" r="2.2" fill={color} />
      <line x1="11" y1="11" x2="17" y2="11" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7.5 12 L9 7 L19 7 L20.5 12" stroke={color} strokeWidth="1.3" strokeLinejoin="round" fill="none" />
    </svg>
  );
};

const MODES = [
  { id: 'walking',   Icon: WalkIcon, label: 'Walk',  labelJa: '徒歩'   },
  { id: 'bicycling', Icon: BikeIcon, label: 'Bike',  labelJa: '自転車' },
  { id: 'driving',   Icon: CarIcon,  label: 'Drive', labelJa: '車'     },
];

// ── FLOATING ICON (L-path, 6462ms/loop) ──────────────────────────
// 座標系: ページ全体(max-width:540px)の左上を原点とするpx座標
// Phase A: 右欄外(x=560) → x=310  y=148(heroタイトルの高さ)  水平左移動
// Phase B: x=310  y=148 → y=76(ヘッダー下の余白)  垂直上昇
// Phase C: x=310 → x=-60  y=76  水平左移動して欄外へ消える
function FloatingIcon({ activeMode }) {
  const elRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  const DURATION = 6462;
  // ページ座標 (px) — 赤線書き込み準拠:
  // ヘッダー高さ ≒ 80px (Street Journey ロゴ行)
  // サブテキスト "VIRTUAL ROUTE EXPLORER" ≒ y=96px
  // "READY TO EXPLORE" eyebrow ≒ y=136px (hero padding 36 + margin)
  // タイトル "Every street" 中段 ≒ y=176px  ← Phase A/B の折れ点Y
  // ロゴとサブテキストの間の余白中央 ≒ y=88px  ← Phase C のY (EXIT_Y)
  // TURN_X: "story." 右端より少し右 ≒ x=330px
  // START_X: 右欄外 ≒ x=580px
  // EXIT_X: 左欄外 ≒ x=-60px
  const START_X = 580, TURN_X = 330, TURN_Y = 176, EXIT_Y = 88, EXIT_X = -60;
  const distA = START_X - TURN_X;   // 250
  const distB = TURN_Y - EXIT_Y;    // 88
  const distC = TURN_X - EXIT_X;    // 390
  const total = distA + distB + distC;
  const tA = distA / total;
  const tB = tA + distB / total;

  useEffect(() => {
    tRef.current = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last; last = now;
      tRef.current = (tRef.current + dt / DURATION) % 1;
      const t = tRef.current;
      let x, y, opacity;
      if (t < tA) {
        const p = t / tA;
        x = START_X - p * distA; y = TURN_Y;
        opacity = t < 0.04 ? (t / 0.04) * 0.6 : 0.6;
      } else if (t < tB) {
        const p = (t - tA) / (tB - tA);
        x = TURN_X; y = TURN_Y - p * distB; opacity = 0.6;
      } else {
        const p = (t - tB) / (1 - tB);
        x = TURN_X - p * distC; y = EXIT_Y;
        opacity = p > 0.85 ? (1 - (p - 0.85) / 0.15) * 0.6 : 0.6;
      }
      if (elRef.current) {
        elRef.current.style.transform = `translate(${x - 18}px, ${y - 26}px)`;
        elRef.current.style.opacity = opacity;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeMode]);

  const Icon = MODES[activeMode].Icon;
  return (
    // ページ全体を覆う絶対配置レイヤー（スクロールと無関係に画面固定ではなくページ基準）
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}>
      <div ref={elRef} style={{ position: 'absolute', top: 0, left: 0, willChange: 'transform, opacity', opacity: 0 }}>
        <Icon color={light.accent} size="large" />
      </div>
    </div>
  );
}

// ── ROAD SCENE SVG ────────────────────────────────────────────────
function RoadScene({ isNight }) {
  const n = isNight;
  return (
    <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '65%', transition: 'all 0.6s' }}
      viewBox="0 0 400 200" preserveAspectRatio="none">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={n ? '#040d09' : '#c8e6e2'} />
          <stop offset="100%" stopColor={n ? '#0a1a14' : '#8ec5be'} />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#skyGrad)" />
      {n && [[60,20],[120,12],[180,30],[250,8],[310,22],[360,14],[90,40],[200,18],[340,38]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="rgba(255,255,255,0.7)" />
      ))}
      {n
        ? <circle cx="320" cy="28" r="12" fill="#d4e8e0" opacity="0.9" />
        : <circle cx="320" cy="28" r="16" fill="#ffe88a" opacity="0.7" />}
      <polygon points="140,0 260,0 400,200 0,200" fill={n ? '#0e1f18' : '#a8c8c0'} />
      <line x1="200" y1="10" x2="200" y2="60" stroke={n ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)'} strokeWidth="2" strokeDasharray="8,12" />
      <line x1="200" y1="80" x2="200" y2="130" stroke={n ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)'} strokeWidth="2" strokeDasharray="8,12" />
      <ellipse cx="80" cy="0" rx="70" ry="50" fill={n ? '#0a1c12' : '#7abfaa'} />
      <ellipse cx="40" cy="10" rx="55" ry="40" fill={n ? '#0d2016' : '#6aaa98'} />
      <ellipse cx="320" cy="0" rx="70" ry="50" fill={n ? '#0a1c12' : '#7abfaa'} />
      <ellipse cx="360" cy="10" rx="55" ry="40" fill={n ? '#0d2016' : '#6aaa98'} />
      <ellipse cx="200" cy="0" rx="120" ry="30" fill={n ? 'rgba(42,157,143,0.07)' : 'rgba(42,157,143,0.14)'} />
    </svg>
  );
}

// ── AUTOCOMPLETE HOOK ─────────────────────────────────────────────
function useAutocomplete(value, enabled) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const session = useRef(Math.random().toString(36).slice(2));

  useEffect(() => {
    if (!enabled || value.length < 1) { setSuggestions([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/places?input=${encodeURIComponent(value)}&sessiontoken=${session.current}`);
        const d = await r.json();
        setSuggestions(d.predictions ? d.predictions.slice(0, 6) : []);
      } catch { setSuggestions([]); }
      setLoading(false);
    }, 200);
  }, [value, enabled]);

  return { suggestions, loading, clearSuggestions: () => setSuggestions([]) };
}

// ── ROUTE INPUT ───────────────────────────────────────────────────
function RouteInput({ value, onChange, onSelect, placeholder, dotColor, t }) {
  const [focused, setFocused] = useState(false);
  const { suggestions, loading, clearSuggestions } = useAutocomplete(value, focused || value.length > 0);

  const handleSelect = (pred) => {
    onSelect(pred.description);
    clearSuggestions();
    setFocused(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: `1px solid ${t.surfaceBorder}` }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0, boxShadow: `0 0 6px ${dotColor}` }} />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => { setFocused(false); clearSuggestions(); }, 180)}
          placeholder={placeholder}
          autoComplete="off" autoCorrect="off" spellCheck={false}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: t.text, fontFamily: "'Zen Kaku Gothic New', sans-serif", minWidth: 0 }}
        />
        {loading && <div style={{ width: 12, height: 12, border: `2px solid ${t.surfaceBorder}`, borderTopColor: t.accent, borderRadius: '50%', animation: 'sj-spin .6s linear infinite', flexShrink: 0 }} />}
        {value && <button onClick={() => { onChange(''); clearSuggestions(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, fontSize: 14, padding: '0 2px' }}>×</button>}
      </div>

      {suggestions.length > 0 && focused && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderTop: 'none', borderRadius: '0 0 12px 12px', zIndex: 300, boxShadow: '0 12px 32px rgba(0,0,0,0.12)', overflow: 'hidden', maxHeight: 280, overflowY: 'auto', backdropFilter: 'blur(12px)' }}>
          {suggestions.map((p, i) => (
            <div key={p.place_id || i}
              onMouseDown={() => handleSelect(p)}
              onTouchEnd={e => { e.preventDefault(); handleSelect(p); }}
              style={{ padding: '11px 16px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? `1px solid ${t.surfaceBorder}` : 'none', display: 'flex', alignItems: 'center', gap: 10, transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = t.accentBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: 14, flexShrink: 0, color: t.textMuted }}>📍</div>
              <div>
                <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{p.structured_formatting?.main_text || p.description}</div>
                <div style={{ fontSize: 10, color: t.textSub, marginTop: 2, letterSpacing: '0.04em' }}>{p.structured_formatting?.secondary_text || ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── VIEWER ────────────────────────────────────────────────────────
function Viewer({ steps, origin, destination, travelModeId, routeInfo, onClose }) {
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [filmVisible, setFilmVisible] = useState(false);
  const [activeImg, setActiveImg] = useState('A');
  const [isRecording, setIsRecording] = useState(false);
  const [minimapSrc, setMinimapSrc] = useState('');
  const [minimapMode, setMinimapMode] = useState('current');
  const [routeMapSrc, setRouteMapSrc] = useState('');
  const [isNight, setIsNight] = useState(!getDayFlag());
  const [manualNight, setManualNight] = useState(false);
  const speedRef = useRef(1);
  const imgARef = useRef(null), imgBRef = useRef(null);
  const timerRef = useRef(null), minimapTimerRef = useRef(null);
  const mediaRecRef = useRef(null), recChunksRef = useRef([]);
  const filmHideRef = useRef(null);
  const activeImgRef = useRef('A'), curRef = useRef(0);

  const t = isNight ? dark : light;

  const SPEEDS = [
    { label: '0.5×', interval: 4000 },
    { label: '1×',   interval: 2000 },
    { label: '2×',   interval: 1000 },
    { label: '4×',   interval: 500  },
    { label: '10×',  interval: 180  },
  ];
  const interval = SPEEDS[speed]?.interval ?? 2000;

  useEffect(() => { activeImgRef.current = activeImg; }, [activeImg]);
  useEffect(() => { curRef.current = cur; }, [cur]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // 自動昼夜
  useEffect(() => {
    if (manualNight) return;
    const id = setInterval(() => setIsNight(!getDayFlag()), 60000);
    return () => clearInterval(id);
  }, [manualNight]);

  const directSvUrl = useCallback((step, idx, w = 800, h = 500) => {
    let heading = '';
    if (idx > 0) {
      const prev = steps[idx - 1];
      heading = Math.round(Math.atan2(step.lng - prev.lng, step.lat - prev.lat) * 180 / Math.PI);
    }
    const p = new URLSearchParams({ lat: step.lat, lng: step.lng, w, h });
    if (heading) p.set('heading', heading);
    return `/api/sv?${p}`;
  }, [steps]);

  const staticMapUrl = useCallback((step) => {
    const pathPts = steps.filter((_, i) => i % 4 === 0 || i === steps.length - 1).map(p => `${p.lat},${p.lng}`).join('|');
    return `/api/staticmap?lat=${step.lat}&lng=${step.lng}&path=${encodeURIComponent(pathPts)}`;
  }, [steps]);

  const routeOverviewUrl = useCallback((step) => {
    const first = steps[0], last = steps[steps.length - 1];
    const midLat = (first.lat + last.lat) / 2, midLng = (first.lng + last.lng) / 2;
    const pathPts = steps.filter((_, i) => i % 3 === 0 || i === steps.length - 1).map(p => `${p.lat},${p.lng}`).join('|');
    return `/api/staticmap?lat=${midLat}&lng=${midLng}&path=${encodeURIComponent(pathPts)}&marker=${step.lat},${step.lng}&zoom=13`;
  }, [steps]);

  const crossfade = useCallback((url) => {
    const imgA = imgARef.current, imgB = imgBRef.current;
    if (!imgA || !imgB) return;
    const next = activeImgRef.current === 'A' ? imgB : imgA;
    const prev = activeImgRef.current === 'A' ? imgA : imgB;
    next.src = url;
    next.onload = () => { next.style.opacity = '1'; prev.style.opacity = '0'; setActiveImg(a => a === 'A' ? 'B' : 'A'); };
    next.onerror = () => {};
  }, []);

  const renderStep = useCallback((c, instant = false) => {
    const step = steps[c];
    if (!step) return;
    const url = directSvUrl(step, c);
    if (instant) {
      if (imgARef.current) { imgARef.current.src = url; imgARef.current.style.opacity = '1'; }
      if (imgBRef.current) imgBRef.current.style.opacity = '0';
      setActiveImg('A');
    } else { crossfade(url); }
    const cur_speed = speedRef.current;
    const upd = () => { setMinimapSrc(staticMapUrl(step)); setRouteMapSrc(routeOverviewUrl(step)); };
    clearTimeout(minimapTimerRef.current);
    if (cur_speed >= 3) upd();
    else minimapTimerRef.current = setTimeout(upd, Math.min(SPEEDS[cur_speed]?.interval ?? 2000, 500));
  }, [steps, directSvUrl, crossfade, staticMapUrl, routeOverviewUrl]);

  useEffect(() => { renderStep(0, true); setTimeout(() => setPlaying(true), 600); }, []);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCur(c => {
          const next = c + 1;
          if (next >= steps.length) { setPlaying(false); return c; }
          renderStep(next);
          return next;
        });
      }, interval);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [playing, interval, steps, renderStep]);

  const goTo = useCallback((c, instant = false) => {
    setPlaying(false); clearInterval(timerRef.current);
    setCur(c); renderStep(c, instant);
  }, [renderStep]);

  const pct = ((cur + 1) / steps.length) * 100;
  const step = steps[cur] || {};
  const modeInfo = MODES.find(m => m.id === travelModeId) || MODES[0];
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  const toggleNight = () => { setIsNight(n => !n); setManualNight(true); };

  return (
    <div style={{ position: 'fixed', inset: 0, background: t.vBg, display: 'flex', flexDirection: 'column', zIndex: 100, transition: 'background 0.6s' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: t.vHeader, borderBottom: `1px solid ${t.vHeaderBorder}`, backdropFilter: 'blur(12px)', flexShrink: 0, transition: 'background 0.6s, border-color 0.6s' }}>
        <div onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.14em', color: t.vTextSub, cursor: 'pointer', textTransform: 'uppercase' }}>← Back</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ fontFamily: "'Shippori Mincho', serif", fontSize: 15, fontWeight: 600, color: t.vText, letterSpacing: '0.04em', transition: 'color 0.4s' }}>{origin} → {destination}</div>
          <div style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.vTextMuted, transition: 'color 0.4s' }}>
            {modeInfo.label} · {routeInfo?.distance || steps.length + ' waypoints'}
          </div>
        </div>
        <button onClick={toggleNight} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, letterSpacing: '0.14em', background: isNight ? 'rgba(42,157,143,0.15)' : 'rgba(42,157,143,0.08)', border: `1px solid ${isNight ? 'rgba(42,157,143,0.4)' : 'rgba(42,157,143,0.2)'}`, color: isNight ? '#4fc3b4' : '#2a9d8f', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: "'Zen Kaku Gothic New', sans-serif", transition: 'all 0.3s' }}>
          {isNight ? '🌙' : '☀️'}
          <span style={{ fontSize: 8, letterSpacing: '0.12em' }}>{timeStr}</span>
        </button>
      </div>

      {/* Street View area */}
      <div id="sv-wrap" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: t.vBg, transition: 'background 0.6s' }}>
        {/* Progress bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, height: 2, width: pct + '%', background: `linear-gradient(to right, ${light.accent}, ${light.accentLight})`, transition: 'width .35s ease', zIndex: 10 }} />

        {/* Real SV images */}
        <img ref={imgARef} src="" alt="" crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, transition: 'opacity .45s' }} />
        <img ref={imgBRef} src="" alt="" crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 2, opacity: 0, transition: 'opacity .45s' }} />

        {/* Road scene placeholder (shows when no SV image loaded) */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <RoadScene isNight={isNight} />
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', pointerEvents: 'none', zIndex: 3 }} />

        {/* SV label */}
        <div style={{ position: 'absolute', top: 14, left: 18, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.svLabel, border: `1px solid ${t.svLabelBorder}`, padding: '4px 10px', borderRadius: 4, backdropFilter: 'blur(4px)', zIndex: 5, transition: 'color 0.4s, border-color 0.4s' }}>Street View</div>

        {/* Coords */}
        {step.lat && <div style={{ position: 'absolute', bottom: 14, left: 18, fontSize: 9, letterSpacing: '0.1em', color: t.svCoords, zIndex: 5, transition: 'color 0.4s' }}>{step.lat?.toFixed(4)}° N, {step.lng?.toFixed(4)}° E</div>}

        {/* Minimap */}
        <div style={{ position: 'absolute', bottom: 12, right: 14, width: 100, borderRadius: 8, overflow: 'hidden', border: `1px solid ${t.minimapBorder}`, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', zIndex: 8, background: t.minimapBg, transition: 'border-color 0.4s' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.1)' }}>
            {[{ key: 'current', label: '現在地' }, { key: 'route', label: 'ルート' }].map(({ key, label }) => (
              <button key={key} onClick={() => setMinimapMode(key)} style={{ flex: 1, padding: '3px 0', border: 'none', cursor: 'pointer', background: minimapMode === key ? 'rgba(42,157,143,0.15)' : 'transparent', borderBottom: minimapMode === key ? `2px solid ${light.accent}` : '2px solid transparent', fontFamily: "'Zen Kaku Gothic New',sans-serif", fontSize: 7, color: minimapMode === key ? light.accent : t.textMuted, letterSpacing: '.05em', transition: 'all .15s' }}>{label}</button>
            ))}
          </div>
          <div style={{ height: 72, position: 'relative' }}>
            {minimapMode === 'current'
              ? minimapSrc ? <img src={minimapSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: t.textMuted, fontFamily: "'Zen Kaku Gothic New',sans-serif" }}>読込中</div>
              : routeMapSrc ? <img src={routeMapSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: t.textMuted, fontFamily: "'Zen Kaku Gothic New',sans-serif" }}>読込中</div>}
          </div>
        </div>

        {/* Step instruction */}
        <div style={{ position: 'absolute', bottom: 14, left: 18, right: 126, zIndex: 5 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.3, textShadow: '0 1px 10px rgba(0,0,0,0.9)' }}>{step.instruction || '移動中'}</div>
          {step.distance && <div style={{ fontFamily: "'Zen Kaku Gothic New',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{step.distance}</div>}
        </div>

        {isRecording && (
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 20, zIndex: 20 }}>
            <div style={{ width: 6, height: 6, background: light.danger, borderRadius: '50%', animation: 'sj-blink 1.2s infinite' }} />
            <span style={{ fontFamily: "'Zen Kaku Gothic New',sans-serif", fontSize: 9, color: '#fff', letterSpacing: '.1em' }}>REC</span>
          </div>
        )}

        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', fontFamily: "'Zen Kaku Gothic New',sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.6)', zIndex: 5, background: 'rgba(0,0,0,0.3)', padding: '3px 10px', borderRadius: 20 }}>
          {cur + 1} / {steps.length}
        </div>
      </div>

      {/* Filmstrip toggle */}
      <div onClick={() => { setFilmVisible(v => !v); clearTimeout(filmHideRef.current); if (!filmVisible) filmHideRef.current = setTimeout(() => setFilmVisible(false), 5000); }}
        style={{ height: 6, background: t.vBottomBorder, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 28, height: 2, background: t.textMuted, borderRadius: 2 }} />
      </div>
      {filmVisible && (
        <div style={{ height: 64, background: t.vBottom, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4, overflowX: 'auto', flexShrink: 0, borderBottom: `1px solid ${t.vBottomBorder}` }}>
          {steps.map((s, i) => (
            <img key={i} src={`/api/sv?lat=${s.lat}&lng=${s.lng}&w=112&h=112`} alt="" loading="lazy" onClick={() => goTo(i)}
              style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover', flexShrink: 0, cursor: 'pointer', border: i === cur ? `2px solid ${light.accent}` : '2px solid transparent', opacity: i === cur ? 1 : 0.45, transition: 'border-color .15s, opacity .15s' }} />
          ))}
        </div>
      )}

      {/* Bottom controls */}
      <div style={{ background: t.vBottom, borderTop: `1px solid ${t.vBottomBorder}`, padding: '14px 18px 18px', flexShrink: 0, transition: 'background 0.6s, border-color 0.6s' }}>
        {/* Scrubber */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.1em', color: t.vTextMuted, minWidth: 28, fontFamily: "'Zen Kaku Gothic New',sans-serif", transition: 'color 0.4s' }}>{cur}</span>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: t.vScrubTrack, position: 'relative', cursor: 'pointer', transition: 'background 0.4s' }}
            onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); goTo(Math.round((e.clientX - rect.left) / rect.width * (steps.length - 1))); }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: pct + '%', background: `linear-gradient(to right, ${light.accent}, ${light.accentLight})`, borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: '50%', left: pct + '%', transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', background: t.vThumb, boxShadow: `0 0 8px rgba(42,157,143,0.5)`, transition: 'background 0.4s' }} />
          </div>
          <span style={{ fontSize: 9, letterSpacing: '0.1em', color: t.vTextMuted, minWidth: 28, textAlign: 'right', fontFamily: "'Zen Kaku Gothic New',sans-serif", transition: 'color 0.4s' }}>{steps.length - 1}</span>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Speed */}
          <div style={{ display: 'flex', gap: 5 }}>
            {SPEEDS.map((s, i) => (
              <button key={s.label} onClick={() => setSpeed(i)} style={{ fontSize: 9, letterSpacing: '0.08em', padding: '4px 9px', borderRadius: 20, border: `1px solid ${speed === i ? t.vSpeedActiveBorder : t.vSpeedBorder}`, background: speed === i ? t.vSpeedActiveBg : 'transparent', color: speed === i ? t.vSpeedActiveText : t.vSpeedText, cursor: 'pointer', fontFamily: "'Zen Kaku Gothic New',sans-serif", transition: 'all 0.2s' }}>{s.label}</button>
            ))}
          </div>

          {/* Play controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[
              { icon: '⏮', action: () => goTo(0, true) },
              { icon: '◀◀', action: () => goTo(Math.max(0, cur - 8)) },
            ].map((c, i) => (
              <button key={i} onClick={c.action} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: t.vCtrl, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}>{c.icon}</button>
            ))}
            <button onClick={() => setPlaying(p => !p)} style={{ border: 'none', width: 42, height: 42, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.vCtrlMainBg, boxShadow: `0 0 18px ${t.vCtrlMainShadow}`, color: '#fff', transition: 'background 0.3s, box-shadow 0.3s' }}>
              {playing ? '⏸' : '▶'}
            </button>
            {[
              { icon: '▶▶', action: () => goTo(Math.min(steps.length - 1, cur + 8)) },
              { icon: '⏭', action: () => goTo(steps.length - 1, true) },
            ].map((c, i) => (
              <button key={i} onClick={c.action} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: t.vCtrl, padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}>{c.icon}</button>
            ))}
          </div>

          {/* Progress info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.06em', color: t.vProgressText, fontFamily: "'Zen Kaku Gothic New',sans-serif", transition: 'color 0.4s' }}>{routeInfo?.distance || ''}</div>
            <div style={{ fontSize: 9, letterSpacing: '0.12em', color: t.vProgressSub, fontFamily: "'Zen Kaku Gothic New',sans-serif", transition: 'color 0.4s' }}>{routeInfo?.duration || ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function Home() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [modeIdx, setModeIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaderMsg, setLoaderMsg] = useState({ ja: '', en: '', detail: '' });
  const [steps, setSteps] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const t = light; // Top screen always light

  function stripHtml(h) { return h.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  function lerp(a, b, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const r = i / n; pts.push({ lat: a.lat + (b.lat - a.lat) * r, lng: a.lng + (b.lng - a.lng) * r }); }
    return pts;
  }

  async function startJourney() {
    if (!origin.trim()) return alert('出発地を入力してください');
    if (!destination.trim()) return alert('目的地を入力してください');
    setLoading(true);
    setLoaderMsg({ ja: '住所を変換中', en: 'GEOCODING', detail: '座標を取得しています...' });
    try {
      const [og, dg] = await Promise.all([
        fetch(`/api/geocode?address=${encodeURIComponent(origin)}`).then(r => r.json()),
        fetch(`/api/geocode?address=${encodeURIComponent(destination)}`).then(r => r.json()),
      ]);
      if (og.status !== 'OK') throw new Error('出発地が見つかりません: ' + origin);
      if (dg.status !== 'OK') throw new Error('目的地が見つかりません: ' + destination);
      const oL = og.results[0].geometry.location;
      const dL = dg.results[0].geometry.location;

      setLoaderMsg({ ja: 'ルート計算中', en: 'DIRECTIONS', detail: '経路を取得しています...' });
      const dr = await fetch(`/api/directions?origin=${oL.lat},${oL.lng}&destination=${dL.lat},${dL.lng}&mode=${MODES[modeIdx].id}`).then(r => r.json());

      let waypoints = [];
      if (dr.status === 'OK' && dr.routes.length) {
        const leg0 = dr.routes[0].legs[0];
        setRouteInfo({
          duration: leg0.duration?.text || '',
          distance: leg0.distance?.value >= 1000 ? leg0.distance?.text || '' : `${leg0.distance?.value || ''}m`,
        });
        for (const leg of dr.routes[0].legs) {
          for (const step of leg.steps) {
            const instr = stripHtml(step.html_instructions);
            const dist = step.distance?.text || '';
            lerp(step.start_location, step.end_location, 4).forEach((p, i) =>
              waypoints.push({ lat: p.lat, lng: p.lng, instruction: i === 0 ? instr : '', distance: i === 0 ? dist : '' })
            );
          }
          const last = leg.end_location;
          waypoints.push({ lat: last.lat, lng: last.lng, instruction: '到着', distance: '' });
        }
      } else {
        waypoints = lerp(oL, dL, 40).map((p, i) => ({
          lat: p.lat, lng: p.lng,
          instruction: i === 0 ? '出発' : i === 40 ? '到着' : `移動中 ${Math.round(i / 40 * 100)}%`,
          distance: ''
        }));
      }
      setLoaderMsg({ ja: '準備完了', en: 'READY', detail: `${waypoints.length}地点を取得しました` });
      await new Promise(r => setTimeout(r, 400));
      setSteps(waypoints);
    } catch (e) {
      alert(e.message || 'エラーが発生しました');
    }
    setLoading(false);
  }

  if (steps) return (
    <Viewer
      steps={steps}
      origin={origin}
      destination={destination}
      travelModeId={MODES[modeIdx].id}
      routeInfo={routeInfo}
      onClose={() => setSteps(null)}
    />
  );

  return (
    <>
      <Head>
        <title>Street Journey</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Shippori+Mincho:wght@400;600;700&family=Zen+Kaku+Gothic+New:wght@300;400&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
          body { background: ${light.bg}; font-family: 'Zen Kaku Gothic New', sans-serif; color: ${light.text}; overflow-x: hidden; }
          ::placeholder { color: ${light.textMuted} !important; }
          @keyframes sj-spin { to { transform: rotate(360deg); } }
          @keyframes sj-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
          @keyframes walk-leg-f { 0%,100% { transform: rotate(-28deg); } 50% { transform: rotate(28deg); } }
          @keyframes walk-leg-b { 0%,100% { transform: rotate(28deg); } 50% { transform: rotate(-28deg); } }
          @keyframes walk-arm-f { 0%,100% { transform: rotate(22deg); } 50% { transform: rotate(-22deg); } }
          @keyframes walk-arm-b { 0%,100% { transform: rotate(-22deg); } 50% { transform: rotate(22deg); } }
          @keyframes icon-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </Head>

      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: light.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, zIndex: 200 }}>
          <div style={{ width: 40, height: 40, border: `2px solid ${light.surfaceBorder}`, borderTopColor: light.accent, borderRadius: '50%', animation: 'sj-spin .7s linear infinite' }} />
          <div style={{ fontSize: 14, color: light.text, fontFamily: "'Zen Kaku Gothic New',sans-serif", letterSpacing: '.06em' }}>{loaderMsg.ja}</div>
          <div style={{ fontSize: 10, color: light.textMuted, letterSpacing: '.15em', textTransform: 'uppercase' }}>{loaderMsg.en}</div>
          <div style={{ fontSize: 10, color: light.textMuted, letterSpacing: '.08em' }}>{loaderMsg.detail}</div>
        </div>
      )}

      <div style={{ background: light.bg, minHeight: '100vh', paddingBottom: 40, position: 'relative', overflow: 'hidden', maxWidth: 540, margin: '0 auto' }}>
        {/* BG circles */}
        <div style={{ position: 'absolute', top: -120, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,230,226,0.55) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,191,158,0.18) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* FloatingIcon — ページ全体基準 */}
        <FloatingIcon activeMode={modeIdx} />

        {/* Logo Header */}
        <div style={{ padding: '28px 28px 0', position: 'relative', zIndex: 3 }}>
          {/* メインロゴ画像 — mix-blend-modeで白背景を透過 */}
          <img
            src="/stj-logo.png"
            alt="Street Journey"
            style={{
              width: '72%',
              maxWidth: 300,
              display: 'block',
              mixBlendMode: 'multiply',
            }}
          />
          {/* サブコピー */}
          <div style={{
            marginTop: 10,
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
            fontWeight: 400,
            fontSize: 10,
            color: light.accent,
            letterSpacing: '0.12em',
            lineHeight: 1.9,
          }}>
            <div>VIRTUAL ROUTE EXPLORER | v.3.0</div>
            <div>READY TO EXPLORE &gt;&gt;&gt;</div>
            <div style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontWeight: 400, color: light.text, fontSize: 13, marginTop: 4, letterSpacing: '0.04em' }}>Every street has a story.</div>
            <div style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontWeight: 400, color: light.textSub, fontSize: 11, letterSpacing: '0.04em' }}>Set your route and travel mode, then start your journey.</div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 10 }}>
          {/* Route card */}
          <div style={{ background: light.surface, border: `1px solid ${light.surfaceBorder}`, borderRadius: 16, padding: '18px 0 0', backdropFilter: 'blur(12px)', boxShadow: '0 2px 20px rgba(42,157,143,0.06)', overflow: 'visible', position: 'relative', zIndex: 20 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: light.accent, marginBottom: 10, padding: '0 18px' }}>Route</div>
            <RouteInput value={origin} onChange={setOrigin} onSelect={setOrigin}
              placeholder="出発地 / Origin" dotColor={light.green} t={t} />
            <RouteInput value={destination} onChange={setDestination} onSelect={setDestination}
              placeholder="目的地 / Destination" dotColor={light.danger} t={t} />
            <div style={{ padding: '8px 18px 14px', fontSize: 9, color: light.textMuted, letterSpacing: '0.08em' }}>
              日本語・英語・住所・施設名対応
            </div>
          </div>

          {/* Travel Mode card */}
          <div style={{ background: light.surface, border: `1px solid ${light.surfaceBorder}`, borderRadius: 16, padding: '18px 18px 16px', backdropFilter: 'blur(12px)', boxShadow: '0 2px 20px rgba(42,157,143,0.06)' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: light.accent, marginBottom: 12 }}>Travel Mode</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {MODES.map((m, i) => (
                <button key={m.id} onClick={() => setModeIdx(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', borderRadius: 12, background: modeIdx === i ? light.accentBg : 'transparent', border: `1.5px solid ${modeIdx === i ? light.accent : light.surfaceBorder}`, cursor: 'pointer', transition: 'all 0.18s' }}>
                  <m.Icon color={modeIdx === i ? light.accent : light.textMuted} size="small" />
                  <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: modeIdx === i ? light.accent : light.textSub }}>{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start button */}
        <div style={{ padding: '20px 20px 0', position: 'relative', zIndex: 1 }}>
          <button onClick={startJourney} style={{ width: '100%', background: light.accent, color: '#fff', border: 'none', borderRadius: 14, padding: '17px 32px', fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 4px 24px rgba(42,157,143,0.28)', transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = light.accentLight; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = light.accent; e.currentTarget.style.transform = 'translateY(0)'; }}>
            Start Journey <span style={{ fontSize: 16 }}>→</span>
          </button>
        </div>
      </div>
    </>
  );
}
