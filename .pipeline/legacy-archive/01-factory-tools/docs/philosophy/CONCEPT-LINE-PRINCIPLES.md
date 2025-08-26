# Concept Line Principles
*Critical principles that must not be forgotten*

## 🎯 Core Principle: BLACK AND WHITE ONLY

### Why Black and White?
1. **Focus on Structure** - No distractions from colors or styling
2. **Rapid Validation** - Stakeholders focus on functionality, not aesthetics
3. **Clear Progression** - Color comes in Prototype Line as enhancement
4. **Accessibility First** - Must work without any visual enhancements
5. **Print-Friendly** - Can be printed and marked up easily

### What This Means:
- ⚫ Black text on white background
- ⬜ White space for layout only
- 🚫 NO colors (not even grays)
- 🚫 NO gradients
- 🚫 NO shadows
- 🚫 NO rounded corners
- 🚫 NO icons or emojis
- ✅ Simple borders (black only)
- ✅ Basic HTML structure
- ✅ Semantic HTML only

### Examples:
```html
<!-- GOOD - Concept Line -->
<table border="1">
  <tr>
    <th>Account Name</th>
    <th>Status</th>
  </tr>
  <tr>
    <td>Johnson Residence</td>
    <td>Active</td>
  </tr>
</table>

<!-- BAD - Has styling -->
<table style="border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  <tr style="background: #f7fafc;">
    <th>Account Name</th>
    <th>Status</th>
  </tr>
</table>
```

## 📊 Three-Line Color Progression

| Line | Visual Style | Purpose |
|------|-------------|---------|
| **Concept** | Black & White ONLY | Structure validation |
| **Prototype** | Basic colors, simple styling | Usability testing |
| **Production** | Full design system | Brand experience |

## 🔧 Generator Requirements

All Concept Line generators MUST:
1. Output pure black text on white background
2. Use only basic HTML tags (no CSS)
3. Use `border="1"` for tables (black borders)
4. No inline styles except `display:none` for functionality
5. No external stylesheets
6. No JavaScript visual effects

## 🎬 The Reveal Moment

The magic happens when stakeholders see:
1. **Iteration 1**: Black & white structure ✓ "Yes, those are the right fields"
2. **Iteration 2**: Add colors/basic styling ✓ "Oh, now it looks usable!"
3. **Iteration 3**: Full design ✓ "Wow, it's beautiful!"

Each iteration builds anticipation and shows clear progress.

## ⚠️ Common Mistakes to Avoid

1. **Adding "just a little color"** - No! Stay disciplined
2. **Using gray for headers** - Still color, not allowed
3. **Adding hover effects** - Save for Prototype Line
4. **Icons for clarity** - Text only in Concept Line
5. **Subtle shadows** - No shadows at all

## 💡 Remember

> "If you can't make it work in black and white, colors won't save it."

The Concept Line proves the information architecture and workflow are correct. Nothing more, nothing less.

---

*This principle was established early in the project and must be maintained for the factory to work correctly.*