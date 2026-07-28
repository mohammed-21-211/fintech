// Fintech Promo — Scenes (shared by AR + EN versions)
// 30-second promo, 1080×1080 (Instagram feed).
// Language is selected by window.PROMO_LANG ('ar' | 'en') set in the host HTML.
//
// Scene plan:
//   0.0 –  4.0 s  Hook            "Where does your money go?"
//   4.0 –  8.0 s  Brand reveal    Fintech logo + tagline
//   8.0 – 15.0 s  Feature 1       Quick add transaction (form mockup)
//  15.0 – 22.0 s  Feature 2       Income vs Expenses analytics
//  22.0 – 27.5 s  Feature 3       Free • No card • Bilingual
//  27.5 – 30.0 s  CTA             "Start free →" + domain

// ── Localized copy ──────────────────────────────────────────────────────────
const COPY = {
  ar: {
    fontStack: "'Noto Sans Arabic', 'Montserrat', sans-serif",
    dir: 'rtl',

    s1_hook:   'أين تذهب أموالك؟',
    s1_sub:    'كل شهر… نفس السؤال.',

    s2_brand:  'Fintech',
    s2_tag:    'تحكّم كامل بأموالك.',

    s3_eyebrow:  'سرعة',
    s3_caption:  'أضف معاملة في ثوانٍ',
    s3_label:    'تسوّق البقالة',
    s3_category: '🛒 الطعام',
    s3_amount_label: 'المبلغ',
    s3_title_label:  'العنوان',
    s3_save:     'حفظ',
    s3_toast:    'تم حفظ المعاملة',

    s4_eyebrow:  'تحليلات',
    s4_caption:  'افهم دخلك ومصروفاتك بنظرة واحدة',
    s4_income:   'الدخل',
    s4_expenses: 'المصروفات',
    s4_delta:    '+12.5%',
    s4_delta_sub:'مقارنة بالشهر الماضي',
    s4_months: ['يناير','فبراير','مارس','أبريل','مايو','يونيو'],

    s5_eyebrow:  'مجاناً',
    s5_headline_a: 'بدون بطاقة.',
    s5_headline_b: 'بدون التزام.',
    s5_pill1: 'عربي + إنجليزي',
    s5_pill2: 'يعمل على الجوال',
    s5_pill3: 'محمي بالكامل',

    s6_cta:    'ابدأ الآن مجاناً',
    s6_arrow:  '←',
    s6_domain: 'fintech.app',
  },
  en: {
    fontStack: "'Montserrat', 'Inter', system-ui, sans-serif",
    dir: 'ltr',

    s1_hook:   'Where does your money go?',
    s1_sub:    'Every month… same question.',

    s2_brand:  'Fintech',
    s2_tag:    'Take full control of your money.',

    s3_eyebrow:  'Fast',
    s3_caption:  'Log a transaction in seconds',
    s3_label:    'Grocery shopping',
    s3_category: '🛒 Food',
    s3_amount_label: 'Amount',
    s3_title_label:  'Title',
    s3_save:     'Save',
    s3_toast:    'Transaction saved',

    s4_eyebrow:  'Insights',
    s4_caption:  'See income vs. expenses at a glance',
    s4_income:   'Income',
    s4_expenses: 'Expenses',
    s4_delta:    '+12.5%',
    s4_delta_sub:'vs last month',
    s4_months: ['Jan','Feb','Mar','Apr','May','Jun'],

    s5_eyebrow:  'Free',
    s5_headline_a: 'No card.',
    s5_headline_b: 'No commitment.',
    s5_pill1: 'EN + AR',
    s5_pill2: 'Mobile-first',
    s5_pill3: 'Fully secure',

    s6_cta:    'Start free',
    s6_arrow:  '→',
    s6_domain: 'fintech.app',
  },
};

