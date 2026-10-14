# Project architecture

- Keep editorial hero imagery and motion in FashionHero, using store settings for content and optional image overrides; this isolates presentation from commerce state.
- Use the shared motion preference for automatic editorial transitions and pointer effects; accessibility must cover CSS and JavaScript motion.
- Product cards display only catalogue images and retain cart/wishlist context actions; campaign imagery must never stand in for merchandise.