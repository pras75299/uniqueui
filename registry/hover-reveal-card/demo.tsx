// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "hover-reveal-card": ({ theme = "dark" }) => (
    <div className="flex flex-wrap gap-6 items-start justify-center p-10">
      <HoverRevealCard
        theme={theme}
        image="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80"
        imageAlt="People at a conference table"
        tag="AI"
        title="AI for inclusive growth: Leadership lessons from Davos"
        subtitle="Article"
        description="What are the practical ways to ensure AI expands opportunity, strengthens resilience and supports a more inclusive, equitable future?"
        ctaText="Read the article →"
        accentColor="#6366f1"
        imageHeight={220}
        className="w-72"
      />
    </div>
  )} as const;
