import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C, SANS, SERIF, DISPLAY, ART_STYLES, glass, glassGold } from "./tokens";
import { SectionHead, SettingsRow, Toggle } from "./components";

/* ═══════════════════════════════════════════════════════════════════
   PAGE: SETTINGS
   Sections: Profile, Generation, Appearance, Notifications, Account & Billing
═══════════════════════════════════════════════════════════════════ */
interface UserData {
  id: number;
  email: string;
  username: string;
  createdAt: string;
  name: string;
}

interface changePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;

}

const SETTINGS_SECTIONS = [
  { id: "profile",       label: "Profile" },
  { id: "generation",    label: "Generation" },
  { id: "appearance",    label: "Appearance" },
  { id: "notifications", label: "Notifications" },
  { id: "account",       label: "Account & Billing" },
];

export default function PageSettings() {
  const [section, setSection]         = useState("profile");
  const [autoSave, setAutoSave]       = useState(true);
  const [hq, setHq]                   = useState(false);
  const [publicGallery, setPG]        = useState(true);
  const [emailNotifs, setEn]          = useState(true);
  const [userDetails, setUserDetails] = useState<UserData | null>(null);
  const [error, setError]             = useState<string | null>(null);

  // Change password state
  const [pwOpen, setPwOpen]           = useState(false);
  const [pwCurrent, setPwCurrent]     = useState("");
  const [pwNew, setPwNew]             = useState("");
  const [pwConfirm, setPwConfirm]     = useState("");
  const [pwError, setPwError]         = useState<string | null>(null);
  const [pwSuccess, setPwSuccess]     = useState(false);
  const [pwLoading, setPwLoading]     = useState(false);

  const handleChangePassword = async () => {
    setPwError(null);
    setPwSuccess(false);
    setPwLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/auth/changePassword`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew, confirmPassword: pwConfirm}),
      });
      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }
      const body = await response.json().catch(() => ({}));
      const data: changePasswordData = JSON.parse(body);

      setPwSuccess(true);
      setPwCurrent(data.currentPassword); setPwNew(data.newPassword); setPwConfirm(data.confirmPassword);
      setTimeout(() => { setPwOpen(false); setPwSuccess(false); }, 2000);
    } catch (err: any) {
      setPwError(err.message || "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("/api/settings/user", {
          method: "GET", 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }

        const responseText = await response.text();
        
        // Check if the backend sent us a completely empty response
        if (!responseText || responseText.trim() === "") {
          throw new Error("Backend connected, but returned no user data.");
        }

        // It is now safe to parse the JSON
        const data: UserData = JSON.parse(responseText);
        setUserDetails(data);
      }
      catch (err: any) {
        setError(err.message || 'Failed to pull database data.');
      }
    };
    fetchUserDetails();
  }, []);

  // Format a friendly display date if user data is loaded
  const memberSince = userDetails?.createdAt 
    ? new Date(userDetails.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Loading...';

  // Extract initials safely for the avatar bubble
  const avatarInitials = userDetails?.name 
    ? userDetails.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <div style={{ padding: "2.5rem", display: "grid", gridTemplateColumns: "200px 1fr", gap: "2rem" }}>

      {/* Settings sidebar nav */}
      <div style={{ borderRadius: 10, padding: "0.75rem 0", height: "fit-content", ...glass(0.035, 16) }}>
        {SETTINGS_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              width: "100%", textAlign: "left", padding: "0.65rem 1.2rem",
              background: section === s.id ? C.goldDim : "none",
              border: "none", cursor: "pointer", transition: "all .16s",
              fontFamily: SANS, fontSize: 12,
              fontWeight: section === s.id ? 600 : 400,
              color: section === s.id ? C.gold : C.muted,
              borderLeft: section === s.id ? `2px solid ${C.gold}` : "2px solid transparent",
            } as any}
          >{s.label}</button>
        ))}
      </div>

      {/* Settings content panel */}
      <div style={{ borderRadius: 10, padding: "1.8rem", ...glass(0.035, 16) }}>
        <AnimatePresence mode="wait">

          {/* Profile Section */}
          {section === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
              <SectionHead label="Profile" sub="Manage your personal information" />
              
              {/* Error Callout Banner if fetch fails */}
              {error && (
                <div style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: "rgba(230,80,80,0.15)", border: "1px solid rgba(230,80,80,0.3)", color: "#ff8888", borderRadius: 6, fontFamily: SANS, fontSize: 12 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem", padding: "1.5rem", borderRadius: 8, ...glassGold() }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 35%, ${C.gold}55, ${C.surface4})`,
                  border: `2px solid ${C.goldBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 20px ${C.gold}22`, flexShrink: 0,
                }}>
                  <span style={{ fontFamily: SANS, fontSize: 20, color: C.gold, fontWeight: 700 }}>
                    {avatarInitials}
                  </span>
                </div>
                <div>
                  {/* Fixed Crash: Added optional chaining here */}
                  <p style={{ fontFamily: SERIF, fontSize: 20, color: C.main, fontWeight: 700 }}>
                    {userDetails?.username || "Loading Profile..."}
                  </p> 
                  <p style={{ fontFamily: SANS, fontSize: 11, color: C.goldText, marginTop: 3 }}>
                    Pro Creator · Member since {memberSince}
                  </p>
                  <button style={{
                    marginTop: "0.5rem", fontFamily: SANS, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
                    color: C.gold, background: C.goldDim, border: `1px solid ${C.goldBorder}`, borderRadius: 4, padding: "4px 12px", cursor: "pointer",
                  }}>Change Avatar</button>
                </div>
              </div>

              {/* Dynamic Form Setup tied directly to database values instead of hardcoded strings */}
              {[
                { l: "Full Name", v: userDetails?.name || "" }, 
                { l: "Email Address", v: userDetails?.email || "" }, 
                { l: "Username", v: userDetails?.username ? `@${userDetails.username}` : "" }
              ].map(f => (
                <div key={f.l} style={{ marginBottom: "1.2rem" }}>
                  <label style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.goldText, fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>{f.l}</label>
                  <input
                    key={f.v} // Forces re-render with fresh DB values once state updates
                    defaultValue={f.v}
                    style={{ width: "100%", borderRadius: 7, padding: "0.75rem 1rem", fontFamily: SANS, fontSize: 13, color: C.main, outline: "none", transition: "all .2s", ...glass(0.04, 12) }}
                    onFocus={e => { e.currentTarget.style.borderColor = C.goldBorder; }}
                    onBlur={e => { e.currentTarget.style.borderColor = C.glassBorder; }}
                  />
                </div>
              ))}
              
              <button style={{
                padding: "0.75rem 2rem", borderRadius: 7, fontFamily: SANS, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
                color: C.bg, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg,${C.gold},#e8c05a)`, boxShadow: `0 2px 16px ${C.gold}44`,
              }}>Save Changes</button>
            </motion.div>
          )}

          {/* Generation Section */}
          {section === "generation" && (
            <motion.div key="gen" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
              <SectionHead label="Generation" sub="Default parameters for comic generation" />
              <SettingsRow label="Auto-Save Panels" desc="Automatically save all generated panels to your library"><Toggle on={autoSave} set={setAutoSave} /></SettingsRow>
              <SettingsRow label="High Quality Default" desc="Use maximum quality steps by default (slower generation)"><Toggle on={hq} set={setHq} /></SettingsRow>
              <SettingsRow label="Default Panel Count" desc="Number of panels used when starting a new comic">
                <select style={{ background: "transparent", border: `1px solid ${C.goldBorder}`, borderRadius: 5, padding: "5px 10px", fontFamily: SANS, fontSize: 12, color: C.gold, cursor: "pointer", outline: "none" }}>
                  {[4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>{n} panels</option>)}
                </select>
              </SettingsRow>
              <SettingsRow label="Default Art Style" desc="Art style pre-selected in the Comic Crafter">
                <select style={{ background: "transparent", border: `1px solid ${C.goldBorder}`, borderRadius: 5, padding: "5px 10px", fontFamily: SANS, fontSize: 12, color: C.gold, cursor: "pointer", outline: "none" }}>
                  {ART_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </SettingsRow>
            </motion.div>
          )}

          {/* Appearance Section */}
          {section === "appearance" && (
            <motion.div key="app" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
              <SectionHead label="Appearance" sub="Personalise the PanelForge interface" />
              <SettingsRow label="Public Gallery" desc="Show completed comics in the community gallery"><Toggle on={publicGallery} set={setPG} /></SettingsRow>
              <div style={{ marginTop: "1.6rem" }}>
                <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.goldText, fontWeight: 700, marginBottom: "0.8rem" }}>Accent Colour</p>
                <div style={{ display: "flex", gap: "0.65rem" }}>
                  {[C.gold, "#b8a99a", "#8fa89e", "#c4956a", "#6ea87a"].map((clr, i) => (
                    <button key={i} style={{
                      width: 28, height: 28, borderRadius: "50%", background: clr,
                      border: i === 0 ? `2px solid ${C.main}` : "none", cursor: "pointer",
                      boxShadow: i === 0 ? `0 0 10px ${clr}88` : undefined,
                    }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Section */}
          {section === "notifications" && (
            <motion.div key="notif" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
              <SectionHead label="Notifications" sub="Control how and when PanelForge contacts you" />
              <SettingsRow label="Email Notifications" desc="Receive email when comic generation completes"><Toggle on={emailNotifs} set={setEn} /></SettingsRow>
              <SettingsRow label="Weekly Digest" desc="Get a weekly summary of your creative activity"><Toggle on={false} set={() => {}} /></SettingsRow>
              <SettingsRow label="Product Updates" desc="Hear about new features and improvements"><Toggle on={true} set={() => {}} /></SettingsRow>
            </motion.div>
          )}

          {/* Account & Billing Section */}
          {section === "account" && (
            <motion.div key="acct" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
              <SectionHead label="Account & Billing" sub="Manage your plan, credits and data" />
              <div style={{ borderRadius: 8, padding: "1.5rem", marginBottom: "1.5rem", ...glassGold() }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.26em", textTransform: "uppercase", color: C.goldText, fontWeight: 700, marginBottom: "0.4rem" }}>Current Plan</p>
                    <p style={{ fontFamily: DISPLAY, fontSize: 30, color: C.gold, letterSpacing: "0.06em", textShadow: `0 0 16px ${C.gold}44` }}>Pro Creator</p>
                    <p style={{ fontFamily: SANS, fontSize: 12, color: C.muted, marginTop: 4, fontWeight: 300 }}>250 credits / month · Renews Jun 15, 2026</p>
                  </div>
                  <button style={{
                    padding: "0.6rem 1.2rem", borderRadius: 6, fontFamily: SANS, fontSize: 10, letterSpacing: "0.18em",
                    textTransform: "uppercase", fontWeight: 700, color: C.gold, cursor: "pointer", ...glassGold(),
                  }}>Upgrade Plan</button>
                </div>
              </div>
              {/* Change Password */}
              <div style={{ borderBottom: `1px solid ${C.glassBorder}`, paddingBottom: "1.2rem", marginBottom: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontFamily: SANS, fontSize: 13, color: C.main, fontWeight: 500 }}>Change Password</p>
                    <p style={{ fontFamily: SANS, fontSize: 11, color: C.muted, marginTop: 2, fontWeight: 300 }}>Update your login password</p>
                  </div>
                  <button
                    onClick={() => { setPwOpen(o => !o); setPwError(null); setPwSuccess(false); }}
                    style={{
                      padding: "5px 14px", borderRadius: 4, fontFamily: SANS, fontSize: 10,
                      letterSpacing: "0.15em", textTransform: "uppercase",
                      color: pwOpen ? C.gold : C.muted,
                      border: `1px solid ${pwOpen ? C.goldBorder : C.glassBorder}`,
                      background: pwOpen ? C.goldDim : "transparent",
                      cursor: "pointer", transition: "all .18s",
                    }}
                  >{pwOpen ? "Cancel" : "Change ↓"}</button>
                </div>

                <AnimatePresence>
                  {pwOpen && (
                    <motion.div
                      key="pw-form"
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: "1.2rem" }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", padding: "1.2rem", borderRadius: 8, ...glass(0.04, 12) }}>
                        {[
                          { label: "Current password",     value: pwCurrent, set: setPwCurrent },
                          { label: "New password",         value: pwNew,     set: setPwNew     },
                          { label: "Confirm new password", value: pwConfirm, set: setPwConfirm },
                        ].map(f => (
                          <div key={f.label}>
                            <label style={{ fontFamily: SANS, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.goldText, fontWeight: 700, display: "block", marginBottom: "0.35rem" }}>{f.label}</label>
                            <input
                              type="password"
                              value={f.value}
                              onChange={e => f.set(e.target.value)}
                              style={{ width: "100%", boxSizing: "border-box", borderRadius: 7, padding: "0.65rem 0.9rem", fontFamily: SANS, fontSize: 13, color: C.main, outline: "none", transition: "all .2s", ...glass(0.04, 12) }}
                              onFocus={e => { e.currentTarget.style.borderColor = C.goldBorder; }}
                              onBlur={e => { e.currentTarget.style.borderColor = C.glassBorder; }}
                            />
                          </div>
                        ))}

                        {pwError && (
                          <p style={{ fontFamily: SANS, fontSize: 11, color: "#ff8888", background: "rgba(230,80,80,0.1)", border: "1px solid rgba(230,80,80,0.25)", borderRadius: 5, padding: "0.5rem 0.75rem" }}>{pwError}</p>
                        )}
                        {pwSuccess && (
                          <p style={{ fontFamily: SANS, fontSize: 11, color: "#88dd99", background: "rgba(80,200,100,0.1)", border: "1px solid rgba(80,200,100,0.25)", borderRadius: 5, padding: "0.5rem 0.75rem" }}>Password updated successfully.</p>
                        )}

                        <button
                          onClick={handleChangePassword}
                          disabled={pwLoading}
                          style={{
                            padding: "0.65rem 1.5rem", borderRadius: 7, fontFamily: SANS, fontSize: 10,
                            letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
                            color: C.bg, border: "none", cursor: pwLoading ? "not-allowed" : "pointer",
                            opacity: pwLoading ? 0.6 : 1,
                            background: `linear-gradient(135deg,${C.gold},#e8c05a)`,
                            boxShadow: `0 2px 12px ${C.gold}33`,
                            alignSelf: "flex-start", transition: "opacity .18s",
                          }}
                        >{pwLoading ? "Saving…" : "Update Password"}</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <SettingsRow label="Download All Data" desc="Export all your projects, stories and panel images">
                <button style={{ padding: "5px 14px", borderRadius: 4, fontFamily: SANS, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.muted, cursor: "pointer", ...glass(0.04, 12) }}>Export ↓</button>
              </SettingsRow>
              <SettingsRow label="Delete Account" desc="Permanently remove your account and all associated data">
                <button style={{
                  padding: "5px 14px", background: "rgba(200,60,60,0.08)", border: "1px solid rgba(200,60,60,0.22)",
                  borderRadius: 4, fontFamily: SANS, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "rgba(220,100,100,0.7)", cursor: "pointer",
                }}>Delete</button>
              </SettingsRow>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}