"use client";

import { useEffect, useState } from "react";
import {
    AuditLog,
    BusinessRecord,
    BusinessSubscriptionResponse,
    usePlatformAdmin,
} from "@/hooks/usePlatformAdmin";

function formatDate(value?: string | null) {
    if (!value) return "—";

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return String(value);

    return parsed.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function remainingDays(expirationDate?: string | null) {
    if (!expirationDate) return "—";

    const expiry = new Date(`${String(expirationDate).slice(0, 10)}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const difference = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return difference < 0 ? "Expired" : `${difference} day${difference === 1 ? "" : "s"}`;
}

export default function BusinessSubscriptionDetails() {
    const {
        businesses,
        isLoading,
        error,
        clearError,
        loadBusinesses,
        loadBusinessSubscription,
        loadAuditLogs,
    } = usePlatformAdmin();

    const [search, setSearch] = useState("");
    const [selectedBusiness, setSelectedBusiness] =
        useState<BusinessRecord | null>(null);
    const [details, setDetails] =
        useState<BusinessSubscriptionResponse | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [notice, setNotice] = useState("");

    const searchBusinesses = async (requestedSearch = search) => {
        try {
            await loadBusinesses(requestedSearch);
        } catch (requestError) {
            setNotice(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to load businesses."
            );
        }
    };

    useEffect(() => {
        void searchBusinesses("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openBusiness = async (business: BusinessRecord) => {
        setSelectedBusiness(business);

        try {
            const [subscriptionResult, logs] = await Promise.all([
                loadBusinessSubscription(business.business_id),
                loadAuditLogs(business.business_id),
            ]);

            setDetails(subscriptionResult);
            setAuditLogs(logs);
        } catch (requestError) {
            setNotice(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to load business subscription details."
            );
        }
    };

    return (
        <main className="p-5">
            <div className="mx-auto max-w-[1550px]">
                {(notice || error) && (
                    <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-[#E6DDF0] bg-white px-4 py-3 text-[11px] text-[#2D1B4E] shadow-sm">
                        <p>{notice || error}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setNotice("");
                                clearError();
                            }}
                            className="text-base leading-none text-[#776E84]"
                            aria-label="Dismiss message"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <section className="overflow-hidden rounded-[16px] border border-[#E6DDF0] bg-white shadow-sm">
                        <div className="border-b border-[#F0ECF5] px-5 py-4">
                            <div className="mb-3 h-1 w-8 rounded-full bg-[#3B1B88]" />
                            <h2 className="text-[16px] font-semibold">Businesses</h2>
                            <p className="mt-1 text-[10px] text-[#776E84]">
                                Search a business to review its subscription and payment history.
                            </p>

                            <div className="mt-4 flex gap-2">
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            void searchBusinesses();
                                        }
                                    }}
                                    placeholder="Business or owner"
                                    className="min-w-0 flex-1 rounded-lg border border-[#E6DDF0] bg-[#FCFBFE] px-3 py-2 text-[10px] outline-none focus:border-[#3B1B88]"
                                />
                                <button
                                    type="button"
                                    onClick={() => void searchBusinesses()}
                                    className="rounded-lg bg-[#2D1B4E] px-3 py-2 text-[10px] font-semibold text-white"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[620px] overflow-y-auto">
                            {isLoading ? (
                                <EmptyState text="Loading businesses…" />
                            ) : businesses.length === 0 ? (
                                <EmptyState text="No businesses found. Businesses appear here after a payment submission exists." />
                            ) : (
                                businesses.map((business) => {
                                    const isActive =
                                        selectedBusiness?.business_id ===
                                        business.business_id;

                                    return (
                                        <button
                                            key={business.business_id}
                                            type="button"
                                            onClick={() => void openBusiness(business)}
                                            className={[
                                                "w-full border-b border-[#F3EFF6] px-5 py-4 text-left transition last:border-b-0",
                                                isActive
                                                    ? "bg-[#F8F4FF]"
                                                    : "hover:bg-[#FCFAFF]",
                                            ].join(" ")}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-[11px] font-semibold text-[#1A1220]">
                                                        {business.store_name_snapshot}
                                                    </p>
                                                    <p className="mt-1 truncate text-[10px] text-[#665D79]">
                                                        {business.owner_name_snapshot}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-[#EEE8F8] px-2.5 py-1 text-[8px] font-semibold text-[#3B1B88]">
                                                    {business.plan_name || "Free"}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between text-[9px] text-[#776E84]">
                                                <span>{business.subscription_status || "No subscription"}</span>
                                                <span>{remainingDays(business.expiration_date)}</span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    <section className="rounded-[16px] border border-[#E6DDF0] bg-white p-5 shadow-sm">
                        {!selectedBusiness || !details ? (
                            <EmptyState text="Select a business to view its subscription details." />
                        ) : (
                            <>
                                <div className="mb-5">
                                    <div className="mb-2 h-1 w-8 rounded-full bg-[#3B1B88]" />
                                    <h2 className="text-[16px] font-semibold">
                                        {selectedBusiness.store_name_snapshot}
                                    </h2>
                                    <p className="mt-1 text-[10px] text-[#776E84]">
                                        {selectedBusiness.owner_name_snapshot} ·{" "}
                                        {selectedBusiness.business_code_snapshot ||
                                            `BUS-${String(selectedBusiness.business_id).padStart(5, "0")}`}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <DetailCard
                                        label="Current Plan"
                                        value={details.subscription?.plan_name || "Free"}
                                    />
                                    <DetailCard
                                        label="Subscription Status"
                                        value={details.subscription?.status || "FREE"}
                                    />
                                    <DetailCard
                                        label="Start Date"
                                        value={formatDate(details.subscription?.start_date)}
                                    />
                                    <DetailCard
                                        label="Expiration Date"
                                        value={formatDate(details.subscription?.expiration_date)}
                                    />
                                    <DetailCard
                                        label="Remaining Days"
                                        value={remainingDays(details.subscription?.expiration_date)}
                                    />
                                    <DetailCard
                                        label="Latest Payment"
                                        value={details.latest_payment?.status || "No payment"}
                                    />
                                </div>

                                <section className="mt-5 rounded-xl border border-[#E6DDF0] bg-[#FCFBFE] p-4">
                                    <h3 className="text-[12px] font-semibold">
                                        Latest Payment Verification
                                    </h3>
                                    <div className="mt-3 space-y-2 text-[10px]">
                                        <KeyValue
                                            label="Reference Number"
                                            value={
                                                details.latest_payment?.reference_number ||
                                                "—"
                                            }
                                        />
                                        <KeyValue
                                            label="Requested Plan"
                                            value={
                                                details.latest_payment
                                                    ?.requested_plan_name_snapshot || "—"
                                            }
                                        />
                                        <KeyValue
                                            label="Verified By"
                                            value={details.latest_payment?.verified_by || "—"}
                                        />
                                        <KeyValue
                                            label="Verified Date"
                                            value={formatDate(
                                                details.latest_payment?.verified_at
                                            )}
                                        />
                                        {details.latest_payment?.rejection_reason && (
                                            <KeyValue
                                                label="Rejection Reason"
                                                value={
                                                    details.latest_payment
                                                        .rejection_reason
                                                }
                                            />
                                        )}
                                    </div>
                                </section>

                                <section className="mt-5">
                                    <h3 className="text-[12px] font-semibold">
                                        Recent Subscription Activity
                                    </h3>

                                    <div className="mt-3 overflow-hidden rounded-xl border border-[#E6DDF0]">
                                        {auditLogs.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-[10px] text-[#776E84]">
                                                No subscription actions have been recorded yet.
                                            </div>
                                        ) : (
                                            auditLogs.slice(0, 6).map((log) => (
                                                <div
                                                    key={log.audit_log_id}
                                                    className="border-b border-[#F3EFF6] px-4 py-3 last:border-b-0"
                                                >
                                                    <p className="text-[10px] font-semibold text-[#1A1220]">
                                                        {log.action.replaceAll("_", " ")}
                                                    </p>
                                                    <p className="mt-1 text-[9px] text-[#665D79]">
                                                        {formatDate(log.created_at)} ·{" "}
                                                        {log.performed_by || "Platform Admin"}
                                                    </p>
                                                    {log.reason && (
                                                        <p className="mt-1 text-[9px] text-[#776E84]">
                                                            {log.reason}
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

function DetailCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-[#E6DDF0] bg-[#FCFBFE] p-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#776E84]">
                {label}
            </p>
            <p className="mt-2 truncate text-[12px] font-semibold text-[#1A1220]">
                {value}
            </p>
        </div>
    );
}

function KeyValue({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-[#776E84]">{label}</span>
            <span className="max-w-[60%] text-right font-semibold text-[#1A1220]">
                {value}
            </span>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-[#E6DDF0] bg-[#FCFBFE] px-5 text-center">
            <p className="text-[11px] leading-5 text-[#776E84]">{text}</p>
        </div>
    );
}
