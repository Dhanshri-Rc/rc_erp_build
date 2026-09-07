import { useEffect, useState } from "react";
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
    <main className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-white px-4 py-3 font-['Inter',Arial,sans-serif] text-[#22283a]">
      {/* Top-left decorative rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[118px] -top-[145px] h-[340px] w-[340px] rounded-full border-[72px] border-[rgba(112,79,244,0.13)] bg-[linear-gradient(135deg,rgba(124,93,246,0.56),rgba(84,177,221,0.25))] max-[680px]:-left-[105px] max-[680px]:-top-[95px] max-[680px]:h-[230px] max-[680px]:w-[230px] max-[680px]:border-[48px]"
      />

      {/* Bottom-right decorative gradient ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[285px] -right-[160px] h-[500px] w-[500px] rounded-full bg-[linear-gradient(110deg,#6f4cf4_0%,#5e6bea_47%,#10b8bf_100%)] opacity-[0.88] max-[680px]:-bottom-[190px] max-[680px]:-right-[125px] max-[680px]:h-[330px] max-[680px]:w-[330px]"
      >
        <div className="absolute inset-[82px] rounded-full bg-white max-[680px]:inset-[55px]" />
      </div>

      {/* Top-right wave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[105px] -top-[95px] h-[210px] w-[520px] rotate-12 opacity-20 [background:repeating-radial-gradient(ellipse_at_center,transparent_0_10px,#b9bfd8_11px_12px,transparent_13px_21px)]"
      />

      {/* Bottom-left wave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[90px] -left-[170px] h-[210px] w-[520px] rotate-[24deg] opacity-20 [background:repeating-radial-gradient(ellipse_at_center,transparent_0_10px,#b9bfd8_11px_12px,transparent_13px_21px)]"
      />

      <div className="relative z-10 flex max-h-full w-full max-w-[480px] flex-col justify-center text-center max-[680px]:max-w-[490px]">
        <form
  onSubmit={submit}
  className="w-full rounded-[18px] border border-[#e5e8f0] bg-white px-[74px] pb-7 pt-5 shadow-[0_12px_36px_rgba(59,72,125,0.08)] max-[680px]:px-6 max-[680px]:pb-6 max-[680px]:pt-5 max-[390px]:px-[17px]"
>
          <img
  src="/rc-logo.png"
  alt="RC ERP"
  className="mx-auto -mb-[5px] block h-[64px] w-[84px] object-cover object-center"
/>

          <h1 className="m-0 mt-1 text-[25px] font-bold tracking-[-0.7px] text-[#171b25] max-[390px]:text-[25px]">
            RC ERP
          </h1>

          <p className="mb-0 mt-1 text-[14px] font-medium text-[#68708a]">
            One Platform.{" "}
            <strong className="font-bold text-[#7653f2]">Complete</strong>{" "}
            <strong className="font-bold text-[#0cacb4]">Control.</strong>
          </p>

          <div className="relative mt-3 h-px bg-[#edf0f5]">
            <span className="absolute left-1/2 top-[-1px] h-[3px] w-12 -translate-x-1/2 rounded-[10px] bg-[linear-gradient(110deg,#6f4cf4_0%,#5e6bea_47%,#10b8bf_100%)]" />
          </div>

          <h2 className="mb-0 mt-3 text-[17px] font-[600] text-[#171b25]">
            Welcome Back!
          </h2>

          <p className="mb-4 mt-1 text-[13px] text-[#7a8399]">
            Sign in to continue to your account
          </p>

          {/* Username or email */}
          <div className="relative mb-2.5">
            <UserRound
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8490a8]"
            />

            <input
              autoFocus
              type="text"
              placeholder="Username or Email"
              value={form.identifier}
              onChange={(e) =>
                setForm({ ...form, identifier: e.target.value })
              }
              className="h-10 w-full rounded-[7px] border border-[#dfe3ec] bg-white pb-0 pl-12 pr-[42px] pt-0 text-[13px] text-[#394259] outline-none transition duration-200 placeholder:text-[#7c8498] focus:border-[#7755ef] focus:shadow-[0_0_0_3px_rgba(111,76,244,0.08)]"
            />
          </div>

          {/* Password */}
          <div className="relative mb-[14px]">
            <LockKeyhole
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8490a8]"
            />

            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="h-10 w-full rounded-[7px] border border-[#dfe3ec] bg-white pb-0 pl-12 pr-[42px] pt-0 text-[13px] text-[#394259] outline-none transition duration-200 placeholder:text-[#7c8498] focus:border-[#7755ef] focus:shadow-[0_0_0_3px_rgba(111,76,244,0.08)]"
            />

            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center border-0 bg-transparent p-[4px] text-[#8590a6] transition hover:text-[#6538f3] focus:outline-none"
            >
              {show ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="-mt-[5px] mb-[10px] text-left text-[9px] text-red-500"
            >
              {error}
            </div>
          )}

          <div className="mb-4 mt-2 flex items-center justify-between text-[12px]">
            <label className="flex cursor-pointer items-center gap-2 text-[#394259]">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) =>
                  setForm({ ...form, remember: e.target.checked })
                }
                className="h-[15px] w-[15px] cursor-pointer accent-[#6f4cf4]"
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
              className="border-0 bg-transparent p-0 text-[#6538f3] transition hover:text-[#4f26d3] hover:underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="h-10 w-full rounded-[7px] border-0 bg-[linear-gradient(110deg,#6f4cf4_0%,#5e6bea_47%,#10b8bf_100%)] text-[13px] font-semibold text-white shadow-[0_7px_20px_rgba(99,77,229,0.18)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_11px_24px_rgba(99,77,229,0.25)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none"
          >
            {busy ? "Signing in…" : "Login"}
          </button>

          <div className="my-3.5 flex items-center gap-[18px] text-[13px] text-[#485067] before:h-px before:flex-1 before:bg-[#e7e9ef] after:h-px after:flex-1 after:bg-[#e7e9ef]">
            or
          </div>

          <button
            type="button"
            onClick={() =>
              alert(
                "Google SSO can be enabled with your organization OAuth credentials.",
              )
            }
            className="flex h-[40px] w-full items-center justify-center rounded-[7px] border border-[#dfe3ec] bg-white text-[13px] font-medium text-[#485067] shadow-sm transition hover:border-[#cbd0dc] hover:bg-[#fafbfc] focus:outline-none focus:ring-2 focus:ring-[#7653f2]/15"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="mr-[10px] h-[18px] w-[18px]"
            >
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.39 13.86A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.48l3.35-2.62Z"
              />
              <path
                fill="#EA4335"
                d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z"
              />
            </svg>

            Sign in with Google
          </button>
        </form>

        <div className="mt-3 flex items-center justify-center text-[12px] font-semibold text-[#283248]">
          <span className="mr-2 inline-flex h-[19px] w-[19px] items-center justify-center rounded-md border-2 border-[#7654ef] text-[#7654ef]">
            <ShieldCheck className="h-[13px] w-[13px]" />
          </span>
          Secure. Reliable. Built for Better Performance.
        </div>

        <p className="mb-0 mt-2 text-[11px] text-[#7c8498]">
          © 2026 RC ERP. All rights reserved.
        </p>
      </div>
    </main>
  );
}