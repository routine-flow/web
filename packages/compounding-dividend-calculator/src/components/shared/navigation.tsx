"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "배당 계산기" },
    { href: "/backtesting", label: "백테스팅" },
  ];

  return (
    <nav className="w-full bg-white shadow-md mb-4">
      <div className="flex overflow-x-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`py-3 px-4 flex-shrink-0 font-medium transition-colors duration-200 ${
                isActive
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
