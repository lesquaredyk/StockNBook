/* eslint-disable @typescript-eslint/no-require-imports */
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

function badRequest(headers, message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: message }) };
}

function unauthorized(headers, message) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: message }) };
}

function serverError(headers, message = "Internal server error") {
    return { statusCode: 500, headers, body: JSON.stringify({ error: message }) };
}

function toSafeString(value, max = 255) {
    return String(value ?? "").trim().slice(0, max);
}

function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

async function ensureStoreExists(connection, storeId) {
    const parsed = Number(storeId);
    if (!Number.isInteger(parsed) || parsed <= 0) return false;

    const [rows] = await connection.execute(
        "SELECT id FROM stores WHERE id = ? LIMIT 1",
        [parsed]
    );

    return rows.length > 0;
}

async function ensureBranchBelongsToStore(connection, branchId, storeId) {
    const parsedBranchId = Number(branchId);
    const parsedStoreId = Number(storeId);

    if (!Number.isInteger(parsedBranchId) || parsedBranchId <= 0) return false;
    if (!Number.isInteger(parsedStoreId) || parsedStoreId <= 0) return false;

    const [rows] = await connection.execute(
        "SELECT id FROM branches WHERE id = ? AND store_id = ? LIMIT 1",
        [parsedBranchId, parsedStoreId]
    );

    return rows.length > 0;
}

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json",
    };

    const method = event?.requestContext?.http?.method || event.httpMethod;

    if (method === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    let body = {};
    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        return badRequest(headers, "Invalid JSON body");
    }

    const action = body.action;
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        // ── AUTH ─────────────────────────────────────────────
        const authHeader =
            event?.headers?.authorization ||
            event?.headers?.Authorization ||
            "";

        if (!authHeader) {
            return unauthorized(headers, "No token provided");
        }

        let decoded;
        let store_id;
        let tokenBranchId;
        let tokenRole;

        try {
            const token = authHeader.replace("Bearer ", "");
            decoded = jwt.verify(token, JWT_SECRET);

            store_id = Number(decoded.store_id);
            tokenBranchId = decoded.branch_id ? Number(decoded.branch_id) : null;
            tokenRole = String(decoded.role || "").toLowerCase();
        } catch {
            return unauthorized(headers, "Invalid token");
        }

        if (!Number.isInteger(store_id) || store_id <= 0) {
            return unauthorized(headers, "Invalid store in token");
        }

        const storeExists = await ensureStoreExists(connection, store_id);

        if (!storeExists) {
            return badRequest(headers, "Store account not found");
        }

        const isBranchUser = tokenRole === "manager" || tokenRole === "staff";

        // Manager/staff should always use their assigned branch.
        // Owner can pass branch_id if they want to filter/create per branch.
        const requestedBranchId =
            body.branch_id ||
            body.branchId ||
            body.branch_id === 0 ||
            body.branchId === 0
                ? Number(body.branch_id || body.branchId)
                : null;

        const activeBranchId = isBranchUser
            ? tokenBranchId
            : requestedBranchId || null;

        if (isBranchUser && !activeBranchId) {
            return badRequest(headers, "Missing branch_id for branch user");
        }

        if (activeBranchId) {
            const branchOk = await ensureBranchBelongsToStore(
                connection,
                activeBranchId,
                store_id
            );

            if (!branchOk) {
                return badRequest(headers, "Invalid branch for this store");
            }
        }

        // ── CREATE PRODUCT ───────────────────────────────────
        if (action === "create_product") {
            const name = toSafeString(body.name, 120);
            const category = toSafeString(body.category, 120);
            const stock = toNumber(body.stock) ?? 0;
            const alertLevel = toNumber(body.alertLevel) ?? 0;
            const originalPrice = toNumber(body.originalPrice) ?? 0;
            const salesPrice = toNumber(body.salesPrice) ?? 0;

            if (!name || !category) {
                return badRequest(headers, "name and category are required");
            }

            if (!activeBranchId) {
                return badRequest(headers, "branch_id is required");
            }

            const [result] = await connection.execute(
                `INSERT INTO products
                 (store_id, branch_id, name, category, stock, alert_level, original_price, sales_price)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    store_id,
                    activeBranchId,
                    name,
                    category,
                    stock,
                    alertLevel,
                    originalPrice,
                    salesPrice,
                ]
            );

            const [rows] = await connection.execute(
                `SELECT
                     products.id,
                     products.store_id       AS storeId,
                     products.branch_id      AS branchId,
                     branches.branch_name    AS branchName,
                     products.name,
                     products.category,
                     products.stock,
                     products.alert_level    AS alertLevel,
                     products.original_price AS originalPrice,
                     products.sales_price    AS salesPrice,
                     products.created_at     AS createdAt
                 FROM products
                          LEFT JOIN branches
                                    ON products.branch_id = branches.id
                                        AND products.store_id = branches.store_id
                 WHERE products.id = ?
                     LIMIT 1`,
                [result.insertId]
            );

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ success: true, product: rows[0] }),
            };
        }

        // ── READ PRODUCTS ────────────────────────────────────
        if (action === "get_products") {
            let query = `
                SELECT
                    products.id,
                    products.store_id       AS storeId,
                    products.branch_id      AS branchId,
                    branches.branch_name    AS branchName,
                    products.name,
                    products.category,
                    products.stock,
                    products.alert_level    AS alertLevel,
                    products.original_price AS originalPrice,
                    products.sales_price    AS salesPrice,
                    products.created_at     AS createdAt
                FROM products
                LEFT JOIN branches
                  ON products.branch_id = branches.id
                 AND products.store_id = branches.store_id
                WHERE products.store_id = ?
            `;

            const params = [store_id];

            if (activeBranchId) {
                query += ` AND products.branch_id = ?`;
                params.push(activeBranchId);
            }

            query += ` ORDER BY products.created_at DESC`;

            const [rows] = await connection.execute(query, params);

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ products: rows }),
            };
        }

        // ── UPDATE PRODUCT ───────────────────────────────────
        if (action === "update_product") {
            const id = Number(body.id);

            if (!Number.isInteger(id) || id <= 0) {
                return badRequest(headers, "Invalid product id");
            }

            const name = toSafeString(body.name, 120);
            const category = toSafeString(body.category, 120);
            const stock = toNumber(body.stock) ?? 0;
            const alertLevel = toNumber(body.alertLevel) ?? 0;
            const originalPrice = toNumber(body.originalPrice) ?? 0;
            const salesPrice = toNumber(body.salesPrice) ?? 0;

            if (!name || !category) {
                return badRequest(headers, "name and category are required");
            }

            let query = `
                UPDATE products
                SET
                    name = ?,
                    category = ?,
                    stock = ?,
                    alert_level = ?,
                    original_price = ?,
                    sales_price = ?
                WHERE id = ?
                  AND store_id = ?
            `;

            const params = [
                name,
                category,
                stock,
                alertLevel,
                originalPrice,
                salesPrice,
                id,
                store_id,
            ];

            if (activeBranchId) {
                query += ` AND branch_id = ?`;
                params.push(activeBranchId);
            }

            const [result] = await connection.execute(query, params);

            if (result.affectedRows === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "Product not found" }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true }),
            };
        }

        // ── DELETE PRODUCT ───────────────────────────────────
        if (action === "delete_product") {
            const id = Number(body.id);

            if (!Number.isInteger(id) || id <= 0) {
                return badRequest(headers, "Invalid product id");
            }

            let query = `
                DELETE FROM products
                WHERE id = ?
                  AND store_id = ?
            `;

            const params = [id, store_id];

            if (activeBranchId) {
                query += ` AND branch_id = ?`;
                params.push(activeBranchId);
            }

            const [result] = await connection.execute(query, params);

            if (result.affectedRows === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: "Product not found" }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true }),
            };
        }

        return badRequest(headers, "Invalid action");
    } catch (err) {
        console.error("Lambda error:", err);
        return serverError(headers, err.message || "Internal server error");
    } finally {
        if (connection) await connection.end();
    }
};