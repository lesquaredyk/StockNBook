"use client";

import { useCallback, useState } from "react";

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentFilter = PaymentStatus | "ALL";

export type SubscriptionSummary = {
    pending_verification: number;
    active_subscriptions: number;
    expiring_soon: number;
    expired_subscriptions: number;
    approved_payments?: number;
    rejected_payments?: number;
};

export type PaymentSubmission = {
    payment_submission_id: number;
    business_id: number;
    store_name_snapshot: string;
    owner_name_snapshot: string;
    business_code_snapshot?: string | null;
    current_plan_id?: number | null;
    requested_plan_id?: number;
    current_plan_name_snapshot?: string | null;
    requested_plan_name_snapshot: string;
    required_amount: number;
    amount_submitted: number;
    reference_number: string;
    payment_date: string;
    proof_file_url: string;
    status: PaymentStatus;
    submitted_at: string;
    verified_at?: string | null;
    verified_by?: string | null;
    rejection_reason?: string | null;
    rejection_explanation?: string | null;
    billing_period?: string | null;
    subscription_status?: string | null;
    start_date?: string | null;
    expiration_date?: string | null;
};

export type BusinessRecord = {
    business_id: number;
    store_name_snapshot: string;
    owner_name_snapshot: string;
    business_code_snapshot?: string | null;
    subscription_id?: number | null;
    subscription_status?: string | null;
    start_date?: string | null;
    expiration_date?: string | null;
    plan_name?: string | null;
    latest_payment_status?: PaymentStatus | null;
    latest_reference_number?: string | null;
    verified_at?: string | null;
    verified_by?: string | null;
};

export type BusinessSubscriptionResponse = {
    subscription: {
        subscription_id: number;
        business_id: number;
        status: string;
        start_date?: string | null;
        expiration_date?: string | null;
        plan_id: number;
        plan_name: string;
        price: number;
        billing_period: string;
        inventory_limit?: number | null;
        monthly_booking_limit?: number | null;
        staff_limit?: number | null;
        reports_enabled?: number | boolean;
        analytics_enabled?: number | boolean;
        forecasting_enabled?: number | boolean;
    } | null;
    latest_payment: {
        payment_submission_id: number;
        status: PaymentStatus;
        reference_number: string;
        requested_plan_name_snapshot: string;
        submitted_at: string;
        verified_at?: string | null;
        rejection_reason?: string | null;
        verified_by?: string | null;
    } | null;
};

export type AuditLog = {
    audit_log_id: number;
    business_id: number;
    subscription_id?: number | null;
    payment_submission_id?: number | null;
    action: string;
    previous_status?: string | null;
    new_status?: string | null;
    reason?: string | null;
    created_at: string;
    performed_by?: string | null;
};

type ApiErrorPayload = {
    message?: string;
};

function getAuthToken() {
    if (typeof window === "undefined") return "";

    return (
        sessionStorage.getItem("token") ||
        localStorage.getItem("token") ||
        ""
    );
}

async function adminRequest<T>(
    action: string,
    body: Record<string, unknown> = {}
): Promise<T> {
    const token = getAuthToken();

    const response = await fetch("/api/subscription-admin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            action,
            ...body,
        }),
        cache: "no-store",
    });

    const payload = (await response.json().catch(() => ({}))) as T & ApiErrorPayload;

    if (!response.ok) {
        throw new Error(
            payload.message || "Unable to complete the Platform Admin request."
        );
    }

    return payload;
}

export function usePlatformAdmin() {
    const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
    const [payments, setPayments] = useState<PaymentSubmission[]>([]);
    const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const clearError = useCallback(() => setError(""), []);

    const loadSummary = useCallback(async () => {
        const result = await adminRequest<{ summary: SubscriptionSummary }>(
            "get_subscription_summary"
        );
        setSummary(result.summary);
        return result.summary;
    }, []);

    const loadPayments = useCallback(
        async (status: PaymentFilter = "PENDING", search = "") => {
            const result = await adminRequest<{ payments: PaymentSubmission[] }>(
                "list_payment_submissions",
                { status, search }
            );
            setPayments(result.payments);
            return result.payments;
        },
        []
    );

    const loadDashboard = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            await Promise.all([loadSummary(), loadPayments("PENDING")]);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to load the administrator dashboard."
            );
        } finally {
            setIsLoading(false);
        }
    }, [loadPayments, loadSummary]);

    const loadPaymentDetails = useCallback(
        async (paymentSubmissionId: number) => {
            const result = await adminRequest<{ payment: PaymentSubmission }>(
                "get_payment_submission",
                { payment_submission_id: paymentSubmissionId }
            );
            return result.payment;
        },
        []
    );

    const approvePayment = useCallback(
        async (paymentSubmissionId: number) => {
            return adminRequest<{
                message: string;
                store_name: string;
                plan_name: string;
                start_date: string;
                expiration_date: string;
            }>("approve_payment_submission", {
                payment_submission_id: paymentSubmissionId,
            });
        },
        []
    );

    const rejectPayment = useCallback(
        async (
            paymentSubmissionId: number,
            rejectionReason: string,
            rejectionExplanation: string
        ) => {
            return adminRequest<{
                message: string;
                store_name: string;
                reason: string;
            }>("reject_payment_submission", {
                payment_submission_id: paymentSubmissionId,
                rejection_reason: rejectionReason,
                rejection_explanation: rejectionExplanation,
            });
        },
        []
    );

    const loadBusinesses = useCallback(async (search = "") => {
        const result = await adminRequest<{ businesses: BusinessRecord[] }>(
            "list_businesses",
            { search }
        );
        setBusinesses(result.businesses);
        return result.businesses;
    }, []);

    const loadBusinessSubscription = useCallback(
        async (businessId: number) => {
            return adminRequest<BusinessSubscriptionResponse>(
                "get_business_subscription",
                { business_id: businessId }
            );
        },
        []
    );

    const loadAuditLogs = useCallback(async (businessId?: number) => {
        const result = await adminRequest<{ audit_logs: AuditLog[] }>(
            "list_audit_logs",
            businessId ? { business_id: businessId } : {}
        );
        return result.audit_logs;
    }, []);

    return {
        summary,
        payments,
        businesses,
        isLoading,
        error,
        clearError,
        setIsLoading,
        setError,
        loadSummary,
        loadPayments,
        loadDashboard,
        loadPaymentDetails,
        approvePayment,
        rejectPayment,
        loadBusinesses,
        loadBusinessSubscription,
        loadAuditLogs,
    };
}
