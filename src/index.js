import { useState, useMemo } from 'react';

export const useVirtualizer = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const { virtualItems, totalHeight } = useMemo(() => {
    const rangeStart = Math.floor(scrollTop / itemHeight);
    const rangeEnd = Math.min(
      itemCount - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );

    const startIndex = Math.max(0, rangeStart - overscan);
    const endIndex = Math.min(itemCount - 1, rangeEnd + overscan);

    const virtualItems = [];
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }

    const totalHeight = itemCount * itemHeight;

    return { virtualItems, totalHeight };
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  return {
    virtualItems,
    totalHeight,
    onScroll,
  };
};