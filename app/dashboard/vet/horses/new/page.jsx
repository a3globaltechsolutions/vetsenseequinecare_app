"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import toast from "react-hot-toast";

export default function NewHorsePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    color: "",
    sex: "STALLION",
    microchip: "",
    imageUrl: "",
    dob: "",
    countryOfBirth: "Nigeria",
    sire: "",
    dam: "",
    weight: "",
    bodyConditionScore: "",
    lastDeworming: "",
    bloodType: "",
    allergies: "",
    behavior: "",
    dietary: "",
    exerciseRestrictions: "",
    insurance: "",
    currentMedications: "",
  });

  // Calculate age when DOB changes
  useEffect(() => {
    if (!formData.dob) {
      setCalculatedAge("");
      return;
    }
    const birth = new Date(formData.dob);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (today.getDate() < birth.getDate()) {
      months--;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    let ageStr = "";
    if (years > 0) ageStr += `${years} year${years > 1 ? "s" : ""}`;
    if (months > 0)
      ageStr += ageStr
        ? ` ${months} month${months > 1 ? "s" : ""}`
        : `${months} month${months > 1 ? "s" : ""}`;
    if (!ageStr) ageStr = "0 month";

    setCalculatedAge(ageStr);
  }, [formData.dob]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Horse name is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/horses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // age not sent
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Horse added successfully!");
        router.push("/dashboard/vet");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to add horse");
      }
    } catch (error) {
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
            <Link href="/dashboard/vet">
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Add New Horse</h1>
              <p className="text-sm text-gray-600">
                Create a new horse profile
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Horse Image */}
            <div>
              <Label className="text-base font-semibold">Horse Image</Label>
              <p className="text-sm text-gray-600 mb-3">
                Upload a clear photo of the horse
              </p>
              <CloudinaryUpload
                onUploadComplete={(url) =>
                  setFormData({ ...formData, imageUrl: url })
                }
                currentImage={formData.imageUrl}
              />
            </div>

            {/* Basic Information */}
            <div className="border-t pt-6">
              <h3 className="text-base font-semibold mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Thunder"
                    required
                    className="mt-1"
                  />
                </div>

                {/* Breed */}
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) =>
                      setFormData({ ...formData, breed: e.target.value })
                    }
                    placeholder="e.g., Arabian, Thoroughbred"
                    className="mt-1"
                  />
                </div>

                {/* DOB */}
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                {/* Read-only Age and Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="text"
                      value={calculatedAge}
                      disabled
                      className="mt-1 bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      placeholder="e.g., Bay, Chestnut"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Sex */}
                <div>
                  <Label htmlFor="sex">Sex</Label>
                  <select
                    id="sex"
                    value={formData.sex}
                    onChange={(e) =>
                      setFormData({ ...formData, sex: e.target.value })
                    }
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="STALLION">Stallion</option>
                    <option value="MARE">Mare</option>
                    <option value="GELDING">Gelding</option>
                  </select>
                </div>

                {/* Microchip */}
                <div>
                  <Label htmlFor="microchip">Microchip Number</Label>
                  <Input
                    id="microchip"
                    value={formData.microchip}
                    onChange={(e) =>
                      setFormData({ ...formData, microchip: e.target.value })
                    }
                    placeholder="15-digit number"
                    maxLength={15}
                    className="mt-1"
                  />
                </div>

                {/* Country of Birth */}
                <div>
                  <Label htmlFor="countryOfBirth">Country of Birth</Label>
                  <Input
                    id="countryOfBirth"
                    value={formData.countryOfBirth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        countryOfBirth: e.target.value,
                      })
                    }
                    placeholder="Nigeria"
                    className="mt-1"
                  />
                </div>

                {/* Sire and Dam */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sire">Sire (Father)</Label>
                    <Input
                      id="sire"
                      value={formData.sire}
                      onChange={(e) =>
                        setFormData({ ...formData, sire: e.target.value })
                      }
                      placeholder="Father's name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dam">Dam (Mother)</Label>
                    <Input
                      id="dam"
                      value={formData.dam}
                      onChange={(e) =>
                        setFormData({ ...formData, dam: e.target.value })
                      }
                      placeholder="Mother's name"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div className="border-t pt-6">
              <h3 className="text-base font-semibold mb-4">
                Health Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      placeholder="e.g., 45.5 or 450"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bodyConditionScore">
                      Body Condition Score
                    </Label>
                    <Input
                      id="bodyConditionScore"
                      value={formData.bodyConditionScore}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bodyConditionScore: e.target.value,
                        })
                      }
                      placeholder="e.g., 5 or 5.0"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Input
                    id="bloodType"
                    value={formData.bloodType}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodType: e.target.value })
                    }
                    placeholder="e.g., A, B, AB"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lastDeworming">Last Deworming Date</Label>
                  <Input
                    id="lastDeworming"
                    type="date"
                    value={formData.lastDeworming}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastDeworming: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) =>
                      setFormData({ ...formData, allergies: e.target.value })
                    }
                    placeholder="Any known allergies or sensitivities..."
                    rows={2}
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="currentMedications">
                    Current Medications
                  </Label>
                  <textarea
                    id="currentMedications"
                    value={formData.currentMedications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentMedications: e.target.value,
                      })
                    }
                    placeholder="List any current medications..."
                    rows={2}
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="behavior">Behavioral Notes</Label>
                  <textarea
                    id="behavior"
                    value={formData.behavior}
                    onChange={(e) =>
                      setFormData({ ...formData, behavior: e.target.value })
                    }
                    placeholder="Temperament, training level, any behavioral notes..."
                    rows={2}
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="dietary">Dietary Requirements</Label>
                  <textarea
                    id="dietary"
                    value={formData.dietary}
                    onChange={(e) =>
                      setFormData({ ...formData, dietary: e.target.value })
                    }
                    placeholder="Special diet, feeding schedule, supplements..."
                    rows={2}
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="exerciseRestrictions">
                    Exercise Restrictions
                  </Label>
                  <textarea
                    id="exerciseRestrictions"
                    value={formData.exerciseRestrictions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        exerciseRestrictions: e.target.value,
                      })
                    }
                    placeholder="Any exercise limitations or restrictions..."
                    rows={2}
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <Label htmlFor="insurance">Insurance Details</Label>
                  <Input
                    id="insurance"
                    value={formData.insurance}
                    onChange={(e) =>
                      setFormData({ ...formData, insurance: e.target.value })
                    }
                    placeholder="Policy number, provider, coverage details..."
                    className="mt-1"
                  />
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
                {loading ? "Adding..." : "Add Horse"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
