import Link from "next/link";

export default function Home() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl font-bold">Welcome to Hyper-Nova</h1>
      <div className="flex flex-col space-y-2">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Dashboard
        </Link>
        <Link href="/bridge" className="text-blue-600 hover:underline">
          Bridge / IBC
        </Link>
        <Link href="/market/BTC/USD" className="text-blue-600 hover:underline">
          Market: BTC/USD
        </Link>
      </div>
    </div>
  );
}