// ── Design tokens (mirror of colors_and_type.css) ───────────────────────────
const T = {
  bg:        '#0A0A0A',
  elevated:  '#111111',
  surface:   '#161616',
  overlay:   '#1E1E1E',
  input:     '#141414',
  border:    '#262626',
  borderHi:  '#2E2E2E',
  text:      '#FFFFFF',
  text2:     '#888888',
  text3:     '#555555',
  inverse:   '#0A0A0A',
  lime:      '#D4F03C',
  limeDark:  '#B8D832',
  limeMuted: 'rgba(212, 240, 60, 0.08)',
  limeGlow:  'rgba(212, 240, 60, 0.18)',
  success:   '#4ADE80',
  error:     '#F87171',
};

// Convenience: easings the codebase favors (ease, not cubic-bezier)
const E = Easing;

// ── Small primitives ────────────────────────────────────────────────────────

// Fade + slide entry/exit wrapper. Use INSIDE a <Sprite>.
function Anim({ in: inT = 0.35, out: outT = 0.35, dy = 16, children, style }) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - outT);
  let opacity = 1, ty = 0;
  if (localTime < inT) {
    const t = E.easeOutCubic(clamp(localTime / inT, 0, 1));
    opacity = t;
    ty = (1 - t) * dy;
  } else if (localTime > exitStart) {
    const t = E.easeInCubic(clamp((localTime - exitStart) / outT, 0, 1));
    opacity = 1 - t;
    ty = -t * (dy * 0.5);
  }
  return (
    <div style={{ opacity, transform: `translateY(${ty}px)`, ...style }}>
      {children}
    </div>
  );
}

// "F" logo mark — lime square with black F
function LogoMark({ size = 56, radius }) {
  const r = radius ?? Math.round(size * 0.22);
  return (
    <div style={{
      width: size, height: size,
      background: T.lime,
      borderRadius: r,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Montserrat', 'Inter', sans-serif",
      fontWeight: 900,
      fontSize: size * 0.55,
      color: T.inverse,
      letterSpacing: '-0.02em',
      flexShrink: 0,
    }}>
      F
    </div>
  );
}

// Inline eyebrow chip (lime, uppercase)
function Eyebrow({ text, lang }) {
  // No uppercase transform on Arabic — looks wrong
  const isAr = lang === 'ar';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 16px',
      background: T.limeMuted,
      border: `1px solid ${T.limeGlow}`,
      borderRadius: 9999,
      color: T.lime,
      fontFamily: COPY[lang].fontStack,
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: isAr ? 0 : '2.5px',
      textTransform: isAr ? 'none' : 'uppercase',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: T.lime,
      }}/>
      {text}
    </span>
  );
}

// Ambient lime radial glow centered behind a scene
function LimeGlow({ size = 900, opacity = 1, x = 540, y = 540 }) {
  return (
    <div style={{
      position: 'absolute',
      left: x - size / 2, top: y - size / 2,
      width: size, height: size,
      background: `radial-gradient(circle, rgba(212,240,60,0.12) 0%, transparent 65%)`,
      opacity,
      pointerEvents: 'none',
    }}/>
  );
}

// Slide indicator dots — bottom of frame
function SceneDots({ total = 6, active = 0 }) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 36,
      display: 'flex', justifyContent: 'center', gap: 10,
      pointerEvents: 'none',
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === active ? 28 : 6,
          height: 6,
          borderRadius: 3,
          background: i === active ? T.lime : '#333',
          transition: 'all 250ms ease',
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1 — Hook (0–4s)
// "Where does your money go?" with chaotic floating amounts behind.
// ─────────────────────────────────────────────────────────────────────────────

