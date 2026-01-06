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
import { useVirtualizer } from 'react-simple-virtualize';

const MyLargeList = () => {
  // 1. Setup your data
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);
  
  // 2. Define dimensions
  const containerHeight = 500;
  const itemHeight = 50;

  // 3. Initialize the hook
  const { virtualItems, totalHeight, onScroll } = useVirtualizer({
    itemCount: items.length,
    itemHeight,
    containerHeight,
    overscan: 5, // Optional: Number of items to render outside viewport
  });

  return (
    // Outer Container: Needs fixed height & overflow-y: auto
    <div
      onScroll={onScroll}
      style={{
        height: containerHeight,
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid #ccc'
      }}
    >
      {/* Inner Container: Sets the scrollable height */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        
        {/* Render only visible items */}
        {virtualItems.map(({ index, offsetTop }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: itemHeight,
              transform: `translateY(${offsetTop}px)`, // Crucial for positioning
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 10,
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

### `useVirtualizer(options)`

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `itemCount` | `number` | Yes | Total number of items in the list. |
| `itemHeight` | `number` | Yes | Height of a single item in pixels. |
| `containerHeight` | `number` | Yes | Height of the visible scroll area (viewport). |
| `overscan` | `number` | No | Number of extra items to render above/below the visible area (Default: 3). |

### Returns

| Value | Type | Description |
| :--- | :--- | :--- |
| `virtualItems` | `array` | Array of items to be rendered. Each item contains `{ index, offsetTop }`. |
| `totalHeight` | `number` | Total height of the list (used for the inner container). |
| `onScroll` | `function` | Event handler to be attached to the outer container's `onScroll`. |

## 🗺️ Roadmap & Support

Currently, this package is optimized for **Fixed Height** lists.
I am actively working on the following features for the next major release:

- [ ] **Dynamic Height Support:** For items with variable content (chat bubbles, feeds).
- [ ] **Grid Virtualization:** Virtualizing both rows and columns.
- [ ] **Horizontal Scrolling:** Support for X-axis virtualization.

### ☕ Support the Development

If this package saved you time or if you want to speed up the development of **Dynamic Height** support, consider buying me a coffee. It helps keep the project alive and maintained!

<a href="https://www.buymeacoffee.com/obceylan" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

## 📄 License

MIT © Ozan Batuhan Ceylan