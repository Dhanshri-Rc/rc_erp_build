import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth, dashboardFor } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [show, setShow] = useState(false),
    [form, setForm] = useState({
      identifier: "",
      password: "",
      remember: false,
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (user) return <Navigate to={dashboardFor(user.role)} replace />;
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await login(form);
      nav(dashboardFor(u.role), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login-page">
      <div className="wave top" />
      <div className="wave bottom" />
      <div className="login-center">
        <form className="login-card" onSubmit={submit}>
          <img className="login-logo" src="/rc-logo.png" alt="RC ERP" />
          <h1 className="brand-name">RC ERP</h1>
          <div className="tagline">
            One Platform. <b>Complete</b> <b>Control.</b>
          </div>
          <div className="login-divider" />
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-sub">Sign in to continue to your account</p>
          <div className="login-field">
            <UserRound />
            <input
              autoFocus
              placeholder="Username or Email"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            />
          </div>
          <div className="login-field">
            <LockKeyhole />
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              aria-label="Toggle password"
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {error && (
            <div
              className="error"
              style={{ fontSize: 9, textAlign: "left", margin: "-5px 0 10px" }}
            >
              {error}
            </div>
          )}
          <div className="login-row">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) =>
                  setForm({ ...form, remember: e.target.checked })
                }
              />{" "}
              Remember me
            </label>
            <button
              type="button"
              className="link-btn"
              onClick={() =>
                alert(
                  "Password resets are handled securely by your RC ERP administrator.",
                )
              }
            >
              Forgot Password?
            </button>
          </div>
          <button className="primary-login" disabled={busy}>
            {busy ? "Signing in…" : "Login"}
          </button>
          <div className="or-row">or</div>
          <button
            type="button"
            className="google-btn"
            onClick={() =>
              alert(
                "Google SSO can be enabled with your organization OAuth credentials.",
              )
            }
          >
            <span className="google-g">G</span> Sign in with Google
          </button>
        </form>
        <div className="login-note">
          <span>
            <ShieldCheck size={13} />
          </span>
          Secure. Reliable. Built for Better Performance.
        </div>
        <div className="copyright">© 2026 RC ERP. All rights reserved.</div>
      </div>
    </div>
  );
}
