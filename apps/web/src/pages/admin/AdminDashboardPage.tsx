import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Bike,
  Check,
  Clock3,
  LogOut,
  MapPin,
  ShieldCheck,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUserQuery, useLogoutMutation } from "@/hooks/auth/useAuth";
import {
  usePendingDriversQuery,
  usePendingRestaurantsQuery,
  useUpdateDriverVerificationMutation,
  useUpdateRestaurantVerificationMutation,
} from "@/hooks/admin/useAdminApplications";
import { getAccessToken } from "@/lib/auth-session";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

type Queue = "restaurants" | "drivers";
type ReviewStatus = "APPROVED" | "REJECTED";

export default function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedQueue: Queue = searchParams.get("view") === "drivers" ? "drivers" : "restaurants";
  const userQuery = useCurrentUserQuery(Boolean(getAccessToken()));
  const restaurantsQuery = usePendingRestaurantsQuery();
  const driversQuery = usePendingDriversQuery();
  const restaurantMutation = useUpdateRestaurantVerificationMutation();
  const driverMutation = useUpdateDriverVerificationMutation();
  const logoutMutation = useLogoutMutation();
  const [actionError, setActionError] = useState<string>();
  const [busyKey, setBusyKey] = useState<string>();

  async function reviewApplication(queue: Queue, id: string, status: ReviewStatus, applicantName: string) {
    if (status === "REJECTED" && !window.confirm(`Reject ${applicantName}’s ${queue === "restaurants" ? "restaurant" : "driver"} application?`)) return;
    setActionError(undefined);
    setBusyKey(`${queue}:${id}`);
    try {
      if (queue === "restaurants") await restaurantMutation.mutateAsync({ id, status });
      else await driverMutation.mutateAsync({ id, status });
    } catch (cause) {
      setActionError(getApiErrorMessage(cause, `Could not update this ${queue === "restaurants" ? "restaurant" : "driver"} application.`));
    } finally {
      setBusyKey(undefined);
    }
  }

  async function signOut() {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      window.location.replace("/login");
    }
  }

  const activeLoading = selectedQueue === "restaurants" ? restaurantsQuery.isLoading : driversQuery.isLoading;
  const activeError = selectedQueue === "restaurants" ? restaurantsQuery.isError : driversQuery.isError;
  const refetch = selectedQueue === "restaurants" ? restaurantsQuery.refetch : driversQuery.refetch;
  const adminName = [userQuery.data?.firstName, userQuery.data?.lastName].filter(Boolean).join(" ") || "Administrator";

  return (
    <div className="min-h-screen bg-[#f7f7f5] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-black/[0.06] bg-[#191817] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex h-full flex-col">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-5 py-5">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"><UtensilsCrossed className="size-5" /></span>
            <span><span className="block text-[15px] font-semibold tracking-tight">SwiftBite</span><span className="block text-xs text-white/45">Administration</span></span>
          </Link>
          <div className="mx-3 mb-5 rounded-xl border border-white/10 bg-white/[0.05] p-3">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Signed in as</p>
            <p className="mt-2 truncate px-1 text-sm font-medium">{adminName}</p>
            <p className="mt-1 truncate px-1 text-xs text-white/45">{userQuery.data?.email}</p>
          </div>
          <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
            <p className="hidden px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 lg:block">Application review</p>
            <button type="button" onClick={() => setSearchParams({ view: "restaurants" })} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/60 transition hover:bg-white/[0.07] hover:text-white", selectedQueue === "restaurants" && "bg-white/10 text-white ring-1 ring-inset ring-white/[0.07]")}>
              <Store className={cn("size-[18px]", selectedQueue === "restaurants" && "text-primary")} /><span>Restaurants</span><span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">{restaurantsQuery.data?.length ?? "—"}</span>
            </button>
            <button type="button" onClick={() => setSearchParams({ view: "drivers" })} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/60 transition hover:bg-white/[0.07] hover:text-white", selectedQueue === "drivers" && "bg-white/10 text-white ring-1 ring-inset ring-white/[0.07]")}>
              <Bike className={cn("size-[18px]", selectedQueue === "drivers" && "text-primary")} /><span>Drivers</span><span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">{driversQuery.data?.length ?? "—"}</span>
            </button>
          </nav>
          <div className="mt-auto hidden p-3 lg:block"><div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs font-medium">Secure admin access</p><p className="mt-1 text-xs leading-5 text-white/45">Only administrator accounts can review these applications.</p><span className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-300"><ShieldCheck className="size-3.5" />Role protected</span></div></div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
            <div><p className="text-xs text-muted-foreground">SwiftBite administration</p><p className="mt-0.5 text-sm font-semibold">Application review</p></div>
            <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground" onClick={() => void signOut()} disabled={logoutMutation.isPending}><LogOut className="size-4" /><span className="hidden sm:inline">Sign out</span></Button>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] space-y-7 px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
          <section className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-medium text-primary">OPERATIONS</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{selectedQueue === "restaurants" ? "Restaurant applications" : "Driver applications"}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Review pending applications and approve or reject access to the SwiftBite platform.</p></div>
            <div className="flex gap-2 rounded-xl border border-black/[0.06] bg-white px-4 py-3"><Clock3 className="mt-0.5 size-4 text-primary" /><div><p className="text-xs text-muted-foreground">Awaiting review</p><p className="text-lg font-semibold leading-6">{activeLoading ? "—" : selectedQueue === "restaurants" ? restaurantsQuery.data?.length ?? 0 : driversQuery.data?.length ?? 0}</p></div></div>
          </section>

          {actionError && <p role="alert" className="rounded-xl border border-destructive/15 bg-destructive/[0.04] p-3 text-sm text-destructive">{actionError}</p>}
          {activeLoading && <div className="grid gap-4 xl:grid-cols-2"><LoadingCard /><LoadingCard /></div>}
          {activeError && <Card className="rounded-2xl border-black/[0.06]"><CardContent className="flex flex-wrap items-center justify-between gap-4 p-6"><div className="flex items-center gap-3"><AlertCircle className="size-5 text-destructive" /><div><p className="text-sm font-medium">Couldn’t load pending applications</p><p className="mt-1 text-xs text-muted-foreground">Check your connection and try again.</p></div></div><Button variant="outline" className="rounded-xl" onClick={() => void refetch()}>Try again</Button></CardContent></Card>}

          {!activeLoading && !activeError && selectedQueue === "restaurants" && (restaurantsQuery.data?.length ? (
            <div className="grid gap-4 xl:grid-cols-2">{restaurantsQuery.data.map((application) => <Card key={application.id} className="overflow-hidden rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]">
              <CardContent className="p-0">
                <div className="flex gap-4 border-b border-black/[0.06] p-5 sm:p-6">
                  {application.imageUrl ? <img src={application.imageUrl} alt="" className="size-[76px] shrink-0 rounded-xl object-cover" /> : <span className="grid size-[76px] shrink-0 place-items-center rounded-xl bg-[#fff2e9] text-primary"><Store className="size-7" /></span>}
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold tracking-tight">{application.name}</h2><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">Pending</span></div><p className="mt-1 text-sm text-muted-foreground">{application.cuisineType}</p><p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground"><MapPin className="mt-0.5 size-3.5 shrink-0" />{application.address}, {application.city}</p></div>
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  {application.description && <p className="text-sm leading-6 text-muted-foreground">{application.description}</p>}
                  <ApplicantDetails name={`${application.ownerFirstName} ${application.ownerLastName}`} email={application.ownerEmail} phone={application.ownerPhone} submittedAt={application.createdAt} />
                  <ReviewActions busy={busyKey === `restaurants:${application.id}`} onApprove={() => void reviewApplication("restaurants", application.id, "APPROVED", application.name)} onReject={() => void reviewApplication("restaurants", application.id, "REJECTED", application.name)} />
                </div>
              </CardContent>
            </Card>)}</div>
          ) : <EmptyState kind="restaurant" />)}

          {!activeLoading && !activeError && selectedQueue === "drivers" && (driversQuery.data?.length ? (
            <div className="grid gap-4 xl:grid-cols-2">{driversQuery.data.map((application) => {
              const name = `${application.firstName} ${application.lastName}`;
              return <Card key={application.id} className="rounded-2xl border-black/[0.06] shadow-[0_8px_30px_-24px_rgba(0,0,0,0.22)]"><CardContent className="space-y-5 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-xl bg-violet-50 text-violet-700"><Bike className="size-5" /></span><div><h2 className="font-semibold tracking-tight">{name}</h2><p className="mt-1 text-xs text-muted-foreground">Driver applicant</p></div></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">Pending</span></div>
                <ApplicantDetails name={name} email={application.email} phone={application.phone} submittedAt={application.createdAt} />
                <ReviewActions busy={busyKey === `drivers:${application.id}`} onApprove={() => void reviewApplication("drivers", application.id, "APPROVED", name)} onReject={() => void reviewApplication("drivers", application.id, "REJECTED", name)} />
              </CardContent></Card>;
            })}</div>
          ) : <EmptyState kind="driver" />)}
        </main>
      </div>
    </div>
  );
}

