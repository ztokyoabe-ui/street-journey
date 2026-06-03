import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

/* ─────────── AUTOCOMPLETE HOOK ─────────── */
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
        if (d.predictions) setSuggestions(d.predictions.slice(0, 6));
        else setSuggestions([]);
      } catch { setSuggestions([]); }
      setLoading(false);
    }, 200);
  }, [value, enabled]);

  return { suggestions, loading, clearSuggestions: () => setSuggestions([]) };
}

/* ─────────── ROUTE INPUT COMPONENT ─────────── */
function RouteInput({ value, onChange, onSelect, placeholder, dotColor, label }) {
  const [focused, setFocused] = useState(false);
  const { suggestions, loading, clearSuggestions } = useAutocomplete(value, focused || value.length > 0);
  const wrapRef = useRef(null);

  const handleSelect = (pred) => {
    onSelect(pred.description);
    clearSuggestions();
    setFocused(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.15)' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0, boxShadow: `0 0 6px ${dotColor}` }} />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => { setFocused(false); clearSuggestions(); }, 180)}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 15, color: '#fff', fontFamily: 'inherit', minWidth: 0,
          }}
        />
        {loading && <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.15)', borderTopColor: 'rgba(255,255,255,.7)', borderRadius: '50%', animation: 'spin .6s linear infinite', flexShrink: 0 }} />}
        {value && <button onClick={() => { onChange(''); clearSuggestions(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.3)', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>×</button>}
      </div>

      {suggestions.length > 0 && focused && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '100%',
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,.12)', borderTop: 'none',
          borderRadius: '0 0 12px 12px', zIndex: 300,
          boxShadow: '0 12px 32px rgba(0,0,0,.6)', overflow: 'hidden',
          maxHeight: 280, overflowY: 'auto',
        }}>
          {suggestions.map((p, i) => (
            <div
              key={p.place_id || i}
              onMouseDown={() => handleSelect(p)}
              onTouchEnd={e => { e.preventDefault(); handleSelect(p); }}
              style={{
                padding: '12px 16px', cursor: 'pointer',
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'transparent', transition: 'background .1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: 16, flexShrink: 0, color: 'rgba(255,255,255,.3)' }}>📍</div>
              <div>
                <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>
                  {p.structured_formatting?.main_text || p.description}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2, fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em' }}>
                  {p.structured_formatting?.secondary_text || ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── VIEWER ─────────── */
function Viewer({ steps, origin, destination, travelMode, routeInfo, onClose }) {
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // index: 0=1× 1=2× 2=3× 3=5× 4=10×
  const [filmVisible, setFilmVisible] = useState(false);
  const [activeImg, setActiveImg] = useState('A');
  const [isRecording, setIsRecording] = useState(false);
  const [minimapSrc, setMinimapSrc] = useState('');
  const [minimapMode, setMinimapMode] = useState('current'); // 'current' | 'route'
  const [routeMapSrc, setRouteMapSrc] = useState('');
  const speedRef = useRef(2);

  const imgARef = useRef(null);
  const imgBRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecRef = useRef(null);
  const recChunksRef = useRef([]);
  const filmHideRef = useRef(null);
  const minimapTimerRef = useRef(null);
  const curRef = useRef(cur);
  const playingRef = useRef(playing);
  const activeImgRef = useRef(activeImg);

  const SPEED_STEPS = [
    { label: '1×', interval: 2000 },
    { label: '2×', interval: 1000 },
    { label: '3×', interval: 650 },
    { label: '5×', interval: 380 },
    { label: '10×', interval: 180 },
  ];
  const interval = SPEED_STEPS[speed]?.interval ?? 650;

  useEffect(() => { curRef.current = cur; }, [cur]);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { activeImgRef.current = activeImg; }, [activeImg]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // SV URL
  const svUrl = useCallback((step, idx) => {
    let heading = '';
    if (idx > 0) {
      const prev = steps[idx - 1];
      const dLat = step.lat - prev.lat, dLng = step.lng - prev.lng;
      heading = `&heading=${Math.round(Math.atan2(dLng, dLat) * 180 / Math.PI)}`;
    }
    return `/api/sv-proxy?lat=${step.lat}&lng=${step.lng}${heading ? `&heading=${heading.slice(9)}` : ''}&w=800&h=500`;
  }, [steps]);

  // Static map URL (via API proxy to avoid CORS)
  const staticMapUrl = useCallback((step) => {
    const pathPts = steps.filter((_, i) => i % 4 === 0 || i === steps.length - 1)
      .map(p => `${p.lat},${p.lng}`).join('|');
    return `/api/static-map?lat=${step.lat}&lng=${step.lng}&path=${encodeURIComponent(pathPts)}`;
  }, [steps]);

  // Direct SV URL (using api key from server)
  const directSvUrl = useCallback((step, idx, w = 800, h = 500) => {
    let heading = '';
    if (idx > 0) {
      const prev = steps[idx - 1];
      const dLat = step.lat - prev.lat, dLng = step.lng - prev.lng;
      heading = Math.round(Math.atan2(dLng, dLat) * 180 / Math.PI);
    }
    const params = new URLSearchParams({ lat: step.lat, lng: step.lng, w, h });
    if (heading) params.set('heading', heading);
    return `/api/sv?${params}`;
  }, [steps]);

  const staticMapUrlDirect = useCallback((step) => {
    const pathPts = steps.filter((_, i) => i % 4 === 0 || i === steps.length - 1)
      .map(p => `${p.lat},${p.lng}`).join('|');
    return `/api/staticmap?lat=${step.lat}&lng=${step.lng}&path=${encodeURIComponent(pathPts)}`;
  }, [steps]);

  // ルート全体マップ（start〜end中点を中心に広いズーム）
  const routeOverviewUrl = useCallback((step) => {
    const first = steps[0], last = steps[steps.length - 1];
    const midLat = (first.lat + last.lat) / 2;
    const midLng = (first.lng + last.lng) / 2;
    const pathPts = steps.filter((_, i) => i % 3 === 0 || i === steps.length - 1)
      .map(p => `${p.lat},${p.lng}`).join('|');
    // 現在地マーカーとして current step を渡す
    return `/api/staticmap?lat=${midLat}&lng=${midLng}&path=${encodeURIComponent(pathPts)}&marker=${step.lat},${step.lng}&zoom=13`;
  }, [steps]);

  // Crossfade
  const crossfade = useCallback((url) => {
    const imgA = imgARef.current, imgB = imgBRef.current;
    if (!imgA || !imgB) return;
    const next = activeImgRef.current === 'A' ? imgB : imgA;
    const prev = activeImgRef.current === 'A' ? imgA : imgB;
    next.src = url;
    next.onload = () => {
      next.style.opacity = '1'; prev.style.opacity = '0';
      setActiveImg(a => a === 'A' ? 'B' : 'A');
    };
    next.onerror = () => {};
  }, []);

  // Render step
  const renderStep = useCallback((c, instant = false) => {
    const step = steps[c];
    if (!step) return;
    const url = directSvUrl(step, c);
    if (instant) {
      const imgA = imgARef.current;
      if (imgA) { imgA.src = url; imgA.style.opacity = '1'; }
      const imgB = imgBRef.current;
      if (imgB) imgB.style.opacity = '0';
      setActiveImg('A');
    } else {
      crossfade(url);
    }
    // ミニマップ更新：高速時(3×以上)はdebounceなしで即時更新
    const currentSpeed = speedRef.current;
    const currentInterval = SPEED_STEPS[currentSpeed]?.interval ?? 650;
    const isHighSpeed = currentSpeed >= 3; // 5×・10×
    const updateMinimap = () => {
      setMinimapSrc(staticMapUrlDirect(step));
      setRouteMapSrc(routeOverviewUrl(step));
    };
    clearTimeout(minimapTimerRef.current);
    if (isHighSpeed) {
      updateMinimap();
    } else {
      minimapTimerRef.current = setTimeout(updateMinimap, Math.min(currentInterval, 500));
    }
  }, [steps, directSvUrl, crossfade, staticMapUrlDirect, routeOverviewUrl]);

  // Init
  useEffect(() => {
    renderStep(0, true);
    setTimeout(() => setPlaying(true), 600);
  }, []);

  // Playback
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCur(c => {
          const next = c + 1;
          if (next >= steps.length) { setPlaying(false); return c; }
          renderStep(next, false);
          return next;
        });
      }, interval);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, interval, steps, renderStep]);

  const goTo = useCallback((c, instant = false) => {
    setPlaying(false);
    clearInterval(timerRef.current);
    setCur(c);
    renderStep(c, instant);
  }, [renderStep]);

  const togglePlay = () => setPlaying(p => !p);
  const goToStart = () => goTo(0, true);
  const prevStep = () => goTo(Math.max(0, cur - 1));
  const nextStep = () => goTo(Math.min(steps.length - 1, cur + 1));
  const skipFwd = () => goTo(Math.min(steps.length - 1, cur + 8));

  const pct = ((cur + 1) / steps.length) * 100;
  const step = steps[cur] || {};

  // Filmstrip toggle
  const toggleFilmstrip = () => {
    setFilmVisible(v => !v);
    clearTimeout(filmHideRef.current);
    if (!filmVisible) filmHideRef.current = setTimeout(() => setFilmVisible(false), 5000);
  };

  // Recording
  const toggleRecord = async () => {
    if (isRecording) {
      if (mediaRecRef.current?.state !== 'inactive') mediaRecRef.current.stop();
      setIsRecording(false);
      return;
    }
    if (!window.MediaRecorder) return alert('このブラウザは録画に非対応です');
    const wrap = document.getElementById('sv-wrap');
    const canvas = document.createElement('canvas');
    canvas.width = wrap.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = wrap.offsetHeight * (window.devicePixelRatio || 1);
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(10);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
    const mr = new MediaRecorder(stream, { mimeType: mime });
    recChunksRef.current = [];
    mr.ondataavailable = e => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(recChunksRef.current, { type: 'video/webm' });
      if (blob.size === 0) return alert('録画データが空です');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'street-journey.webm'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    };
    mr.start(200);
    mediaRecRef.current = mr;
    setIsRecording(true);
    const drawLoop = () => {
      if (mediaRecRef.current?.state === 'inactive') return;
      const el = activeImgRef.current === 'A' ? imgARef.current : imgBRef.current;
      try {
        if (el?.complete && el.naturalWidth > 0) {
          ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'rgba(0,0,0,.5)';
          ctx.fillRect(0, canvas.height - 56, canvas.width, 56);
          ctx.fillStyle = '#fff'; ctx.font = `bold ${canvas.width * .018}px sans-serif`;
          ctx.fillText(step.instruction || '', 14 * (window.devicePixelRatio || 1), canvas.height - 30 * (window.devicePixelRatio || 1));
        }
      } catch {}
      requestAnimationFrame(drawLoop);
    };
    drawLoop();
    if (!playing) setPlaying(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,0,0,.82)', backdropFilter: 'blur(10px)', gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,.9)', letterSpacing: '.07em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {origin} → {destination}
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: '.06em', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span>{steps.length} waypoints · {travelMode}</span>
            {routeInfo?.duration && <span style={{ color: 'rgba(255,200,80,.85)' }}>🕐 {routeInfo.duration}</span>}
            {routeInfo?.distance && <span style={{ color: 'rgba(255,200,80,.85)' }}>📍 {routeInfo.distance}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <Btn onClick={goToStart}>⏮ Start</Btn>
          <Btn onClick={toggleRecord} style={{ color: isRecording ? '#ff6060' : undefined, background: isRecording ? 'rgba(255,60,60,.25)' : undefined }}>
            {isRecording ? '⏹ STOP' : '⏺ REC'}
          </Btn>
          <Btn onClick={onClose} style={{ padding: '7px 14px', fontSize: 10, letterSpacing: '.06em' }}>← 検索に戻る</Btn>
        </div>
      </div>

      {/* SV */}
      <div id="sv-wrap" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#111' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: 2, width: pct + '%', background: 'rgba(255,255,255,.9)', transition: 'width .35s ease', zIndex: 10 }} />
        <img ref={imgARef} src="" alt="" crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1, transition: 'opacity .45s' }} />
        <img ref={imgBRef} src="" alt="" crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 2, opacity: 0, transition: 'opacity .45s' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(transparent,rgba(0,0,0,.85))', pointerEvents: 'none', zIndex: 3 }} />

        {/* Minimap */}
        <div style={{ position: 'absolute', bottom: 14, right: 14, width: 158, borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(255,255,255,.25)', zIndex: 8, boxShadow: '0 4px 20px rgba(0,0,0,.6)', background: '#1a1a2e' }}>
          {/* 切り替えタブ */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,.7)' }}>
            {[{ key: 'current', label: '現在地' }, { key: 'route', label: 'ルート全体' }].map(({ key, label }) => (
              <button key={key} onClick={() => setMinimapMode(key)} style={{
                flex: 1, padding: '4px 0', border: 'none', cursor: 'pointer',
                background: minimapMode === key ? 'rgba(255,200,80,.25)' : 'transparent',
                borderBottom: minimapMode === key ? '2px solid #ffc850' : '2px solid transparent',
                fontFamily: "'DM Mono',monospace", fontSize: 8,
                color: minimapMode === key ? '#ffc850' : 'rgba(255,255,255,.4)',
                letterSpacing: '.05em', transition: 'all .15s',
              }}>{label}</button>
            ))}
          </div>
          {/* マップ画像 */}
          <div style={{ height: 110, position: 'relative' }}>
            {minimapMode === 'current'
              ? minimapSrc
                ? <img src={minimapSrc} alt="map" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.3)' }}>読込中...</div>
              : routeMapSrc
                ? <img src={routeMapSrc} alt="route" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.3)' }}>読込中...</div>
            }
          </div>
        </div>

        {/* REC badge */}
        {isRecording && (
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,.65)', padding: '5px 10px', borderRadius: 20, zIndex: 20 }}>
            <div style={{ width: 8, height: 8, background: '#ff4444', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#fff', letterSpacing: '.08em' }}>REC</span>
          </div>
        )}

        {/* Step info */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, right: 178, zIndex: 5 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3, textShadow: '0 1px 10px rgba(0,0,0,.9)' }}>{step.instruction || '移動中'}</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 3, letterSpacing: '.06em' }}>{step.instructionEn || 'En route'}</div>
          {step.distance && <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{step.distance}</div>}
        </div>

        <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,.55)', zIndex: 5, background: 'rgba(0,0,0,.45)', padding: '4px 8px', borderRadius: 20 }}>
          {cur + 1} / {steps.length}
        </div>
      </div>

      {/* Filmstrip toggle */}
      <div onClick={toggleFilmstrip} style={{ height: 8, background: 'rgba(255,255,255,.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.14)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}>
        <div style={{ width: 32, height: 2, background: 'rgba(255,255,255,.3)', borderRadius: 2 }} />
      </div>

      {/* Filmstrip */}
      {filmVisible && (
        <div style={{ height: 68, background: 'rgba(0,0,0,.92)', display: 'flex', alignItems: 'center', padding: '0 8px', gap: 4, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', flexShrink: 0 }}>
          {steps.map((s, i) => (
            <img key={i}
              src={`/api/sv?lat=${s.lat}&lng=${s.lng}&w=112&h=112`}
              alt="" loading="lazy"
              onClick={() => goTo(i)}
              style={{ width: 52, height: 52, borderRadius: 4, objectFit: 'cover', flexShrink: 0, cursor: 'pointer', border: i === cur ? '2px solid #fff' : '2px solid transparent', opacity: i === cur ? 1 : 0.45, transition: 'border-color .15s, opacity .15s', scrollSnapAlign: 'center' }}
            />
          ))}
        </div>
      )}

      {/* Scrubber */}
      <div style={{ padding: '8px 16px 4px', background: 'rgba(0,0,0,.9)', flexShrink: 0 }}>
        <input type="range" min={0} max={steps.length - 1} value={cur}
          onChange={e => goTo(parseInt(e.target.value))}
          style={{ width: '100%', WebkitAppearance: 'none', height: 2, background: `linear-gradient(to right,#fff ${pct}%,rgba(255,255,255,.15) ${pct}%)`, borderRadius: 2, outline: 'none', cursor: 'pointer' }} />
      </div>

      {/* Speed */}
      <div style={{ padding: '6px 14px', background: 'rgba(0,0,0,.9)', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.6)', letterSpacing: '.1em', marginRight: 4 }}>SPEED</span>
        {SPEED_STEPS.map((s, i) => (
          <button key={s.label} onClick={() => setSpeed(i)} style={{
            flex: 1, padding: '6px 0',
            background: speed === i ? 'rgba(255,200,80,.2)' : 'rgba(255,255,255,.06)',
            border: `1px solid ${speed === i ? 'rgba(255,200,80,.7)' : 'rgba(255,255,255,.22)'}`,
            borderRadius: 8,
            fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: speed === i ? 600 : 400,
            color: speed === i ? '#ffc850' : 'rgba(255,255,255,.6)',
            cursor: 'pointer', transition: 'all .15s',
          }}>{s.label}</button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 'env(safe-area-inset-bottom,0px)', background: 'rgba(0,0,0,.9)', flexShrink: 0 }}>
        {[
          { icon: '⏮', label: 'START/始点', action: goToStart },
          { icon: '◀', label: 'PREV/前', action: prevStep },
          { icon: playing ? '⏸' : '▶', label: '', action: togglePlay, big: true },
          { icon: '▶', label: 'NEXT/次', action: nextStep },
          { icon: '⏭', label: 'SKIP/スキップ', action: skipFwd },
        ].map((c, i) => (
          <button key={i} onClick={c.action} style={{
            flex: 1, background: 'none', border: 'none', color: c.big ? '#fff' : 'rgba(255,255,255,.45)',
            padding: '13px 8px', fontSize: c.big ? 24 : 18, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            {c.icon}
            {c.label && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: '.06em', color: 'rgba(255,255,255,.25)' }}>{c.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: 'rgba(255,255,255,.12)', border: 'none', borderRadius: 16,
      padding: '7px 12px', color: 'rgba(255,255,255,.75)', fontFamily: "'DM Mono',monospace",
      fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '.06em', ...style
    }}>{children}</button>
  );
}

/* ─────────── MAIN PAGE ─────────── */
export default function Home() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState('walking');
  const [loading, setLoading] = useState(false);
  const [loaderMsg, setLoaderMsg] = useState({ ja: '', en: '', detail: '' });
  const [steps, setSteps] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const modes = [
    { id: 'walking', ja: '🚶 徒歩', en: 'Walking' },
    { id: 'driving', ja: '🚗 車', en: 'Driving' },
    { id: 'bicycling', ja: '🚴 自転車', en: 'Cycling' },
  ];

  function stripHtml(h) { return h.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  function lerp(a, b, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }); }
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
      const dr = await fetch(`/api/directions?origin=${oL.lat},${oL.lng}&destination=${dL.lat},${dL.lng}&mode=${mode}`).then(r => r.json());

      let waypoints = [];
      if (dr.status === 'OK' && dr.routes.length) {
        // 所要時間・距離をrouteInfoとして保存
        const leg = dr.routes[0].legs[0];
        setRouteInfo({
          duration: leg.duration?.text || '',
          distance: leg.distance?.value >= 1000
            ? leg.distance?.text || ''
            : `${leg.distance?.value || ''}m`,
        });
        for (const leg of dr.routes[0].legs) {
          for (const step of leg.steps) {
            const instr = stripHtml(step.html_instructions);
            const dist = step.distance?.text || '';
            const sub = lerp(step.start_location, step.end_location, 4);
            sub.forEach((p, i) => waypoints.push({ lat: p.lat, lng: p.lng, instruction: i === 0 ? instr : '', instructionEn: i === 0 ? instr : '', distance: i === 0 ? dist : '' }));
          }
          const last = leg.end_location;
          waypoints.push({ lat: last.lat, lng: last.lng, instruction: '到着', instructionEn: 'Arrived', distance: '' });
        }
      } else {
        // Fallback interpolation
        const sub = lerp(oL, dL, 40);
        waypoints = sub.map((p, i) => ({ lat: p.lat, lng: p.lng, instruction: i === 0 ? '出発' : i === 40 ? '到着' : `移動中 ${Math.round(i / 40 * 100)}%`, instructionEn: i === 0 ? 'Departure' : i === 40 ? 'Arrived' : `En route ${Math.round(i / 40 * 100)}%`, distance: '' }));
      }

      setLoaderMsg({ ja: '準備完了', en: 'READY', detail: `${waypoints.length}地点を取得しました` });
      await new Promise(r => setTimeout(r, 400));
      setSteps(waypoints);
    } catch (e) {
      alert(e.message || 'エラーが発生しました');
    }
    setLoading(false);
  }

  if (steps) return <Viewer steps={steps} origin={origin} destination={destination} travelMode={modes.find(m2 => m2.id === mode)?.ja || mode} routeInfo={routeInfo} onClose={() => setSteps(null)} />;

  return (
    <>
      <Head>
        <title>Street Journey</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Shippori+Mincho:wght@400;700&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
          input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#ffc850; cursor:pointer; }
          input[type=range] { -webkit-appearance:none; cursor:pointer; }
          * { -webkit-tap-highlight-color: transparent; }
          body { overflow-y: auto; overflow-x: hidden; background: #0e0e0e; }
          ::placeholder { color: rgba(255,255,255,.25) !important; }
        `}</style>
      </Head>

      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, zIndex: 200 }}>
          <div style={{ width: 42, height: 42, border: '2px solid rgba(255,255,255,.15)', borderTopColor: 'rgba(255,255,255,.8)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.9)', fontFamily: "'DM Mono',monospace", letterSpacing: '.06em' }}>{loaderMsg.ja}</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,.6)', letterSpacing: '.15em', textTransform: 'uppercase' }}>{loaderMsg.en}</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,.25)', letterSpacing: '.08em' }}>{loaderMsg.detail}</div>
        </div>
      )}

      <div style={{ background: '#0e0e0e', minHeight: '100vh', paddingBottom: 32 }}>
        {/* Header */}
        <div style={{ padding: '28px 24px 16px', borderBottom: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, color: '#fff' }}>Street <span style={{ color: '#ffc850' }}>Journey</span></div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,.6)', letterSpacing: '.1em', marginTop: 5 }}>行きたい場所へ、すぐ行こう。 / Go anywhere. Right now.</div>
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.25)', letterSpacing: '.1em', border: '1px solid rgba(255,255,255,.12)', padding: '4px 8px', borderRadius: 20 }}>BETA v3</div>
        </div>

        {/* Route card */}
        <Card title="Route / ルート">
          <RouteInput value={origin} onChange={setOrigin} onSelect={setOrigin} placeholder="出発地 / Origin（例: 渋谷駅、Shibuya Station）" dotColor="#4ade80" label="Origin" />
          <RouteInput value={destination} onChange={setDestination} onSelect={setDestination} placeholder="目的地 / Destination（例: 原宿駅、Harajuku）" dotColor="#f87171" label="Destination" />
          <div style={{ padding: '4px 16px 10px', fontFamily: "'DM Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,.2)', letterSpacing: '.08em' }}>
            日本語・英語・住所・施設名対応 / Supports Japanese, English, addresses & place names
          </div>
        </Card>

        {/* Mode */}
        <Card title="Travel Mode / 移動手段">
          <div style={{ display: 'flex', padding: 10, gap: 6 }}>
            {modes.map(m2 => (
              <button key={m2.id} onClick={() => setMode(m2.id)} style={{
                flex: 1, padding: '10px 4px',
                border: `1px solid ${mode === m2.id ? '#ffc850' : 'rgba(255,255,255,.22)'}`,
                borderRadius: 8,
                background: mode === m2.id ? 'rgba(255,200,80,.12)' : 'rgba(255,255,255,.04)',
                color: mode === m2.id ? '#ffc850' : 'rgba(255,255,255,.6)',
                cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '.04em',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all .15s',
              }}>
                {m2.ja}
                <span style={{ fontSize: 8, opacity: .7 }}>{m2.en}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Start */}
        <button onClick={startJourney} style={{
          margin: '14px 16px 0', width: 'calc(100% - 32px)', padding: 17,
          background: '#ffc850', color: '#0a0a0a', border: 'none', borderRadius: 12,
          fontFamily: "'DM Mono',monospace", fontSize: 12, fontWeight: 700, letterSpacing: '.14em',
          textTransform: 'uppercase', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          ▶ JOURNEY START
          <span style={{ fontFamily: 'inherit', fontSize: 10, color: 'rgba(0,0,0,.5)', fontWeight: 400, letterSpacing: 0 }}>旅を始める</span>
        </button>
      </div>
    </>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ margin: '14px 16px 0', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 12, overflow: 'visible' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,.15)', fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.14em', color: 'rgba(255,255,255,.25)', textTransform: 'uppercase' }}>{title}</div>
      {children}
    </div>
  );
}
