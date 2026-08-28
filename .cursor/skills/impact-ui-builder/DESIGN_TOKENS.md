# Impact UI Design Tokens

Complete reference for colors, typography, spacing, and other design values.

## Colors

### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| `$primaryColor` | `#4259ee` | Primary CTAs, main actions, links |
| `$secondaryColor` | `#3649c6` | Primary hover states |
| `$lightBlueColor` | `#eceefd` | Light hover backgrounds |
| `$buttonHoverColor` | `#29399f` | Dark hover states |

### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `$mainFontColor` | `#1f2b4d` | Primary body text, headings |
| `$textButtonFontColor` | `#60697d` | Secondary text, labels, placeholders |
| `$color-text-secondary` | `#60697d` | Alternative secondary text |

### Background Colors
| Token | Value | Usage |
|-------|-------|-------|
| `$white` / `$whiteColor` | `#ffffff` | Page backgrounds, cards |
| `$color-gray-50` | `#f9fafb` | Subtle backgrounds |
| `$skeletonColor` | `#f5f6fa` | Loading placeholders |
| `$textButtonPrimaryBg` | `#f5f6fa` | Text button backgrounds |
| `$inactiveInputBackground` | `#f2f4fb` | Disabled input backgrounds |
| `$tableBgHoverColor` | `#f1f4f9` | Table row hover |

### Status Colors - Success
| Token | Value | Usage |
|-------|-------|-------|
| `$successIconColor` | `#3bb273` | Success icons |
| `$successBackground` | `#ebf7f1` | Success alert backgrounds |
| `$successStroke` | `#c4e8d5` | Success borders |
| `$successToastStroke` | `#89d1ab` | Success toast borders |

### Status Colors - Error
| Token | Value | Usage |
|-------|-------|-------|
| `$errorColor` | `#ec4c5c` | Error icons, text |
| `$errorBackground` | `#feeaf3` | Error alert backgrounds |
| `$errorStroke` | `#f3c1c0` | Error borders |
| `$redText` | `#ab3939` | Dark error text |

### Status Colors - Warning
| Token | Value | Usage |
|-------|-------|-------|
| `$warningAlertIcon` | `#e1bc29` | Warning icons |
| `$warningBackground` | `#fff8d5` | Warning alert backgrounds |
| `$warningStroke` | `#ffe770` | Warning borders |
| `$warningToastText` | `#e1bc29` | Warning toast text |

### Status Colors - Info
| Token | Value | Usage |
|-------|-------|-------|
| `$infoStroke` | `#c6cdfb` | Info borders |
| `$infoBackground` | `#e2f4ff` | Info alert backgrounds |

### Border Colors
| Token | Value | Usage |
|-------|-------|-------|
| `$borderColor` | `#d9dde7` | Default borders |
| `$outerBorder` | `#d9dde7` | Card/container borders |
| `$menuBorderColor` | `#f0f0f0` | Menu dividers |
| `$accrodionBorderColor` | `#eff2fa` | Accordion borders |

### Destructive Colors
| Token | Value | Usage |
|-------|-------|-------|
| `$destructiveBg` | `#e15554` | Destructive button background |
| `$destructiveHoverBg` | `#ab3939` | Destructive button hover |

### Badge Colors
| Token | Value | Usage |
|-------|-------|-------|
| `$primaryBadge` | `#5267f4` | Primary badge |
| `$grayBadge` | `#5f6673` | Neutral badge |
| `$redBadge` | `#ec4c5c` | Error badge |
| `$greenBadge` | `#108431` | Success badge |
| `$yellowBadge` | `#ffe174` | Warning badge |

### Subtle Badge Colors
| Token | Value | Usage |
|-------|-------|-------|
| `$subtleDefaultColor` | `#f2f3f4` | Default subtle |
| `$subtleInfoColor` | `#f1f3fe` | Info subtle |
| `$subtleSuccessColor` | `#f4fff7` | Success subtle |
| `$subtleWarningColor` | `#fdfae9` | Warning subtle |
| `$subtleErrorColor` | `#fef4f5` | Error subtle |

