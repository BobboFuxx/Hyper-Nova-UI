import { useBalances } from "../hooks/useBalances";

export default function Balances() {
  const { balances, loading } = useBalances();

  if (loading) {
    return <div className="p-4 text-gray-400">Loading balances...</div>;
  }

  return (
    <div className="p-4 bg-gray-900 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Balances</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="text-left py-2">Asset</th>
            <th className="text-right py-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((bal) => (
            <tr key={bal.denom} className="border-b border-gray-800">
              <td className="py-2">{bal.denom.toUpperCase()}</td>
              <td className="py-2 text-right">{bal.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
