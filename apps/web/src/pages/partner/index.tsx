import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Bike,
  Check,
  ChefHat,
  Clock3,
  MapPin,
  Smartphone,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import grilledChickenRice from "@/assets/grilled-chicken-rice.png";

const foodCategories = [
  {
    name: "Rice bowls",
    note: "Comfort, served hot",
    icon: "🍛",
    color: "bg-[#fff0dc]",
  },
  {
    name: "Burgers & grills",
    note: "Made for big cravings",
    icon: "🍔",
    color: "bg-[#fce6e1]",
  },
  {
    name: "Small chops",
    note: "A little bit of everything",
    icon: "🥟",
    color: "bg-[#eee7fb]",
  },
  {
    name: "Something sweet",
    note: "Save room for dessert",
    icon: "🍰",
    color: "bg-[#e4f3ee]",
  },
];

const steps = [
  {
    number: "01",
    title: "Find your craving",
    description:
      "Explore the Swiftbite app and find something delicious nearby.",
  },
  {
    number: "02",
    title: "Place your order",
    description:
      "Choose your favorites and let the restaurant prepare them fresh.",
  },
  {
    number: "03",
    title: "Enjoy the moment",
    description: "A Swiftbite courier brings your meal right to your door.",
  },
];

export default function PartnerPage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      <header className="relative z-10 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            aria-label="Swiftbite home"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-primary text-white shadow-sm shadow-primary/25">
              <Utensils className="size-5" strokeWidth={2.4} />
            </span>
            <span className="text-[21px] font-extrabold tracking-tight">
              swiftbite<span className="text-primary">.</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-8 text-sm font-medium text-foreground/70 md:flex"
            aria-label="Main navigation"
          >
            <a href="#how-it-works" className="transition hover:text-primary">
              How it works
            </a>
            <a href="#cuisines" className="transition hover:text-primary">
              What to eat
            </a>
            <a href="#partners" className="transition hover:text-primary">
              Partner with us
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full px-5">
              <Link to="/customer">
                Get the app <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 size-[480px] rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-[-10%] size-[380px] rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="mx-auto grid min-h-[610px] max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1.02fr_.98fr] md:py-20 lg:min-h-[680px]">
          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-3.5 py-2 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="size-4" /> Good food, good mood
            </div>
            <h1 className="text-[clamp(3.25rem,7vw,5.6rem)] font-black leading-[.98] tracking-[-.065em] text-[#211b1b]">
              Cravings call.
              <br />
              We{" "}
              <span className="relative inline-block text-primary">
                deliver.
                <span className="absolute -bottom-1 left-1 h-2 w-[92%] -rotate-2 rounded-full bg-[#ffc766]/80" />
              </span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-[#6e6260] sm:text-lg sm:leading-8">
              Your favorite meals, the neighborhood spots you love, and new
              tastes to discover — all coming your way with Swiftbite.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-6 text-[15px] shadow-lg shadow-primary/20"
              >
                <Link to="/customer">
                  Explore Swiftbite <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-black/10 bg-white/70 px-6 text-[15px]"
              >
                <a href="#how-it-works">
                  How it works <ArrowDown className="ml-2 size-4" />
                </a>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#766b68]">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-4 text-primary" /> Delivered with care
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> Local favorites,
                closer
              </span>
            </div>
          </div>

          <div className="relative mx-auto flex h-[370px] w-full max-w-[540px] items-center justify-center sm:h-[500px]">
            <div className="absolute left-[9%] top-[7%] size-[78%] rounded-full bg-[#f6d4bd] sm:size-[76%]" />
            <img
              src={grilledChickenRice}
              alt="Grilled chicken served with seasoned rice and fresh vegetables"
              className="relative z-[1] aspect-square w-[min(100%,500px)] object-contain drop-shadow-[0_30px_28px_rgba(104,54,35,.18)]"
              fetchPriority="high"
            />

            <div className="absolute bottom-[7%] right-[1%] z-[2] flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3.5 shadow-xl shadow-[#82452e]/10 sm:bottom-[10%] sm:right-[3%] sm:p-4">
              <span className="grid size-11 place-items-center rounded-xl bg-[#eaf5ed] text-[#518c61]">
                <Bike className="size-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-[#928582]">
                  On its way
                </span>
                <span className="block text-sm font-bold">
                  A little joy, delivered
                </span>
              </span>
              <span className="ml-1 grid size-6 place-items-center rounded-full bg-[#e7f3e9] text-[#548961]">
                <Check className="size-3.5" />
              </span>
            </div>

            <div className="absolute left-[3%] top-[20%] z-[2] flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold shadow-lg shadow-[#82452e]/10 sm:left-[1%] sm:top-[22%] sm:px-4 sm:py-2.5 sm:text-sm">
              <span className="text-lg">⭐</span> Made fresh, just for you
            </div>
          </div>
        </div>
      </section>

      <section
        id="cuisines"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">
              A little inspiration
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Whatever you’re craving.
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              From familiar comfort to a new favorite, your next good meal
              starts here.
            </p>
          </div>
          <Link
            to="/customer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Find your next meal <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {foodCategories.map((category) => (
            <Link
              key={category.name}
              to="/customer"
              className="group rounded-[26px] border border-black/[.055] bg-white p-4 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[.06]"
            >
              <div
                className={`grid aspect-[1.48] place-items-center overflow-hidden rounded-[20px] ${category.color}`}
              >
                <span
                  className="text-[76px] transition duration-300 group-hover:scale-110 group-hover:-rotate-3"
                  role="img"
                  aria-label={category.name}
                >
                  {category.icon}
                </span>
              </div>
              <div className="flex items-center justify-between px-1 pb-1 pt-4">
                <div>
                  <h3 className="font-bold">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.note}
                  </p>
                </div>
                <span className="grid size-9 place-items-center rounded-full bg-primary/5 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-[#f8f7f5] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-primary">
              Easy as that
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Good food is just a few taps away.
            </h2>
            <p className="mt-4 text-muted-foreground">
              A simple way to bring the meals you love a little closer.
            </p>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <article
                key={step.number}
                className="relative text-center md:text-left"
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-[65%] top-7 hidden h-px w-[72%] border-t border-dashed border-[#e9c7b7] md:block" />
                )}
                <span className="relative z-[1] mx-auto grid size-14 place-items-center rounded-2xl bg-white text-lg font-extrabold text-primary shadow-sm ring-1 ring-black/[.04] md:mx-0">
                  {step.number}
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground md:mx-0">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/customer">
                Get started <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="partners"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <article className="relative overflow-hidden rounded-[30px] bg-[#252022] p-7 text-white sm:p-10">
            <div className="absolute -right-10 -top-12 size-52 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#ffbd91]">
                <ChefHat className="size-6" />
              </span>
              <p className="mt-7 text-sm font-bold uppercase tracking-[.16em] text-[#ffc2a3]">
                For restaurants
              </p>
              <h2 className="mt-3 max-w-sm text-3xl font-extrabold tracking-tight">
                More local love for your kitchen.
              </h2>
              <p className="mt-3 max-w-sm leading-7 text-white/65">
                Bring your menu to more people and manage your orders in one
                place.
              </p>
              <Button
                asChild
                className="mt-7 rounded-full bg-white px-5 text-[#252022] hover:bg-white/90"
              >
                <Link to="/partner/restaurants">
                  Become a restaurant partner{" "}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            <div
              className="pointer-events-none absolute -bottom-9 -right-2 rotate-[-12deg] text-[105px] opacity-20 sm:right-6 sm:text-[130px]"
              aria-hidden="true"
            >
              🍲
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[30px] bg-[#fff0df] p-7 sm:p-10">
            <div className="absolute -bottom-20 -right-10 size-64 rounded-full bg-[#ffd8ac]" />
            <div className="relative z-[1]">
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-primary shadow-sm">
                <Bike className="size-6" />
              </span>
              <p className="mt-7 text-sm font-bold uppercase tracking-[.16em] text-primary">
                For delivery partners
              </p>
              <h2 className="mt-3 max-w-sm text-3xl font-extrabold tracking-tight">
                Take the road to something good.
              </h2>
              <p className="mt-3 max-w-sm leading-7 text-[#766b68]">
                Join Swiftbite and help bring great meals to your community.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-7 rounded-full border-black/10 bg-white px-5"
              >
                <Link to="/partner/drivers">
                  Ride with Swiftbite <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            <div
              className="pointer-events-none absolute -bottom-10 -right-2 rotate-[-12deg] text-[105px] opacity-35 sm:right-6 sm:text-[130px]"
              aria-hidden="true"
            >
              🛵
            </div>
          </article>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 overflow-hidden rounded-[30px] bg-primary px-7 py-10 text-white sm:flex-row sm:px-12 sm:py-12">
          <div className="absolute -right-16 -top-28 size-72 rounded-full border border-white/10" />
          <div className="absolute -right-2 -top-16 size-52 rounded-full border border-white/10" />
          <div className="relative max-w-xl">
            <p className="flex items-center gap-2 text-sm font-semibold text-white/75">
              <Smartphone className="size-4" /> Your next meal is waiting
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Make room for something delicious.
            </h2>
            <p className="mt-3 text-white/75">
              Find Swiftbite on mobile and bring your favorite flavors along.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="relative shrink-0 rounded-full px-6 font-bold text-primary"
          >
            <Link to="/customer">
              Explore Swiftbite <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-black/[.06] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold tracking-tight"
          >
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-white">
              <Utensils className="size-4" />
            </span>
            swiftbite<span className="-ml-2 text-primary">.</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Good food brings us together.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
            <Link to="/login" className="hover:text-primary">
              Log in
            </Link>
            <Link to="/partner/restaurants" className="hover:text-primary">
              Restaurants
            </Link>
            <Link to="/partner/drivers" className="hover:text-primary">
              Drivers
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
