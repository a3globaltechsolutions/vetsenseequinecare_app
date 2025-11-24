"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SealManagementPage() {
  const [generating, setGenerating] = useState(false);
  const [seals, setSeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeals();
  }, []);

  const loadSeals = async () => {
    try {
      const res = await fetch("/api/seals/active", { method: "POST" });
      const data = await res.json();
      setSeals(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading seals:", error);
      setLoading(false);
    }
  };

  const handleGenerateSeals = async () => {
    setGenerating(true);

    try {
      const res = await fetch("/api/seals/generate", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("All seals generated successfully!");
        loadSeals(); // Reload seals
      } else {
        toast.error(data.error || "Failed to generate seals");
      }
    } catch (error) {
      toast.error("Error generating seals");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link href="/dashboard/vet" className="shrink-0">
                <Button variant="outline" size="sm" className="h-9 px-3">
                  ← Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Official Seal Management</h1>
          <p className="text-gray-600">
            Generate and manage VETSENSE digital authentication seals
          </p>
        </div>

        {/* Generation Section */}
        <Card className="p-6 mb-8 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Generate New Seals</h2>
              <p className="text-gray-700 mb-4">
                This will create fresh versions of all 4 seal types: Circular,
                Emblem, Wax, and Signature Overlay. Previous seals will be
                marked as inactive.
              </p>
              <ul className="text-sm text-gray-600 mb-4 space-y-1">
                <li>• Seals are uploaded to Cloudinary</li>
                <li>• Each seal gets a unique SHA256 fingerprint</li>
                <li>• Previous versions remain in database for audit</li>
                <li>• Generation typically takes 10-15 seconds</li>
              </ul>
              <Button
                onClick={handleGenerateSeals}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Seals...
                  </>
                ) : (
                  "Generate All Seals"
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Current Seals Display */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Current Active Seals</h2>

          {seals.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-lg font-semibold mb-2">
                No Active Seals Found
              </h3>
              <p className="text-gray-600 mb-4">
                Generate seals to start using digital authentication
              </p>
              <Button onClick={handleGenerateSeals}>Generate Seals Now</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {seals.map((seal) => (
                <Card key={seal.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="mb-2 bg-green-600">Active</Badge>
                      <h3 className="text-lg font-bold">{seal.type}</h3>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(seal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>

                  <div className="mb-4 flex justify-center bg-gray-50 p-4 rounded">
                    <Image
                      src={seal.pngUrl}
                      alt={seal.type}
                      width={200}
                      height={100}
                      className="w-32 h-32 object-contain"
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Fingerprint:</p>
                      <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                        {seal.fingerprint}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={seal.pngUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full" size="sm">
                          View Full Size
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(seal.pngUrl);
                          toast.success("URL copied to clipboard");
                        }}
                      >
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Information Section */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-3">Seal Types Explained</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <span className="font-semibold">Circular Seal:</span> Traditional
              round seal with practice name and vet credentials in circular
              format
            </div>
            <div>
              <span className="font-semibold">Emblem Seal:</span> Badge-style
              rectangular seal with decorative elements
            </div>
            <div>
              <span className="font-semibold">Wax Seal:</span> Simulated wax
              seal with irregular edges and embossed appearance
            </div>
            <div>
              <span className="font-semibold">Signature Overlay:</span>{" "}
              Horizontal seal with signature-style text and date field
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
