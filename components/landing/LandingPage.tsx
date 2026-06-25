"use client";

import { useState } from "react";
import {
    ArrowRight,
    Check,
    Package,
    Sparkles,
} from "lucide-react";
import AuthModal from "./AuthModal";

type AuthMode = "login" | "signup" | null;

type PricingPlan = {
    name: string;
    label: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    buttonText: string;
    highlighted?: boolean;
};

const pricingPlans: PricingPlan[] = [
    {
        name: "Starter",
        label: "Free",
        price: "₱0",
        period: "/month",
        description:
            "For small or starting party supply businesses exploring basic booking and inventory tools.",
        features: [
            "Basic booking management",
            "Basic inventory management",
            "Product catalog",
            "Simple POS transactions",
            "QR code generation for bookings",
            "Up to 50 inventory items",
            "Up to 20 bookings per month",
            "Single admin account",
            "Basic dashboard overview",
        ],
        buttonText: "Start for free",
    },
    {
        name: "Business",
        label: "Standard",
        price: "₱499",
        period: "/month",
        description:
            "For growing small-to-medium party businesses with regular booking operations.",
        features: [
            "Everything in Starter",
            "Unlimited bookings",
            "Up to 500 inventory items",
            "Sales and booking analytics",
            "Downloadable reports",
            "Booking calendar management",
            "Transaction history",
            "Low-stock notifications",
            "Up to 3 staff accounts",
            "Priority email support",
        ],
        buttonText: "Start free trial",
        highlighted: true,
    },
    {
        name: "Enterprise",
        label: "Premium",
        price: "₱1,299",
        period: "/month",
        description:
            "For larger event suppliers and businesses that need advanced operational control.",
        features: [
            "Everything in Business",
            "Unlimited inventory items",
            "Unlimited staff accounts",
            "Advanced analytics and business insights",
            "Custom branding and logo upload",
            "QR inventory scanning",
            "Advanced POS features",
            "Sales forecasting",
            "Multi-role account control",
            "Data backup and extended history",
            "Priority customer support",
        ],
        buttonText: "Contact sales",
    },
];

