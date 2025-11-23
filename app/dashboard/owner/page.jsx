"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchHorses();
  }, []);

  const fetchHorses = async () => {
    try {
      const res = await fetch("/api/horses");
      const data = await res.json();
      console.log(data);

      setHorses(data);
    } catch (error) {
      console.error("Error fetching horses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Get next upcoming vaccination for a horse
  const getNextVaccination = (horse) => {
    if (!horse.vaccinations || horse.vaccinations.length === 0) {
      return null;
    }

    const upcoming = horse.vaccinations
      .filter((v) => new Date(v.nextDue) > new Date())
      .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));

    return upcoming[0] || null;
  };

  // Calculate days until vaccination
  const getDaysUntil = (date) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getInitials = () => {
    return session?.user?.name?.charAt(0).toUpperCase() || "O";
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
              <p className="text-xs text-gray-600">Owner Dashboard</p>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {session?.user?.title}. {session?.user?.name}
              </p>
              <Badge variant="secondary" className="text-xs">
                OWNER
              </Badge>
            </div>
            <Link href={`/dashboard/owner/profile`}>
              <Button size="sm">Profile</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>

          {/* Mobile View - Hamburger Menu */}
          <div className="md:hidden relative">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center hover:bg-purple-700 transition-colors"
            >
              {getInitials()}
            </button>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMobileMenuOpen(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">
                      {session?.user?.title}. {session?.user?.name}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-2">
                      OWNER
                    </Badge>
                  </div>
                  <div className="p-2">
                    <Link href={`/dashboard/owner/profile`} className="block">
                      <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </Button>
                    </Link>
                  </div>
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {session?.user?.title}. {session?.user?.name}!
          </h2>
          <p className="text-gray-600">
            View your horses, medical records, and vaccination schedules.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">My Horses</p>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-purple-600"
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
            </div>
            <p className="text-3xl font-bold">{horses.length}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Medical Records</p>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {horses.reduce(
                (sum, h) => sum + (h._count?.medicalRecords || 0),
                0
              )}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Vaccinations</p>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {horses.reduce(
                (sum, h) => sum + (h._count?.vaccinations || 0),
                0
              )}
            </p>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-start gap-3">
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
            <div className="flex items-start gap-3">
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

        {/* Horse List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your horses...</p>
          </div>
        ) : horses.length === 0 ? (
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
              yet. Once they add horses and assign ownership, you&apos;ll see
              them here.
            </p>
            <div className="text-sm text-gray-500">
              <p>Contact VETSENSE to get your horses added:</p>
              <p className="mt-2">📞 07067677446</p>
            </div>
          </Card>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4">My Horses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {horses.map((horse) => {
                const nextVaccination = getNextVaccination(horse);
                const daysUntil = nextVaccination
                  ? getDaysUntil(nextVaccination.nextDue)
                  : null;

                return (
                  <Card
                    key={horse.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {horse.imageUrl ? (
                      <Image
                        src={horse.imageUrl}
                        alt={horse.name}
                        className="w-full h-48 object-cover"
                        width={200}
                        height={200}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <svg
                          className="w-20 h-20 text-purple-300"
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
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold">{horse.name}</h3>
                        <Badge
                          variant={
                            horse.status === "ACTIVE" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {horse.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {horse.breed || "Unknown breed"} •{" "}
                        {horse.age ? `${horse.age} years` : "Age unknown"}
                      </p>

                      {/* Vaccination Reminder */}
                      {nextVaccination && (
                        <div
                          className={`mt-4 p-3 rounded ${
                            daysUntil <= 7
                              ? "bg-red-50 border border-red-200"
                              : daysUntil <= 30
                              ? "bg-yellow-50 border border-yellow-200"
                              : "bg-green-50 border border-green-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <svg
                              className={`w-4 h-4 ${
                                daysUntil <= 7
                                  ? "text-red-600"
                                  : daysUntil <= 30
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="text-sm font-semibold">
                              Next Vaccination
                            </p>
                          </div>
                          <p className="text-xs text-gray-700">
                            {nextVaccination.vaccineName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {daysUntil > 0
                              ? `Due in ${daysUntil} day${
                                  daysUntil !== 1 ? "s" : ""
                                }`
                              : daysUntil === 0
                              ? "Due today!"
                              : `Overdue by ${Math.abs(daysUntil)} day${
                                  Math.abs(daysUntil) !== 1 ? "s" : ""
                                }`}
                          </p>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 mb-4">
                        <span>
                          📋 {horse._count?.medicalRecords || 0} records
                        </span>
                        <span>
                          💉 {horse._count?.vaccinations || 0} vaccines
                        </span>
                      </div>
                      <Link href={`/horses/${horse.id}`}>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
