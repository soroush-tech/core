# SidebarItem

One entry of a [`Sidebar`](../Sidebar/README.md): an icon **pinned to the anchored edge** (it
holds its position while the rail opens and closes) plus content shown while the rail is open -
the `label` by default, or custom `children` (badges, counts, ...). The `label` is always the
accessible name, so collapsed icon-only items stay screen-reader friendly. On a right-anchored
rail the open content renders to the icon's left.

Built on [`Pressable`](../../Pressable/README.md), so it carries button semantics with only the
styling declared here - no inherited uppercase, bold weight, or letter-spacing from the button
family. It renders Pressable's default element, meaning `role="button"`, a tab stop, and
Enter/Space activation, with `disabled` expressed as `aria-disabled`. Selection styling and
`aria-pressed` are its own; every `Pressable` prop (`disabled`, `color`, `href`, `as`, spacing, ...)
passes through. Must render inside a `Sidebar`, which provides the open state and anchor via
`SidebarContext`.

## Usage

```tsx
<SidebarItem
  icon="history"
  label="Gist history"
  isSelected={panel === 'gists'}
  onSelect={() => setPanel('gists')}
/>

// Custom open-state content - the label stays the accessible name:
<SidebarItem icon="edit_note" label="Drafts">
  <span>Drafts (3)</span>
</SidebarItem>
```

Under a [`Sidebar`](../Sidebar/README.md) with `hasPanel`, `children` mean something different:
they become the contents of the rail's panel column, shown while this item is selected, and the
row falls back to the `label`. The item then also carries `aria-expanded` and, while selected,
`aria-controls` pointing at the panel.

The children are **ported** into the panel via [`Portal`](../../Portal/README.md), not handed
upward - so they remain declared here and keep this item's context, state, and handlers, and the
item may sit at any depth in the rail. Being ported, they are client-only: nothing renders into
the panel during server rendering.

```tsx
<Sidebar aria-label="Editor panels" isOpen={isOpen} hasPanel>
  <SidebarItem icon="folder" label="Directory" isSelected={isDirectory} onSelect={showDirectory}>
    <DirectoryTree /> {/* the panel, not the row */}
  </SidebarItem>
</Sidebar>
```

## Props

Also accepts every `Pressable` prop except `feedback` and `activeOpacity`, which the variant
decides (`plain` gets none, everything else gets the press highlight).

| Prop         | Type                              | Default     | Description                                                                                    |
| ------------ | --------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `icon`       | `IconName`                        | -           | Icon shown in both states, pinned to the anchored edge.                                        |
| `label`      | `string`                          | -           | Accessible name; also the default visible content while open.                                  |
| `variant`    | `'text' \| 'outlined' \| 'plain'` | `'text'`    | `text` is borderless (selection via fill); `plain` also drops fill, hover, and press feedback. |
| `size`       | `'sm' \| 'md' \| 'lg'`            | `'sm'`      | Padding and font size - resolves against `theme.sizes`.                                        |
| `color`      | `PaletteColor`                    | `'primary'` | Palette the selected fill and press highlight derive from.                                     |
| `children`   | `ReactNode`                       | -           | Open-state content instead of the label - or the panel's content under `hasPanel`.             |
| `isSelected` | `boolean`                         | -           | Active state - drives `aria-pressed` and the selected fill.                                    |
| `onSelect`   | `() => void`                      | -           | Fired when the item is activated. Runs after any `onClick`.                                    |

## Theming

| Slot   | Element            |
| ------ | ------------------ |
| `root` | The item's button. |

Customize via `theme.components.SidebarItem.styleOverrides`.
