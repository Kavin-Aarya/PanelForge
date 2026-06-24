import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────
   PanelForge Auth — editorial split layout
   All styles live in index.css (Tailwind v4 + components)
───────────────────────────────────────────────────── */

/* ── CURSOR ── */
function Cursor() {
  const dot  = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const pos  = useRef({ x: -200, y: -200 });
  const rpos = useRef({ x: -200, y: -200 });
  const raf  = useRef<number>(0);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      rpos.current.x = lerp(rpos.current.x, pos.current.x, 0.1);
      rpos.current.y = lerp(rpos.current.y, pos.current.y, 0.1);
      if (ring.current) {
        ring.current.style.left = rpos.current.x + "px";
        ring.current.style.top  = rpos.current.y + "px";
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const mv  = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dot.current) {
        dot.current.style.left = e.clientX + "px";
        dot.current.style.top  = e.clientY + "px";
      }
    };
    const ov  = (e: MouseEvent) => {
      if (!ring.current) return;
      if ((e.target as Element).closest("a,button,input,label"))
        ring.current.classList.add("lnk");
    };
    const out = () => ring.current?.classList.remove("lnk");
    const dn  = () => ring.current?.classList.add("dn");
    const up  = () => ring.current?.classList.remove("dn");

    window.addEventListener("mousemove", mv, { passive: true });
    document.addEventListener("mouseover", ov);
    document.addEventListener("mouseout",  out);
    document.addEventListener("mousedown", dn);
    document.addEventListener("mouseup",   up);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", mv);
      document.removeEventListener("mouseover", ov);
      document.removeEventListener("mouseout",  out);
      document.removeEventListener("mousedown", dn);
      document.removeEventListener("mouseup",   up);
    };
  }, []);

  return (
    <>
      {/* grain + cursors — classes defined in index.css */}
      <div className="auth-grain" />
      <div ref={dot}  className="c-dot" />
      <div ref={ring} className="auth-c-ring" />
    </>
  );
}

/* ── FIELD ── */
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

function Field({ label, type = "text", value, onChange, error }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [show,    setShow]    = useState(false);
  const isPass  = type === "password";
  const actType = isPass ? (show ? "text" : "password") : type;
  const active  = focused || !!value;

  return (
    <div className="auth-field">
      {/* Floating label — animates via framer-motion, typography from index.css via inline style */}
      <motion.label
        animate={{
          y:             active ? 0 : 18,
          fontSize:      active ? 9 : 13,
          letterSpacing: active ? "0.22em" : "0.04em",
          color:         focused ? "rgba(201,168,76,0.7)" : "rgba(237,232,225,0.22)",
          textTransform: active ? "uppercase" : "none",
        }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 pointer-events-none z-[1] font-sans font-medium"
      >
        {label}
      </motion.label>

      <div className="relative">
        <input
          type={actType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur ={() => setFocused(false)}
          className={[
            "auth-field-input",
            isPass  ? "pass"      : "",
            error   ? "has-error" : "",
          ].join(" ")}
        />

        {/* Animated gold underline */}
        <motion.div
          className="auth-field-underline"
          animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Show / hide password */}
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="auth-field-eye"
          >
            {show ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            className="auth-field-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── OAUTH BUTTON ── */
interface OAuthBtnProps {
  label: string;
  icon: React.ReactNode;
}

function OAuthBtn({ label, icon }: OAuthBtnProps) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.97 }} className="auth-oauth-btn">
      {icon}
      <span className="auth-oauth-label">{label}</span>
    </motion.button>
  );
}

