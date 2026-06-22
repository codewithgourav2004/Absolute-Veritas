import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';

// ── Math CAPTCHA generator ────────────────────────────────────────────────────
const generateCaptcha = () => {
  const ops = [
    { a: Math.floor(Math.random() * 9) + 1, b: Math.floor(Math.random() * 9) + 1, op: '+' },
    { a: Math.floor(Math.random() * 9) + 5, b: Math.floor(Math.random() * 5) + 1, op: '-' },
    { a: Math.floor(Math.random() * 5) + 2, b: Math.floor(Math.random() * 5) + 2, op: '×' },
  ];
  const chosen = ops[Math.floor(Math.random() * ops.length)];
  const answer = chosen.op === '+' ? chosen.a + chosen.b
               : chosen.op === '-' ? chosen.a - chosen.b
               : chosen.a * chosen.b;
  return { question: `${chosen.a} ${chosen.op} ${chosen.b}`, answer };
};

// ── Bot score engine ──────────────────────────────────────────────────────────
const useBotDetection = () => {
  const mouseMoved      = useRef(false);
  const firstInteract   = useRef(null);
  const keystrokeTimes  = useRef([]);

  useEffect(() => {
    const onMove = () => { mouseMoved.current = true; };
    const onKey  = () => {
      const now = Date.now();
      if (!firstInteract.current) firstInteract.current = now;
      keystrokeTimes.current.push(now);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchstart', onMove, { passive: true });
    window.addEventListener('keydown', onKey, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onMove);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const getBotScore = useCallback((honeypot, submitTime) => {
    let score = 0;
    const reasons = [];

    // 1. Honeypot field filled by bot
    if (honeypot && honeypot.length > 0) {
      score += 10;
      reasons.push('honeypot');
    }

    // 2. Form submitted too quickly (< 4 seconds from first interaction)
    if (firstInteract.current && submitTime - firstInteract.current < 4000) {
      score += 5;
      reasons.push('too-fast');
    }

    // 3. No mouse movement ever (likely headless browser)
    if (!mouseMoved.current) {
      score += 3;
      reasons.push('no-mouse');
    }

    // 4. Keystroke timing too uniform (robotic typing)
    const times = keystrokeTimes.current;
    if (times.length > 4) {
      const gaps = times.slice(1).map((t, i) => t - times[i]);
      const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const variance = gaps.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / gaps.length;
      if (variance < 50) { // Perfect uniformity — robot typing
        score += 2;
        reasons.push('uniform-typing');
      }
    }

    return { score, isBot: score >= 8, reasons };
  }, []);

  return { getBotScore };
};

// ── ConsultationPopup ─────────────────────────────────────────────────────────
const ConsultationPopup = () => {
  const [visible,    setVisible]    = useState(false);
  const [closing,    setClosing]    = useState(false);
  const [sent,       setSent]       = useState(false);
  const [botBlocked, setBotBlocked] = useState(false);
  const [serverErr,  setServerErr]  = useState('');
  const [captcha,    setCaptcha]    = useState(generateCaptcha);
  const [captchaErr, setCaptchaErr] = useState('');
  const submitTime                  = useRef(null);

  const { getBotScore } = useBotDetection();

  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    mode: 'onBlur',
  });

  // Show after 1.5 s on every page load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(() => { setVisible(false); setClosing(false); }, 300);
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaErr('');
  };

  const onSubmit = async (data) => {
    // Validate CAPTCHA
    if (parseInt(data.captchaAnswer, 10) !== captcha.answer) {
      setCaptchaErr('Incorrect answer. Please try again.');
      refreshCaptcha();
      return;
    }
    setCaptchaErr('');
    submitTime.current = Date.now();

    // Bot detection
    const { score, isBot, reasons } = getBotScore(data._hp, submitTime.current);
    if (isBot) {
      console.warn('[ConsultationPopup] Bot detected — score:', score, 'reasons:', reasons);
      setBotBlocked(true);
      return;
    }

    try {
      setServerErr('');
      await api.post('/enquiries', {
        name:    data.name,
        email:   data.email,
        phone:   data.phone,
        message: data.message || 'Consultation request via website popup',
        category: 'Consultation',
        service:  'Free Consultation',
      });
      setSent(true);
      reset();
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'rgba(26,31,60,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={close}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 ${
          closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ boxShadow: '0 25px 60px rgba(26,31,60,0.35)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo via-crimson to-gold" />

        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
              <span className="text-xs font-mono text-crimson uppercase tracking-[0.2em]">Free Consultation</span>
            </div>
            <h2 className="font-display font-black text-indigo text-2xl leading-tight">
              Get Expert Guidance
            </h2>
            <p className="text-steel text-sm mt-0.5">We'll call you back within 2 business hours.</p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-crimson hover:bg-crimson/10 transition-all duration-200 flex-shrink-0 ml-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-5">
          {sent ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-indigo text-xl mb-1">Thank You!</h3>
              <p className="text-steel text-sm max-w-xs">
                Your consultation request has been received. Our team will contact you shortly.
              </p>
              <button
                onClick={close}
                className="mt-5 text-sm text-crimson font-semibold hover:underline"
              >
                Close
              </button>
            </div>
          ) : botBlocked ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-indigo text-xl mb-1">Verification Failed</h3>
              <p className="text-steel text-sm max-w-xs mb-4">
                Our system detected unusual activity. Please use the <a href="/contact-us" className="text-crimson font-semibold hover:underline">Contact page</a> to reach us.
              </p>
              <button onClick={close} className="text-sm text-steel hover:text-indigo transition-colors">Dismiss</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3.5">
              {/* Honeypot — hidden from humans, filled by bots */}
              <input
                {...register('_hp')}
                type="text"
                tabIndex={-1}
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                autoComplete="off"
              />

              {/* Name */}
              <div>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Your Name *"
                  className={`w-full rounded-xl px-4 py-3 text-sm bg-pearl border focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/20 transition-all placeholder-gray-400 ${
                    errors.name ? 'border-crimson' : 'border-gray-200'
                  }`}
                />
                {errors.name && <p className="text-crimson text-xs mt-1 pl-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                  })}
                  type="email"
                  placeholder="Email ID *"
                  className={`w-full rounded-xl px-4 py-3 text-sm bg-pearl border focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/20 transition-all placeholder-gray-400 ${
                    errors.email ? 'border-crimson' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-crimson text-xs mt-1 pl-1">{errors.email.message}</p>}
              </div>

              {/* Phone with country code */}
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-pearl border border-gray-200 rounded-xl px-3 py-3 text-sm text-indigo font-medium flex-shrink-0 select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <div className="flex-1">
                  <input
                    {...register('phone', {
                      required: 'Phone is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: '10-digit Indian mobile number' },
                    })}
                    type="tel"
                    placeholder="Mobile Number *"
                    maxLength={10}
                    className={`w-full rounded-xl px-4 py-3 text-sm bg-pearl border focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/20 transition-all placeholder-gray-400 ${
                      errors.phone ? 'border-crimson' : 'border-gray-200'
                    }`}
                  />
                </div>
              </div>
              {errors.phone && <p className="text-crimson text-xs -mt-2 pl-1">{errors.phone.message}</p>}

              {/* Message */}
              <textarea
                {...register('message')}
                rows={3}
                placeholder="Describe your product, compliance requirement, etc."
                className="w-full rounded-xl px-4 py-3 text-sm bg-pearl border border-gray-200 focus:outline-none focus:border-crimson focus:ring-1 focus:ring-crimson/20 transition-all placeholder-gray-400 resize-none"
              />

              {/* Math CAPTCHA */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-steel font-medium flex-shrink-0">Captcha:</span>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="text-indigo hover:text-crimson transition-colors"
                    title="Refresh captcha"
                    aria-label="Refresh captcha"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <div className="bg-indigo/5 border border-indigo/20 rounded-lg px-4 py-2 font-mono font-bold text-indigo text-sm tracking-widest select-none">
                    {captcha.question} =
                  </div>
                  <input
                    {...register('captchaAnswer', { required: 'Required' })}
                    type="number"
                    placeholder="?"
                    className={`w-20 rounded-xl px-3 py-2 text-sm bg-pearl border focus:outline-none focus:border-crimson text-center font-mono ${
                      captchaErr || errors.captchaAnswer ? 'border-crimson' : 'border-gray-200'
                    }`}
                  />
                </div>
                {(captchaErr || errors.captchaAnswer) && (
                  <p className="text-crimson text-xs mt-1 pl-1">{captchaErr || 'Please solve the captcha'}</p>
                )}
              </div>

              {serverErr && <p className="text-crimson text-xs bg-crimson/5 border border-crimson/20 rounded-lg px-3 py-2">{serverErr}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-crimson hover:bg-indigo text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-crimson/25 hover:shadow-indigo/25"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Submitting...
                  </span>
                ) : 'Get Free Consultation'}
              </button>

              <p className="text-center text-xs text-steel/60 pb-1">
                By submitting, you agree to be contacted by our team.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationPopup;
