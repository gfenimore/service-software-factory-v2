# ViewForge Bug List
*Created: January 21, 2025*

## 🐛 Active Bugs

### Bug #1: No Support for Related Record Fields
- **Description:** Cannot select related entity fields (e.g., `serviceLocation.account.accountName`)
- **Impact:** Cannot display parent account name in service location views
- **Workaround:** Manually edit JSON after export to add related fields
- **Priority:** High
- **Suggested Fix:** Add relationship selector in field picker with dot notation support

### Bug #2: Field Names Don't Match BUSM Schema
- **Description:** Field selector shows generic names that don't match Business Model (BUSM) field names
- **Impact:** Manual renaming required after export
- **Workaround:** Edit field paths in exported JSON to match actual schema
- **Priority:** High
- **Suggested Fix:** Load field names from BUSM registry or entity schema files

## 📝 Enhancement Requests

### Enhancement #1: Multi-Entity Support
- **Description:** Allow configuration of multiple related entities in one session
- **Benefit:** Faster configuration of complete workflows

### Enhancement #2: Import Existing Configurations
- **Description:** Load and edit previously exported JSON configurations
- **Benefit:** Iterative refinement without starting from scratch

## 🔧 Workarounds for Current Session

For now, we'll manually edit the exported JSON to:
1. Add related field paths (e.g., `account.accountName`)
2. Correct field names to match BUSM schema