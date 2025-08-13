# BUSM-to-Supabase Synchronization Directive

## Claude-CC-Human Alignment on Schema Management

**Date**: August 13, 2025  
**Status**: 🟢 Active Directive  
**From**: Claude (with Human approval)  
**To**: CC (Claude Code)

---

## 📋 Executive Summary

CC, I'm fully in the loop on our schema discussion. The Human and I are aligned: **The BUSM is THE source of truth** for our database schema. All Supabase tables must synchronize with the BUSM specification found at `.product-specs/00-platform-core/busm-model/BUSM.mmd`.

---

## 🎯 Immediate Actions Required

### 1. Fix Field Name Mismatches (Priority: CRITICAL)

The following field names in our code don't match the actual Supabase schema (which correctly follows the BUSM):

**In ContactDetailsModal.tsx** (around lines 76-77):

```typescript
// CURRENT (Wrong):
email: contact.email || undefined,
phone: contact.phone || contact.mobile || undefined,

// SHOULD BE (Correct per BUSM/Supabase):
email: contact.email_address || undefined,
phone: contact.phone_number || undefined,
```

**In API Routes**:

- `/api/accounts/[accountId]/contacts/route.ts`
- Any TypeScript interfaces using `email` or `phone`

**TypeScript Interface Correction**:

```typescript
interface Contact {
  id: string
  account_id: string
  first_name: string
  last_name: string
  email_address: string // NOT 'email'
  phone_number: string // NOT 'phone'
  is_primary_contact: boolean // NOT 'is_primary'
  communication_preference?: 'Voice' | 'Text' | 'Email'
}
```

### 2. Prepare SERVICE_LOCATION Table (Column 2 of Master View)

Next entity to implement from BUSM:

```sql
-- From BUSM specification
SERVICE_LOCATION {
  ServiceLocationID: int (PK)
  AccountID: int (FK)
  LocationName: string
  ServiceAddress: string
  ServiceCity: string
  ServiceState: string
  ServiceZipCode: string
  Latitude: decimal
  Longitude: decimal
  -- Additional fields per BUSM
}
```

---

## 🏗️ Architecture Principles Going Forward

### 1. BUSM is Immutable Truth

- The BUSM.mmd file is weeks of refined business modeling
- Database changes flow FROM BUSM → TO Supabase
- Never create tables not in the BUSM (except SDLC tracking)

### 2. Incremental Module Implementation

We're building in this order:

1. **Accounts Module** (Current: ACCOUNT, CONTACT, next: SERVICE_LOCATION)
2. **Operations Module** (Future: WORK_ORDER, WORK_ORDER_ITEM, etc.)
3. **Financial Module** (Later: INVOICE, PAYMENT, etc.)
4. **Assets Module** (Eventually: SERVICEABLE_ITEM, etc.)

### 3. Field Naming Convention

BUSM (PascalCase) → Supabase (snake_case):

- `AccountID` → `account_id`
- `PhoneNumber` → `phone_number`
- `EmailAddress` → `email_address`
- `IsPrimaryContact` → `is_primary_contact`

### 4. Processor Tables Clarification

The existing processor/quality*gates tables are for SDLC tracking, not business operations. Consider prefixing with `sdlc*`:

- `processor_sessions` → `sdlc_processor_sessions`
- `processor_runs` → `sdlc_processor_runs`
- `quality_gates` → `sdlc_quality_gates`

---

## 💡 Key Insights from Today's Discovery

1. **We have 27 entities in BUSM, only 2 implemented** - lots of runway ahead!
2. **The Human will act as "Supabase Surrogate"** for schema operations you can't perform
3. **MCP Supabase works in Cursor but not Claude Code** - this is fine, we have workarounds
4. **Field name mismatches caused today's bugs** - fixing these prevents future issues

---

## ✅ Confirmation Checklist for CC

Please confirm you understand and will:

- [ ] Fix all `email` → `email_address` references
- [ ] Fix all `phone` → `phone_number` references
- [ ] Use BUSM.mmd as source of truth for any new tables
- [ ] Implement SERVICE_LOCATION next for Column 2
- [ ] Follow snake_case naming convention from BUSM

---

## 🤝 Team Alignment

**Human**: Decided BUSM is source of truth, will be Supabase surrogate  
**Claude**: Supports BUSM synchronization, will ensure architectural alignment  
**CC**: Execute implementation, maintain code-schema synchronization

We're all aligned on using the BUSM as our north star. The database is the business model, and the business model is captured perfectly in the BUSM.

---

## 📎 Reference Files

- **BUSM Source**: `.product-specs/00-platform-core/busm-model/BUSM.mmd`
- **Current Schema**: Available via MCP in Cursor or Human as surrogate
- **Implementation**: Start with field fixes, then SERVICE_LOCATION

---

_Let's keep our implementation perfectly synchronized with the business model we've spent weeks refining!_
