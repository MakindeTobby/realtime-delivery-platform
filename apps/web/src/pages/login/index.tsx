import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/custom/TextField";
import { useLoginMutation } from "@/hooks/auth/useAuth";
import { getApiErrorMessage } from "@/lib/api-error";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const loginMutation = useLoginMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    try {
      await loginMutation.mutateAsync({ email, password });
      const requestedPath = searchParams.get("next");
      const next = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/dashboard";
      navigate(next, { replace: true });
    } catch (cause) {
      setError(
        cause instanceof Error && "response" in cause &&
          (cause as { response?: { status?: number } }).response?.status === 401
          ? "Email or password is incorrect."
          : getApiErrorMessage(cause, "Sign in failed. Please try again."),
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div>
            <h1 className="text-2xl font-bold">Sign in to continue</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your restaurant application will be waiting after you sign in.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            <Link to="/partner/restaurants" className="font-medium text-primary underline">
              Return to restaurant onboarding
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