---

## Typography

### Font Family
```scss
$fontFamily: 'Manrope', sans-serif;
```

### Font Sizes
| Token | Value | Usage |
|-------|-------|-------|
| `$smallFontSize` | `12px` | Captions, helper text, small labels |
| `$normalFontSize` | `14px` | Body text, inputs, buttons (default) |
| `$mediumFontSize` | `16px` | Subheadings, emphasized text |
| `$largeFontSize` | `20px` | Page headings, titles |

### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `$regularFontWeight` | `400` | Body text |
| `$normalFontWeight` | `500` | Slightly emphasized text |
| `$semiBoldFontWeight` | `600` | Labels, section headers |
| `$BoldFontWeight` | `700` | Headings, important text |
| `$ExtraFontWeight` | `800` | Extra emphasis (rare) |

### Line Heights
| Token | Value |
|-------|-------|
| `$l1` | `16px` |
| `$l2` | `20px` |
| `$l3` | `24px` |
| `$l4` | `28px` |
| `$l5` | `32px` |
| `$l6` | `36px` |
| `$l7` | `40px` |
| `$l8` | `44px` |

---

## Spacing

### Padding/Margin Scale
| Token | Value | Usage |
|-------|-------|-------|
| `$p1` | `4px` | Tight spacing, icon gaps |
| `$p2` | `8px` | Small gaps, compact layouts |
| `$p3` | `12px` | Default small padding |
| `$p4` | `16px` | Standard component padding |
| `$p5` | `20px` | Section padding |
| `$p6` | `24px` | Card/container padding |
| `$p7` | `28px` | Large section gaps |
| `$p8` | `32px` | Page-level padding |
| `$p9` | `36px` | Extra large spacing |
| `$p10` | `40px` | Maximum spacing |

### Component Sizes
| Token | Value | Usage |
|-------|-------|-------|
| `$smallComponent` | `24px` | Small buttons, icons |
| `$mediumComponent` | `28px` | Medium components |
| `$BigComponent` | `32px` | Large buttons, inputs |
| `$Component48px` | `48px` | Extra large components |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `$borderRadius` | `8px` | Default for buttons, inputs, cards |
| `$borderRadiusLarge` | `16px` | Large cards, modals |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `$boxShadowLight` | `rgba(0, 0, 0, 0.1)` | Subtle elevation |
| `$boxShadowMedium` | `rgba(0, 0, 0, 0.12)` | Cards, dropdowns |
| `$boxShadowSoft` | `rgba(0, 0, 0, 0.06)` | Very subtle shadows |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `$LOW_1` - `$LOW_4` | `1-4` | In-page overlays |
| `$HIGH_1` | `10` | Dropdowns, tooltips |
| `$HIGH_2` | `99` | Sticky headers |
| `$VERY_HIGH` | `999` | Modals, toasts |

---

## Table Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `$TABLE_DEFAULT_HEIGHT` | `40px` | Default row height |
| `$TABLE_MEDIUM_HEIGHT` | `29px` | Comfort row height |
| `$TABLE_SMALL_HEIGHT` | `25px` | Compact row height |

---

## Using Design Tokens

### In SCSS
```scss
@import 'impact-ui/styles/base/color';
@import 'impact-ui/styles/base/typography';

.my-component {
  color: $mainFontColor;
  font-size: $normalFontSize;
  padding: $p4;
  border-radius: $borderRadius;
  border: 1px solid $borderColor;
}
```

### In Inline Styles (Last Resort)
Use impact-ui's CSS classes when possible. If you must use inline styles:

```tsx
// Use the actual hex values from this reference
<div style={{ 
  color: '#1f2b4d', // $mainFontColor
  padding: '16px', // $p4
  borderRadius: '8px' // $borderRadius
}}>
```

### Via CSS Classes (Preferred)
impact-ui components come with built-in classes following the `ia-` prefix convention:
```tsx
<div className="ia-styles ia-text-primary ia-p-4">
```
