"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AssignOwnerDialog from "@/components/AssignOwnerDialog";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Medical Records states
  const [medicalSearchTerm, setMedicalSearchTerm] = useState("");
  const [medicalCurrentPage, setMedicalCurrentPage] = useState(1);
  const [deletingMedical, setDeletingMedical] = useState(null);
  const [showDeleteMedicalDialog, setShowDeleteMedicalDialog] = useState(false);
  const [medicalToDelete, setMedicalToDelete] = useState(null);

  // Vaccination states
  const [vaccinationSearchTerm, setVaccinationSearchTerm] = useState("");
  const [vaccinationCurrentPage, setVaccinationCurrentPage] = useState(1);
  const [deletingVaccination, setDeletingVaccination] = useState(null);
  const [showDeleteVaccinationDialog, setShowDeleteVaccinationDialog] =
    useState(false);
  const [vaccinationToDelete, setVaccinationToDelete] = useState(null);

  const itemsPerPage = 2;

  const getInitials = () => {
    return session?.user?.name?.charAt(0).toUpperCase() || " ";
  };

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
      toast.error("An error occurred");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteMedical = async () => {
    if (!medicalToDelete) return;
    setDeletingMedical(medicalToDelete.id);
    try {
      const res = await fetch(
        `/api/horses/${params.id}/medical/${medicalToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        toast.success("Medical record deleted successfully");
        fetchHorse();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete medical record");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeletingMedical(null);
      setShowDeleteMedicalDialog(false);
      setMedicalToDelete(null);
    }
  };

  const handleDeleteVaccination = async () => {
    if (!vaccinationToDelete) return;
    setDeletingVaccination(vaccinationToDelete.id);
    try {
      const res = await fetch(
        `/api/horses/${params.id}/vaccinations/${vaccinationToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        toast.success("Vaccination deleted successfully");
        fetchHorse();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete vaccination");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeletingVaccination(null);
      setShowDeleteVaccinationDialog(false);
      setVaccinationToDelete(null);
    }
  };

  // Filter and paginate medical records
  const filteredMedicalRecords =
    horse?.medicalRecords?.filter(
      (record) =>
        record.diagnosis
          .toLowerCase()
          .includes(medicalSearchTerm.toLowerCase()) ||
        record.treatment.toLowerCase().includes(medicalSearchTerm.toLowerCase())
    ) || [];

  const totalMedicalPages = Math.ceil(
    filteredMedicalRecords.length / itemsPerPage
  );
  const paginatedMedicalRecords = filteredMedicalRecords.slice(
    (medicalCurrentPage - 1) * itemsPerPage,
    medicalCurrentPage * itemsPerPage
  );

  // Filter and paginate vaccinations
  const filteredVaccinations =
    horse?.vaccinations?.filter(
      (vaccination) =>
        vaccination.vaccineName
          .toLowerCase()
          .includes(vaccinationSearchTerm.toLowerCase()) ||
        (vaccination.batchNumber &&
          vaccination.batchNumber
            .toLowerCase()
            .includes(vaccinationSearchTerm.toLowerCase()))
    ) || [];

  const totalVaccinationPages = Math.ceil(
    filteredVaccinations.length / itemsPerPage
  );
  const paginatedVaccinations = filteredVaccinations.slice(
    (vaccinationCurrentPage - 1) * itemsPerPage,
    vaccinationCurrentPage * itemsPerPage
  );

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
      {/* Header - Fixed for better mobile experience */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link href={backUrl} className="shrink-0">
                <Button variant="outline" size="sm" className="h-9 px-3">
                  ← Back
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {horse.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {horse.breed || "Unknown breed"}
                </p>
              </div>
            </div>
            {isVet && (
              <div className="flex items-center gap-2 shrink-0">
                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-2">
                  <AssignOwnerDialog
                    horseId={horse.id}
                    currentOwners={horse.owners || []}
                    onSuccess={fetchHorse}
                  />

                  <Link href={`/horses/${horse.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 h-9"
                    >
                      <svg
                        className="w-4 h-4"
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
                      <span className="hidden xs:inline">Edit</span>
                    </Button>
                  </Link>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center gap-1 h-9"
                  >
                    <svg
                      className="w-4 h-4"
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
                    <span className="hidden xs:inline">Delete</span>
                  </Button>
                </div>

                {/* Mobile Menu */}
                <div className="sm:hidden relative">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center hover:bg-purple-700 transition-colors text-sm"
                  >
                    {getInitials()}
                  </button>

                  {mobileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMobileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
                        <div className="p-3 border-b bg-gray-50">
                          <p className="text-sm font-medium text-gray-900">
                            Horse Actions
                          </p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            VET TOOLS
                          </Badge>
                        </div>
                        <div className="p-1 space-y-1">
                          <div className="px-2 py-1">
                            <AssignOwnerDialog
                              horseId={horse.id}
                              currentOwners={horse.owners || []}
                              onSuccess={fetchHorse}
                            />
                          </div>
                          <Link
                            href={`/horses/${horse.id}/edit`}
                            className="block px-2"
                          >
                            <Button
                              variant="ghost"
                              className="justify-start border w-full text-sm h-9"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Edit Horse
                            </Button>
                          </Link>
                          <div className="px-2">
                            <Button
                              variant="ghost"
                              className="border justify-start bg-red-600 text-white hover:text-red-700 hover:bg-red-50 w-full text-sm h-9"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setShowDeleteDialog(true);
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete Horse
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Better spacing for mobile */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Horse Info */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card className="overflow-hidden">
              {horse.imageUrl ? (
                <div className="relative w-full h-48 sm:h-64">
                  <Image
                    src={horse.imageUrl}
                    alt={horse.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 sm:w-24 sm:h-24 text-purple-300"
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
              <div className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Status
                    </span>
                    <Badge
                      variant={
                        horse.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {horse.status}
                    </Badge>
                  </div>
                  {horse.age && (
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Age
                      </span>
                      <span className="font-medium text-sm sm:text-base">
                        {horse.age} years
                      </span>
                    </div>
                  )}
                  {horse.color && (
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Color
                      </span>
                      <span className="font-medium text-sm sm:text-base">
                        {horse.color}
                      </span>
                    </div>
                  )}
                  {horse.sex && (
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Sex
                      </span>
                      <span className="font-medium text-sm sm:text-base capitalize">
                        {horse.sex.toLowerCase()}
                      </span>
                    </div>
                  )}
                  {horse.microchip && (
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">
                        Microchip
                      </span>
                      <span className="font-mono text-xs">
                        {horse.microchip}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {horse.owners && horse.owners.length > 0 && (
              <Card className="p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">
                  Owners
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {horse.owners.map((ownership) => (
                    <div key={ownership.id} className="text-xs sm:text-sm">
                      <p className="font-medium truncate">
                        {ownership.owner.name}
                      </p>
                      <p className="text-gray-600 truncate">
                        {ownership.owner.email}
                      </p>
                      {ownership.owner.phone && (
                        <p className="text-gray-600 truncate">
                          {ownership.owner.phone}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Content Area */}
          <div className="lg:col-span-2">
            {/* Tabs - Improved mobile scrolling */}
            <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b overflow-x-auto pb-px scrollbar-hide">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "overview"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("medical")}
                className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "medical"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Medical ({horse.medicalRecords?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("vaccinations")}
                className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "vaccinations"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Vaccinations ({horse.vaccinations?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                  activeTab === "documents"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Documents ({horse.documents?.length || 0})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <Card className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                  Horse Information
                </h2>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg sm:text-2xl font-bold text-purple-600">
                      {horse.medicalRecords?.length || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Medical Records
                    </p>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">
                      {horse.vaccinations?.length || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Vaccinations
                    </p>
                  </div>
                  <div className="text-center p-2 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-lg sm:text-2xl font-bold text-green-600">
                      {horse.documents?.length || 0}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Documents
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "medical" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                  {isVet && (
                    <Link
                      href={`/horses/${horse.id}/medical/new`}
                      className="sm:shrink-0"
                    >
                      <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm h-9">
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Medical Record
                      </Button>
                    </Link>
                  )}
                  <Input
                    type="text"
                    placeholder="Search medical records..."
                    value={medicalSearchTerm}
                    onChange={(e) => {
                      setMedicalSearchTerm(e.target.value);
                      setMedicalCurrentPage(1);
                    }}
                    className="flex-1 text-sm h-9"
                  />
                </div>

                {filteredMedicalRecords.length > 0 ? (
                  <>
                    <div className="space-y-3 sm:space-y-4">
                      {paginatedMedicalRecords.map((record) => (
                        <Card key={record.id} className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base sm:text-lg mb-1 truncate">
                                {record.diagnosis}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {new Date(
                                  record.recordDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            {isVet && (
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Link
                                  href={`/horses/${horse.id}/medical/${record.id}/edit`}
                                  className="flex-1 sm:flex-none"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs h-8 sm:h-9 sm:text-sm"
                                  >
                                    <svg
                                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
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
                                  onClick={() => {
                                    setMedicalToDelete(record);
                                    setShowDeleteMedicalDialog(true);
                                  }}
                                  disabled={deletingMedical === record.id}
                                  className="flex-1 sm:flex-none text-xs h-8 sm:h-9 sm:text-sm"
                                >
                                  <svg
                                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
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
                          <div className="space-y-2 sm:space-y-3">
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-gray-700">
                                Treatment
                              </p>
                              <p className="text-gray-600 text-xs sm:text-sm">
                                {record.treatment}
                              </p>
                            </div>
                            {record.notes && (
                              <div>
                                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                                  Notes
                                </p>
                                <p className="text-gray-600 text-xs sm:text-sm">
                                  {record.notes}
                                </p>
                              </div>
                            )}
                            {record.attachments &&
                              record.attachments.length > 0 && (
                                <div>
                                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                                    Attachments
                                  </p>
                                  <div className="flex gap-1 sm:gap-2 flex-wrap">
                                    {record.attachments.map((url, index) => (
                                      <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs sm:text-sm text-blue-600 hover:underline"
                                      >
                                        Attachment {index + 1}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </Card>
                      ))}
                    </div>

                    {totalMedicalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4 sm:mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setMedicalCurrentPage(
                              Math.max(1, medicalCurrentPage - 1)
                            )
                          }
                          disabled={medicalCurrentPage === 1}
                          className="h-8 text-xs sm:h-9 sm:text-sm"
                        >
                          Previous
                        </Button>
                        <span className="text-xs sm:text-sm text-gray-600">
                          Page {medicalCurrentPage} of {totalMedicalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setMedicalCurrentPage(
                              Math.min(
                                totalMedicalPages,
                                medicalCurrentPage + 1
                              )
                            )
                          }
                          disabled={medicalCurrentPage === totalMedicalPages}
                          className="h-8 text-xs sm:h-9 sm:text-sm"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-6 sm:p-12 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
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
                    <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                      {medicalSearchTerm
                        ? "No medical records found"
                        : "No medical records yet"}
                    </p>
                    {isVet && !medicalSearchTerm && (
                      <Link href={`/horses/${horse.id}/medical/new`}>
                        <Button className="text-sm h-9">
                          Add First Record
                        </Button>
                      </Link>
                    )}
                  </Card>
                )}
              </div>
            )}

            {activeTab === "vaccinations" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                  {isVet && (
                    <Link
                      href={`/horses/${horse.id}/vaccinations/new`}
                      className="sm:shrink-0"
                    >
                      <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm h-9">
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Vaccination
                      </Button>
                    </Link>
                  )}
                  <Input
                    type="text"
                    placeholder="Search vaccinations..."
                    value={vaccinationSearchTerm}
                    onChange={(e) => {
                      setVaccinationSearchTerm(e.target.value);
                      setVaccinationCurrentPage(1);
                    }}
                    className="flex-1 text-sm h-9"
                  />
                </div>

                {filteredVaccinations.length > 0 ? (
                  <>
                    <div className="space-y-3 sm:space-y-4">
                      {paginatedVaccinations.map((vaccination) => {
                        const daysUntilDue = Math.ceil(
                          (new Date(vaccination.nextDue) - new Date()) /
                            (1000 * 60 * 60 * 24)
                        );
                        const isOverdue = daysUntilDue < 0;
                        const isDueSoon =
                          daysUntilDue <= 30 && daysUntilDue >= 0;

                        return (
                          <Card key={vaccination.id} className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base sm:text-lg mb-1 truncate">
                                  {vaccination.vaccineName}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  Given:{" "}
                                  {new Date(
                                    vaccination.dateGiven
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                                <Badge
                                  variant={
                                    isOverdue
                                      ? "destructive"
                                      : isDueSoon
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="w-full sm:w-auto text-center text-xs"
                                >
                                  {isOverdue
                                    ? `Overdue ${Math.abs(daysUntilDue)} days`
                                    : isDueSoon
                                    ? `Due in ${daysUntilDue} days`
                                    : `Due ${new Date(
                                        vaccination.nextDue
                                      ).toLocaleDateString()}`}
                                </Badge>
                                {isVet && (
                                  <div className="flex gap-2 w-full sm:w-auto">
                                    <Link
                                      href={`/horses/${horse.id}/vaccinations/${vaccination.id}/edit`}
                                      className="flex-1 sm:flex-none"
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs h-8 sm:h-9 sm:text-sm"
                                      >
                                        <svg
                                          className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
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
                                      onClick={() => {
                                        setVaccinationToDelete(vaccination);
                                        setShowDeleteVaccinationDialog(true);
                                      }}
                                      disabled={
                                        deletingVaccination === vaccination.id
                                      }
                                      className="flex-1 sm:flex-none text-xs h-8 sm:h-9 sm:text-sm"
                                    >
                                      <svg
                                        className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
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
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">Next Due:</span>
                                <span className="font-medium">
                                  {new Date(
                                    vaccination.nextDue
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {vaccination.batchNumber && (
                                <div className="flex justify-between text-xs sm:text-sm">
                                  <span className="text-gray-600">
                                    Batch Number:
                                  </span>
                                  <span className="font-medium font-mono">
                                    {vaccination.batchNumber}
                                  </span>
                                </div>
                              )}
                              {vaccination.notes && (
                                <div className="mt-2 sm:mt-3">
                                  <p className="text-xs sm:text-sm font-semibold text-gray-700">
                                    Notes
                                  </p>
                                  <p className="text-gray-600 text-xs sm:text-sm">
                                    {vaccination.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                    {totalVaccinationPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4 sm:mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setVaccinationCurrentPage(
                              Math.max(1, vaccinationCurrentPage - 1)
                            )
                          }
                          disabled={vaccinationCurrentPage === 1}
                          className="h-8 text-xs sm:h-9 sm:text-sm"
                        >
                          Previous
                        </Button>
                        <span className="text-xs sm:text-sm text-gray-600">
                          Page {vaccinationCurrentPage} of{" "}
                          {totalVaccinationPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setVaccinationCurrentPage(
                              Math.min(
                                totalVaccinationPages,
                                vaccinationCurrentPage + 1
                              )
                            )
                          }
                          disabled={
                            vaccinationCurrentPage === totalVaccinationPages
                          }
                          className="h-8 text-xs sm:h-9 sm:text-sm"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Card className="p-6 sm:p-12 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                      {vaccinationSearchTerm
                        ? "No vaccinations found"
                        : "No vaccinations recorded yet"}
                    </p>
                    {isVet && !vaccinationSearchTerm && (
                      <Link href={`/horses/${horse.id}/vaccinations/new`}>
                        <Button className="text-sm h-9">
                          Add First Vaccination
                        </Button>
                      </Link>
                    )}
                  </Card>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <Card className="p-6 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-2">
                  Document generation coming in Phase 7
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Generate passports, certificates, and reports
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Delete Horse Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
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
              <span className="break-words">Delete {horse.name}?</span>
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
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleting} className="m-0 sm:m-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 m-0 sm:m-0"
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

      {/* Delete Medical Record Dialog */}
      <AlertDialog
        open={showDeleteMedicalDialog}
        onOpenChange={setShowDeleteMedicalDialog}
      >
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
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
              <span className="break-words">Delete Medical Record?</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the medical record for{" "}
              <strong>{medicalToDelete?.diagnosis}</strong>? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={!!deletingMedical}
              className="m-0 sm:m-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMedical}
              disabled={!!deletingMedical}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 m-0 sm:m-0"
            >
              {deletingMedical ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Record"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Vaccination Dialog */}
      <AlertDialog
        open={showDeleteVaccinationDialog}
        onOpenChange={setShowDeleteVaccinationDialog}
      >
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
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
              <span className="break-words">Delete Vaccination?</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the vaccination for{" "}
              <strong>{vaccinationToDelete?.vaccineName}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={!!deletingVaccination}
              className="m-0 sm:m-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVaccination}
              disabled={!!deletingVaccination}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 m-0 sm:m-0"
            >
              {deletingVaccination ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Vaccination"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (max-width: 640px) {
          .xs\\:inline {
            display: inline !important;
          }
        }
      `}</style>
    </div>
  );
}
