import { UIEvent } from 'react';

export interface VirtualItem {
  index: number;
  offsetTop: number;
}

export interface UseVirtualizerOptions {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export interface UseVirtualizerResult {
  virtualItems: VirtualItem[];
  totalHeight: number;
  onScroll: (e: UIEvent<HTMLElement>) => void;
}

export declare function useVirtualizer(options: UseVirtualizerOptions): UseVirtualizerResult;