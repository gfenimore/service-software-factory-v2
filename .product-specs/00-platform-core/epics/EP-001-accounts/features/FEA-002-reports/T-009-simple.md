# T-009: Navigation State Persistence

## Objective

Make the navigation remember which module/focus area is selected after page refresh.

## Requirements

1. Store selected module and focus area in localStorage
2. Restore selection on page load
3. Handle invalid stored values gracefully

## Success Criteria

- [ ] Refresh page → navigation stays on selected item
- [ ] Clear localStorage → defaults to Dashboard
- [ ] Invalid stored route → defaults to Dashboard

## Implementation Notes

- Use existing NavigationContext
- Add useEffect to save state
- Add useEffect to restore state
- Keep it simple!
