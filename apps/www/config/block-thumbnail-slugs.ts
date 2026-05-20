/**
 * Maps block slug → `componentDemos` key for `/blocks` index card previews.
 * Detail pages use the block slug directly; only override when the index crop
 * needs a simpler frame (e.g. hide marquee rows).
 */
export const BLOCK_THUMBNAIL_SLUG: Partial<Record<string, string>> = {
  "hero-logo-marquee": "hero-logo-marquee-thumbnail",
};
