# Scalable Artifact Management System

**Purpose**: Handle dozens of user stories with clear traceability

## Multi-Level Hierarchy Structure

```
.cursor/
├── projects/
│   ├── pest-control-v1/
│   │   ├── epics/
│   │   │   ├── customer-management/
│   │   │   │   ├── stories/
│   │   │   │   │   ├── US-001-view-accounts/
│   │   │   │   │   │   ├── iterations/
│   │   │   │   │   │   │   ├── iteration-1/
│   │   │   │   │   │   │   │   ├── planning/
│   │   │   │   │   │   │   │   ├── design/
│   │   │   │   │   │   │   │   ├── development/
│   │   │   │   │   │   │   │   ├── testing/
│   │   │   │   │   │   │   │   └── review/
│   │   │   │   │   │   │   └── iteration-2/ (bug fixes)
│   │   │   │   │   │   ├── status.md
│   │   │   │   │   │   └── requirements.md
│   │   │   │   │   └── US-002-manage-contacts/
│   │   │   │   ├── epic-status.md
│   │   │   │   └── epic-backlog.md
│   │   │   ├── service-delivery/
│   │   │   ├── scheduling/
│   │   │   └── billing/
│   │   ├── project-status.md
│   │   └── backlog.md
│   └── marine-services-v1/ (future domain)
└── templates/
    └── domain-templates/
```

## Story Lifecycle Management

### Story Status Tracking

```markdown
# US-001 Status Dashboard

**Story**: View and Manage Accounts
**Epic**: Customer Management
**Status**: COMPLETED ✅
**Iterations**: 2
**Total Effort**: 8 hours (estimated: 6)

## Iteration History

| Iteration | Status      | Duration | Artifacts         | Issues                    |
| --------- | ----------- | -------- | ----------------- | ------------------------- |
| 1         | ✅ Complete | 6h       | All agents        | Performance tuning needed |
| 2         | ✅ Complete | 2h       | Performance fixes | None                      |

## Current Deployment

- **Preview**: https://pest-control-v1-us001.vercel.app
- **Production**: Live on client site
- **Health**: All systems operational
```

## Automated Management Scripts

```bash
# scripts/story-lifecycle.sh
#!/bin/bash

create_story() {
    STORY_ID=$1
    TITLE=$2
    EPIC=$3

    mkdir -p ".cursor/projects/pest-control-v1/epics/$EPIC/stories/$STORY_ID/iterations/iteration-1"

    # Create all agent directories
    for agent in planning design development testing review; do
        mkdir -p ".cursor/projects/pest-control-v1/epics/$EPIC/stories/$STORY_ID/iterations/iteration-1/$agent"
    done

    # Create status file
    cat > ".cursor/projects/pest-control-v1/epics/$EPIC/stories/$STORY_ID/status.md" << EOF
# $STORY_ID Status
**Title**: $TITLE
**Epic**: $EPIC
**Status**: IN_PROGRESS
**Current Iteration**: 1
**Started**: $(date)
EOF

    echo "✅ Story $STORY_ID created in epic $EPIC"
}

# Usage: ./story-lifecycle.sh create US-023 "Customer Search" customer-management
```

## Backlog Management Dashboard

```markdown
# Pest Control v1 - Master Backlog

## Epic: Customer Management (Priority 1)

- [x] US-001: View Accounts (8h actual)
- [x] US-002: Manage Contacts (6h actual)
- [ ] US-003: Customer Search (4h estimated)
- [ ] US-004: Account History (6h estimated)
      **Epic Progress**: 2/4 stories (14h completed, 10h remaining)

## Epic: Service Delivery (Priority 2)

- [ ] US-010: Schedule Services (8h estimated)
- [ ] US-011: Track Technicians (12h estimated)
- [ ] US-012: Service Reports (6h estimated)
      **Epic Progress**: 0/3 stories (0h completed, 26h remaining)

## Epic: Billing & Invoicing (Priority 3)

- [ ] US-020: Generate Invoices (10h estimated)
- [ ] US-021: Payment Tracking (8h estimated)
      **Epic Progress**: 0/2 stories (0h completed, 18h remaining)

## Project Totals

- **Completed**: 14 hours across 2 stories
- **Remaining**: 54 hours across 7 stories
- **Velocity**: 7 hours/story average
- **Estimated Completion**: 8 more stories = ~56 hours total
```

## Domain Template Replication

```bash
# scripts/replicate-domain.sh
#!/bin/bash

SOURCE_DOMAIN="pest-control-v1"
TARGET_DOMAIN=$1  # e.g., "marine-services-v1"

# Copy entire structure
cp -r ".cursor/projects/$SOURCE_DOMAIN" ".cursor/projects/$TARGET_DOMAIN"

# Update all references using sed
find ".cursor/projects/$TARGET_DOMAIN" -type f -name "*.md" -exec \
    sed -i "s/$SOURCE_DOMAIN/$TARGET_DOMAIN/g" {} \;

echo "✅ Domain template replicated: $TARGET_DOMAIN"
echo "🔧 Manual customization needed for domain-specific terminology"
```
