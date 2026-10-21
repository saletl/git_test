import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PxBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Layout {
  matrix: DOMMatrix | null;
  origin: { x: number; y: number };
}

/**
 * Maps rectangles in an SVG's own coordinates to pixel boxes inside a container,
 * so real HTML buttons (with focus rings and screen-reader labels) can sit exactly over the artwork.
 */
export function useSvgLayout(svgRef: RefObject<SVGGraphicsElement | null>, containerRef: RefObject<HTMLElement | null>) {
  const [layout, setLayout] = useState<Layout>({ matrix: null, origin: { x: 0, y: 0 } });

  useLayoutEffect(() => {
    const measure = () => {
      const svg = svgRef.current;
      const container = containerRef.current;
      if (!svg || !container) return;
      const matrix = svg.getScreenCTM();
      const rect = container.getBoundingClientRect();
      setLayout({ matrix: matrix ? DOMMatrix.fromMatrix(matrix) : null, origin: { x: rect.left, y: rect.top } });
    };
    measure();
    const container = containerRef.current;
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (container && observer) observer.observe(container);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
    };
  }, [svgRef, containerRef]);

  const toPx = useCallback(
    (box: Box): PxBox | null => {
      const m = layout.matrix;
      if (!m) return null;
      const a = new DOMPoint(box.x, box.y).matrixTransform(m);
      const b = new DOMPoint(box.x + box.w, box.y + box.h).matrixTransform(m);
      return {
        left: Math.min(a.x, b.x) - layout.origin.x,
        top: Math.min(a.y, b.y) - layout.origin.y,
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
      };
    },
    [layout],
  );

  return toPx;
}

export function pxStyle(box: PxBox | null, pad = 0): React.CSSProperties {
  if (!box) return { display: 'none' };
  return { left: box.left - pad, top: box.top - pad, width: box.width + pad * 2, height: box.height + pad * 2 };
}
