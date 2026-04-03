type Prop = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

/**
 * Shared props reference table used by both the component page and docs page.
 * Pass `showDefault` on the docs page to include the Default column.
 */
export default function PropsTable({
  props,
  showDefault = false,
}: {
  props: Prop[];
  showDefault?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3 font-medium">Prop</th>
              <th className="px-4 py-3 font-medium">Type</th>
              {showDefault && (
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Default</th>
              )}
              <th className="px-4 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {props.map((prop, idx) => (
              <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                <td className="px-4 py-3 border-r border-neutral-100 dark:border-neutral-800/50">
                  <code className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-400/10 px-1.5 py-0.5 rounded text-xs">
                    {prop.name}
                  </code>
                </td>
                <td className="px-4 py-3 border-r border-neutral-100 dark:border-neutral-800/50">
                  <code className="text-blue-600 dark:text-blue-400/80 bg-blue-50 dark:bg-blue-400/10 px-1.5 py-0.5 rounded text-xs break-all">
                    {prop.type}
                  </code>
                </td>
                {showDefault && (
                  <td className="px-4 py-3 border-r border-neutral-100 dark:border-neutral-800/50 hidden sm:table-cell">
                    {prop.default ? (
                      <code className="text-neutral-500 text-xs">{prop.default}</code>
                    ) : (
                      <span className="text-neutral-300 dark:text-neutral-700 text-xs">—</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 text-sm">
                  {prop.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
