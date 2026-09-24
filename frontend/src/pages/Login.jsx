import { useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth, dashboardFor } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const loginInProgress = useRef(false);

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

    if (loginInProgress.current) return;

    const identifier = form.identifier.trim();
    if (!identifier || !form.password) {
      setError("Username/email and password are required");
      return;
    }

    setError("");
    setBusy(true);
    loginInProgress.current = true;

    try {
      const u = await login({
        identifier,
        password: form.password,
        remember: Boolean(form.remember),
      });
      nav(dashboardFor(u.role), { replace: true });
    } catch (err) {
      const status = err?.response?.status ?? err?.status;

      if (status === 429) {
        setError("Too many login attempts. Please try again later.");
      } else if (
        err?.code === "ERR_NETWORK" ||
        err?.message === "Unable to reach server"
      ) {
        setError("Unable to connect securely. Please try again.");
      } else {
        setError("Invalid username/email or password.");
      }
    } finally {
      loginInProgress.current = false;
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen min-h-[100dvh] w-full items-center justify-center overflow-x-hidden bg-[#f7f8fc] px-4 py-6 font-['Inter',Arial,sans-serif] text-[#22283a] sm:px-6 sm:py-8">
      <div className="my-auto w-full max-w-[420px]">
        <form
          onSubmit={submit}
          autoComplete="on"
          className="w-full rounded-2xl border border-[#e5e9f0] bg-white px-5 py-7 text-left shadow-[0_12px_40px_rgba(26,43,75,0.07)] min-[380px]:px-7 sm:px-9 sm:py-8"
        >
          <div className="mb-7 text-center">
            <img
              src="/rc-logo.png"
              alt="RC ERP"
              className="mx-auto block h-14 w-20 object-contain"
            />
            <h1 className="mt-2 text-[23px] font-bold tracking-tight text-[#1d2536]">
              RC ERP
            </h1>
            <p className="mt-1 text-[13px] leading-5 text-[#68738a]">
              One Platform.{" "}
              <strong className="font-semibold text-[#674be3]">Complete</strong>{" "}
              <strong className="font-semibold text-[#0c929a]">Control.</strong>
            </p>
          </div>

          <div className="mb-5">
            <label htmlFor="login-identifier" className="mb-2 block text-[13px] font-semibold text-[#354057]">
              Username or email
            </label>
            <div className="relative">
              <UserRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8792a6]" />
              <input
                id="login-identifier"
                autoFocus
                type="text"
                name="identifier"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                maxLength={254}
                placeholder="Username or email"
                value={form.identifier}
                onChange={(e) => setForm((current) => ({ ...current, identifier: e.target.value }))}
                aria-describedby={error ? "login-error" : undefined}
                className="h-11 w-full rounded-lg border border-[#d8deea] bg-white pl-11 pr-3 text-base text-[#253249] outline-none transition-colors placeholder:text-[#939eae] hover:border-[#aab6ca] focus:border-[#674be3] focus:ring-[3px] focus:ring-[#674be3]/10 sm:text-sm"
              />
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="login-password" className="mb-2 block text-[13px] font-semibold text-[#354057]">
              Password
            </label>
            <div className="relative">
              <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8792a6]" />
              <input
                id="login-password"
                type={show ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                maxLength={128}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                aria-describedby={error ? "login-error" : undefined}
                className="h-11 w-full rounded-lg border border-[#d8deea] bg-white pl-11 pr-12 text-base text-[#253249] outline-none transition-colors placeholder:text-[#939eae] hover:border-[#aab6ca] focus:border-[#674be3] focus:ring-[3px] focus:ring-[#674be3]/10 sm:text-sm"
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent text-[#68758c] hover:bg-[#f2f0ff] hover:text-[#674be3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#674be3]"
              >
                {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              id="login-error"
              role="alert"
              className="mb-4 rounded-md bg-red-50 px-3 py-2 text-left text-[13px] leading-5 text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[12px] sm:text-[13px]">
            <label className="flex cursor-pointer items-center gap-2 text-[#3d4960]">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    remember: e.target.checked,
                  }))
                }
                className="h-4 w-4 cursor-pointer accent-[#674be3]"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() =>
                alert(
                  "Password resets are handled securely by your RC ERP administrator.",
                )
              }
              className="rounded-sm border-0 bg-transparent p-0 font-medium text-[#6045d4] transition hover:text-[#4831b6] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#674be3]"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="h-11 w-full rounded-lg border-0 bg-[#674be3] text-sm font-semibold text-white shadow-[0_5px_14px_rgba(103,75,227,0.17)] transition-colors hover:bg-[#573bd0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#674be3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-medium leading-5 text-[#667188] sm:text-xs">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[#674be3]" />
          <p className=" text-center text-[11px] text-[#8992a4]">
          © 2026 RC ERP. All rights reserved.
        </p>
        </div>
      
      </div>
    </main>
  );
}
