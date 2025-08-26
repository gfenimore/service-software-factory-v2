-- Database Generator v1.0
-- Module: Account Management Phase 1
-- Entity: Account
-- Iteration: 1
-- Generated: 2025-08-23T21:57:19.126Z

CREATE TABLE account (
  id UUID PRIMARY KEY,
  account_number VARCHAR(255) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(255) NOT NULL,
  status VARCHAR(255) DEFAULT 'Active' NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  zip_code VARCHAR(255),
  owner_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_account_owner_id ON account(owner_id);