export default function LandingPage({
                                        onSignupSuccess,
                                    }: {
    onSignupSuccess: () => void;
}) {
    const [authMode, setAuthMode] = useState<AuthMode>(null);

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#FDFAF4] text-[#1A1220]">
            <nav className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#EBE4F0] bg-white px-6 lg:px-10">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D1B4E] text-[#C9951A]">
                        <Package className="h-5 w-5" />
                    </div>

                    <span className="text-lg font-semibold tracking-tight">
                        <span className="text-[#2D1B4E]">Stock</span>NBook
                    </span>
                </div>

                <div className="hidden items-center gap-8 text-sm text-[#7A6E88] md:flex">
                    <a href="#features" className="transition hover:text-[#2D1B4E]">
                        Features
                    </a>

                    <a href="#pricing" className="transition hover:text-[#2D1B4E]">
                        Pricing
                    </a>

                    <a href="#how-it-works" className="transition hover:text-[#2D1B4E]">
                        About
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAuthMode("login")}
                        className="rounded-lg border border-[#EBE4F0] px-4 py-2 text-sm font-medium text-[#1A1220] transition hover:bg-[#EEE8F8]"
                    >
                        Log in
                    </button>

                    <button
                        onClick={() => setAuthMode("signup")}
                        className="rounded-lg bg-[#2D1B4E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3D2560]"
                    >
                        Start free
                    </button>
                </div>
            </nav>

            <section className="grid min-h-[620px] items-end gap-12 bg-[#2D1B4E] px-6 pt-20 lg:grid-cols-2 lg:px-10">
                <div className="pb-14">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#F5E8C0]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Built for event stylists & party suppliers
                    </div>

                    <h1 className="max-w-xl font-serif text-5xl leading-tight text-white lg:text-6xl">
                        The business OS for every{" "}
                        <span className="italic text-[#F5E8C0]">celebration.</span>
                    </h1>

                    <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                        Bookings, inventory, packages, and sales — managed beautifully.
                        Built for Filipino event businesses that mean business.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            onClick={() => setAuthMode("signup")}
                            className="rounded-lg bg-[#C9951A] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Get started free
                        </button>

                        <button
                            onClick={() => setAuthMode("login")}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                        >
                            Log in
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-t-2xl border border-white/10 bg-white shadow-2xl">
                    <div className="flex items-center gap-2 border-b border-[#EBE4F0] bg-[#F8F5FF] px-5 py-4">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-300" />
                        <div className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-300" />

                        <span className="ml-3 text-xs text-[#7A6E88]">
                            StockNBook — Dashboard
                        </span>
                    </div>

                    <div className="p-5">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <MiniStat label="Bookings" value="48" note="↑ +12%" />
                            <MiniStat label="Revenue" value="₱84.5k" note="↑ +8%" />
                            <MiniStat label="Low stock" value="3" note="Alert" danger />
                        </div>

                        <div className="mt-5 text-xs font-semibold uppercase tracking-widest text-[#2D1B4E]">
                            This week&#39;s events
                        </div>

                        <div className="mt-3 divide-y divide-[#EBE4F0]">
                            <EventRow
                                color="#2D1B4E"
                                title="Garcia Wedding"
                                info="May 18 · ₱12,000"
                                status="Confirmed"
                            />

                            <EventRow
                                color="#C9951A"
                                title="Cruz Debut"
                                info="May 22 · ₱8,500"
                                status="Pending"
                            />

                            <EventRow
                                color="#F0997B"
                                title="Santos Birthday"
                                info="May 25 · ₱5,000"
                                status="New"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-[#F5E8C0] bg-[#FFFBF0] px-6 py-6">
                <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 text-center md:grid-cols-4">
                    <ProofStat value="500+" label="Event stylists" />
                    <ProofStat value="₱2M+" label="Bookings managed" />
                    <ProofStat value="4.9★" label="Average rating" />
                    <ProofStat value="3 min" label="To get started" />
                </div>
            </section>

            <section id="features" className="bg-white px-6 py-20 lg:px-10">
                <div className="mx-auto max-w-6xl">
                    <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#C9951A]">
                        What&#39;s inside
                    </p>

                    <h2 className="mt-3 text-center font-serif text-4xl text-[#1A1220]">
                        Everything your event business needs
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-[#7A6E88]">
                        Built specifically for party suppliers and event stylists — not
                        adapted from a generic tool.
                    </p>

                    <div className="mt-12 grid overflow-hidden rounded-2xl border border-[#EBE4F0] md:grid-cols-3">
                        <FeatureCard
                            number="01"
                            title="Smart bookings"
                            desc="Calendar view, booking statuses, and auto-reminders for every event."
                        />

                        <FeatureCard
                            number="02"
                            title="Package builder"
                            desc="Create styled packages with pricing tiers, inclusions, and add-ons."
                        />

                        <FeatureCard
                            number="03"
                            title="Inventory control"
                            desc="Monitor party supplies, product quantities, and restock alerts."
                        />

                        <FeatureCard
                            number="04"
                            title="Sales / POS"
                            desc="Quick checkout for walk-in and on-site event sales."
                        />

                        <FeatureCard
                            number="05"
                            title="Revenue forecasting"
                            desc="See projected income by month and season."
                        />

                        <FeatureCard
                            number="06"
                            title="Booking link"
                            desc="A public page where clients browse packages and book directly."
                        />
                    </div>
                </div>
            </section>

            <PricingSection onSelectPlan={() => setAuthMode("signup")} />

            <section
                id="how-it-works"
                className="bg-[#2D1B4E] px-6 py-20 text-white lg:px-10"
            >
                <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#F5E8C0]">
                    How it works
                </p>

                <h2 className="mt-3 text-center font-serif text-4xl">
                    Up and running in minutes
                </h2>

                <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
                    <StepCard
                        number="01"
                        title="Add packages and inventory"
                        desc="Set up your event packages, pricing tiers, and party supplies."
                    />

                    <StepCard
                        number="02"
                        title="Share your booking link"
                        desc="Clients browse, pick a package, and book directly."
                    />

                    <StepCard
                        number="03"
                        title="Track, earn, and grow"
                        desc="Monitor revenue, restock alerts, and upcoming events."
                    />
                </div>
            </section>

            <section className="flex flex-col items-start justify-between gap-6 bg-[#FFFBF0] px-6 py-12 md:flex-row md:items-center lg:px-10">
                <div>
                    <h2 className="font-serif text-3xl">
                        Ready to run your business properly?
                    </h2>

                    <p className="mt-2 text-sm text-[#7A6E88]">
                        Join Filipino event stylists already using StockNBook.
                    </p>
                </div>

                <button
                    onClick={() => setAuthMode("signup")}
                    className="rounded-lg bg-[#2D1B4E] px-6 py-3 text-sm font-medium text-white"
                >
                    Create free account
                </button>
            </section>

            {authMode && (
                <AuthModal
                    mode={authMode}
                    onClose={() => setAuthMode(null)}
                    onSwitch={setAuthMode}
                    onSignupSuccess={() => {
                        setAuthMode(null);
                        onSignupSuccess();
                    }}
                />
            )}
        </main>
    );
}

