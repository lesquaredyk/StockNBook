"use client";

import { useState } from "react";
import { PaymentSubmission } from "@/hooks/usePlatformAdmin";

function formatCurrency(value: number) {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(value?: string | null, withTime = false) {
    if (!value) return "—";

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return String(value);

    return parsed.toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    });
}

export default function PaymentReviewModal({
                                               payment,
                                               onClose,
                                               onApprove,
                                               onReject,
                                           }: {
    payment: PaymentSubmission;
    onClose: () => void;
    onApprove: () => void;
    onReject: () => void;
}) {
    const [showProof, setShowProof] = useState(false);
    const isPending = payment.status === "PENDING";

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="payment-review-title"
                    className="max-h-[calc(100vh-48px)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
                >
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <div className="mb-2 h-1 w-8 rounded-full bg-[#3B1B88]" />
                            <h2
                                id="payment-review-title"
                                className="text-[20px] font-semibold text-[#1A1220]"
                            >
                                Review Subscription Payment
                            </h2>
                            <p className="mt-1 text-[11px] text-[#776E84]">
                                Compare these read-only details with the receiving GCash transaction history before approval.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xl leading-none text-[#776E84] transition hover:text-[#1A1220]"
                            aria-label="Close payment review"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InfoSection title="Business Information">
                            <InfoRow
                                label="Store Name"
                                value={payment.store_name_snapshot}
                            />
                            <InfoRow
                                label="Owner"
                                value={payment.owner_name_snapshot}
                            />
                            <InfoRow
                                label="Business ID"
                                value={
                                    payment.business_code_snapshot ||
                                    `BUS-${String(payment.business_id).padStart(5, "0")}`
                                }
                            />
                        </InfoSection>

                        <InfoSection title="Subscription Information">
                            <InfoRow
                                label="Current Plan"
                                value={payment.current_plan_name_snapshot || "Free"}
                            />
                            <InfoRow
                                label="Requested Plan"
                                value={payment.requested_plan_name_snapshot}
                            />
                            <InfoRow
                                label="Required Amount"
                                value={formatCurrency(payment.required_amount)}
                            />
                            <InfoRow
                                label="Billing Period"
                                value={payment.billing_period || "Monthly"}
                            />
                        </InfoSection>

                        <InfoSection title="Payment Information">
                            <InfoRow
                                label="Amount Submitted"
                                value={formatCurrency(payment.amount_submitted)}
                            />
                            <InfoRow
                                label="Reference Number"
                                value={payment.reference_number}
                            />
                            <InfoRow
                                label="Payment Date"
                                value={formatDate(payment.payment_date)}
                            />
                            <InfoRow
                                label="Date Submitted"
                                value={formatDate(payment.submitted_at, true)}
                            />
                        </InfoSection>

                        <InfoSection title="Proof of Payment">
                            <p className="text-[10px] leading-5 text-[#665D79]">
                                The proof image cannot be edited by the Platform Administrator. A screenshot alone is not final proof; verify against the actual GCash record.
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowProof(true)}
                                className="mt-4 rounded-lg bg-[#F2EDFF] px-3 py-2 text-[10px] font-semibold text-[#3B1B88] transition hover:bg-[#E6DDFF]"
                            >
                                View uploaded screenshot
                            </button>
                        </InfoSection>
                    </div>

                    {!isPending && (
                        <div className="mt-4 rounded-xl border border-[#E6DDF0] bg-[#FCFBFE] p-4 text-[10px]">
                            <p className="font-semibold text-[#1A1220]">
                                This payment is already {payment.status.toLowerCase()}.
                            </p>
                            {payment.verified_by && (
                                <p className="mt-1 text-[#665D79]">
                                    Verified by {payment.verified_by} on{" "}
                                    {formatDate(payment.verified_at, true)}.
                                </p>
                            )}
                            {payment.rejection_reason && (
                                <p className="mt-1 text-[#9A2424]">
                                    Reason: {payment.rejection_reason}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[#F0ECF5] pt-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-[#E6DDF0] px-4 py-2 text-[10px] font-semibold text-[#2D1B4E]"
                        >
                            Close
                        </button>

                        {isPending && (
                            <>
                                <button
                                    type="button"
                                    onClick={onReject}
                                    className="rounded-lg border border-[#E7B4B4] bg-white px-4 py-2 text-[10px] font-semibold text-[#9A2424] transition hover:bg-[#FFF5F5]"
                                >
                                    Reject Payment
                                </button>
                                <button
                                    type="button"
                                    onClick={onApprove}
                                    className="rounded-lg bg-[#2D1B4E] px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-[#3B1B88]"
                                >
                                    Approve Payment
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showProof && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="relative max-h-[calc(100vh-32px)] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-3 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setShowProof(false)}
                            className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-lg text-white"
                            aria-label="Close proof preview"
                        >
                            ×
                        </button>

                        <img
                            src={payment.proof_file_url}
                            alt={`Payment proof for ${payment.store_name_snapshot}`}
                            className="h-auto w-full rounded-xl border border-[#E6DDF0] bg-[#FCFBFE] object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
}

function InfoSection({
                         title,
                         children,
                     }: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border border-[#E6DDF0] bg-[#FCFBFE] p-4">
            <h3 className="text-[12px] font-semibold text-[#1A1220]">{title}</h3>
            <div className="mt-3 space-y-2.5">{children}</div>
        </section>
    );
}

function InfoRow({
                     label,
                     value,
                 }: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 text-[10px]">
            <span className="shrink-0 text-[#776E84]">{label}</span>
            <span className="max-w-[65%] break-words text-right font-semibold text-[#1A1220]">
                {value}
            </span>
        </div>
    );
}
