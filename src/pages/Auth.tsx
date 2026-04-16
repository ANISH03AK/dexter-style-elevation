import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import authImg from "@/assets/auth-side.jpg";
import { toast } from "sonner";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden lg:block bg-ink">
        <img src={authImg} alt="DEXTER" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/70 via-ink/30 to-transparent" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="font-display text-2xl tracking-[0.3em] font-bold">DEXTER</Link>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Member Privileges</p>
            <h2 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
              Join the inner <br/> circle.
            </h2>
            <p className="mt-4 text-primary-foreground/70 max-w-sm">
              Early access to drops, exclusive editions, and members-only events.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link to="/" className="lg:hidden font-display text-xl tracking-[0.3em] font-bold block mb-12">DEXTER</Link>

          <div className="flex gap-1 mb-10 border-b border-border">
            {(["login", "signup"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`pb-3 px-4 text-xs uppercase tracking-[0.25em] font-semibold transition-smooth -mb-px border-b-2 ${mode === m ? "border-ink text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold mb-2">
            {mode === "login" ? "Welcome back." : "Become a member."}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "login" ? "Enter your details to access your account." : "Sign up for early access and exclusive offers."}
          </p>

          <form onSubmit={(e) => { e.preventDefault(); toast.success(mode === "login" ? "Signed in" : "Account created"); }} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Full Name</label>
                <input required className="mt-2 w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-smooth" />
              </div>
            )}
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
              <input required type="email" className="mt-2 w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-smooth" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Password</label>
              <input required type="password" className="mt-2 w-full bg-transparent border-b border-border py-3 focus:outline-none focus:border-foreground transition-smooth" />
            </div>

            {mode === "login" && (
              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="accent-foreground" /> Remember me
                </label>
                <a href="#" className="link-underline">Forgot password?</a>
              </div>
            )}

            <button type="submit" className="w-full bg-ink text-primary-foreground py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold hover:text-ink transition-smooth flex items-center justify-center gap-3 mt-4">
              {mode === "login" ? "Sign In" : "Create Account"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="my-8 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or continue with <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="border border-border py-3 text-xs uppercase tracking-[0.2em] hover:border-foreground transition-smooth flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.32z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="currentColor" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              Google
            </button>
            <button className="border border-border py-3 text-xs uppercase tracking-[0.2em] hover:border-foreground transition-smooth flex items-center justify-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to our <a href="#" className="link-underline text-foreground">Terms</a> & <a href="#" className="link-underline text-foreground">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
