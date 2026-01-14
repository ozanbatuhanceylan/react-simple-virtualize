# react-simple-virtualize

![NPM Version](https://img.shields.io/npm/v/react-simple-virtualize)
![License](https://img.shields.io/npm/l/react-simple-virtualize)
![Size](https://img.shields.io/bundlephobia/minzip/react-simple-virtualize)

**react-simple-virtualize** is a lightweight (less than 1kb), dependency-free React hook for rendering large lists efficiently.

It solves the "too many DOM elements" problem by rendering only the items visible in the viewport. Perfect for scenarios where you need raw performance without the complexity or weight of larger libraries.

## 🚀 Features

* **Tiny:** < 1kb gzipped.
* **Zero Dependencies:** It does one thing and does it well.
* **Agnostic:** Works with `<div>`, `<ul>`, `<table>` or any other DOM element.
* **TypeScript:** Written in JS but includes full Type definitions.

## 📦 Installation

```bash
npm install react-simple-virtualize
# or
yarn add react-simple-virtualize
```

## 💻 Usage

Here is a basic example of a list with 10,000 items:

```jsx
import React from 'react';
import { useVirtualize } from 'react-simple-virtualize';

const MyLargeList = () => {
  // 1. Setup your data
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);
  
  // 2. Initialize the hook
  const { 
    virtualItems, 
    totalHeight, 
    scrollRef,
    onScroll 
  } = useVirtualize({
    itemCount: items.length,
    itemHeight: 50,
    overscan: 5,
  });

  return (
    // Outer Container: Needs a size (fixed or flex) & overflow-y: auto
    <div
      ref={scrollRef}
      onScroll={onScroll}
      style={{
        height: '500px', // Or '100%', 'flex: 1'
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid #ccc'
      }}
    >
      {/* Inner Container: Sets the scrollable height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        
        {/* Render only visible items */}
        {virtualItems.map(({ index, offsetTop, measureRef }) => (
          <div
            key={index}
            ref={measureRef} // <--- Crucial for Dynamic Height!
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${offsetTop}px)`,
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 10,
              minHeight: 50, // Optional: just for visual
              background: index % 2 === 0 ? '#fff' : '#f5f5f5'
            }}
          >
            {items[index]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyLargeList;
```

## ⚙️ API Reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `itemCount` | `number` | **Required** | Total number of items in the list. |
| `itemHeight` | `number` | **Required** | Estimated height of an item. Used for initial rendering and unmeasured items. |
| `overscan` | `number` | `3` | Number of extra items to render outside the visible viewport. |
| `containerHeight` | `number` | `undefined` | Optional fixed height. If omitted, the hook uses `ResizeObserver` on `scrollRef` to measure it automatically. |

### Return Values

| Value | Type | Description |
|---|---|---|
| `virtualItems` | `VirtualItem[]` | Array of items to be rendered in the current viewport. |
| `totalHeight` | `number` | Total calculated height of the list (apply this to the inner container). |
| `scrollRef` | `RefObject` | Ref to be attached to the scrollable container element (for auto-sizing). |
| `onScroll` | `function` | Scroll handler to be attached to the scrollable container. |

#### `VirtualItem` Interface
```ts
interface VirtualItem {
  index: number;
  offsetTop: number;
  measureRef: (el: HTMLElement | null) => void; // Must be attached to the rendered element
}
```

## Migration from v1 to v2

v2 introduces support for **Dynamic Heights**. This is a breaking change.

**Changes:**
- You must now attach the `measureRef` to your rendered element.
- `itemHeight` prop is now used as an **estimate** for unrendered items.

```jsx
// v1 (Old)
<div style={{ transform: `translateY(${virtualItem.offsetTop}px)` }}>...</div>

// v2 (New)
<div 
  ref={virtualItem.measureRef} // <--- Required!
  style={{ transform: `translateY(${virtualItem.offsetTop}px)` }}
>
  ...
</div>
```

## 🗺️ Roadmap & Support

Here's what's planned for the future of `react-simple-virtualize`.

- [x] **Fixed Height Lists:** Initial release with core virtualization logic. (v1.0)
- [x] **Dynamic Height Lists:** Support for items with variable heights using a measurement ref. (v2.0) 🚀
- [ ] **Horizontal Virtualization:** Support for row-based scrolling.
- [ ] **Grid Virtualization:** Virtualize both rows and columns (spreadsheet style).
- [ ] **Window Scrolling:** Support for using the browser's native scrollbar instead of a container.
- [ ] **Infinite Loader:** Built-in support for loading more data as you scroll (Pagination).

> **Note:** If you have a specific feature request, feel free to open an issue!

### ☕ Support the Development

If this package saved you time or if you want to speed up the development of **Dynamic Height** support, consider buying me a coffee. It helps keep the project alive and maintained!

<a href="https://www.buymeacoffee.com/obceylan" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

## 📄 License

MIT © Ozan Batuhan Ceylan