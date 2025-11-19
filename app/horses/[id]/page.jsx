"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import Image from "next/image";

export default function HorseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchHorse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchHorse = async () => {
    try {
      const res = await fetch(`/api/horses/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setHorse(data);
      } else {
        toast.error("Horse not found");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching horse:", error);
      toast.error("Failed to load horse");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/horses/${params.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Horse deleted successfully");
        router.push("/dashboard/vet");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete horse");
      }
    } catch (error) {
      console.error("Error deleting horse:", error);
      toast.error("An error occurred");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading horse details...</p>
        </div>
      </div>
    );
  }

  if (!horse) {
    return null;
  }

  const isVet = session?.user?.role === "VET";
  const backUrl = isVet ? "/dashboard/vet" : "/dashboard/owner";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={backUrl}>
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{horse.name}</h1>
              <p className="text-sm text-gray-600">
                {horse.breed || "Unknown breed"}
              </p>
            </div>
          </div>
          {isVet && (
            <div className="flex gap-2">
              <Link href={`/horses/${horse.id}/edit`}>
                <Button variant="outline" size="sm">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Horse Image & Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="overflow-hidden">
              {horse.imageUrl ? (
                <div className="relative w-full h-64">
                  <Image
                    src={horse.imageUrl}
                    alt={horse.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-purple-300"
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
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge
                      variant={
                        horse.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {horse.status}
                    </Badge>
                  </div>
                  {horse.age && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Age</span>
                      <span className="font-medium">{horse.age} years</span>
                    </div>
                  )}
                  {horse.color && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Color</span>
                      <span className="font-medium">{horse.color}</span>
                    </div>
                  )}
                  {horse.sex && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sex</span>
                      <span className="font-medium capitalize">
                        {horse.sex.toLowerCase()}
                      </span>
                    </div>
                  )}
                  {horse.microchip && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Microchip</span>
                      <span className="font-mono text-xs">
                        {horse.microchip}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Owners */}
            {horse.owners && horse.owners.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Owners</h3>
                <div className="space-y-3">
                  {horse.owners.map((ownership) => (
                    <div key={ownership.id} className="text-sm">
                      <p className="font-medium">{ownership.owner.name}</p>
                      <p className="text-gray-600">{ownership.owner.email}</p>
                      {ownership.owner.phone && (
                        <p className="text-gray-600">{ownership.owner.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Tabs Content */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Horse Information</h2>

              {/* Placeholder for Phase 6 */}
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Coming in Phase 6
                  </h3>
                  <p className="text-sm text-blue-700">
                    Medical records and vaccination tracking will be available
                    soon.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {horse.medicalRecords?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Medical Records</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {horse.vaccinations?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Vaccinations</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {horse.documents?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Documents</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              Delete {horse.name}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete <strong>{horse.name}</strong>?
                  This action cannot be undone.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-amber-900 mb-1">
                    This will permanently delete:
                  </p>
                  <ul className="list-disc list-inside text-amber-800 space-y-1">
                    <li>
                      All medical records ({horse.medicalRecords?.length || 0})
                    </li>
                    <li>
                      All vaccinations ({horse.vaccinations?.length || 0})
                    </li>
                    <li>All documents ({horse.documents?.length || 0})</li>
                    <li>Ownership history</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Horse
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
