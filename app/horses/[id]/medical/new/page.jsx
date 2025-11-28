"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import toast from "react-hot-toast";

export default function NewMedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentVet, setCurrentVet] = useState(null);
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment: "",
    drug: "", // NEW: Specific drug used
    dosage: "", // NEW: Dosage information
    vet: "", // NEW: Administering veterinarian
    notes: "",
    recordDate: new Date().toISOString().split("T")[0],
    attachments: [],
  });

  useEffect(() => {
    fetchHorse();
    fetchCurrentVet();
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

  const fetchCurrentVet = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const session = await res.json();
        if (session?.user) {
          setCurrentVet(session.user);
          // Auto-fill vet field with current vet's name
          setFormData((prev) => ({
            ...prev,
            vet: `${session.user.name} (${session.user.title || "DVM"})`,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching vet info:", error);
    }
  };

  const handleAddAttachment = (url) => {
    setFormData({
      ...formData,
      attachments: [...formData.attachments, url],
    });
  };

  const handleRemoveAttachment = (index) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.diagnosis.trim() || !formData.treatment.trim()) {
      toast.error("Diagnosis and treatment are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/horses/${params.id}/medical`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Medical record added successfully!");
        router.push(`/horses/${params.id}`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to add medical record");
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
                Add Medical Record
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
            {/* Record Date */}
            <div>
              <Label htmlFor="recordDate">Record Date</Label>
              <Input
                id="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={(e) =>
                  setFormData({ ...formData, recordDate: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <Label htmlFor="diagnosis">
                Diagnosis <span className="text-red-500">*</span>
              </Label>
              <Input
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
                placeholder="e.g., Mild colic, Lameness, Piroplasmosis"
                required
                className="mt-1"
              />
            </div>

            {/* Treatment */}
            <div>
              <Label htmlFor="treatment">
                Treatment <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="treatment"
                value={formData.treatment}
                onChange={(e) =>
                  setFormData({ ...formData, treatment: e.target.value })
                }
                placeholder="Describe the treatment administered..."
                required
                rows={4}
                className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* NEW: Drug and Dosage Section */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="drug">Drug/Medication Used</Label>
                <Input
                  id="drug"
                  value={formData.drug}
                  onChange={(e) =>
                    setFormData({ ...formData, drug: e.target.value })
                  }
                  placeholder="e.g., Imidocarb dipropionate"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Especially important for Piroplasmosis treatment
                </p>
              </div>

              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                  placeholder="e.g., 2mg/kg, 10ml"
                  className="mt-1"
                />
              </div>
            </div>

            {/* NEW: Administering Veterinarian */}
            <div>
              <Label htmlFor="vet">Administering Veterinarian</Label>
              <Input
                id="vet"
                value={formData.vet}
                onChange={(e) =>
                  setFormData({ ...formData, vet: e.target.value })
                }
                placeholder="e.g., Dr. John Doe"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                {currentVet
                  ? `Auto-filled with your name. Will appear on medical certificates.`
                  : `Will appear on the Piroplasmosis treatment certificate`}
              </p>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional observations or follow-up instructions..."
                rows={3}
                className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Info Box for Piroplasmosis */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
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
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">
                    Piroplasmosis Treatment Records
                  </p>
                  <p>
                    For Piroplasmosis prophylactic treatment, ensure you fill in
                    the drug name and dosage fields. This information will
                    appear on the dedicated Piroplasmosis certificate in the
                    horse passport.
                  </p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <Label className="mb-2 block">Attachments (Optional)</Label>
              <CloudinaryUpload onUploadComplete={handleAddAttachment} />
              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Attached Files:</p>
                  {formData.attachments.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate flex-1"
                      >
                        Attachment {index + 1}
                      </a>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                {loading ? "Adding Record..." : "Add Medical Record"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
