const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "stocknbook-secret-key";

const dbConfig = {
    host: "stocknbook-db.clyuqe48evd0.ap-southeast-1.rds.amazonaws.com",
    user: "admin",
    password: "2qJivedWDxCQS6TLjjEl",
    database: "stocknbook",
    ssl: { rejectUnauthorized: false },
};

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
};

function verifyToken(event) {
    const auth =
        event.headers?.Authorization || event.headers?.authorization || "";
    const token = auth.replace("Bearer ", "");

    if (!token) throw new Error("No token provided");

    return jwt.verify(token, JWT_SECRET);
}

function safeParseJSON(value) {
    if (!value) return [];

    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return [];
        }
    }

    return value;
}

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "" };
    }

    let connection;

    try {
        const body = JSON.parse(event.body || "{}");
        const { action } = body;

        connection = await mysql.createConnection(dbConfig);

        // ─── GET ALL PACKAGES FOR ONE BRANCH ─────────────────────
        // ─── GET ALL PACKAGES FOR ONE BRANCH OR STORE ─────────────────────
        if (action === "get_packages") {
            const branch_id = body.branch_id ? Number(body.branch_id) : null;
            const store_id = body.store_id ? Number(body.store_id) : null;

            if (!branch_id && !store_id) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "branch_id or store_id is required" }),
                };
            }

            let rows;

            if (branch_id) {
                [rows] = await connection.execute(
                    `SELECT id, store_id, branch_id, name, description, original_value,
                    discount_type, discount_value, package_price,
                    duration, status, inclusions, created_at, updated_at
             FROM packages
             WHERE branch_id = ?
             ORDER BY created_at DESC`,
                    [branch_id]
                );
            } else {
                [rows] = await connection.execute(
                    `SELECT id, store_id, branch_id, name, description, original_value,
                    discount_type, discount_value, package_price,
                    duration, status, inclusions, created_at, updated_at
             FROM packages
                     WHERE store_id = ?
                       AND branch_id IS NOT NULL
             ORDER BY created_at DESC`,
                    [store_id]
                );
            }

            const packages = rows.map((pkg) => ({
                ...pkg,
                inclusions: safeParseJSON(pkg.inclusions),
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ packages }),
            };
        }

        // ─── GET SINGLE PACKAGE ──────────────────────────────────────────
        if (action === "get_package") {
            const id = Number(body.id);
            const branch_id = body.branch_id ? Number(body.branch_id) : null;

            if (!id) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Package id is required" }),
                };
            }

            let rows;

            if (branch_id) {
                [rows] = await connection.execute(
                    `SELECT * FROM packages WHERE id = ? AND branch_id = ? LIMIT 1`,
                    [id, branch_id]
                );
            } else {
                [rows] = await connection.execute(
                    `SELECT * FROM packages WHERE id = ? LIMIT 1`,
                    [id]
                );
            }

            if (!rows.length) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "Package not found" }),
                };
            }

            const pkg = {
                ...rows[0],
                inclusions: safeParseJSON(rows[0].inclusions),
            };

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ package: pkg }),
            };
        }

        // ─── CREATE PACKAGE ──────────────────────────────────────────────
        if (action === "create_package") {
            const decoded = verifyToken(event);

            const {
                store_id,
                branch_id,
                name,
                description,
                original_value,
                discount_type,
                discount_value,
                package_price,
                duration,
                status = "Active",
                inclusions = [],
            } = body;

            const targetStoreId = Number(store_id || decoded.store_id);
            const targetBranchId = Number(branch_id || decoded.branch_id);

            if (!targetStoreId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "store_id is required" }),
                };
            }

            if (!targetBranchId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "branch_id is required" }),
                };
            }

            if (!name || package_price === undefined || package_price === null) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: "name and package_price are required",
                    }),
                };
            }

            const [result] = await connection.execute(
                `INSERT INTO packages
                    (store_id, branch_id, name, description, original_value, discount_type,
                     discount_value, package_price, duration, status, inclusions)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    targetStoreId,
                    targetBranchId,
                    name,
                    description ?? null,
                    original_value ?? 0,
                    discount_type ?? "amount",
                    discount_value ?? 0,
                    package_price,
                    duration ?? null,
                    status,
                    JSON.stringify(inclusions),
                ]
            );

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    message: "Package created",
                    id: result.insertId,
                    store_id: targetStoreId,
                    branch_id: targetBranchId,
                }),
            };
        }

        // ─── UPDATE PACKAGE ──────────────────────────────────────────────
        if (action === "update_package") {
            const decoded = verifyToken(event);

            const {
                id,
                store_id,
                branch_id,
                name,
                description,
                original_value,
                discount_type,
                discount_value,
                package_price,
                duration,
                status,
                inclusions,
            } = body;

            const packageId = Number(id);
            const targetStoreId = Number(store_id || decoded.store_id);
            const targetBranchId = Number(branch_id || decoded.branch_id);

            if (!packageId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Package id is required" }),
                };
            }

            if (!targetStoreId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "store_id is required" }),
                };
            }

            if (!targetBranchId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "branch_id is required" }),
                };
            }

            const [result] = await connection.execute(
                `UPDATE packages SET
                    name = ?,
                    description = ?,
                    original_value = ?,
                    discount_type = ?,
                    discount_value = ?,
                    package_price = ?,
                    duration = ?,
                    status = ?,
                    inclusions = ?,
                    updated_at = CURRENT_TIMESTAMP
                 WHERE id = ? AND branch_id = ?`,
                [
                    name,
                    description ?? null,
                    original_value ?? 0,
                    discount_type ?? "amount",
                    discount_value ?? 0,
                    package_price,
                    duration ?? null,
                    status,
                    JSON.stringify(inclusions ?? []),
                    packageId,
                    targetBranchId,
                ]
            );

            if (result.affectedRows === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        error: "Package not found for this branch",
                    }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Package updated" }),
            };
        }

        // ─── DELETE PACKAGE ──────────────────────────────────────────────
        if (action === "delete_package") {
            const decoded = verifyToken(event);

            const packageId = Number(body.id);
            const targetBranchId = Number(body.branch_id || decoded.branch_id);

            if (!packageId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Package id is required" }),
                };
            }

            if (!targetBranchId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "branch_id is required" }),
                };
            }

            const [result] = await connection.execute(
                `DELETE FROM packages WHERE id = ? AND branch_id = ?`,
                [packageId, targetBranchId]
            );

            if (result.affectedRows === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({
                        error: "Package not found for this branch",
                    }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: "Package deleted" }),
            };
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Invalid action" }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message }),
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};