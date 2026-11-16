---
'@vinicunca/taman-ui': minor
---

Replace `TamanButtonCheckGroup` with `TamanToggleGroup`, a wrapper around pohon's `PToggleGroup`: it accepts every `PToggleGroup` prop and slot, and adds `allowClear`, `maxCount`, `beforeChange` and `showIcon` on top. Breaking changes:

- `TamanButtonCheckGroup` is removed. Its types are renamed: `TamanToggleGroupItem`, `TamanToggleGroupModel`, `TamanToggleGroupProps` and `TamanToggleGroupValue`. `TamanButtonCheckGroupOption` is removed.
- `options` is now `items` (`TamanToggleGroupItem`, which extends `ToggleGroupItem`), and labels are plain strings.
- `multiple` is now `type: 'single' | 'multiple'`.
- The `btnClick` event is renamed to `itemClick`.
- The `#icon` slot is replaced by the forwarded `#leading` slot (`{ item, pressed, ui }`, with `item.loading` set while `beforeChange` is pending), or by setting `leadingIcon` on an item. The `#option` slot is replaced by the forwarded `#default` slot (`{ item, index, pressed, ui }`).
- Requires `pohon-ui` 2.8 or later.
