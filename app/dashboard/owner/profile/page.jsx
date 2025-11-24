"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, PawPrint, Activity } from "lucide-react";
import toast from "react-hot-toast";

const OwnerProfile = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;

    async function loadUserProfile() {
      try {
        // Owner fetches their own profile
        const res = await fetch(`/api/owner/profile`);
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">Profile not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/owner">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </Link>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">
                  {user.title}. {user.name}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href={`/dashboard/owner/profile/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" /> Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* USER INFO */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">
                {user.title ? `${user.title}. ${user.name}` : user.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{user.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{user.address || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">State</p>
              <p className="font-medium">{user.state || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Country</p>
              <p className="font-medium">{user.country}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* OWNED HORSES */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PawPrint className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold">My Horses</h2>
          </div>

          {user.ownedHorses?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No horses registered yet.</p>
              <p className="text-sm text-gray-400">
                Contact your veterinarian to register your horses.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.ownedHorses?.map((own) => (
                <div
                  key={own.id}
                  className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-lg">{own.horse.name}</p>
                    <p className="text-sm text-gray-600">
                      {own.horse.breed} • {own.horse.age} years •{" "}
                      {own.horse.color} • {own.horse.sex}
                    </p>
                    {own.startDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Owned since:{" "}
                        {new Date(own.startDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Link href={`/horses/${own.horse.id}`}>
                    <Button variant="outline" size="sm">
                      View Horse
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default OwnerProfile;
