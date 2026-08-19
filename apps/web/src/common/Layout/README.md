# Layout

App-shell wrapper used by every page. Composes `Header`, `Blueprint` (main content area), and `Footer` in a full-height column.

```tsx
<Layout>
  <MyPageContent />
</Layout>
```

---

## Props

| Prop             | Type                               | Default      | Description                                      |
| ---------------- | ---------------------------------- | ------------ | ------------------------------------------------ |
| `children`       | `ReactNode`                        | -            | Page content rendered inside Blueprint           |
| `header`         | `ReactNode`                        | `<Header />` | Override or suppress (`null`) the default header |
| `footer`         | `ReactNode`                        | `<Footer />` | Override or suppress (`null`) the default footer |
| `blueprintProps` | `Omit<BlueprintProps, 'children'>` | -            | Props forwarded to the Blueprint wrapper         |

---

## Visual behaviour

- Root: `Flex` column, `minHeight="100vh"`
- Content area: `Blueprint as="main"` with `scanline`, `pt={10}`, `flex={1}`
- Header and footer slot in above and below the main area respectively
- Passing `header={null}` or `footer={null}` suppresses those slots entirely