function PricingSection({
                            onSelectPlan,
                        }: {
    onSelectPlan: () => void;
}) {
    return (
        <section id="pricing" className="bg-[#F8F5FF] px-6 py-20 lg:px-10">
            <div className="mx-auto max-w-6xl">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#C9951A]">
                    Pricing
                </p>

                <h2 className="mt-3 text-center font-serif text-4xl text-[#1A1220]">
                    Simple plans for growing event businesses
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-[#7A6E88]">
                    Start with the basic tools, then upgrade as your bookings,
                    inventory, staff, and branch operations grow.
                </p>

                <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
                    {pricingPlans.map((plan) => (
                        <PricingCard
                            key={plan.name}
                            plan={plan}
                            onSelectPlan={onSelectPlan}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function PricingCard({
                         plan,
                         onSelectPlan,
                     }: {
    plan: PricingPlan;
    onSelectPlan: () => void;
}) {
    return (
        <div
            className={[
                "relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
                plan.highlighted
                    ? "border-[#2D1B4E] ring-2 ring-[#2D1B4E]"
                    : "border-[#EBE4F0]",
            ].join(" ")}
        >
            {plan.highlighted && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2D1B4E] px-4 py-1 text-xs font-semibold text-white shadow-md">
                    Most popular
                </div>
            )}

            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A6E88]">
                    {plan.label}
                </p>

                <h3 className="mt-3 font-serif text-2xl font-semibold text-[#1A1220]">
                    {plan.name}
                </h3>

                <div className="mt-5 flex items-end gap-1">
                    <span className="font-serif text-4xl font-semibold tracking-tight text-[#1A1220]">
                        {plan.price}
                    </span>

                    <span className="pb-1 text-sm text-[#7A6E88]">
                        {plan.period}
                    </span>
                </div>

                <p className="mt-4 min-h-[72px] text-sm leading-6 text-[#7A6E88]">
                    {plan.description}
                </p>
            </div>

            <div className="mt-7 border-t border-[#EBE4F0] pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A6E88]">
                    Included features
                </p>

                <ul className="mt-4 space-y-2.5">
                    {plan.features.map((feature) => (
                        <li
                            key={feature}
                            className="flex gap-2 text-sm leading-5 text-[#3F354C]"
                        >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C9951A]" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                type="button"
                onClick={onSelectPlan}
                className={[
                    "mt-auto h-11 w-full rounded-xl text-sm font-semibold transition",
                    plan.highlighted
                        ? "bg-[#2D1B4E] text-white hover:bg-[#3D2560]"
                        : "border border-[#3D2560] bg-white text-[#2D1B4E] hover:bg-[#2D1B4E] hover:text-white",
                ].join(" ")}
            >
                {plan.buttonText}
            </button>
        </div>
    );
}

function MiniStat({
                      label,
                      value,
                      note,
                      danger = false,
                  }: {
    label: string;
    value: string;
    note: string;
    danger?: boolean;
}) {
    return (
        <div className="rounded-xl border border-[#EBE4F0] bg-[#FDFAF4] p-4">
            <p className="text-xs uppercase tracking-widest text-[#7A6E88]">
                {label}
            </p>

            <p className="mt-1 text-xl font-semibold">{value}</p>

            <p
                className={`mt-1 text-xs ${
                    danger ? "text-[#993C1D]" : "text-[#3B6D11]"
                }`}
            >
                {note}
            </p>
        </div>
    );
}

function EventRow({
                      color,
                      title,
                      info,
                      status,
                  }: {
    color: string;
    title: string;
    info: string;
    status: string;
}) {
    return (
        <div className="flex items-center gap-3 py-4">
            <div
                className="h-10 w-1 rounded-full"
                style={{ backgroundColor: color }}
            />

            <div className="flex-1">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-[#7A6E88]">{info}</p>
            </div>

            <span className="rounded-md bg-[#EEE8F8] px-3 py-1 text-xs font-medium text-[#3D2560]">
                {status}
            </span>
        </div>
    );
}

function ProofStat({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <p className="font-serif text-3xl text-[#2D1B4E]">{value}</p>
            <p className="mt-1 text-xs text-[#7A6E88]">{label}</p>
        </div>
    );
}

function FeatureCard({
                         number,
                         title,
                         desc,
                     }: {
    number: string;
    title: string;
    desc: string;
}) {
    return (
        <div className="border-b border-r border-[#EBE4F0] bg-white p-7 transition hover:bg-[#FDFAF4]">
            <p className="font-serif text-4xl text-[#EEE8F8]">{number}</p>
            <div className="mt-4 h-0.5 w-8 rounded-full bg-[#C9951A]" />
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#7A6E88]">{desc}</p>
        </div>
    );
}

function StepCard({
                      number,
                      title,
                      desc,
                  }: {
    number: string;
    title: string;
    desc: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <p className="font-serif text-5xl text-[#C9951A]">{number}</p>
            <h3 className="mt-5 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/50">{desc}</p>
        </div>
    );
}