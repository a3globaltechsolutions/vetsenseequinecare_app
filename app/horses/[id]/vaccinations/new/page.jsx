"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { addYears, format } from "date-fns";

export default function NewVaccinationPage() {
  const params = useParams();
  const router = useRouter();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vaccineName: "",
    dateGiven: new Date().toISOString().split("T")[0],
    nextDue: addYears(new Date(), 1).toISOString().split("T")[0],
    batchNumber: "",
    administeredBy: "", // NEW: Veterinarian who administered
    certificateNo: "", // NEW: Certificate number
    notes: "",
  });

  // Predefined vaccine options for quick selection
  const nigerianVaccines = [
    "African Horse Sickness",
    "Tetanus",
    "Equine Influenza",
    "Rabies",
    "Strangles",
  ];

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
      }
    } catch (error) {
      console.error("Error fetching horse:", error);
    }
  };

  // Auto-calculate next due date when date given changes
  const handleDateGivenChange = (e) => {
    const dateGiven = e.target.value;
    const nextDue = addYears(new Date(dateGiven), 1)
      .toISOString()
      .split("T")[0];
    setFormData({
      ...formData,
      dateGiven,
      nextDue,
    });
  };

  // Quick select vaccine
  const handleQuickSelect = (vaccineName) => {
    setFormData({ ...formData, vaccineName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vaccineName.trim() || !formData.dateGiven) {
      toast.error("Vaccine name and date given are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/horses/${params.id}/vaccinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Vaccination added successfully!");
        router.push(`/horses/${params.id}`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to add vaccination");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/horses/${params.id}`}>
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Add Vaccination
              </h1>
              <p className="text-sm text-gray-600">
                {horse ? `For ${horse.name}` : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Select Vaccines (Nigerian Standards) */}
            <div>
              <Label className="mb-2 block">
                Quick Select (Nigerian Standards)
              </Label>
              <div className="flex flex-wrap gap-2">
                {nigerianVaccines.map((vaccine) => (
                  <Button
                    key={vaccine}
                    type="button"
                    variant={
                      formData.vaccineName === vaccine ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleQuickSelect(vaccine)}
                    className={
                      formData.vaccineName === vaccine
                        ? "bg-purple-600 hover:bg-purple-700"
                        : ""
                    }
                  >
                    {vaccine}
                  </Button>
                ))}
              </div>
            </div>

            {/* Vaccine Name */}
            <div>
              <Label htmlFor="vaccineName">
                Vaccine Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vaccineName"
                value={formData.vaccineName}
                onChange={(e) =>
                  setFormData({ ...formData, vaccineName: e.target.value })
                }
                placeholder="e.g., African Horse Sickness, Tetanus, Equine Influenza"
                required
                className="mt-1"
              />
            </div>

            {/* Date Given and Next Due */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateGiven">
                  Date Given <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateGiven"
                  type="date"
                  value={formData.dateGiven}
                  onChange={handleDateGivenChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="nextDue">Next Due Date</Label>
                <Input
                  id="nextDue"
                  type="date"
                  value={formData.nextDue}
                  onChange={(e) =>
                    setFormData({ ...formData, nextDue: e.target.value })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated as 1 year from date given
                </p>
              </div>
            </div>

            {/* NEW: Batch Number and Certificate Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, batchNumber: e.target.value })
                  }
                  placeholder="e.g., AHS-2024-001"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="certificateNo">Certificate Number</Label>
                <Input
                  id="certificateNo"
                  value={formData.certificateNo}
                  onChange={(e) =>
                    setFormData({ ...formData, certificateNo: e.target.value })
                  }
                  placeholder="e.g., VETSENSE-AHS-2025-001"
                  className="mt-1"
                />
              </div>
            </div>

            {/* NEW: Administering Veterinarian */}
            <div>
              <Label htmlFor="administeredBy">Administering Veterinarian</Label>
              <Input
                id="administeredBy"
                value={formData.administeredBy}
                onChange={(e) =>
                  setFormData({ ...formData, administeredBy: e.target.value })
                }
                placeholder="e.g., Dr. Simpa Muhammad AbdulAzeez (DVM, 8829)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Will appear on vaccination certificates in passport
              </p>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional notes or observations..."
                rows={3}
                className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Info Box - Nigerian Equine Requirements */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
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
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-1">
                    Nigerian Equine Vaccination Standards
                  </p>
                  <p className="mb-2">
                    Each vaccination will appear on a dedicated certificate page
                    in the horse passport:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>African Horse Sickness (AHS) - Critical in Nigeria</li>
                    <li>Tetanus - Standard protection</li>
                    <li>Equine Influenza - Respiratory protection</li>
                    <li>
                      Piroplasmosis treatment (add via Medical Records if
                      needed)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "Adding Vaccination..." : "Add Vaccination"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
