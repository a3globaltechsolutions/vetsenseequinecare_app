"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import Image from "next/image";

export default function OwnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOwner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchOwner = async () => {
    try {
      const res = await fetch(`/api/users/owners/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOwner(data);
      } else {
        toast.error("Owner not found");
        router.push("/dashboard/vet/owners");
      }
    } catch (error) {
      console.error("Error fetching owner:", error);
      toast.error("Failed to load owner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${owner.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/users/owners/${params.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Owner deleted successfully");
        router.push("/dashboard/vet/owners");
      } else {
        toast.error(data.error || "Failed to delete owner");
      }
    } catch (error) {
      console.error("Error deleting owner:", error);
      toast.error("An error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const formatOwnerName = (owner) => {
    return owner.title ? `${owner.title} ${owner.name}` : owner.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading owner details...</p>
        </div>
      </div>
    );
  }

  if (!owner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/vet/owners">
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {formatOwnerName(owner)}
              </h1>
              <p className="text-sm text-gray-600">Owner Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/vet/owners/${owner.id}/edit`}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Owner Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {formatOwnerName(owner)}
                  </h2>
                  <Badge variant="secondary">OWNER</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{owner.email}</p>
                </div>
                {owner.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{owner.phone}</p>
                  </div>
                )}
                {(owner.address || owner.state || owner.country) && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">
                      {[owner.address, owner.state, owner.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {new Date(owner.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Horses Owned</p>
                  <p className="font-medium">
                    {owner.ownedHorses?.length || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Horses */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Owned Horses</h3>

              {owner.ownedHorses && owner.ownedHorses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {owner.ownedHorses.map((ownership) => (
                    <Card
                      key={ownership.id}
                      className="p-4 hover:shadow-lg transition-shadow"
                    >
                      {ownership.horse.imageUrl ? (
                        <Image
                          src={ownership.horse.imageUrl}
                          alt={ownership.horse.name}
                          width={300}
                          height={200}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded mb-3 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-purple-300"
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
                      <h4 className="font-bold mb-1">{ownership.horse.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {ownership.horse.breed || "Unknown breed"}
                      </p>
                      <Link href={`/horses/${ownership.horse.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          View Horse
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
                  <p className="text-lg font-medium mb-2">No horses assigned</p>
                  <p className="text-sm">
                    Assign horses to this owner from the horse detail page
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
