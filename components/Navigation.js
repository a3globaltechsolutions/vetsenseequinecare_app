"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function Navigation() {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-primary-600">
                🐎 VETSENSE
              </span>
            </Link>

            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-900 hover:text-primary-600 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>

              {/* Admin & Vet Navigation */}
              {(session.user.role === "ADMIN" ||
                session.user.role === "VET") && (
                <>
                  <Link
                    href="/horses"
                    className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                  >
                    Horses
                  </Link>
                  <Link
                    href="/clients"
                    className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                  >
                    Clients
                  </Link>
                </>
              )}

              {/* Client Navigation */}
              {session.user.role === "CLIENT" && (
                <Link
                  href="/my-horses"
                  className="text-gray-500 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  My Horses
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {session.user.name} ({session.user.role})
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
