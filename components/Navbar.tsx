import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  const navItems = [
    { name: "Spot", path: "/" },
    { name: "Perps", path: "/perps" },
    { name: "Prelaunch", path: "/prelaunch" },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Left side navigation */}
          <div className="flex space-x-6">
            {navItems.map((item) => {
              const active = router.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    active
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