function ApplicantDetails({ name, email, phone, submittedAt }: { name: string; email: string; phone: string | null; submittedAt: string }) {
  return <div className="grid gap-3 rounded-xl border border-black/[0.06] bg-[#fafaf8] p-4 sm:grid-cols-2"><div className="min-w-0"><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Applicant</p><p className="mt-1 truncate text-sm font-medium">{name}</p><a href={`mailto:${email}`} className="mt-1 block truncate text-xs text-primary hover:underline">{email}</a>{phone && <a href={`tel:${phone}`} className="mt-1 block text-xs text-muted-foreground hover:text-foreground">{phone}</a>}</div><div><p className="text-[11px] uppercase tracking-wide text-muted-foreground">Submitted</p><p className="mt-1 text-sm font-medium">{new Date(submittedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</p><p className="mt-1 text-xs text-muted-foreground">Application received</p></div></div>;
}

function ReviewActions({ busy, onApprove, onReject }: { busy: boolean; onApprove: () => void; onReject: () => void }) {
  return <div className="flex justify-end gap-2 border-t border-black/[0.06] pt-4"><Button variant="outline" className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={onReject} disabled={busy}><X className="size-4" />Reject</Button><Button className="rounded-xl" onClick={onApprove} disabled={busy}><Check className="size-4" />{busy ? "Updating…" : "Approve"}</Button></div>;
}

function EmptyState({ kind }: { kind: "restaurant" | "driver" }) {
  const noun = kind === "restaurant" ? "restaurant" : "driver";
  const Icon = kind === "restaurant" ? Store : Bike;
  return <Card className="rounded-2xl border-black/[0.06]"><CardContent className="flex flex-col items-center px-6 py-14 text-center"><span className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="size-6" /></span><h2 className="mt-4 font-semibold">You’re all caught up</h2><p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">There are no pending {noun} applications right now. New applications will appear here.</p><Link to="/dashboard" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Back to dashboard <ArrowUpRight className="size-4" /></Link></CardContent></Card>;
}

function LoadingCard() {
  return <Card className="rounded-2xl border-black/[0.06]"><CardContent className="space-y-4 p-6"><div className="h-6 w-2/5 animate-pulse rounded bg-muted" /><div className="h-4 w-3/5 animate-pulse rounded bg-muted" /><div className="h-20 animate-pulse rounded-xl bg-muted/60" /></CardContent></Card>;
}