/* ── AUTH PAGE ── */
export default function AuthPage() {
  const [mode,    setMode]    = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  

  
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && !form.name.trim())                   e.name     = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))          e.email    = "Enter a valid email";
    if (form.password.length < 8)                                 e.password = "Min 8 characters";
    if (mode === "signup" && form.password !== form.confirm)       e.confirm  = "Passwords don't match";
    return e;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents browser refresh
  
    // Run your frontend validation checks first
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
  
    setLoading(true);
  
    // Map your UI state keys ('form') to your backend expectations
    const backendPayload = {
      username: form.name,
      email: form.email,
      password: form.password,
      confirmpassword: form.confirm
    };
    const loginPayload = {
      email: form.email,
      password: form.password
    };

    let response: Response;

    try {
      if (mode == "login") {
        response = await fetch('/api/auth/login', {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginPayload)
        });
      }
      else {
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendPayload) // ◄ Sends the filled-out text data!
        });
      }
      
      // 1. Check specifically for Rate Limiting code (429)
      if (response.status === 429) {
        setLoading(false);
        const errorData = await response.json();
        alert(errorData.error); // Alerts: "Too many requests..."
        return;
      }
  
      // 2. Handle a Successful response
      if (response.ok) {
        const data = await response.json();
        
        // Save the token to local storage if it's a sign-in/login action.
        // This safely falls back regardless of if your backend uses camelCase or snake_case
        const token = data.accessToken || data.access_token || data.token;
        
        if (token) {
          localStorage.setItem("accessToken", token);
        }

        // Triggers your beautiful success checkmark animation
        setLoading(false);
        setDone(true); 
        
        // Delays navigation slightly so the user can see the complete animation
        setTimeout(() => { 
          navigate("/dashboard");
        }, 1800);
      } 
      // 3. Handle Backend Failure States
      else {
        setLoading(false);
        const errorText = await response.text();
        alert("Backend Error: " + errorText);
      }
    } catch (error) {
      setLoading(false);
      console.error("Network error:", error);
      alert("Could not connect to the backend server.");
    }
  };

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setForm({ name: "", email: "", password: "", confirm: "" });
    setErrors({});
    setDone(false);
  };

  const mqItems = ["Story Logic","Character Lock","Style Engine","Panel Layout AI","Dialogue Engine","Collaboration","Export Suite","LoRA Training","API Access"];
  const doubled = [...mqItems, ...mqItems];

  return (
    <div className="auth-page">
      <Cursor />

      {/* ══════════════════════════════════════
          LEFT — full-bleed editorial artwork
      ══════════════════════════════════════ */}
      <motion.div
        className="auth-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Ken-burns image */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.07 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1400&q=80"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.15) saturate(0.2) contrast(1.18) sepia(0.1)" }}
          />
        </motion.div>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(13,12,11,0.05) 0%, rgba(13,12,11,0.72) 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,rgba(13,12,11,0.45) 0%,rgba(13,12,11,0) 28%,rgba(13,12,11,0) 60%,rgba(13,12,11,0.85) 100%)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 65% 55% at 38% 44%, rgba(196,149,106,0.055) 0%, transparent 70%)" }}
        />

        {/* Scanline sweep */}
        <div className="scanline" />

        {/* Corner L-brackets */}
        {[
          { top: 28, left: 28 },
          { top: 28, right: 28 },
          { bottom: 28, left: 28 },
          { bottom: 28, right: 28 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-[14px] h-[14px] z-[4]"
            style={pos as React.CSSProperties}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-full h-full">
              {i === 0 && <path d="M0 7V0H7"   stroke="rgba(184,169,154,0.28)" strokeWidth="1" />}
              {i === 1 && <path d="M14 7V0H7"  stroke="rgba(184,169,154,0.28)" strokeWidth="1" />}
              {i === 2 && <path d="M0 7V14H7"  stroke="rgba(184,169,154,0.28)" strokeWidth="1" />}
              {i === 3 && <path d="M14 7V14H7" stroke="rgba(184,169,154,0.28)" strokeWidth="1" />}
            </svg>
          </motion.div>
        ))}

        {/* Vertical side label */}
        <motion.div
          className="absolute z-[4] flex items-center gap-4"
          style={{
            left: "clamp(1.5rem,2.5vw,2.8rem)",
            top: "50%",
            transform: "translateY(-50%) rotate(-90deg)",
            transformOrigin: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <div className="w-px h-11" style={{ background: "rgba(184,169,154,0.18)" }} />
          <span className="auth-side-label">AI Comic Authoring Platform</span>
        </motion.div>

        {/* Bottom editorial copy */}
        <div
          className="absolute inset-0 z-[3] flex flex-col justify-end"
          style={{ padding: "clamp(2.5rem,4vw,4.5rem)" }}
        >
          {/* Eyebrow */}
          <motion.div
            className="flex items-center gap-[0.8rem] mb-[1.6rem]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-8 h-px" style={{ background: "rgba(184,169,154,0.28)" }} />
            <span className="auth-eyebrow">
              {mode === "login" ? "Welcome back" : "Begin your journey"}
            </span>
          </motion.div>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={mode + "h"}
              className="auth-headline mb-[1.4rem]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              {mode === "login" ? (
                <>Where <span className="auth-headline-italic">Stories</span><br />Forge Worlds.</>
              ) : (
                <>Your <span className="auth-headline-italic">Canvas</span><br />Awaits.</>
              )}
            </motion.h2>
          </AnimatePresence>

          {/* Body */}
          <motion.p
            className="auth-body mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Describe any scene. PanelForge renders it — panel by panel — into comics that feel hand-crafted, not generated.
          </motion.p>

          {/* Micro stats */}
          <motion.div
            className="flex gap-[2.2rem] mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15, duration: 1 }}
          >
            {[{ n: "2.4M+", l: "Panels" }, { n: "180K", l: "Creators" }, { n: "4.9★", l: "Rating" }].map((s, i) => (
              <div key={i} className="flex flex-col gap-[0.15rem]">
                <span className="auth-stat-num">{s.n}</span>
                <span className="auth-stat-label">{s.l}</span>
              </div>
            ))}
          </motion.div>

          {/* Marquee */}
          <motion.div
            className="overflow-hidden pt-4"
            style={{
              maskImage: "linear-gradient(90deg,transparent,black 8%,black 92%,transparent)",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            <div className="mqa">
              {doubled.map((item, i) => (
                <div key={i} className="flex items-center gap-[3rem] shrink-0">
                  <span
                    className="text-[9px] tracking-[0.2em] uppercase font-sans font-medium"
                    style={{ color: "rgba(237,232,225,0.09)" }}
                  >
                    {item}
                  </span>
                  <div
                    className="w-[2px] h-[2px] rounded-full shrink-0"
                    style={{ background: "rgba(184,169,154,0.13)" }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          RIGHT — bare form panel
      ══════════════════════════════════════ */}
      <div className="auth-right">

        {/* Ambient glow */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(201,168,76,0.02) 0%,transparent 70%)" }}
        />

        <div className="auth-inner">

          {/* Logo */}
          <motion.div
            className="flex items-baseline gap-[2px] mb-[3.2rem]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <a href="/" className="no-underline flex items-baseline gap-[2px]">
              <span className="auth-logo-panel">PANEL</span>
              <span className="auth-logo-forge">Forge</span>
            </a>
          </motion.div>

          {/* Mode tabs */}
          <motion.div
            className="flex gap-8 mb-[2.5rem] items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {(["login", "signup"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`auth-tab ${m === mode ? "active" : "inactive"}`}
              >
                {m === "login" ? "Sign in" : "Create account"}
                {m === mode && (
                  <motion.div layoutId="tab-ul" className="auth-tab-underline" />
                )}
              </button>
            ))}
          </motion.div>

          {/* Form headline */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + "title"}
              className="mb-[2.6rem]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="auth-form-title">
                {mode === "login"
                  ? <>Welcome <span className="auth-headline-italic">back.</span></>
                  : <>Start <span className="auth-headline-italic">forging.</span></>}
              </h1>
              <p className="auth-form-subtitle">
                {mode === "login"
                  ? "Continue your creative journey."
                  : "Join 180,000+ creators building worlds with AI."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Success state */}
          <AnimatePresence>
            {done && (
              <motion.div
                className="pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-[0.9rem] mb-[0.7rem]">
                  <motion.div
                    className="auth-success-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
                  >
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                  <span className="auth-success-title">
                    {mode === "login" ? "You're in." : "Account created."}
                  </span>
                </div>
                <p className="auth-success-sub">Redirecting to your canvas…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!done && (
            <form onSubmit={handleSubmit} noValidate>
              {/* Name field — signup only */}
              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Field label="Full name" value={form.name} onChange={set("name")} error={errors.name} />
                  </motion.div>
                )}
              </AnimatePresence>

              <Field label="Email"    type="email"    value={form.email}    onChange={set("email")}    error={errors.email} />
              <Field label="Password" type="password" value={form.password} onChange={set("password")} error={errors.password} />

              {/* Confirm password — signup only */}
              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Field label="Confirm password" type="password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot password — login only */}
              {mode === "login" && (
                <div className="text-right mt-[-0.9rem] mb-[1.8rem]">
                  <a href="#" className="auth-forgot">Forgot password?</a>
                </div>
              )}

              {/* TOS — signup only */}
              {mode === "signup" && (
                <p className="auth-tos">
                  By creating an account you agree to our{" "}
                  <a href="#">Terms</a> &amp; <a href="#">Privacy</a>.
                </p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.985 }}
                disabled={loading}
                className="auth-submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      className="block w-[10px] h-[10px] rounded-full"
                      style={{ border: "1.5px solid rgba(13,12,11,0.28)", borderTopColor: "#0d0c0b" }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    />
                    Authenticating
                  </span>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-[1.3rem]">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">or continue with</span>
                <div className="auth-divider-line" />
              </div>

              {/* OAuth row */}
              <div className="flex gap-[0.5rem]">
                <OAuthBtn
                  label="Google"
                  icon={
                    <svg width="13" height="13" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(237,232,225,0.2)" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(237,232,225,0.15)" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="rgba(237,232,225,0.17)" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(237,232,225,0.18)" />
                    </svg>
                  }
                />
                <OAuthBtn
                  label="GitHub"
                  icon={
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(237,232,225,0.24)">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  }
                />
                <OAuthBtn
                  label="X"
                  icon={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(237,232,225,0.24)">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  }
                />
              </div>
            </form>
          )}

          {/* Switch mode */}
          <motion.p
            className="auth-switch-text mt-[2.2rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {mode === "login" ? "No account yet?" : "Already a creator?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="auth-switch-btn"
            >
              {mode === "login" ? "Create account →" : "Sign in →"}
            </button>
          </motion.p>
        </div>

        {/* EST. label */}
        <motion.div
          className="absolute right-[clamp(1.5rem,3vw,3rem)] bottom-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <span className="auth-est">EST. 2025</span>
        </motion.div>
      </div>
    </div>
  );
}