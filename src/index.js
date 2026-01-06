import { useState, useMemo } from 'react';

export const useVirtualize = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3
}) => {
  // Store the current scroll position
  const [scrollTop, setScrollTop] = useState(0);

  // Update scroll position on scroll event
  const onScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Memoize calculations to prevent unnecessary re-renders
  const { virtualItems, totalHeight } = useMemo(() => {
    // 1. Calculate the visible range based on scroll position
    const rangeStart = Math.floor(scrollTop / itemHeight);
    const rangeEnd = Math.min(
      itemCount - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );

    // 2. Add overscan (buffer) to the range for smoother scrolling
    const startIndex = Math.max(0, rangeStart - overscan);
    const endIndex = Math.min(itemCount - 1, rangeEnd + overscan);

    // 3. Generate the array of items to be rendered
    const virtualItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        offsetTop: i * itemHeight, // Calculate absolute position for each item
      });
    }

    // 4. Calculate total phantom height to maintain scrollbar size
    const totalHeight = itemCount * itemHeight;

    return { virtualItems, totalHeight };
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  return {
    virtualItems,
    totalHeight,
    onScroll,
  };
};