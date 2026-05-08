import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const Auth = () => {

    const { user, signIn, signUp, loading, isAdmin, weddingRoles } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);

    const resolveRedirect = (wRoles: typeof weddingRoles, admin: boolean): string => {
        if (admin) return "/admin";
        if (wRoles.length === 0) return "/admin";
        if (wRoles.length > 1) return "/select-role";
        const role = wRoles[0].role;
        if (role === "bride" || role === "groom") return "/guests";
        if (role === "organizer") return "/organizer";
        return "/admin";
    };

    useEffect(() => {
        if (!loading && user) {
            // Honour the ?next= param set by the middleware, fall back to role-based path.
            const next = searchParams.get('next');
            router.replace(next ?? resolveRedirect(weddingRoles, isAdmin));
        }
    }, [loading, user, weddingRoles, isAdmin, router, searchParams]);

    if (loading || user) return null;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        const fn = mode === "signin" ? signIn : signUp;
        const { error, weddingRoles: newWeddingRoles, isAdmin: newIsAdmin } =
            await fn(email, password) as any;
        setBusy(false);
        if (error) {
            toast.error(error.message);
            return;
        }
        if (mode === "signup") {
            toast.success("Account created. You can now sign in.");
            setMode("signin");
        }
    }

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <h1 className="font-display text-5xl text-warm-dark text-center mb-2">
                    Admin <em className="italic text-gold">Access</em>
                </h1>
                <p className="text-center text-warm-soft text-sm mb-10 tracking-[0.2em] uppercase">
                    {mode === "signin" ? "Welcome back" : "Create an account"}
                </p>

                <form onSubmit={onSubmit} className="flex flex-col gap-5 border border-blush p-8 bg-white/40">
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] tracking-[0.45em] uppercase text-warm-soft">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-transparent border-0 border-b border-warm-mid/30 py-2 text-warm-dark outline-none focus:border-gold rounded-none"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] tracking-[0.45em] uppercase text-warm-soft">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="bg-transparent border-0 border-b border-warm-mid/30 py-2 text-warm-dark outline-none focus:border-gold rounded-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={busy}
                        className="mt-4 px-10 py-3 border border-gold text-gold uppercase text-[11px] tracking-[0.4em] font-light hover:bg-gold hover:text-warm-dark transition-colors disabled:opacity-50"
                    >
                        {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
                    </button>
                </form>

                <button
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="block mx-auto mt-6 text-[11px] tracking-[0.3em] uppercase text-warm-soft hover:text-gold transition-colors"
                >
                    {mode === "signin" ? "Create an account" : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
    )
}

export default Auth