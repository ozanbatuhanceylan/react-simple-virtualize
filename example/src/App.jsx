import React from 'react';
// Importing directly from source instead of NPM for local testing
import { useVirtualize } from '../../src/index'; 

const App = () => {
  // Generate test data with 10,000 items
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);
  
  const containerHeight = 500;
  const itemHeight = 50;

  const { virtualItems, totalHeight, onScroll } = useVirtualize({
    itemCount: items.length,
    itemHeight,
    containerHeight,
    overscan: 5, // Render 5 extra items outside the viewport to prevent flickering
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Virtualization Test</h1>
      <p>The box below contains 10,000 items but keeps the DOM light.</p>

      {/* Outer Container: The scrollable viewport */}
      <div
        onScroll={onScroll}
        style={{
          height: containerHeight,
          overflowY: 'auto',
          position: 'relative',
          border: '2px solid #333',
          width: '300px'
        }}
      >
        {/* Inner Container: Sets the total scrollable height (phantom) */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          
          {/* Render only the visible items */}
          {virtualItems.map(({ index, offsetTop }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: itemHeight,
                transform: `translateY(${offsetTop}px)`, // Position the item absolutely
                background: index % 2 === 0 ? '#e0f7fa' : '#ffffff', // Alternating colors
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '10px',
                boxSizing: 'border-box'
              }}
            >
              {items[index]}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{marginTop: '20px'}}>
        <strong>Rendered DOM nodes:</strong> {virtualItems.length}
      </div>
    </div>
  );
};

export default App;