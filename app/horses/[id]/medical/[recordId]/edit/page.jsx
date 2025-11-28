/* eslint-disable react-hooks/exhaustive-deps */
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

export default function EditMedicalRecordPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment: "",
    drug: "",
    dosage: "",
    vet: "",
    notes: "",
    recordDate: "",
    attachments: [],
  });

  useEffect(() => {
    fetchRecord();
  }, [params.recordId]);

  const fetchRecord = async () => {
    try {
      const res = await fetch(
        `/api/horses/${params.id}/medical/${params.recordId}`
      );
      if (!res.ok) {
        toast.error("Record not found");
        router.push(`/horses/${params.id}`);
        return;
      }

      const data = await res.json();
      setFormData({
        diagnosis: data.diagnosis || "",
        treatment: data.treatment || "",
        drug: data.drug || "",
        dosage: data.dosage || "",
        vet: data.vet || "",
        notes: data.notes || "",
        recordDate: new Date(data.recordDate).toISOString().split("T")[0],
        attachments: data.attachments || [],
      });
    } catch (error) {
      console.error("Error fetching record:", error);
      toast.error("Failed to load record");
    } finally {
      setLoading(false);
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

    setSaving(true);

    try {
      const res = await fetch(
        `/api/horses/${params.id}/medical/${params.recordId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Medical record updated successfully!");
        router.push(`/horses/${params.id}`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update medical record");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading record...</p>
        </div>
      </div>
    );
  }

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
                Edit Medical Record
              </h1>
              <p className="text-sm text-gray-600">Update record details</p>
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
                rows={4}
                value={formData.treatment}
                onChange={(e) =>
                  setFormData({ ...formData, treatment: e.target.value })
                }
                required
                className="w-full mt-1 border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Drug + Dosage */}
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
              </div>

              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                  placeholder="e.g., 2mg/kg"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Veterinarian */}
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
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full mt-1 border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-amber-600 mt-0.5"
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
                    Ensure the drug and dosage fields are accurate. They appear
                    on the Piroplasmosis certificate.
                  </p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <Label className="mb-2 block">Attachments</Label>
              <CloudinaryUpload onUploadComplete={handleAddAttachment} />

              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
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
                        size="sm"
                        variant="destructive"
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