function SceneHook({ lang }) {
  const c = COPY[lang];
  const { localTime, duration, progress } = useSprite();

  // Generate floating $ blots — deterministic so SSR/scrub is stable
  const blots = [
    { x: 120, y: 200, amt: '−$54',   delay: 0.0 },
    { x: 820, y: 240, amt: '−$420',  delay: 0.15 },
    { x: 180, y: 760, amt: '−$33',   delay: 0.35 },
    { x: 800, y: 740, amt: '−$1,240',delay: 0.55 },
    { x: 90,  y: 480, amt: '−$89',   delay: 0.20 },
    { x: 900, y: 540, amt: '−$210',  delay: 0.45 },
    { x: 540, y: 180, amt: '−$12',   delay: 0.70 },
    { x: 540, y: 900, amt: '−$76',   delay: 0.80 },
  ];

  return (
    <>
      {/* Background floating $ amounts */}
      {blots.map((b, i) => {
        const t = clamp((localTime - b.delay) / 0.6, 0, 1);
        const eased = E.easeOutCubic(t);
        const exit = clamp((localTime - (duration - 0.5)) / 0.5, 0, 1);
        const op = (0.18 + 0.08 * Math.sin((localTime + i) * 1.3)) * eased * (1 - exit);
        const drift = Math.sin((localTime + i * 0.7) * 0.8) * 8;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: b.x, top: b.y + drift,
            fontFamily: c.fontStack,
            fontWeight: 700,
            fontSize: 32 + (i % 3) * 10,
            color: T.text3,
            letterSpacing: '-0.02em',
            opacity: op,
            transform: 'translate(-50%, -50%)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {b.amt}
          </div>
        );
      })}

      {/* Center hook */}
      <Anim in={0.5} out={0.4}>
        <div style={{
          position: 'absolute',
          left: 0, right: 0, top: 360,
          textAlign: 'center',
          fontFamily: c.fontStack,
          padding: '0 80px',
        }}>
          <div style={{
            fontSize: lang === 'ar' ? 108 : 96,
            fontWeight: 900,
            color: T.text,
            letterSpacing: lang === 'ar' ? '0' : '-3px',
            lineHeight: 1.05,
          }}>
            {c.s1_hook.split('').map((ch, i) => {
              if (ch === '؟' || ch === '?') {
                return <span key={i} style={{ color: T.lime }}>{ch}</span>;
              }
              return ch;
            })}
          </div>
          <div style={{
            marginTop: 32,
            fontSize: 36,
            fontWeight: 500,
            color: T.text2,
            letterSpacing: lang === 'ar' ? '0' : '-0.5px',
          }}>
            {c.s1_sub}
          </div>
        </div>
      </Anim>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — Brand reveal (4–8s)
// ─────────────────────────────────────────────────────────────────────────────

function SceneBrand({ lang }) {
  const c = COPY[lang];
  const { localTime, duration } = useSprite();

  // Logo mark scales in with easeOutBack, then word "Fintech" slides in
  const markT = E.easeOutBack(clamp(localTime / 0.7, 0, 1));
  const wordT = E.easeOutCubic(clamp((localTime - 0.4) / 0.6, 0, 1));
  const tagT  = E.easeOutCubic(clamp((localTime - 0.9) / 0.6, 0, 1));

  const exitT = clamp((localTime - (duration - 0.4)) / 0.4, 0, 1);
  const exitOp = 1 - E.easeInCubic(exitT);

  // Glow grows a hair through the scene
  const glowOp = clamp((localTime - 0.2) / 1.0, 0, 1) * exitOp;

  return (
    <>
      <LimeGlow size={1100} opacity={glowOp * 1.4} />

      {/* Center stack: logomark + "Fintech" + tagline */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 36,
        opacity: exitOp,
      }}>
        {/* Lockup row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{
            transform: `scale(${markT})`,
            transformOrigin: 'center',
          }}>
            <LogoMark size={180} />
          </div>
          <div style={{
            opacity: wordT,
            transform: `translateX(${(1 - wordT) * (lang === 'ar' ? 40 : -40)}px)`,
            fontFamily: c.fontStack,
            fontWeight: 900,
            fontSize: 160,
            color: T.text,
            letterSpacing: '-5px',
            lineHeight: 1,
          }}>
            {c.s2_brand}
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: tagT,
          transform: `translateY(${(1 - tagT) * 20}px)`,
          fontFamily: c.fontStack,
          fontSize: lang === 'ar' ? 52 : 46,
          fontWeight: 500,
          color: T.text2,
          letterSpacing: lang === 'ar' ? '0' : '-0.5px',
          textAlign: 'center',
          padding: '0 80px',
          marginTop: 16,
        }}>
          {c.s2_tag}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — Quick add transaction (8–15s)
// Form fills in: title types, category appears, amount counts up, Save pressed,
// toast confirms.
// ─────────────────────────────────────────────────────────────────────────────

function SceneQuickAdd({ lang }) {
  const c = COPY[lang];
  const { localTime, duration } = useSprite();
  const isAr = lang === 'ar';

  const exitT = clamp((localTime - (duration - 0.4)) / 0.4, 0, 1);
  const exitOp = 1 - E.easeInCubic(exitT);

  // Sub-timeline (relative to scene start)
  // 0.0 – 0.6  card slides in
  // 0.6 – 1.8  title types
  // 1.8 – 2.4  category pill appears
  // 2.4 – 3.6  amount counts up
  // 3.8 – 4.3  save button press
  // 4.3 – 6.6  toast visible

  const cardT  = E.easeOutCubic(clamp(localTime / 0.6, 0, 1));
  const titleProg = clamp((localTime - 0.6) / 1.2, 0, 1);
  const titleStr = c.s3_label.slice(0, Math.ceil(titleProg * c.s3_label.length));
  const catT   = E.easeOutBack(clamp((localTime - 1.8) / 0.6, 0, 1));
  const amtProg = clamp((localTime - 2.4) / 1.2, 0, 1);
  const amtVal = (54.20 * E.easeOutCubic(amtProg)).toFixed(2);
  const saveT = clamp((localTime - 3.8) / 0.5, 0, 1);
  const savePressed = localTime > 3.85 && localTime < 4.15;
  const toastVisible = localTime > 4.3 && localTime < duration - 0.2;
  const toastT = clamp((localTime - 4.3) / 0.4, 0, 1);
  const captionT = E.easeOutCubic(clamp((localTime - 0.4) / 0.6, 0, 1));

  return (
    <>
      <LimeGlow size={900} opacity={0.5 * exitOp} y={620} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        paddingTop: 110,
        opacity: exitOp,
        direction: c.dir,
      }}>
        {/* Eyebrow + caption */}
        <div style={{
          opacity: captionT,
          transform: `translateY(${(1 - captionT) * 12}px)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          textAlign: 'center', padding: '0 80px',
        }}>
          <Eyebrow text={c.s3_eyebrow} lang={lang} />
          <div style={{
            fontFamily: c.fontStack,
            fontSize: isAr ? 56 : 52,
            fontWeight: 900,
            color: T.text,
            letterSpacing: isAr ? '0' : '-1px',
            lineHeight: 1.1,
            maxWidth: 880,
          }}>
            {c.s3_caption}
          </div>
        </div>

        {/* Transaction card */}
        <div style={{
          marginTop: 56,
          width: 720,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 28,
          padding: '36px 40px',
          opacity: cardT,
          transform: `translateY(${(1 - cardT) * 30}px) scale(${0.96 + 0.04 * cardT})`,
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          position: 'relative',
        }}>
          {/* Title input */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontFamily: c.fontStack,
              fontSize: 16, fontWeight: 500, color: T.text2,
              marginBottom: 10,
            }}>{c.s3_title_label}</div>
            <div style={{
              height: 64, background: T.input,
              border: `1px solid ${titleProg > 0 && titleProg < 1 ? T.lime : T.border}`,
              boxShadow: titleProg > 0 && titleProg < 1 ? `0 0 0 3px ${T.limeMuted}` : 'none',
              borderRadius: 14,
              display: 'flex', alignItems: 'center',
              padding: '0 20px',
              fontFamily: c.fontStack,
              fontSize: 24, fontWeight: 500, color: T.text,
            }}>
              {titleStr}
              {titleProg > 0 && titleProg < 1 && (
                <span style={{
                  display: 'inline-block', width: 2, height: 26,
                  background: T.lime, marginLeft: 4,
                  opacity: Math.sin(localTime * 20) > 0 ? 1 : 0,
                }}/>
              )}
            </div>
          </div>

          {/* Category + Amount row */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
            {/* Category pill */}
            <div style={{
              flex: 1,
              opacity: catT,
              transform: `scale(${0.7 + 0.3 * catT})`,
              transformOrigin: isAr ? 'right' : 'left',
            }}>
              <div style={{
                fontFamily: c.fontStack,
                fontSize: 16, fontWeight: 500, color: T.text2,
                marginBottom: 10,
              }}>{c.s3_category.split(' ')[0] === '🛒' ? (isAr ? 'الفئة' : 'Category') : ''}</div>
              <div style={{
                height: 56, background: T.input,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                display: 'flex', alignItems: 'center',
                padding: '0 20px',
                fontFamily: c.fontStack,
                fontSize: 22, fontWeight: 600, color: T.text,
                gap: 8,
              }}>
                {c.s3_category}
              </div>
            </div>

            {/* Amount */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: c.fontStack,
                fontSize: 16, fontWeight: 500, color: T.text2,
                marginBottom: 10,
              }}>{c.s3_amount_label}</div>
              <div style={{
                height: 56, background: T.input,
                border: `1px solid ${amtProg > 0 && amtProg < 1 ? T.lime : T.border}`,
                boxShadow: amtProg > 0 && amtProg < 1 ? `0 0 0 3px ${T.limeMuted}` : 'none',
                borderRadius: 14,
                display: 'flex', alignItems: 'center',
                padding: '0 20px',
                fontFamily: c.fontStack,
                fontSize: 26, fontWeight: 700, color: T.text,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.5px',
              }}>
                <span style={{ color: T.text2, marginRight: 4 }}>$</span>{amtVal}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div style={{
            display: 'flex', justifyContent: isAr ? 'flex-start' : 'flex-end',
          }}>
            <div style={{
              height: 56,
              padding: '0 40px',
              background: T.lime,
              borderRadius: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: c.fontStack,
              fontSize: 22, fontWeight: 700, color: T.inverse,
              transform: savePressed ? 'scale(0.96)' : `scale(${0.9 + 0.1 * saveT})`,
              boxShadow: localTime > 3.6 && localTime < 4.3 ? `0 0 32px ${T.limeGlow}` : 'none',
              transition: 'transform 80ms ease',
              opacity: clamp((localTime - 2.8) / 0.4, 0, 1),
            }}>
              {c.s3_save} {localTime > 4.15 && '✓'}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toastVisible && (
          <div style={{
            marginTop: 32,
            opacity: clamp(toastT, 0, 1),
            transform: `translateY(${(1 - toastT) * 16}px)`,
            background: T.overlay,
            border: `1px solid ${T.success}`,
            borderRadius: 16,
            padding: '16px 28px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(74, 222, 128, 0.18)',
              color: T.success,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: c.fontStack, fontWeight: 900, fontSize: 18,
            }}>✓</div>
            <div style={{
              fontFamily: c.fontStack,
              fontSize: 22, fontWeight: 600, color: T.text,
            }}>{c.s3_toast}</div>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4 — Income vs Expenses analytics (15–22s)
// ─────────────────────────────────────────────────────────────────────────────

function SceneAnalytics({ lang }) {
  const c = COPY[lang];
  const { localTime, duration } = useSprite();
  const isAr = lang === 'ar';

  const exitT = clamp((localTime - (duration - 0.4)) / 0.4, 0, 1);
  const exitOp = 1 - E.easeInCubic(exitT);

  const captionT = E.easeOutCubic(clamp(localTime / 0.6, 0, 1));
  const chartT   = E.easeOutCubic(clamp((localTime - 0.4) / 1.2, 0, 1));
  const deltaT   = E.easeOutBack(clamp((localTime - 1.8) / 0.6, 0, 1));

  // 6 months of paired bars (income / expenses)
  const data = [
    { i: 3200, e: 2400 },
    { i: 3400, e: 2700 },
    { i: 3100, e: 2900 },
    { i: 3800, e: 2600 },
    { i: 4100, e: 2800 },
    { i: 4400, e: 2900 },
  ];
  const maxV = 5000;
  const chartH = 360;

  return (
    <>
      <LimeGlow size={1000} opacity={0.5 * exitOp} y={700} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 100,
        opacity: exitOp,
        direction: c.dir,
      }}>
        {/* Eyebrow + caption */}
        <div style={{
          opacity: captionT,
          transform: `translateY(${(1 - captionT) * 12}px)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          textAlign: 'center', padding: '0 80px',
        }}>
          <Eyebrow text={c.s4_eyebrow} lang={lang} />
          <div style={{
            fontFamily: c.fontStack,
            fontSize: isAr ? 52 : 46,
            fontWeight: 900,
            color: T.text,
            letterSpacing: isAr ? '0' : '-1px',
            lineHeight: 1.15,
            maxWidth: 880,
          }}>
            {c.s4_caption}
          </div>
        </div>

        {/* Chart card */}
        <div style={{
          marginTop: 48,
          width: 880,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 28,
          padding: '32px 36px',
          opacity: chartT,
          transform: `translateY(${(1 - chartT) * 24}px)`,
          position: 'relative',
        }}>
          {/* Legend row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <Legend color={T.lime}   label={c.s4_income}   lang={lang} />
              <Legend color={T.error}  label={c.s4_expenses} lang={lang} />
            </div>
            {/* Delta chip */}
            <div style={{
              opacity: deltaT,
              transform: `scale(${0.5 + 0.5 * deltaT})`,
              transformOrigin: isAr ? 'left' : 'right',
              display: 'flex', flexDirection: 'column',
              alignItems: isAr ? 'flex-start' : 'flex-end',
            }}>
              <div style={{
                fontFamily: c.fontStack,
                fontSize: 40, fontWeight: 900, color: T.success,
                letterSpacing: '-1px',
                fontVariantNumeric: 'tabular-nums',
              }}>{c.s4_delta}</div>
              <div style={{
                fontFamily: c.fontStack,
                fontSize: 16, fontWeight: 500, color: T.text2,
              }}>{c.s4_delta_sub}</div>
            </div>
          </div>

          {/* Bars */}
          <div style={{
            height: chartH,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 18,
            paddingBottom: 36,
            position: 'relative',
            borderBottom: `1px solid ${T.border}`,
          }}>
            {data.map((d, i) => {
              const reveal = clamp((localTime - 0.6 - i * 0.12) / 0.6, 0, 1);
              const e = E.easeOutCubic(reveal);
              const iH = (d.i / maxV) * chartH * e;
              const eH = (d.e / maxV) * chartH * e;
              return (
                <div key={i} style={{
                  flex: 1,
                  display: 'flex', alignItems: 'flex-end',
                  gap: 6, position: 'relative', height: '100%',
                }}>
                  <div style={{
                    flex: 1,
                    height: iH,
                    background: T.lime,
                    borderRadius: '8px 8px 0 0',
                  }}/>
                  <div style={{
                    flex: 1,
                    height: eH,
                    background: T.error,
                    opacity: 0.75,
                    borderRadius: '8px 8px 0 0',
                  }}/>
                  {/* Month label */}
                  <div style={{
                    position: 'absolute',
                    left: 0, right: 0, bottom: -28,
                    textAlign: 'center',
                    fontFamily: c.fontStack,
                    fontSize: 14, fontWeight: 500,
                    color: T.text2,
                  }}>
                    {c.s4_months[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function Legend({ color, label, lang }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: COPY[lang].fontStack,
      fontSize: 18, fontWeight: 600, color: T.text,
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: 4,
        background: color,
      }}/>
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 5 — Free / No card / Bilingual (22–27.5s)
// ─────────────────────────────────────────────────────────────────────────────

function SceneFree({ lang }) {
  const c = COPY[lang];
  const { localTime, duration } = useSprite();
  const isAr = lang === 'ar';

  const exitT = clamp((localTime - (duration - 0.4)) / 0.4, 0, 1);
  const exitOp = 1 - E.easeInCubic(exitT);

  const eyebrowT = E.easeOutBack(clamp(localTime / 0.5, 0, 1));
  const aT       = E.easeOutCubic(clamp((localTime - 0.5) / 0.5, 0, 1));
  const bT       = E.easeOutCubic(clamp((localTime - 0.9) / 0.5, 0, 1));
  const pillsT   = clamp((localTime - 1.6) / 0.4, 0, 1);

  const pills = [c.s5_pill1, c.s5_pill2, c.s5_pill3];

  return (
    <>
      <LimeGlow size={1100} opacity={0.7 * exitOp} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 32,
        opacity: exitOp,
      }}>
        <div style={{
          opacity: eyebrowT,
          transform: `scale(${0.6 + 0.4 * eyebrowT})`,
        }}>
          <Eyebrow text={c.s5_eyebrow} lang={lang} />
        </div>

        <div style={{ textAlign: 'center', padding: '0 80px' }}>
          <div style={{
            opacity: aT,
            transform: `translateY(${(1 - aT) * 24}px)`,
            fontFamily: c.fontStack,
            fontSize: isAr ? 96 : 84,
            fontWeight: 900,
            color: T.text,
            letterSpacing: isAr ? '0' : '-2px',
            lineHeight: 1.05,
          }}>
            {c.s5_headline_a}
          </div>
          <div style={{
            opacity: bT,
            transform: `translateY(${(1 - bT) * 24}px)`,
            fontFamily: c.fontStack,
            fontSize: isAr ? 96 : 84,
            fontWeight: 900,
            color: T.lime,
            letterSpacing: isAr ? '0' : '-2px',
            lineHeight: 1.05,
            marginTop: 8,
          }}>
            {c.s5_headline_b}
          </div>
        </div>

        {/* Feature pills */}
        <div style={{
          display: 'flex', gap: 16, marginTop: 24,
          opacity: pillsT,
          flexWrap: 'wrap', justifyContent: 'center',
          padding: '0 60px',
          direction: c.dir,
        }}>
          {pills.map((p, i) => {
            const delay = i * 0.12;
            const t = E.easeOutBack(clamp((localTime - 1.6 - delay) / 0.5, 0, 1));
            return (
              <div key={i} style={{
                opacity: t,
                transform: `translateY(${(1 - t) * 20}px) scale(${0.85 + 0.15 * t})`,
                padding: '16px 28px',
                background: T.surface,
                border: `1px solid ${T.borderHi}`,
                borderRadius: 9999,
                fontFamily: c.fontStack,
                fontSize: 24, fontWeight: 600,
                color: T.text,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: T.lime, color: T.inverse,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 14,
                }}>✓</span>
                {p}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 6 — CTA (27.5–30s)
// ─────────────────────────────────────────────────────────────────────────────

function SceneCTA({ lang }) {
  const c = COPY[lang];
  const { localTime, duration } = useSprite();
  const isAr = lang === 'ar';

  const logoT = E.easeOutBack(clamp(localTime / 0.5, 0, 1));
  const ctaT  = E.easeOutBack(clamp((localTime - 0.4) / 0.6, 0, 1));
  const domT  = E.easeOutCubic(clamp((localTime - 0.9) / 0.5, 0, 1));

  // Arrow nudges right (or left for AR) on a loop
  const arrowNudge = Math.sin(localTime * 4) * 6 * (isAr ? -1 : 1);

  return (
    <>
      <LimeGlow size={1200} opacity={1} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 56,
      }}>
        {/* Logo */}
        <div style={{
          opacity: logoT,
          transform: `scale(${logoT})`,
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <LogoMark size={120} />
          <div style={{
            fontFamily: c.fontStack,
            fontWeight: 900,
            fontSize: 100,
            color: T.text,
            letterSpacing: '-3px',
            lineHeight: 1,
          }}>
            {c.s2_brand}
          </div>
        </div>

        {/* CTA button */}
        <div style={{
          opacity: ctaT,
          transform: `scale(${0.8 + 0.2 * ctaT})`,
          padding: '32px 60px',
          background: T.lime,
          borderRadius: 9999,
          display: 'flex', alignItems: 'center', gap: 20,
          fontFamily: c.fontStack,
          fontSize: isAr ? 50 : 48,
          fontWeight: 800,
          color: T.inverse,
          letterSpacing: isAr ? '0' : '-1px',
          boxShadow: `0 0 60px ${T.limeGlow}`,
          direction: c.dir,
        }}>
          {c.s6_cta}
          <span style={{
            transform: `translateX(${arrowNudge}px)`,
            display: 'inline-block',
            fontSize: 56,
            fontWeight: 900,
          }}>
            {c.s6_arrow}
          </span>
        </div>

        {/* Domain */}
        <div style={{
          opacity: domT,
          fontFamily: "'Montserrat', 'Inter', sans-serif",
          fontSize: 32,
          fontWeight: 600,
          color: T.text2,
          letterSpacing: '0.5px',
        }}>
          {c.s6_domain}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Master Promo composition
// ─────────────────────────────────────────────────────────────────────────────

function FintechPromo({ lang = 'en' }) {
  // Determine which scene is "active" for dots
  const time = useTime();
  const activeIdx =
    time < 4    ? 0 :
    time < 8    ? 1 :
    time < 15   ? 2 :
    time < 22   ? 3 :
    time < 27.5 ? 4 :
                  5;

  return (
    <div dir={COPY[lang].dir} style={{
      position: 'absolute', inset: 0,
      fontFamily: COPY[lang].fontStack,
      color: T.text,
      overflow: 'hidden',
    }}>
      {/* Subtle ambient noise — top radial wash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(212, 240, 60, 0.05) 0%, transparent 60%)',
        pointerEvents: 'none',
      }}/>

      <Sprite start={0}    end={4.2}>   <SceneHook lang={lang} /></Sprite>
      <Sprite start={4}    end={8.2}>   <SceneBrand lang={lang} /></Sprite>
      <Sprite start={8}    end={15.2}>  <SceneQuickAdd lang={lang} /></Sprite>
      <Sprite start={15}   end={22.2}>  <SceneAnalytics lang={lang} /></Sprite>
      <Sprite start={22}   end={27.7}>  <SceneFree lang={lang} /></Sprite>
      <Sprite start={27.5} end={30}>    <SceneCTA lang={lang} /></Sprite>

      <SceneDots total={6} active={activeIdx} />

      {/* Top-left mini logo watermark (visible during feature scenes) */}
      {time > 8 && time < 27.5 && (
        <div style={{
          position: 'absolute', top: 48, left: 48,
          display: 'flex', alignItems: 'center', gap: 12,
          opacity: 0.85,
        }}>
          <LogoMark size={40} />
          <span style={{
            fontFamily: "'Montserrat', 'Inter', sans-serif",
            fontWeight: 900, fontSize: 28, color: T.text,
            letterSpacing: '-0.5px',
          }}>Fintech</span>
        </div>
      )}
    </div>
  );
}

// Export to window so the host HTML can render it.
Object.assign(window, {
  FintechPromo, COPY, T,
  SceneHook, SceneBrand, SceneQuickAdd, SceneAnalytics, SceneFree, SceneCTA,
  LogoMark, Eyebrow, LimeGlow, SceneDots, Anim, Legend,
});
