// src/app/dashboard/page.js
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignOut } from "@/components/auth/sign-out";
import Link from "next/link";

// Admin Dashboard Data
async function getAdminDashboardData() {
  const [horses, clients, vets, recentHorses] = await Promise.all([
    prisma.horse.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.user.count({ where: { role: "VET" } }),
    prisma.horse.findMany({
      take: 5,
      include: {
        owner: { select: { name: true } },
        vet: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { horses, clients, vets, recentHorses };
}

// Vet Dashboard Data
async function getVetDashboardData(userId) {
  const [myHorses, clients, dueVaccinations, recentMedical] = await Promise.all(
    [
      prisma.horse.count({ where: { vetId: userId } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.vaccination.count({
        where: {
          nextDue: {
            lte: new Date(new Date().setDate(new Date().getDate() + 30)),
          },
          horse: { vetId: userId },
        },
      }),
      prisma.medicalRecord.findMany({
        where: { vetId: userId },
        take: 5,
        include: {
          horse: { select: { name: true } },
        },
        orderBy: { date: "desc" },
      }),
    ]
  );

  return { myHorses, clients, dueVaccinations, recentMedical };
}

// Client Dashboard Data
async function getClientDashboardData(userId) {
  const [myHorses, upcomingVaccinations, recentVisits] = await Promise.all([
    prisma.horse.findMany({
      where: { ownerId: userId },
      include: {
        vet: { select: { name: true } },
        vaccinations: {
          where: {
            nextDue: {
              gte: new Date(),
            },
          },
          take: 3,
          orderBy: { nextDue: "asc" },
        },
      },
    }),
    prisma.vaccination.count({
      where: {
        horse: { ownerId: userId },
        nextDue: {
          lte: new Date(new Date().setDate(new Date().getDate() + 30)),
        },
      },
    }),
    prisma.medicalRecord.findMany({
      where: { horse: { ownerId: userId } },
      take: 5,
      include: {
        vet: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  return { myHorses, upcomingVaccinations, recentVisits };
}

// Admin Dashboard Component
function AdminDashboard({ data, userName }) {
  const { horses, clients, vets, recentHorses } = data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {userName} 👑
          </h1>
          <p className="text-gray-600">Practice Administration Dashboard</p>
        </div>
        <SignOut />
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600">Total Horses</h3>
                <p className="text-3xl font-bold text-gray-900">{horses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600">Clients</h3>
                <p className="text-3xl font-bold text-gray-900">{clients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-purple-600"
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
              </div>
              <div>
                <h3 className="font-semibold text-gray-600">Veterinarians</h3>
                <p className="text-3xl font-bold text-gray-900">{vets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Horses & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recently Added Horses</h2>
              <Link href="/horses">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentHorses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No horses registered yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentHorses.map((horse) => (
                  <Link key={horse.id} href={`/horses/${horse.id}`}>
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {horse.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {horse.breed} • Owner: {horse.owner.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Vet: {horse.vet.name}
                        </p>
                        <p className="text-xs text-primary-600 font-medium">
                          {horse.passportNumber}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/horses/new">
                <Button className="w-full h-16 flex-col">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Horse
                </Button>
              </Link>
              <Link href="/clients/new">
                <Button className="w-full h-16 flex-col">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Add Client
                </Button>
              </Link>
              <Link href="/horses">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Manage Horses
                </Button>
              </Link>
              <Link href="/clients">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Manage Clients
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Vet Dashboard Component
function VetDashboard({ data, userName }) {
  const { myHorses, clients, dueVaccinations, recentMedical } = data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {userName} 🩺
          </h1>
          <p className="text-gray-600">Your veterinary practice dashboard</p>
        </div>
        <SignOut />
      </div>

      {/* Vet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600">My Patients</h3>
                <p className="text-3xl font-bold text-gray-900">{myHorses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-orange-600"
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
              <div>
                <h3 className="font-semibold text-gray-600">
                  Due Vaccinations
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {dueVaccinations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600">Total Clients</h3>
                <p className="text-3xl font-bold text-gray-900">{clients}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Medical & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Medical Records</h2>
              <Link href="/medical">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentMedical.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No medical records yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentMedical.map((record) => (
                  <div key={record.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {record.horse.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {record.diagnosis}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/horses/new">
                <Button className="w-full h-16 flex-col">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Horse
                </Button>
              </Link>
              <Link href="/medical/new">
                <Button className="w-full h-16 flex-col">
                  <svg
                    className="w-5 h-5 mb-1"
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
                  Add Record
                </Button>
              </Link>
              <Link href="/horses">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <svg
                    className="w-5 h-5 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  My Patients
                </Button>
              </Link>
              <Link href="/vaccinations">
                <Button variant="outline" className="w-full h-16 flex-col">
                  <svg
                    className="w-5 h-5 mb-1"
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
                  Vaccinations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Client Dashboard Component
function ClientDashboard({ data, userName }) {
  const { myHorses, upcomingVaccinations, recentVisits } = data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {userName} 👋
          </h1>
          <p className="text-gray-600">Your horse management dashboard</p>
        </div>
        <SignOut />
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600">My Horses</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {myHorses.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-orange-600"
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
              <div>
                <h3 className="font-semibold text-gray-600">
                  Due Vaccinations
                </h3>
                <p className="text-3xl font-bold text-orange-600">
                  {upcomingVaccinations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600">Recent Visits</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {recentVisits.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Horses & Recent Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">My Horses</h2>
              <Link href="/my-horses">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {myHorses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">
                  You don&apos;t have any horses registered yet
                </p>
                <Link href="/contact">
                  <Button>Contact Us to Register</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myHorses.map((horse) => (
                  <Link key={horse.id} href={`/my-horses/${horse.id}`}>
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {horse.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {horse.breed} • Vet: {horse.vet.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {horse.vaccinations.length} vaccinations
                        </p>
                        <p className="text-xs text-primary-600 font-medium">
                          {horse.passportNumber}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Recent Veterinary Visits
              </h2>
              <Link href="/medical-history">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentVisits.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent visits</p>
            ) : (
              <div className="space-y-4">
                {recentVisits.map((visit) => (
                  <div key={visit.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        Health Check
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(visit.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {visit.vet.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Dashboard Page
export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  let dashboardData;
  let DashboardComponent;

  switch (session.user.role) {
    case "ADMIN":
      dashboardData = await getAdminDashboardData();
      DashboardComponent = AdminDashboard;
      break;
    case "VET":
      dashboardData = await getVetDashboardData(session.user.id);
      DashboardComponent = VetDashboard;
      break;
    case "CLIENT":
      dashboardData = await getClientDashboardData(session.user.id);
      DashboardComponent = ClientDashboard;
      break;
    default:
      redirect("/auth/signin");
  }

  return (
    <div className="p-6">
      <DashboardComponent data={dashboardData} userName={session.user.name} />
    </div>
  );
}
