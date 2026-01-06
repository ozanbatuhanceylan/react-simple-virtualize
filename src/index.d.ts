export function useVirtualize({ itemCount, itemHeight, containerHeight, overscan }: {
    itemCount: any;
    itemHeight: any;
    containerHeight: any;
    overscan?: number;
}): {
    virtualItems: any;
    totalHeight: any;
    onScroll: (e: any) => void;
};
