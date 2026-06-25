
// scripts/seed-platform-admin-existing-plans.mjs
//
// USE THIS INSTEAD OF the old seed-platform-admin.mjs.
//
// This version matches your existing subscription_plans columns:
// id, plan_code, plan_name, monthly_price, booking_limit.
//
// Run:
//   npm install dotenv mysql2 bcryptjs
//   node scripts/seed-platform-admin-existing-plans.mjs

import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
    path: resolve(process.cwd(), ".env.local"),
});

const requiredEnvironmentVariables = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "ADMIN_SEED_EMAIL",
    "ADMIN_SEED_PASSWORD",
    "ADMIN_SEED_NAME",
    "DEMO_BUSINESS_ID",
];

for (const name of requiredEnvironmentVariables) {
    if (!process.env[name]) {
        throw new Error(`Missing ${name} in .env.local.`);
    }
}

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true,
    });

    try {
        const schemaPath = resolve(
            __dirname,
            "subscription_admin_schema_existing_plans.sql"
        );

        await connection.query(readFileSync(schemaPath, "utf8"));

        const businessId = Number(process.env.DEMO_BUSINESS_ID);

        if (!Number.isInteger(businessId) || businessId <= 0) {
            throw new Error(
                "DEMO_BUSINESS_ID must be an existing positive store/business ID."
            );
        }

        const storeName =
            process.env.DEMO_STORE_NAME || "ABC Party Supplies";

        const ownerName =
            process.env.DEMO_OWNER_NAME || "Juan Dela Cruz";

        const passwordHash = await bcrypt.hash(
            process.env.ADMIN_SEED_PASSWORD,
            12
        );

        await connection.execute(
            `
INSERT INTO platform_admins (
    full_name,
    email,
    password_hash,
    role,
    is_active
)
VALUES (?, ?, ?, 'PLATFORM_ADMIN', 1)
ON DUPLICATE KEY UPDATE
full_name = VALUES(full_name),
    password_hash = VALUES(password_hash),
    role = 'PLATFORM_ADMIN',
    is_active = 1
        `,
            [
                process.env.ADMIN_SEED_NAME,
                process.env.ADMIN_SEED_EMAIL.toLowerCase(),
                passwordHash,
            ]
        );

        const [[starterPlan]] = await connection.execute(
            `
SELECT id, plan_code, plan_name, monthly_price
FROM subscription_plans
WHERE LOWER(plan_code) = 'starter'
LIMIT 1
    `
        );

        const [[businessPlan]] = await connection.execute(
            `
SELECT id, plan_code, plan_name, monthly_price
FROM subscription_plans
WHERE LOWER(plan_code) = 'business'
LIMIT 1
    `
        );

        if (!starterPlan || !businessPlan) {
            throw new Error(
                "Starter or Business plan is missing. Run the compatible schema SQL first."
            );
        }

        const [[existingSubscription]] = await connection.execute(
            `
SELECT subscription_id
FROM business_subscriptions
WHERE business_id = ?
    LIMIT 1
        `,
            [businessId]
        );

        if (!existingSubscription) {
            await connection.execute(
                `
INSERT INTO business_subscriptions (
    business_id,
    plan_id,
    status,
    start_date,
    expiration_date
)
VALUES (
        ?,
        ?,
    'ACTIVE',
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 1 MONTH)
)
`,
                [businessId, starterPlan.id]
            );
        }

        const demoReferenceNumber = "DEMO-GCASH-20260625-001";

        const [[existingPayment]] = await connection.execute(
            `
SELECT payment_submission_id
FROM payment_submissions
WHERE reference_number = ?
    LIMIT 1
        `,
            [demoReferenceNumber]
        );

        if (!existingPayment) {
            await connection.execute(
                `
INSERT INTO payment_submissions (
    business_id,
    store_name_snapshot,
    owner_name_snapshot,
    business_code_snapshot,
    current_plan_id,
    requested_plan_id,
    current_plan_name_snapshot,
    requested_plan_name_snapshot,
    required_amount,
    amount_submitted,
    reference_number,
    payment_date,
    proof_file_url,
    status,
    submitted_at
)
VALUES (
        ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, CURDATE(),
    '/uploads/payment-proof/demo-gcash-proof.svg',
    'PENDING',
    NOW()
)
    `,
                [
                    businessId,
                    storeName,
                    ownerName,
                    `BUS-${String(businessId).padStart(5, "0")}`,
                    starterPlan.id,
                    businessPlan.id,
                    starterPlan.plan_name,
                    businessPlan.plan_name,
                    businessPlan.monthly_price,
                    businessPlan.monthly_price,
                    demoReferenceNumber,
                ]
            );
        }

        console.log("\nPlatform Admin seed completed successfully.");
        console.log(`Admin email: ${process.env.ADMIN_SEED_EMAIL}`);
        console.log("Admin role: PLATFORM_ADMIN");
        console.log(`Demo business ID: ${businessId}`);
        console.log(`Pending payment reference: ${demoReferenceNumber}`);
    } finally {
        await connection.end();
    }
}

main().catch((error) => {
    console.error("\nPlatform Admin seed failed:");
    console.error(error.message);
    process.exitCode = 1;
});

