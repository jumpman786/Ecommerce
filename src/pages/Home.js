// pages/Home.js
// Fully tree-driven page - zero hardcoding, atomic-level customization
import React, { useEffect } from 'react';
import { TreeRoot } from '../agent';
import { posthog } from '../lib/posthog';

/**
 * HomeScreen - Pure Tree Renderer
 * 
 * The entire page is rendered from the UI tree.
 * The AI agent can customize ANY component at the atomic level:
 * - Modify any Text: modify_component("banner-title", {content: "SALE"})
 * - Modify any Image: modify_component("product-1-image", {source: "new.jpg"})
 * - Add any component: add_component("main-banner", "Badge", {text: "NEW"})
 * - Reorder sections: reorder_components("main-content", [...])
 */
const HomeScreen = () => {
  useEffect(() => {
    posthog.capture('home_page_viewed', { section: 'home' });
  }, []);

  // Render entire page from tree - that's it!
  return <TreeRoot />;
};

export default HomeScreen;
