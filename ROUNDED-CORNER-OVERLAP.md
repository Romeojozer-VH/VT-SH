# Gotcha: rounded corners need real overlap, not adjacency

Several screens use the same layout: a green header banner behind a white
content panel with rounded top corners, so the corner visually curves into
the green.

```
┌──────────────┐
│    green     │
│  ┌────────┐  │  ← white panel's rounded top corner should
│  │ white  │  │    reveal green in the cut-away curve
└──┴────────┴──┘
```

## The bug

`border-radius` clips an element's own background to the rounded shape.
The small "pocket" area outside the curve but inside the element's
bounding box isn't painted by that element at all — it shows whatever's
*behind* it in the stacking order.

If the green banner and the white panel are simply **adjacent** (the
banner ends exactly where the panel begins, or the panel sits some
`margin-top` below it), there's nothing green behind that pocket — it
falls back to the page's own background. On this app that background is
the same `#fafafa` as the panel itself, so the corner doesn't look
"broken" so much as **invisible**: the whole top edge just reads as flat
instead of curved.

This showed up on `Pay.tsx`, `LegacyBill.tsx`, and `LegacyPayNow.tsx`
because their green banners were sized to match Figma's exact stated
header height, with no built-in slack. Other screens (`ManageCard.tsx`,
`PaymentMethods.tsx`, etc.) happen to size their banner a bit taller than
the header content actually needs, which accidentally provides enough
overlap — so they never exhibited the bug, even though they use the same
pattern.

## The fix

**Every** green-header screen needs the exact same two-sided overlap —
there's no way around it, regardless of how the banner's height is
computed:

1. The panel gets `-mt-6` (-24px, matching the corner radius) to pull its
   own box up into the green, and `pt-6` right after to cancel that shift
   back out for the actual content — so "Payment due" / whatever sits at
   the same position it would without the trick, only the panel's own
   rounded edge moves.
2. The green banner must have **at least 24px of space below the visible
   header content** for that `-mt-6` to land in. Skip this and the panel
   overlaps the header content itself instead of empty green (this is the
   mistake that produced the "Bill" title getting clipped by the panel —
   see git history on `LegacyBill.tsx` / `LegacyPayNow.tsx`).

How you create that 24px of spare green differs by screen:

**Wrap the content directly** (`Pay.tsx`) — make the green the natural
background of a container that holds the header content itself, and add
an explicit `pb-6` inside that wrapper (after the last content element)
as the spare space:

```tsx
<div className="relative overflow-hidden bg-sh-green">
  {/* decorative bg image / gradient, absolutely positioned, z-0 */}
  <div className="relative z-10 pb-6">
    {/* header content — StatusBar, title, etc. */}
  </div>
</div>
<div className="-mt-6 rounded-t-[24px] bg-[#fafafa] pt-6 ...">
  {/* panel content */}
</div>
```

**Fixed-height decorative banner** (`LegacyBill.tsx`, `LegacyPayNow.tsx`)
— when the banner is a separate absolutely-positioned layer sized to a
hardcoded value (e.g. copied straight from a Figma spec), add 24px to
that value on top of whatever the header content needs:

```tsx
{/* header content naturally needs ~152px; +24 is spare for the overlap */}
<div className="absolute inset-x-0 top-0 h-[176px] bg-sh-green" />
<div className="px-5 pt-[18px]">{/* header content, ends around y=152 */}</div>
<div className="-mt-6 rounded-t-[24px] bg-[#fafafa] pt-6 ...">
  {/* panel content — -mt-6 lands in the 176-152=24px spare zone, not
      the header text */}
</div>
```

## When adding a new green-header screen

1. Add `-mt-6 ... pt-6` to the white panel — always, no exceptions.
2. Make sure the green banner has ≥24px of space below the visible header
   content for that overlap to land in. If you're matching a Figma header
   height exactly (rather than measuring it or deliberately padding it),
   add 24px on top of that value.
3. If in doubt, check visually: the rounded corner should show green in
   both top corners, and the header title/content should not be clipped
   by the panel's top edge.
