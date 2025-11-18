"use client";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

export default function OwnerDashboard() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <Link href="/dashboard">
                <Image
                  src="/vetsense_logo.jpg"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="object-contain rounded-full"
                />
              </Link>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">VETSENSE</h1>
              <p className="text-xs text-gray-600">Owner Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {session?.user?.title}. {session?.user?.name}
              </p>
              <Badge className="text-xs">OWNER</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {session?.user?.title}. {session?.user?.name.split(" ")[0]}
            !
          </h2>
          <p className="text-gray-600">
            View your horses, medical records, and vaccination schedules.
          </p>
        </div>

        {/* Empty State */}
        <Card className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Horses Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your veterinarian hasn&apos;t assigned any horses to your account
            yet. Once they add horses and assign ownership, you&apos;ll see them
            here.
          </p>
          <p className="text-sm text-gray-500">
            Phase 5 will enable full horse viewing and document access for
            owners.
          </p>
        </Card>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What You Can Do</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View all your horses&apos; profiles</li>
                  <li>• Access medical records (read-only)</li>
                  <li>• Check vaccination schedules</li>
                  <li>• Download official documents</li>
                  <li>• Receive vaccination reminders</li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Contact your veterinarian for any questions about your horses
                  or to request access.
                </p>
                <div className="text-sm text-gray-600">
                  <p>📞 07067677446</p>
                  <p>✉ Vetsense.equinecare@gmail.com</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Status Banner */}
        <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">
                Owner Portal Active
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                ✅ Phase 2 Complete - You&apos;re logged in as a horse owner.
                Full horse viewing and document access will be enabled in Phase
                5.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
