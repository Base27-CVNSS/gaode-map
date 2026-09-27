import * as React from 'react';

export interface LayerGroupProps {
  children?: React.ReactNode;
  visible?: boolean;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Logical overlay group implemented at React level.
 * It is engine-safe and can group any declarative overlay.
 */
export function LayerGroup({
  children,
  visible = true,
  zoom,
  minZoom,
  maxZoom,
}: LayerGroupProps) {
  if (!visible) return null;
  if (zoom != null && minZoom != null && zoom < minZoom) return null;
  if (zoom != null && maxZoom != null && zoom > maxZoom) return null;
  return <>{children}</>;
}

export default LayerGroup;
