import type { Rider } from "@/domain";

export function RidersPanel({ riders }: { riders: Rider[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 p-4">
      <h2 className="mb-3 text-lg font-semibold">Riders</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="pb-2 font-medium">Rider</th>
            <th className="pb-2 font-medium">Location</th>
            <th className="pb-2 font-medium">Availability</th>
          </tr>
        </thead>
        <tbody>
          {riders.map((rider) => (
            <tr key={rider.id} className="border-t border-zinc-100">
              <td className="py-2">
                {rider.name}
                <span className="ml-2 text-xs text-zinc-400">{rider.id}</span>
              </td>
              <td className="py-2 font-mono">
                ({rider.location.x}, {rider.location.y})
              </td>
              <td className="py-2">
                {rider.isAvailable ? (
                  <span className="text-emerald-700">available</span>
                ) : (
                  <span className="text-rose-700">on delivery</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
