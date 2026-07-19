-- Cloudflare D1 数据库初始化脚本
-- 用法: wrangler d1 execute yihe-db --local --file=./schema.sql

-- ==================== 用户表（登录权限管理） ====================
CREATE TABLE IF NOT EXISTS users (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,  -- 主键ID
  username          TEXT NOT NULL UNIQUE,               -- 用户名
  password_hash     TEXT NOT NULL,                     -- 密码哈希（SHA-256）
  name              TEXT DEFAULT '',                    -- 姓名
  role              TEXT DEFAULT 'user',               -- 角色（admin/user）
  created_at        TEXT DEFAULT (datetime('now'))     -- 创建时间
);

-- ==================== 客户表 ====================
CREATE TABLE IF NOT EXISTS customers (
  id                            INTEGER PRIMARY KEY AUTOINCREMENT,  -- 主键ID
  name                          TEXT NOT NULL DEFAULT '',           -- 客户姓名
  customer_number               INTEGER DEFAULT 1,                  -- 编号（自增长，从1开始，由后端自动生成）
  follow_up_status              TEXT DEFAULT '',                    -- 跟进状态（重点跟踪/已约/跟进中/暂时先不跟/已放弃）
  customer_status               TEXT DEFAULT '',                    -- 客户状态（潜在/意向/成交）
  expected_investment_amount    REAL DEFAULT 0,                     -- 预计投资金额
  total_asset_scale             TEXT DEFAULT '',                    -- 预计总资产规模
  financial_preference          TEXT DEFAULT '',                    -- 理财偏好
  family_situation              TEXT DEFAULT '',                    -- 家庭情况
  occupation_info               TEXT DEFAULT '',                    -- 职业信息
  hobbies                       TEXT DEFAULT '',                    -- 爱好
  last_follow_up_time           TEXT DEFAULT '',                    -- 最近一次沟通时间
  last_follow_up_content        TEXT DEFAULT '',                    -- 跟进内容（最近一次）
  next_follow_up_content        TEXT DEFAULT '',                    -- 下次跟进内容
  next_follow_up_time           TEXT DEFAULT '',                    -- 下次跟进时间
  attention_items               TEXT DEFAULT '',                    -- 关注事项/重点关注事项
  trusted_person                TEXT DEFAULT '',                    -- 信任人
  beneficiary                   TEXT DEFAULT '',                    -- 受益人
  customer_source               TEXT DEFAULT '',                    -- 客户来源
  referrer                      TEXT DEFAULT '',                    -- 推荐人
  created_at                    TEXT DEFAULT (datetime('now')),    -- 创建时间
  updated_at                    TEXT DEFAULT (datetime('now'))     -- 更新时间
);

-- ==================== 跟进记录表 ====================
CREATE TABLE IF NOT EXISTS follow_up_records (
  id                            INTEGER PRIMARY KEY AUTOINCREMENT,  -- 主键ID
  customer_id                   INTEGER NOT NULL,                   -- 所属客户ID（系统自增ID）
  customer_number               INTEGER DEFAULT 0,                  -- 客户编号（Excel原编号，用于关联和展示）
  record_number                 INTEGER DEFAULT 1,                  -- 跟进编号（按客户自增长，从1开始）
  follow_up_time                TEXT DEFAULT '',                    -- 跟进时间
  follow_up_content             TEXT DEFAULT '',                    -- 跟进内容
  next_follow_up_content        TEXT DEFAULT '',                    -- 下次跟进内容
  next_follow_up_time           TEXT DEFAULT '',                    -- 下次跟进时间
  operator                      TEXT DEFAULT '',                    -- 操作人
  created_at                    TEXT DEFAULT (datetime('now')),    -- 创建时间
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- ==================== 索引（加速查询） ====================
CREATE INDEX IF NOT EXISTS idx_customers_number           ON customers(customer_number);            -- 按编号筛选
CREATE INDEX IF NOT EXISTS idx_customers_name                ON customers(name);                     -- 按姓名筛选
CREATE INDEX IF NOT EXISTS idx_customers_status              ON customers(follow_up_status);         -- 按跟进状态筛选
CREATE INDEX IF NOT EXISTS idx_customers_customer_status     ON customers(customer_status);         -- 按客户状态筛选
CREATE INDEX IF NOT EXISTS idx_customers_next_follow_up_time ON customers(next_follow_up_time);     -- 按下次跟进时间筛选
CREATE INDEX IF NOT EXISTS idx_follow_up_records_customer_id ON follow_up_records(customer_id);     -- 按客户查跟进记录
CREATE INDEX IF NOT EXISTS idx_follow_up_records_follow_up_time ON follow_up_records(follow_up_time); -- 按时间排序
