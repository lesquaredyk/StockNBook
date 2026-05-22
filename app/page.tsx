"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CalendarDays,
  LayoutDashboard,
  Mail,
  Lock,
  Package,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type AuthMode = "login" | "signup" | null;

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [showSetup, setShowSetup] = useState(false);
  if (showSetup) {
    return <SetupScreen />;
  }

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
            <span>Features</span>
            <span>Pricing</span>
            <span>About</span>
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

        <section className="bg-white px-6 py-20 lg:px-10">
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
                  desc="Real-time tracking of all your party supplies."
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

        <section className="bg-[#2D1B4E] px-6 py-20 text-white lg:px-10">
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
                  setShowSetup(true);
                }}
            />
        )}
      </main>
  );
}

function AuthModal({
                     mode,
                     onClose,
                     onSwitch,
                     onSignupSuccess,
                   }: {
  mode: "login" | "signup";
  onClose: () => void;
  onSwitch: (mode: "login" | "signup") => void;
  onSignupSuccess: () => void;
}) {

  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    if (mode === "signup") {
      if (!ownerName || !storeName || !phone) {
        alert("Please fill in all signup fields.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const body =
          mode === "login"
              ? {
                action: "login",
                email,
                password,
              }
              : {
                action: "signup",
                owner_name: ownerName,
                store_name: storeName,
                phone,
                email,
                password,
              };

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        alert(data.error || "Authentication failed.");
        return;
      }

      sessionStorage.clear();
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("store_id", String(data.store_id));
      sessionStorage.setItem("store_name", data.store_name);
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("role", data.role || "owner");

      if (mode === "login") {
        sessionStorage.setItem("role", data.role || "owner");

        if (data.role === "manager") {
          sessionStorage.setItem("manager_id", String(data.manager_id));
          sessionStorage.setItem("manager_name", data.manager_name || "");
          sessionStorage.setItem("manager_email", data.manager_email || "");
          sessionStorage.setItem("branch_id", String(data.branch_id));
          sessionStorage.setItem("branch_name", data.branch_name || "");
          sessionStorage.setItem("permissions", JSON.stringify(data.permissions || {}));

          sessionStorage.setItem(
              "packages_manage",
              String(Boolean(data.permissions?.packages_manage))
          );
        }

        if (data.role === "staff") {
          sessionStorage.setItem("staff_id", String(data.staff_id));
          sessionStorage.setItem("staff_name", data.staff_name || "");
          sessionStorage.setItem("staff_email", data.staff_email || "");
          sessionStorage.setItem("branch_id", String(data.branch_id));
          sessionStorage.setItem("branch_name", data.branch_name || "");
          sessionStorage.setItem("permissions", JSON.stringify(data.permissions || {}));

          sessionStorage.setItem(
              "packages_manage",
              String(Boolean(data.permissions?.packages_manage))
          );
        }
        router.push("/dashboard");
      } else {
        onSignupSuccess();
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
        <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
          <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/80 transition hover:bg-white/10 md:text-[#7A6E88]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="hidden bg-[#2D1B4E] p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#C9951A]">
                  <Package className="h-5 w-5" />
                </div>
                <span className="text-lg font-semibold">
                <span className="text-[#F5E8C0]">Stock</span>NBook
              </span>
              </div>

              <h2 className="mt-14 font-serif text-4xl leading-tight">
                {mode === "login" ? (
                    <>
                      Welcome back to your{" "}
                      <span className="italic text-[#F5E8C0]">business.</span>
                    </>
                ) : (
                    <>
                      Start your{" "}
                      <span className="italic text-[#F5E8C0]">celebration</span>{" "}
                      business here.
                    </>
                )}
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
                Manage your events, bookings, inventory, and team from one clean
                dashboard.
              </p>
            </div>

            <p className="border-t border-white/10 pt-6 font-serif text-sm leading-7 text-white/70">
              “Mas madali na ang buhay ko. Everything is in one place.”
            </p>
          </div>

          <div className="max-h-[90vh] overflow-y-auto p-8 md:p-10">
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D1B4E] text-[#C9951A]">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold text-[#2D1B4E]">
              StockNBook
            </span>
            </div>

            <h1 className="font-serif text-4xl text-[#1A1220]">
              {mode === "login" ? "Log in" : "Create account"}
            </h1>

            <p className="mt-2 text-sm text-[#7A6E88]">
              {mode === "login"
                  ? "Enter your credentials to access your dashboard."
                  : "Set up your business in under 3 minutes."}
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

              {mode === "signup" && (
                  <>
                    <TextInput
                        label="Owner name"
                        placeholder="e.g. Maria Santos"
                        value={ownerName}
                        onChange={setOwnerName}
                    />

                    <TextInput
                        label="Business name"
                        placeholder="e.g. Santos Events & Party Supply"
                        value={storeName}
                        onChange={setStoreName}
                        icon={<Package className="h-5 w-5 text-[#7A6E88]" />}
                    />
                  </>
              )}
              {mode === "signup" && (
                  <TextInput
                      label="Phone number"
                      placeholder="9XX XXX XXXX"
                      value={phone}
                      onChange={setPhone}
                  />
              )}

              <TextInput
                  label="Email address"
                  placeholder="you@yourbusiness.com"
                  value={email}
                  onChange={setEmail}
                  icon={<Mail className="h-5 w-5 text-[#7A6E88]" />}
              />

              <TextInput
                  label="Password"
                  placeholder={
                    mode === "login" ? "Enter your password" : "Create a password"
                  }
                  type="password"
                  value={password}
                  onChange={setPassword}
                  icon={<Lock className="h-5 w-5 text-[#7A6E88]" />}
              />

              {mode === "signup" && (
                  <TextInput
                      label="Confirm password"
                      placeholder="Repeat your password"
                      type="password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      icon={<Lock className="h-5 w-5 text-[#7A6E88]" />}
                  />
              )}

              {mode === "login" && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-[#7A6E88]">
                      <input type="checkbox" />
                      Remember me
                    </label>
                    <button type="button" className="font-medium text-[#2D1B4E]">
                      Forgot password?
                    </button>
                  </div>
              )}

              {mode === "signup" && (
                  <label className="flex items-start gap-2 text-sm text-[#7A6E88]">
                    <input type="checkbox" className="mt-1" />
                    <span>
                  I agree to the{" "}
                      <span className="font-medium text-[#2D1B4E]">
                    Terms of Service
                  </span>{" "}
                      and{" "}
                      <span className="font-medium text-[#2D1B4E]">
                    Privacy Policy
                  </span>
                </span>
                  </label>
              )}

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#2D1B4E] px-5 py-3 font-medium text-white transition hover:bg-[#3D2560] disabled:opacity-60"
              >
                {loading
                    ? "Please wait..."
                    : mode === "login"
                        ? "Log in to StockNBook"
                        : "Create my account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#7A6E88]">
              {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
              <button
                  type="button"
                  onClick={() => onSwitch(mode === "login" ? "signup" : "login")}
                  className="font-semibold text-[#2D1B4E]"
              >
                {mode === "login" ? "Sign up free" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
  );
}

function AccessToggle({
                        label,
                        checked,
                        onChange,
                      }: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
      <label className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm text-[#1A1220]">
        <span>{label}</span>

        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-[#2D1B4E]"
        />
      </label>
  );
}


function TextInput({
                     label,
                     placeholder,
                     type = "text",
                     value,
                     onChange,
                     icon,
                   }: {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium text-[#1A1220]">
          {label}
        </label>

        <div className="flex items-center gap-3 rounded-lg border border-[#EBE4F0] bg-white px-4 py-3 transition focus-within:border-[#2D1B4E] focus-within:ring-4 focus-within:ring-[#2D1B4E]/10">
          {icon}

          <input
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#7A6E88]"
          />
        </div>
      </div>
  );
}

function SetupScreen() {
  const router = useRouter();

  const [setupStep, setSetupStep] = useState(1);
  const [branchCount, setBranchCount] = useState(1);

  const [inviteLinks, setInviteLinks] = useState<
      {
        manager_email: string;
        manager_name: string;
        branch_name: string;
        invite_link: string;
      }[]
  >([]);

  const defaultPermissions = {
    dashboard: true,
    bookings: true,
    packages: true,
    packages_manage: false,
    inventory: true,
    pos: true,
    reports: false,
    staff_management: false,
    staff_roles: false,
    branch_settings: false,
  };

  const [branches, setBranches] = useState([
    {
      branch_name: "",
      contact_number: "",
      address: "",
      manager_name: "",
      manager_email: "",
      permissions: defaultPermissions,
    },
  ]);

  const adjustBranches = (delta: number) => {
    setBranchCount((current) => {
      const nextCount = Math.max(1, Math.min(10, current + delta));

      setBranches((prev) => {
        const copy = [...prev];

        while (copy.length < nextCount) {
          copy.push({
            branch_name: "",
            contact_number: "",
            address: "",
            manager_name: "",
            manager_email: "",
            permissions: defaultPermissions,
          });
        }

        return copy.slice(0, nextCount);
      });

      return nextCount;
    });
  };
  const updateBranch = (
      index: number,
      field: "branch_name" | "contact_number" | "address" | "manager_name" | "manager_email",
      value: string
  ) => {
    setBranches((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const updatePermission = (
      index: number,
      permission: keyof typeof defaultPermissions,
      value: boolean
  ) => {
    setBranches((prev) => {
      const copy = [...prev];

      copy[index] = {
        ...copy[index],
        permissions: {
          ...copy[index].permissions,
          [permission]: value,
        },
      };

      return copy;
    });
  };

  return (
      <main className="min-h-screen bg-[#FDFAF4] text-[#1A1220]">
        <nav className="flex h-16 items-center justify-between border-b border-[#EBE4F0] bg-white px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D1B4E] text-[#C9951A]">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">
            <span className="text-[#2D1B4E]">Stock</span>NBook
          </span>
          </div>
        </nav>

        <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-2xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-[#EBE4F0] bg-white p-10 shadow-sm">
            <h1 className="font-serif text-4xl text-[#1A1220]">
              Business setup
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#7A6E88]">
              Your account has been created. Next, we will set up your branches and managers.
            </p>

            {setupStep === 1 && (
                <button
                    onClick={() => setSetupStep(2)}
                    className="mt-8 w-full rounded-lg bg-[#2D1B4E] px-5 py-3 font-medium text-white"
                >
                  Continue setup
                </button>
            )}

            {setupStep === 2 && (
                <div className="mt-8">
                  <h2 className="font-serif text-3xl text-[#1A1220]">
                    How many branches does your business have?
                  </h2>

                  <p className="mt-2 text-sm text-[#7A6E88]">
                    You can always add more branches later.
                  </p>

                  <div className="mt-8 flex items-center justify-center gap-6 rounded-2xl bg-[#FDFAF4] px-6 py-6">
                    <button
                        onClick={() => adjustBranches(-1)}
                        className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#EBE4F0] bg-white text-2xl font-medium text-[#2D1B4E] transition hover:bg-[#EEE8F8]"
                    >
                      −
                    </button>

                    <div className="min-w-[100px] text-center">
                      <div className="font-serif text-5xl leading-none text-[#2D1B4E]">
                        {branchCount}
                      </div>
                      <div className="mt-2 text-sm text-[#7A6E88]">branch(es)</div>
                    </div>

                    <button
                        onClick={() => adjustBranches(1)}
                        className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#EBE4F0] bg-white text-2xl font-medium text-[#2D1B4E] transition hover:bg-[#EEE8F8]"
                    >
                      +
                    </button>
                  </div>

                  <button
                      onClick={() => setSetupStep(3)}
                      className="mt-8 w-full rounded-lg bg-[#2D1B4E] px-5 py-3 font-medium text-white"
                  >
                    Continue
                  </button>
                </div>
            )}

            {setupStep === 3 && (
                <div className="mt-8">
                  <h2 className="font-serif text-3xl text-[#1A1220]">
                    Tell us about your branches
                  </h2>

                  <p className="mt-2 text-sm text-[#7A6E88]">
                    Add the name, contact number, and address of each branch.
                  </p>

                  <div className="mt-8 space-y-6">
                    {Array.from({ length: branchCount }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-[#EBE4F0] bg-[#FDFAF4] p-6"
                        >
                          <h3 className="mb-5 font-semibold text-[#2D1B4E]">
                            Branch {index + 1}
                          </h3>

                          <div className="space-y-4">
                            <TextInput
                                label="Branch name"
                                placeholder="e.g. Main Branch"
                                value={branches[index]?.branch_name || ""}
                                onChange={(value) => updateBranch(index, "branch_name", value)}
                            />

                            <TextInput
                                label="Branch contact number"
                                placeholder="09XX XXX XXXX"
                                value={branches[index]?.contact_number || ""}
                                onChange={(value) => updateBranch(index, "contact_number", value)}
                            />

                            <TextInput
                                label="Branch address"
                                placeholder="Full address of this branch"
                                value={branches[index]?.address || ""}
                                onChange={(value) => updateBranch(index, "address", value)}
                            />

                            <div className="border-t border-[#EBE4F0] pt-6">
                              <h4 className="font-semibold text-[#2D1B4E]">
                                Branch manager
                              </h4>

                              <p className="mt-1 text-sm text-[#7A6E88]">
                                Invite a manager to handle this branch and choose the features they can access.
                              </p>

                              <div className="mt-5 space-y-4">
                                <TextInput
                                    label="Manager name"
                                    placeholder="e.g. Ana Cruz"
                                    value={branches[index]?.manager_name || ""}
                                    onChange={(value) => updateBranch(index, "manager_name", value)}
                                />

                                <TextInput
                                    label="Manager email"
                                    placeholder="manager@email.com"
                                    type="email"
                                    value={branches[index]?.manager_email || ""}
                                    onChange={(value) => updateBranch(index, "manager_email", value)}
                                    icon={<Mail className="h-5 w-5 text-[#7A6E88]" />}
                                />
                              </div>

                              <div className="mt-6">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#7A6E88]">
                                  Feature access
                                </p>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  <AccessToggle
                                      label="Dashboard"
                                      checked={branches[index]?.permissions.dashboard || false}
                                      onChange={(checked) => updatePermission(index, "dashboard", checked)}
                                  />

                                  <AccessToggle
                                      label="Bookings"
                                      checked={branches[index]?.permissions.bookings || false}
                                      onChange={(checked) => updatePermission(index, "bookings", checked)}
                                  />

                                  <AccessToggle
                                      label="Packages"
                                      checked={branches[index]?.permissions.packages || false}
                                      onChange={(checked) => updatePermission(index, "packages", checked)}
                                  />

                                  <AccessToggle
                                      label="Manage Packages"
                                      checked={branches[index]?.permissions.packages_manage || false}
                                      onChange={(checked) => updatePermission(index, "packages_manage", checked)}
                                  />

                                  <AccessToggle
                                      label="Inventory"
                                      checked={branches[index]?.permissions.inventory || false}
                                      onChange={(checked) => updatePermission(index, "inventory", checked)}
                                  />

                                  <AccessToggle
                                      label="Sales / POS"
                                      checked={branches[index]?.permissions.pos || false}
                                      onChange={(checked) => updatePermission(index, "pos", checked)}
                                  />

                                  <AccessToggle
                                      label="Reports"
                                      checked={branches[index]?.permissions.reports || false}
                                      onChange={(checked) => updatePermission(index, "reports", checked)}
                                  />

                                  <AccessToggle
                                      label="Staff Management"
                                      checked={branches[index]?.permissions.staff_management || false}
                                      onChange={(checked) => updatePermission(index, "staff_management", checked)}
                                  />

                                  <AccessToggle
                                      label="Staff Roles & Permissions"
                                      checked={branches[index]?.permissions.staff_roles || false}
                                      onChange={(checked) => updatePermission(index, "staff_roles", checked)}
                                  />

                                  <AccessToggle
                                      label="Branch Settings"
                                      checked={branches[index]?.permissions.branch_settings || false}
                                      onChange={(checked) => updatePermission(index, "branch_settings", checked)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button
                        onClick={() => setSetupStep(2)}
                        className="w-full rounded-lg border border-[#EBE4F0] bg-white px-5 py-3 font-medium text-[#2D1B4E]"
                    >
                      Back
                    </button>

                    <button
                        onClick={async () => {
                          const token = sessionStorage.getItem("token");

                          const res = await fetch("/api/onboarding", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              branches,
                            }),
                          });

                          const data = await res.json();

                          if (!res.ok) {
                            alert(JSON.stringify(data));
                            return;
                          }

                          setInviteLinks(data.invite_links || []);
                          alert("Branches and manager invitation links created!");

                          sessionStorage.setItem("role", "owner");
                        }}
                        className="w-full rounded-lg bg-[#2D1B4E] px-5 py-3 font-medium text-white"
                    >
                      Send invitations
                    </button>
                  </div>
                </div>
            )}
            {inviteLinks.length > 0 && (
                <div className="mt-8 rounded-2xl border border-[#EBE4F0] bg-[#FDFAF4] p-6">
                  <h3 className="font-semibold text-[#2D1B4E]">
                    Manager invitation links
                  </h3>

                  <p className="mt-2 text-sm text-[#7A6E88]">
                    Use these links for testing. Later, these will be sent automatically by email.
                  </p>

                  <div className="mt-5 space-y-4">
                    {inviteLinks.map((invite, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-[#EBE4F0] bg-white p-4"
                        >
                          <p className="text-sm font-semibold text-[#1A1220]">
                            {invite.manager_name || "Manager"} — {invite.branch_name}
                          </p>

                          <p className="mt-1 text-xs text-[#7A6E88]">
                            {invite.manager_email}
                          </p>

                          <div className="mt-3 flex gap-2">
                            <input
                                readOnly
                                value={invite.invite_link}
                                className="w-full rounded-lg border border-[#EBE4F0] px-3 py-2 text-xs text-[#7A6E88]"
                            />

                            <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(invite.invite_link);
                                  alert("Invite link copied!");
                                }}
                                className="rounded-lg bg-[#2D1B4E] px-4 py-2 text-xs font-medium text-white"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                    ))}
                  </div>

                  <button
                      type="button"
                      onClick={() => router.push("/dashboard")}
                      className="mt-6 w-full rounded-lg bg-[#2D1B4E] px-5 py-3 font-medium text-white"
                  >
                    Go to dashboard
                  </button>
                </div>
            )}
          </div>
        </section>
      </main>
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
        <p className={`mt-1 text-xs ${danger ? "text-[#993C1D]" : "text-[#3B6D11]"}`}>
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





