"use client";

import { PaymentSubmission } from "@/hooks/usePlatformAdmin";

export default function ApprovePaymentModal({
                                                payment,
                                                isSaving,
                                                onCancel,
                                                onConfirm,
                                            }: {
    payment: PaymentSubmission;
    isSaving: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="approve-payment-title"
                className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
            >
                <div className="mb-2 h-1 w-8 rounded-full bg-[#3B1B88]" />
                <h2
                    id="approve-payment-title"
                    className="text-[18px] font-semibold text-[#1A1220]"
                >
                    Approve Subscription Payment?
                </h2>

                <p className="mt-3 text-[12px] leading-5 text-[#665D79]">
                    You are about to approve the{" "}
                    <strong>{payment.requested_plan_name_snapshot}</strong> Plan
                    payment for <strong>{payment.store_name_snapshot}</strong>.
                    The subscription will become active after approval.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSaving}
                        className="rounded-lg border border-[#E6DDF0] px-3 py-2 text-[10px] font-semibold text-[#2D1B4E] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSaving}
                        className="rounded-lg bg-[#2D1B4E] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#3B1B88] disabled:opacity-50"
                    >
                        {isSaving ? "Approving…" : "Approve Payment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
