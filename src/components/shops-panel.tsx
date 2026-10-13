import type { Shop } from "@/domain";

export function ShopsPanel({ shops }: { shops: Shop[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 p-4">
      <h2 className="mb-3 text-lg font-semibold">Shops</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="pb-2 font-medium">Shop</th>
            <th className="pb-2 font-medium">Location</th>
          </tr>
        </thead>
        <tbody>
          {shops.map((shop) => (
            <tr key={shop.id} className="border-t border-zinc-100">
              <td className="py-2">
                {shop.name}
                <span className="ml-2 text-xs text-zinc-400">{shop.id}</span>
              </td>
              <td className="py-2 font-mono">
                ({shop.location.x}, {shop.location.y})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
