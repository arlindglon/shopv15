-- ============================================================================
-- DOKAN POS PRO - COMPLETE SUPABASE (PostgreSQL) DATABASE SCHEMA
-- ============================================================================
-- Version: 6.3.0 (Fixed table order + circular dependency)
-- Generated: 2025
-- Compatible with: Supabase (PostgreSQL 15+)
-- ============================================================================
-- Tables: 25 | Indexes: 55+ | Seed data included
-- ============================================================================
-- IMPORTANT: Tables created first WITHOUT foreign keys to avoid dependency
-- errors. All FK constraints added at the end via ALTER TABLE statements.
-- ============================================================================


-- ============================================================================
-- PHASE 1: CREATE ALL TABLES (no foreign keys yet)
-- ============================================================================


-- ============================================================================
-- 1. BRANCHES - Branch/store management (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS branches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    code            TEXT NOT NULL UNIQUE,
    address         TEXT,
    phone           TEXT,
    email           TEXT,
    manager_id      UUID,
    logo_url        TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_default      BOOLEAN NOT NULL DEFAULT false,
    opening_time    TEXT DEFAULT '09:00',
    closing_time    TEXT DEFAULT '22:00',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_code ON branches (code);
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches (is_active);
CREATE INDEX IF NOT EXISTS idx_branches_is_default ON branches (is_default);


-- ============================================================================
-- 2. CATEGORIES - Product categories (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL UNIQUE,
    description     TEXT,
    image           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories (name);


-- ============================================================================
-- 3. PRODUCTS - Product catalog (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    sku             TEXT NOT NULL DEFAULT '',
    barcode         TEXT,
    category        TEXT NOT NULL DEFAULT 'Other',
    sub_category    TEXT,
    unit            TEXT NOT NULL DEFAULT 'pcs',
    purchase_price  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price      NUMERIC(12, 2) NOT NULL DEFAULT 0,
    wholesale_price NUMERIC(12, 2) DEFAULT 0,
    stock           INTEGER NOT NULL DEFAULT 0,
    min_stock       INTEGER NOT NULL DEFAULT 5,
    reorder_level   INTEGER NOT NULL DEFAULT 10,
    max_stock       INTEGER,
    batch_number    TEXT,
    expiry_date     DATE,
    manufacture_date DATE,
    brand           TEXT,
    image_url       TEXT,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    taxable         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);


-- ============================================================================
-- 4. CUSTOMERS - Customer database (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL DEFAULT '',
    email           TEXT,
    address         TEXT,
    city            TEXT,
    postal_code     TEXT,
    credit_limit    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    due             NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_purchases NUMERIC(12, 2) NOT NULL DEFAULT 0,
    loyalty_points  INTEGER NOT NULL DEFAULT 0,
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers (name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers (is_active);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers (created_at DESC);


-- ============================================================================
-- 5. SUPPLIERS - Supplier database (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    company         TEXT,
    contact         TEXT NOT NULL DEFAULT '',
    email           TEXT,
    address         TEXT,
    city            TEXT,
    postal_code     TEXT,
    balance         NUMERIC(12, 2) NOT NULL DEFAULT 0,
    credit_limit    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_purchase  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes           TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers (name);
CREATE INDEX IF NOT EXISTS idx_suppliers_contact ON suppliers (contact);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers (is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_created_at ON suppliers (created_at DESC);


-- ============================================================================
-- 6. APP_USERS - User accounts and role-based access (no FK)
-- ============================================================================
-- Security fields: failed_login_attempts, locked_until, must_change_password,
-- password_reset_token, etc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    username        TEXT NOT NULL UNIQUE,
    email           TEXT,
    phone           TEXT,
    password        TEXT NOT NULL DEFAULT '123456',
    role            TEXT NOT NULL DEFAULT 'Staff'
                    CHECK (role IN ('Master Admin', 'Admin', 'Manager', 'Staff', 'Seller', 'Viewer')),
    branch_id       UUID,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    permissions     JSONB DEFAULT '{}'::jsonb,
    last_login      TIMESTAMPTZ,

    -- Security & Auth Fields
    failed_login_attempts   INTEGER NOT NULL DEFAULT 0,
    last_failed_login_at    TIMESTAMPTZ,
    locked_until            TIMESTAMPTZ,
    must_change_password    BOOLEAN NOT NULL DEFAULT false,
    password_reset_token    TEXT,
    password_reset_expires  TIMESTAMPTZ,
    password_changed_at     TIMESTAMPTZ,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users (username);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users (role);
CREATE INDEX IF NOT EXISTS idx_app_users_is_active ON app_users (is_active);
CREATE INDEX IF NOT EXISTS idx_app_users_created_at ON app_users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_users_locked_until ON app_users (locked_until) WHERE locked_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_users_password_reset_token ON app_users (password_reset_token) WHERE password_reset_token IS NOT NULL;


-- ============================================================================
-- 7. APP_SETTINGS - Application settings (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_settings (
    id                                  TEXT PRIMARY KEY DEFAULT 'default-settings',
    shop_name                           TEXT NOT NULL DEFAULT 'Dokan Enterprise',
    shop_logo                           TEXT,
    shop_banner_image                   TEXT,
    shop_address                        TEXT,
    shop_contact                        TEXT,
    shop_email                          TEXT,
    website                             TEXT,
    shop_bio                            TEXT,
    shop_services                       TEXT,
    tax_id                              TEXT,
    registration_no                     TEXT,
    loading_text                        TEXT DEFAULT 'Loading...',
    currency                            TEXT NOT NULL DEFAULT 'BDT',
    currency_symbol                     TEXT NOT NULL DEFAULT '৳',
    tax_rate                            NUMERIC(5, 2) NOT NULL DEFAULT 0,
    tax_enabled                         BOOLEAN NOT NULL DEFAULT false,
    facebook                            TEXT,
    instagram                           TEXT,
    whatsapp                            TEXT,
    youtube_url                         TEXT,
    opening_hours                       TEXT,
    bank_name                           TEXT,
    bank_account_name                   TEXT,
    bank_account_number                 TEXT,
    bank_branch                         TEXT,
    receipt_footer                      TEXT,
    invoice_note                        TEXT,
    allow_walk_in_customer              BOOLEAN NOT NULL DEFAULT true,
    subscription_plan                   TEXT DEFAULT 'premium'
                                        CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')),
    subscription_expiry_date            TIMESTAMPTZ,
    subscription_contact_phone          TEXT,
    subscription_contact_email          TEXT,
    subscription_contact_whatsapp       TEXT,
    feature_limits                      JSONB,
    auto_backup_enabled                 BOOLEAN DEFAULT false,
    backup_frequency                    TEXT DEFAULT 'weekly',
    last_backup_at                      TIMESTAMPTZ,
    daily_backup_time                   TEXT DEFAULT '03:00',
    monthly_backup_day                  INTEGER DEFAULT 1,
    auto_backup_destination             TEXT DEFAULT 'cloud',
    created_at                          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 8. APP_CONFIG - Key-value configuration store (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             TEXT NOT NULL UNIQUE,
    value           TEXT NOT NULL DEFAULT '',
    category        TEXT,
    description     TEXT,
    is_secret       BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config (key);
CREATE INDEX IF NOT EXISTS idx_app_config_category ON app_config (category);


-- ============================================================================
-- 9. BACKUP_HISTORY - Backup history records (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS backup_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             TEXT,
    file_name           TEXT NOT NULL,
    file_size           BIGINT NOT NULL DEFAULT 0,
    backup_type         TEXT NOT NULL DEFAULT 'manual'
                        CHECK (backup_type IN ('manual', 'daily', 'monthly', 'full', 'auto')),
    tables_included     JSONB DEFAULT '[]'::jsonb,
    status              TEXT NOT NULL DEFAULT 'completed'
                        CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backup_history_type ON backup_history (backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history (status);
CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history (created_at DESC);


-- ============================================================================
-- 10. BACKUP_API_TOKENS - Backup API tokens (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS backup_api_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    token           TEXT UNIQUE NOT NULL,
    backup_type     TEXT NOT NULL
                    CHECK (backup_type IN ('daily', 'monthly', 'full', 'all')),
    validity_days   INTEGER,
    expires_at      TIMESTAMPTZ,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_by      TEXT DEFAULT 'master-admin',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_backup_api_tokens_token ON backup_api_tokens (token);
CREATE INDEX IF NOT EXISTS idx_backup_api_tokens_is_active ON backup_api_tokens (is_active);
CREATE INDEX IF NOT EXISTS idx_backup_api_tokens_backup_type ON backup_api_tokens (backup_type);


-- ============================================================================
-- 11. SUBSCRIPTION_LIMITS - Subscription plan feature limits (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_limits (
    id                      TEXT PRIMARY KEY DEFAULT 'default',
    plan                    TEXT NOT NULL DEFAULT 'premium'
                            CHECK (plan IN ('free', 'basic', 'premium', 'enterprise')),
    max_products            INTEGER NOT NULL DEFAULT -1,
    max_customers           INTEGER NOT NULL DEFAULT -1,
    max_suppliers           INTEGER NOT NULL DEFAULT -1,
    max_admins              INTEGER NOT NULL DEFAULT -1,
    max_managers            INTEGER NOT NULL DEFAULT -1,
    max_staff               INTEGER NOT NULL DEFAULT -1,
    max_sellers             INTEGER NOT NULL DEFAULT -1,
    max_viewers             INTEGER NOT NULL DEFAULT -1,
    pos_system              BOOLEAN NOT NULL DEFAULT true,
    sales_purchases         BOOLEAN NOT NULL DEFAULT true,
    customer_management     BOOLEAN NOT NULL DEFAULT true,
    supplier_management     BOOLEAN NOT NULL DEFAULT true,
    advanced_reports        BOOLEAN NOT NULL DEFAULT false,
    auto_backup             BOOLEAN NOT NULL DEFAULT false,
    api_access              BOOLEAN NOT NULL DEFAULT false,
    priority_support        BOOLEAN NOT NULL DEFAULT false,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 12. GOOGLE_TOKENS - Google OAuth token storage (no FK)
-- ============================================================================

CREATE TABLE IF NOT EXISTS google_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL UNIQUE,
    access_token    TEXT NOT NULL,
    refresh_token   TEXT,
    expires_at      TIMESTAMPTZ,
    token_type      TEXT,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_google_tokens_user_id ON google_tokens (user_id);


-- ============================================================================
-- 13. SALES - Sales records (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sales (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    invoice_number      TEXT NOT NULL DEFAULT '',
    customer_id         UUID,
    customer_name       TEXT NOT NULL DEFAULT 'Walk-in Customer',
    items               JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal            NUMERIC(12, 2) NOT NULL DEFAULT 0,
    item_discount       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cart_discount       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_cost       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total               NUMERIC(12, 2) NOT NULL DEFAULT 0,
    paid                NUMERIC(12, 2) NOT NULL DEFAULT 0,
    due                 NUMERIC(12, 2) NOT NULL DEFAULT 0,
    change_amount       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method      TEXT NOT NULL DEFAULT 'Cash',
    payment_status      TEXT NOT NULL DEFAULT 'Pending'
                        CHECK (payment_status IN ('Pending', 'Partial', 'Paid')),
    status              TEXT NOT NULL DEFAULT 'Completed'
                        CHECK (status IN ('Draft', 'Hold', 'Completed', 'Returned', 'Cancelled')),
    notes               TEXT,
    payments            JSONB DEFAULT '[]'::jsonb,
    history             JSONB DEFAULT '[]'::jsonb,
    created_by          UUID,
    created_by_name     TEXT,
    salesman_id         UUID,
    salesman_name       TEXT,
    branch_id           UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_date ON sales (date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_number ON sales (invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales (customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_name ON sales (customer_name);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales (payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales (status);
CREATE INDEX IF NOT EXISTS idx_sales_created_by ON sales (created_by);
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales (branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales (created_at DESC);


-- ============================================================================
-- 14. PURCHASES - Purchase records (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS purchases (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    purchase_number     TEXT NOT NULL DEFAULT '',
    supplier_id         UUID,
    supplier_name       TEXT NOT NULL DEFAULT 'Unknown',
    items               JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal            NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount            NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    shipping_cost       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total               NUMERIC(12, 2) NOT NULL DEFAULT 0,
    paid                NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance             NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_status      TEXT NOT NULL DEFAULT 'Pending'
                        CHECK (payment_status IN ('Pending', 'Partial', 'Paid')),
    status              TEXT NOT NULL DEFAULT 'Received'
                        CHECK (status IN ('Draft', 'Ordered', 'Received', 'Partial', 'Cancelled')),
    notes               TEXT,
    payments            JSONB DEFAULT '[]'::jsonb,
    history             JSONB DEFAULT '[]'::jsonb,
    created_by          UUID,
    branch_id           UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases (date DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_purchase_number ON purchases (purchase_number);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases (supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_name ON purchases (supplier_name);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases (payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases (status);
CREATE INDEX IF NOT EXISTS idx_purchases_branch_id ON purchases (branch_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases (created_at DESC);


-- ============================================================================
-- 15. EXPENSES - Expense tracking (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS expenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category        TEXT NOT NULL DEFAULT 'Other',
    sub_category    TEXT,
    amount          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    description     TEXT,
    payment_method  TEXT NOT NULL DEFAULT 'Cash',
    reference       TEXT,
    attachment      TEXT,
    branch_id       UUID,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method ON expenses (payment_method);
CREATE INDEX IF NOT EXISTS idx_expenses_branch_id ON expenses (branch_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses (created_at DESC);


-- ============================================================================
-- 16. AUDIT_LOGS - Activity logging (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type         TEXT NOT NULL,
    entity_id           TEXT NOT NULL,
    action              TEXT NOT NULL
                        CHECK (action IN ('create', 'update', 'delete', 'restore', 'void', 'return')),
    old_data            JSONB,
    new_data            JSONB,
    changes             JSONB,
    version_number      INTEGER NOT NULL DEFAULT 1,
    user_id             UUID,
    user_name           TEXT,
    user_role           TEXT,
    ip_address          TEXT,
    user_agent          TEXT,
    description         TEXT,
    notes               TEXT,
    restored_from_id    UUID,
    restored_by_id      UUID,
    restored_by_name    TEXT,
    restored_at         TIMESTAMPTZ,
    branch_id           UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs (entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs (entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_name ON audit_logs (user_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_version ON audit_logs (entity_type, entity_id, version_number);


-- ============================================================================
-- 17. STOCK_ADJUSTMENTS - Stock adjustment records (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_adjustments (
    id              TEXT PRIMARY KEY DEFAULT '',
    product_id      UUID NOT NULL,
    product_name    TEXT,
    sku             TEXT,
    adjustment_type TEXT NOT NULL
                    CHECK (adjustment_type IN ('increase', 'decrease', 'damage', 'theft', 'correction', 'adjustment')),
    quantity        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    previous_stock  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    new_stock       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    reason          TEXT,
    reference       TEXT,
    branch_id       UUID,
    user_id         UUID,
    user_name       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product_id ON stock_adjustments (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_type ON stock_adjustments (adjustment_type);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created_at ON stock_adjustments (created_at DESC);


-- ============================================================================
-- 18. CASH_REGISTERS - Cash register management (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cash_registers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL DEFAULT 'Cash Register',
    branch_id       UUID,
    opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    current_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_registers_branch_id ON cash_registers (branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_registers_is_active ON cash_registers (is_active);


-- ============================================================================
-- 19. CASH_SHIFTS - Cash shift tracking (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cash_shifts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_id     UUID NOT NULL,
    user_id         UUID NOT NULL,
    user_name       TEXT,
    opening_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    closing_amount  NUMERIC(12, 2),
    expected_closing NUMERIC(12, 2),
    variance        NUMERIC(12, 2),
    opened_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at       TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'closed')),
    notes           TEXT,
    branch_id       UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_shifts_register_id ON cash_shifts (register_id);
CREATE INDEX IF NOT EXISTS idx_cash_shifts_user_id ON cash_shifts (user_id);
CREATE INDEX IF NOT EXISTS idx_cash_shifts_status ON cash_shifts (status);
CREATE INDEX IF NOT EXISTS idx_cash_shifts_opened_at ON cash_shifts (opened_at DESC);


-- ============================================================================
-- 20. CASH_REGISTER_TRANSACTIONS - Cash transactions (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cash_register_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id        UUID,
    register_id     UUID NOT NULL,
    transaction_type TEXT NOT NULL
                    CHECK (transaction_type IN ('sale', 'refund', 'cash_in', 'cash_out', 'open', 'close')),
    amount          NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance_after   NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes           TEXT,
    reference_type  TEXT,
    reference_id    TEXT,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_register_transactions_shift_id ON cash_register_transactions (shift_id);
CREATE INDEX IF NOT EXISTS idx_cash_register_transactions_register_id ON cash_register_transactions (register_id);
CREATE INDEX IF NOT EXISTS idx_cash_register_transactions_type ON cash_register_transactions (transaction_type);
CREATE INDEX IF NOT EXISTS idx_cash_register_transactions_created_at ON cash_register_transactions (created_at DESC);


-- ============================================================================
-- 21. INVENTORY_HISTORY - Inventory change history (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL,
    product_name    TEXT,
    sku             TEXT,
    action_type     TEXT NOT NULL
                    CHECK (action_type IN ('sale', 'purchase', 'adjustment', 'damage', 'return', 'added')),
    quantity_change NUMERIC(12, 2) NOT NULL DEFAULT 0,
    previous_stock  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    new_stock       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_price      NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_price     NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes           TEXT,
    reference       TEXT,
    user_id         UUID,
    user_name       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_history_product_id ON inventory_history (product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_action_type ON inventory_history (action_type);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created_at ON inventory_history (created_at DESC);


-- ============================================================================
-- 22. PRINT_TEMPLATES - Print template management (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS print_templates (
    id              TEXT PRIMARY KEY DEFAULT '',
    name            TEXT NOT NULL,
    type            TEXT NOT NULL DEFAULT 'invoice'
                    CHECK (type IN ('invoice', 'purchase', 'quotation', 'receipt', 'challan')),
    paper_size      TEXT NOT NULL DEFAULT 'thermal-80'
                    CHECK (paper_size IN ('thermal-58', 'thermal-80', 'a4', 'a5', 'letter')),
    is_default      BOOLEAN NOT NULL DEFAULT false,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_system       BOOLEAN NOT NULL DEFAULT false,
    elements        JSONB DEFAULT '[]'::jsonb,
    custom_css      TEXT,
    header          TEXT,
    footer          TEXT,
    width           INTEGER NOT NULL DEFAULT 80,
    margin          JSONB DEFAULT '{"top": 2, "right": 2, "bottom": 2, "left": 2}'::jsonb,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_print_templates_type ON print_templates (type);
CREATE INDEX IF NOT EXISTS idx_print_templates_is_default ON print_templates (is_default);


-- ============================================================================
-- 23. HELD_ORDERS - Held/parked POS orders (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS held_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hold_number     TEXT NOT NULL UNIQUE,
    customer_name   TEXT NOT NULL DEFAULT 'Walk-in Customer',
    customer_id     UUID,
    item_count      INTEGER NOT NULL DEFAULT 0,
    subtotal        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total           NUMERIC(12, 2) NOT NULL DEFAULT 0,
    data            JSONB NOT NULL DEFAULT '{}',
    created_by      UUID,
    created_by_name TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_held_orders_created_at ON held_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_held_orders_customer_id ON held_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_held_orders_created_by ON held_orders (created_by);


-- ============================================================================
-- 24. USER_SESSIONS - User session management (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    session_token   TEXT NOT NULL,
    device_info     JSONB,
    ip_address      TEXT,
    user_agent      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    expires_at      TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions (is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions (expires_at);


-- ============================================================================
-- 25. LOGIN_HISTORY - Login attempt tracking (FK added in Phase 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS login_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,
    login_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address      TEXT,
    user_agent      TEXT,
    device_info     JSONB,
    status          TEXT NOT NULL DEFAULT 'failed'
                    CHECK (status IN ('success', 'failed', 'blocked')),
    failure_reason  TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history (user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_at ON login_history (login_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_status ON login_history (status);


-- ============================================================================
-- PHASE 2: ADD ALL FOREIGN KEY CONSTRAINTS
-- ============================================================================
-- Using ALTER TABLE + ADD CONSTRAINT to avoid circular dependency errors
-- ============================================================================

-- app_users → branches
DO $$ BEGIN
    ALTER TABLE app_users ADD CONSTRAINT fk_app_users_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- branches → app_users (manager)
DO $$ BEGIN
    ALTER TABLE branches ADD CONSTRAINT fk_branches_manager
        FOREIGN KEY (manager_id) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- sales → customers
DO $$ BEGIN
    ALTER TABLE sales ADD CONSTRAINT fk_sales_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- sales → app_users (created_by)
DO $$ BEGIN
    ALTER TABLE sales ADD CONSTRAINT fk_sales_created_by
        FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- sales → app_users (salesman)
DO $$ BEGIN
    ALTER TABLE sales ADD CONSTRAINT fk_sales_salesman
        FOREIGN KEY (salesman_id) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- sales → branches
DO $$ BEGIN
    ALTER TABLE sales ADD CONSTRAINT fk_sales_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- purchases → suppliers
DO $$ BEGIN
    ALTER TABLE purchases ADD CONSTRAINT fk_purchases_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- purchases → app_users
DO $$ BEGIN
    ALTER TABLE purchases ADD CONSTRAINT fk_purchases_created_by
        FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- purchases → branches
DO $$ BEGIN
    ALTER TABLE purchases ADD CONSTRAINT fk_purchases_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- expenses → app_users
DO $$ BEGIN
    ALTER TABLE expenses ADD CONSTRAINT fk_expenses_created_by
        FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- expenses → branches
DO $$ BEGIN
    ALTER TABLE expenses ADD CONSTRAINT fk_expenses_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- audit_logs → app_users
DO $$ BEGIN
    ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- audit_logs → audit_logs (self-ref)
DO $$ BEGIN
    ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_restored_from
        FOREIGN KEY (restored_from_id) REFERENCES audit_logs(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- audit_logs → app_users (restored_by)
DO $$ BEGIN
    ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_restored_by
        FOREIGN KEY (restored_by_id) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- audit_logs → branches
DO $$ BEGIN
    ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- stock_adjustments → products
DO $$ BEGIN
    ALTER TABLE stock_adjustments ADD CONSTRAINT fk_stock_adj_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- stock_adjustments → app_users
DO $$ BEGIN
    ALTER TABLE stock_adjustments ADD CONSTRAINT fk_stock_adj_user
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- stock_adjustments → branches
DO $$ BEGIN
    ALTER TABLE stock_adjustments ADD CONSTRAINT fk_stock_adj_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- cash_registers → branches
DO $$ BEGIN
    ALTER TABLE cash_registers ADD CONSTRAINT fk_cash_reg_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- cash_shifts → cash_registers
DO $$ BEGIN
    ALTER TABLE cash_shifts ADD CONSTRAINT fk_cash_shifts_register
        FOREIGN KEY (register_id) REFERENCES cash_registers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- cash_shifts → app_users
DO $$ BEGIN
    ALTER TABLE cash_shifts ADD CONSTRAINT fk_cash_shifts_user
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- cash_shifts → branches
DO $$ BEGIN
    ALTER TABLE cash_shifts ADD CONSTRAINT fk_cash_shifts_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- cash_register_transactions → cash_shifts
DO $$ BEGIN
    ALTER TABLE cash_register_transactions ADD CONSTRAINT fk_crt_shift
        FOREIGN KEY (shift_id) REFERENCES cash_shifts(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- cash_register_transactions → cash_registers
DO $$ BEGIN
    ALTER TABLE cash_register_transactions ADD CONSTRAINT fk_crt_register
        FOREIGN KEY (register_id) REFERENCES cash_registers(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- cash_register_transactions → app_users
DO $$ BEGIN
    ALTER TABLE cash_register_transactions ADD CONSTRAINT fk_crt_created_by
        FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- inventory_history → products
DO $$ BEGIN
    ALTER TABLE inventory_history ADD CONSTRAINT fk_inv_hist_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- inventory_history → app_users
DO $$ BEGIN
    ALTER TABLE inventory_history ADD CONSTRAINT fk_inv_hist_user
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- print_templates → app_users
DO $$ BEGIN
    ALTER TABLE print_templates ADD CONSTRAINT fk_print_tpl_created_by
        FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- held_orders → customers
DO $$ BEGIN
    ALTER TABLE held_orders ADD CONSTRAINT fk_held_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- held_orders → app_users
DO $$ BEGIN
    ALTER TABLE held_orders ADD CONSTRAINT fk_held_created_by
        FOREIGN KEY (created_by) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- user_sessions → app_users
DO $$ BEGIN
    ALTER TABLE user_sessions ADD CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- login_history → app_users
DO $$ BEGIN
    ALTER TABLE login_history ADD CONSTRAINT fk_login_user
        FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================================
-- PHASE 3: AUTO-UPDATE TRIGGER (updated_at)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT table_name FROM information_schema.columns
               WHERE column_name = 'updated_at'
               AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER set_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', tbl);
    END LOOP;
END;
$$;


-- ============================================================================
-- PHASE 4: SEED DATA
-- ============================================================================

-- Default Branch
INSERT INTO branches (id, name, code, address, phone, email, is_active, is_default)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Main Branch',
    'MAIN',
    '123 Business Avenue, Suite 100, City Center',
    '+880 1234 567890',
    'info@dokan.com',
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Default Categories
INSERT INTO categories (name) VALUES
    ('Electronics'),
    ('Grocery'),
    ('Beverages'),
    ('Fashion'),
    ('Medicine'),
    ('Cosmetics'),
    ('Stationery'),
    ('Household'),
    ('Other')
ON CONFLICT (name) DO NOTHING;

-- Default Application Settings
INSERT INTO app_settings (
    id, shop_name, shop_address, shop_contact, shop_bio, shop_services,
    currency, currency_symbol, tax_rate, tax_enabled,
    receipt_footer, allow_walk_in_customer, subscription_plan
) VALUES (
    'default-settings',
    'Dokan Enterprise',
    '123 Business Avenue, Suite 100, City Center',
    '+880 1234 567890',
    'Premium Quality - Retail & Wholesale',
    'Smartphones - Laptops - CCTV - Electronics Accessories - Repairing',
    'BDT',
    '৳',
    5,
    false,
    'Thank you for shopping with us!',
    true,
    'premium'
) ON CONFLICT (id) DO NOTHING;

-- Default App Config
INSERT INTO app_config (key, value, category, description) VALUES
    ('loading_title', 'Dokan', 'settings', 'Custom loading screen title'),
    ('loading_subtitle', 'Smart Shop Management', 'settings', 'Custom loading screen subtitle'),
    ('loading_animation_type', 'spinner', 'settings', 'Loading screen animation type')
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_config (key, value, category, description) VALUES
    ('app_name', 'Dokan POS Pro', 'app', 'Application name'),
    ('app_version', '6.3.0', 'app', 'Application version'),
    ('production_domain', '', 'app', 'Production domain'),
    ('release_year', '2025', 'app', 'Release year')
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_config (key, value, category, description) VALUES
    ('support_email', '', 'support', 'Support email address'),
    ('support_phone', '', 'support', 'Support phone number'),
    ('support_address', '', 'support', 'Support address'),
    ('support_hours', '', 'support', 'Support hours'),
    ('support_facebook', '', 'support', 'Support Facebook page'),
    ('support_whatsapp', '', 'support', 'Support WhatsApp number'),
    ('support_youtube', '', 'support', 'Support YouTube channel'),
    ('support_tutorials', '[]', 'support', 'Video tutorials (JSON)'),
    ('support_faqs', '[]', 'support', 'FAQs (JSON)'),
    ('tutorial_categories', '[]', 'support', 'Tutorial categories (JSON)'),
    ('faq_categories', '[]', 'support', 'FAQ categories (JSON)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO app_config (key, value, category, description) VALUES
    ('developer_name', 'Dokan Team', 'developer', 'Developer name'),
    ('developer_website', '', 'developer', 'Developer website'),
    ('developer_email', '', 'developer', 'Developer email')
ON CONFLICT (key) DO NOTHING;

-- Master Admin User (change password in production!)
INSERT INTO app_users (id, name, username, email, password, role, is_active, permissions) VALUES
(
    '00000000-0000-0000-0000-000000000002',
    'Master Admin',
    'master',
    'mdshantosarker353@gmail.com',
    '#shant0s#',
    'Master Admin',
    true,
    '{
        "dashboard_view": true, "pos_access": true,
        "sales_view": true, "sales_create": true, "sales_edit": true, "sales_delete": true, "sales_return": true,
        "purchases_view": true, "purchases_create": true, "purchases_edit": true, "purchases_delete": true,
        "inventory_view": true, "inventory_create": true, "inventory_edit": true, "inventory_delete": true, "inventory_adjust": true,
        "customers_view": true, "customers_create": true, "customers_edit": true, "customers_delete": true,
        "suppliers_view": true, "suppliers_create": true, "suppliers_edit": true, "suppliers_delete": true,
        "accounting_view": true, "accounting_create": true, "accounting_edit": true, "accounting_delete": true,
        "reports_view": true, "reports_export": true, "cash_register": true, "cash_adjust": true,
        "expenses_view": true, "expenses_create": true, "expenses_edit": true, "expenses_delete": true,
        "branches_view": true, "branches_manage": true, "stock_transfer": true,
        "settings_view": true, "settings_edit": true, "print_templates": true,
        "users_view": true, "users_create": true, "users_edit": true, "users_delete": true, "users_permissions": true,
        "activity_logs": true
    }'::jsonb
) ON CONFLICT DO NOTHING;

-- Default Subscription Limits (Premium)
INSERT INTO subscription_limits (id, plan, max_products, max_customers, max_suppliers,
    max_admins, max_managers, max_staff, max_sellers, max_viewers,
    pos_system, sales_purchases, customer_management, supplier_management,
    advanced_reports, auto_backup, api_access, priority_support)
VALUES (
    'default',
    'premium',
    -1, -1, 500, 3, 5, 10, 10, 5,
    true, true, true, true, true, true, false, true
) ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- END OF SCHEMA - v6.3.0
-- ============================================================================
