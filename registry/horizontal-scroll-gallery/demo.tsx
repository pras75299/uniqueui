// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "horizontal-scroll-gallery": ({ theme = "dark" }) => (
    <HorizontalScrollGallery
      theme={theme}
      items={[
        <Image
          key="1"
          src="https://images.unsplash.com/photo-1681935396624-006f4acdc530?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Landscape 1"
          width={1200}
          height={900}
          className="object-cover w-full h-full"
          unoptimized
        />,
        <Image
          key="2"
          src="https://images.unsplash.com/photo-1775059956734-78ffd2075cec?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Landscape 2"
          width={1200}
          height={900}
          className="object-cover w-full h-full"
          unoptimized
        />,
        <Image
          key="3"
          src="https://images.unsplash.com/photo-1722152246589-23370458081f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Landscape 3"
          width={1200}
          height={900}
          className="object-cover w-full h-full"
          unoptimized
        />,
        <div
          key="4"
          className={cn(
            "w-full h-full flex items-center justify-center p-8 text-center",
            theme === "dark"
              ? "bg-neutral-900 text-white"
              : "bg-neutral-200 text-neutral-900",
          )}
        >
          <h3 className="text-4xl font-bold">End of Gallery</h3>
        </div>,
      ]}
    />
  )} as const;
