import {
  useState,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
  UIEvent,
} from "react";

export interface UseVirtualizeProps {
  /** Total number of items in the list */
  itemCount: number;
  /** Estimated height of a single item (used for unmeasured items) */
  itemHeight: number;
  /** Number of extra items to render outside the visible view (default: 3) */
  overscan?: number;
  /** Fixed container height. If not provided, it will be measured automatically via ResizeObserver */
  containerHeight?: number;
}

export interface VirtualItem {
  /** The index of the item in the original data array */
  index: number;
  /** The calculated top position (px) for absolute positioning */
  offsetTop: number;
  /** Callback ref to measure the actual DOM height of the item */
  measureRef: (el: HTMLElement | null) => void;
}

export function useVirtualize({
  itemCount,
  itemHeight: estimatedItemHeight,
  overscan = 3,
  containerHeight: propsContainerHeight,
}: UseVirtualizeProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [observedHeight, setObservedHeight] = useState(0);

  // Determine the effective container height:
  // Use the prop if provided; otherwise, fall back to the measured height.
  const height = propsContainerHeight ?? observedHeight;

  // --- REFS (State that doesn't trigger re-renders) ---

  // Stores the exact height of each measured item: { index: height }
  const measurementCache = useRef({} as Record<number, number>);

  // Stores the calculated total offset for each index: { index: offset }
  // This acts as a Prefix Sum array to avoid recalculating from 0 every time.
  const offsetCache = useRef({} as Record<number, number>);

  // Tracks the last index that has a valid calculated offset in the cache.
  const lastMeasuredIndex = useRef(-1);

  // Reference to the scrollable container (used for ResizeObserver)
  const scrollRef = useRef<HTMLDivElement>(undefined);

  // Total measured height (Pixel)
  const totalMeasuredSize = useRef(0);
  // Total measured element?
  const totalMeasuredCount = useRef(0);

  const [measurementVersion, setMeasurementVersion] = useState(0);

  // --- HELPER: GET ESTIMATED HEIGHT ---
  // Zeka burada: Eğer hiç ölçüm yoksa senin verdiğin 'itemHeight'ı kullan.
  // Ama ölçüm yaptıysak, gerçek ortalamayı kullan.
  const getEstimatedItemHeight = useCallback(() => {
    return totalMeasuredCount.current > 0
      ? totalMeasuredSize.current / totalMeasuredCount.current
      : estimatedItemHeight;
  }, [estimatedItemHeight]);

  // --- 1. AUTO-SIZER LOGIC ---
  useLayoutEffect(() => {
    // If the user provided a fixed height, skip observation to save resources.
    if (propsContainerHeight !== undefined) return;

    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const observer = new ResizeObserver(([entry]) => {
      // Update state only if dimensions actually changed
      if (entry.contentRect.height !== observedHeight) {
        setObservedHeight(entry.contentRect.height);
      }
    });

    observer.observe(scrollElement);

    return () => observer.disconnect();
  }, [propsContainerHeight, observedHeight]);

  // --- 2. OFFSET CALCULATOR (Core Logic) ---
  // Returns the vertical position (px) of an item.
  const getItemOffset = useCallback(
    (index: number) => {
      // If the offset for this index is already cached, return it directly.
      if (index <= lastMeasuredIndex.current) {
        return offsetCache.current[index] || 0;
      }

      // 1. Retrieve reference data from the last measured item.
      const lastIndex = lastMeasuredIndex.current;

      // If no items have been measured yet (-1), the starting offset is 0.
      // Otherwise, retrieve the offset of the last measured item.
      const lastOffset = lastIndex >= 0 ? offsetCache.current[lastIndex] : 0;

      // Retrieve the height of the last measured item (default to 0 if none measured).
      const lastHeight =
        lastIndex >= 0 ? measurementCache.current[lastIndex] : 0;

      // 2. Calculate the bottom position of the last measured item.
      // This serves as the anchor point for estimating subsequent offsets.
      const lastBottom = lastOffset + lastHeight;

      // 3. Calculate how many unmeasured items exist between the last measured index and the target index.
      const unmeasuredCount = index - lastIndex - 1;

      // 4. Result: Anchor Point + (Number of Unmeasured Items * Estimated Height)
      return lastBottom + unmeasuredCount * getEstimatedItemHeight();
    },
    [estimatedItemHeight, getEstimatedItemHeight]
  );

  // --- 3. BINARY SEARCH (Find Visible Index) ---
  // Finds the index corresponding to the current scroll position.
  // Performance: O(log N) - Crucial for large lists.
  const getStartIndexForOffset = useCallback(
    (offset: number) => {
      let low = 0;
      let high = itemCount - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const currentOffset = getItemOffset(mid);
        const currentHeight =
          measurementCache.current[mid] || getEstimatedItemHeight();

        if (currentOffset <= offset && currentOffset + currentHeight > offset) {
          return mid;
        } else if (currentOffset < offset) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      // Fallback to 0 if not found
      return Math.max(0, low - 1);
    },
    [getItemOffset, itemCount, estimatedItemHeight]
  );

  // --- 4. MEASUREMENT CALLBACK (The "Ref" logic) ---
  // This function is passed to the consumer to attach to their DOM elements.
  const measureElement = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (!el) return;

      const measuredHeight = el.getBoundingClientRect().height;
      const prevHeight = measurementCache.current[index];

      if (prevHeight !== measuredHeight) {
        if (prevHeight === undefined) {
          totalMeasuredSize.current += measuredHeight;
          totalMeasuredCount.current += 1;
        } else {
          totalMeasuredSize.current += measuredHeight - prevHeight;
        }

        measurementCache.current[index] = measuredHeight;

        if (index > lastMeasuredIndex.current) {
          const prevOffset = getItemOffset(index);
          offsetCache.current[index] = prevOffset;
          lastMeasuredIndex.current = index;
        } else {
          lastMeasuredIndex.current = Math.min(
            lastMeasuredIndex.current,
            index - 1
          );
        }

        setMeasurementVersion(v => v + 1);
      }
    },
    [getItemOffset]
  );

  // --- 5. RENDER RANGE CALCULATION ---
  const startIndex = getStartIndexForOffset(scrollTop);
  const endIndex = Math.min(
    itemCount - 1,
    getStartIndexForOffset(scrollTop + height) + overscan
  );

  // Generate the virtual items array to be rendered
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];
    for (let i = Math.max(0, startIndex - overscan); i <= endIndex; i++) {
      items.push({
        index: i,
        offsetTop: getItemOffset(i),
        measureRef: measureElement(i),
      });
    }
    return items;
  }, [startIndex, endIndex, getItemOffset, measureElement, overscan]);

  // Calculate total list height for the scrollbar
  const totalHeight = getItemOffset(itemCount);

  return {
    virtualItems,
    totalHeight,
    scrollRef,
    measurementVersion,
    onScroll: (e: UIEvent<HTMLElement>) =>
      setScrollTop(e.currentTarget.scrollTop),
  };
}
