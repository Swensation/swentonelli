# Guidelines: Child Header & Universal Child View Styling

## 1. Universal Child Header Standard
When presenting any "Child View" across the application—including the Family Calendar columns, Child Profile Matrix, and any future widgets—the header MUST be styled consistently using the standard `ChildHeader` component.

### Specifications:
1. **Avatar Size**: Avatars must display **50% larger** (`w-14 h-14` / 56px to `w-15 h-15` / 60px rounded-full).
2. **Neutral Avatar Border**: Avatars MUST have a consistent neutral border (`border border-slate-700/80 bg-slate-800 shadow-md`), NOT varying per-child border colors on the circular image itself.
3. **Pronounced Column Box Border**: The outer child column box container receives the child's signature color (`border-2` with `style={{ borderColor: `${child.color}99` }}`) to make the column container pop.
4. **Name Typography**: `font-black text-white text-lg tracking-tight`.
5. **No Extraneous Subtitles**: Do NOT generate avatar theme descriptions or subtitles (e.g. "Glinda from Wicked") unless explicitly requested.

---

## 2. Badges vs. Categories Taxonomy
- **Badge**: A Badge is defined strictly as the **state of a child for the day** (e.g. Custody house `Dad's` / `Mom's`, and School status `No School` / `Early Release`).
  - Badges MUST have a fixed minimum width (`min-w-[76px] justify-center`) to prevent typography width jumping between days (e.g. "Mom's" vs "Dad's").
- **Category**: A Category is the **activity classification** for an event (e.g. `OSFC Soccer`, `Field Hockey`, `Miller Elementary`, `Youth Football`). Do NOT refer to event categories as badges.

---

## 3. General Design Philosophy: Purposeful, Clean Styling
- **No Arbitrary Styling**: Do NOT add arbitrary bold, yellow, or colored text to table cells or list items for the sake of styling. Keep all metadata text clean, legible, and uniform.
- **No Extraneous Subtitles**: Remove and do not generate extraneous explanatory subtitles across headers and widgets unless explicitly prompted.
- **Equal Heights**: In multi-column child grids, all columns MUST be equal height (`items-stretch` with `h-full flex flex-col`), matching the height of the tallest column.

