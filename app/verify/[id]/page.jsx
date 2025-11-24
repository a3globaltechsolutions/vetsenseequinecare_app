"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function VerifyDocumentPage() {
  const params = useParams();
  const [document, setDocument] = useState(null);
  const [horse, setHorse] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("checking");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyDocument() {
      try {
        const res = await fetch(`/api/documents/${params.id}/verify`);
        const data = await res.json();

        if (data.valid) {
          setDocument(data.document);
          setHorse(data.horse);
          setVerificationStatus("valid");
        } else {
          setVerificationStatus("invalid");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus("error");
      } finally {
        setLoading(false);
      }
    }

    verifyDocument();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/vetsense_logo.jpg"
              alt="VETSENSE Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            VETSENSE Document Verification
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Verify the authenticity of equine documents
          </p>
        </div>

        {/* Verification Status Banner */}
        <Card
          className={`p-4 sm:p-6 mb-6 ${
            verificationStatus === "valid"
              ? "bg-green-50 border-green-200"
              : verificationStatus === "invalid"
              ? "bg-red-50 border-red-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {verificationStatus === "valid" && (
              <>
                <div className="shrink-0">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-green-600"
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
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-1">
                    Document Verified ✓
                  </h2>
                  <p className="text-sm sm:text-base text-green-700">
                    This document is authentic and issued by VETSENSE Equine
                    Care
                  </p>
                </div>
              </>
            )}

            {verificationStatus === "invalid" && (
              <>
                <div className="shrink-0">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-red-900 mb-1">
                    Verification Failed
                  </h2>
                  <p className="text-sm sm:text-base text-red-700">
                    This document could not be verified in our system
                  </p>
                </div>
              </>
            )}

            {verificationStatus === "error" && (
              <>
                <div className="shrink-0">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600"
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
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-yellow-900 mb-1">
                    Verification Error
                  </h2>
                  <p className="text-sm sm:text-base text-yellow-700">
                    Unable to complete verification. Please try again later.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Document Details */}
        {document && (
          <Card className="p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold mb-3">
                  Document Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge>{document.type}</Badge>
                  </div>
                  {document.passportNo && (
                    <div>
                      <p className="text-sm text-gray-600">Passport Number:</p>
                      <p className="text-lg font-bold text-purple-600">
                        {document.passportNo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Issued Date</p>
                <p className="font-semibold">
                  {new Date(document.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Document ID</p>
                <p className="font-mono text-xs sm:text-sm truncate">
                  {document.id}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Digital Fingerprint (SHA256)
              </p>
              <p className="font-mono text-xs break-all text-gray-600">
                {document.fingerprint}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This unique fingerprint ensures document authenticity and
                prevents tampering
              </p>
            </div>
          </Card>
        )}

        {/* Horse Information */}
        {horse && (
          <Card className="p-4 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4">
              Horse Information
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {horse.imageUrl && (
                <div className="shrink-0">
                  <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden">
                    <Image
                      src={horse.imageUrl}
                      alt={horse.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">
                  {horse.name}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {horse.breed && (
                    <div>
                      <span className="text-gray-600">Breed:</span>
                      <span className="ml-2 font-medium">{horse.breed}</span>
                    </div>
                  )}
                  {horse.age && (
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <span className="ml-2 font-medium">
                        {horse.age} years
                      </span>
                    </div>
                  )}
                  {horse.color && (
                    <div>
                      <span className="text-gray-600">Color:</span>
                      <span className="ml-2 font-medium">{horse.color}</span>
                    </div>
                  )}
                  {horse.sex && (
                    <div>
                      <span className="text-gray-600">Sex:</span>
                      <span className="ml-2 font-medium capitalize">
                        {horse.sex.toLowerCase()}
                      </span>
                    </div>
                  )}
                  {horse.microchip && (
                    <div className="col-span-1 sm:col-span-2">
                      <span className="text-gray-600">Microchip:</span>
                      <span className="ml-2 font-mono text-xs">
                        {horse.microchip}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-600 shrink-0 mt-0.5"
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
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                Security Information
              </h4>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>
                  ✓ All documents are stored with cryptographic fingerprints
                </li>
                <li>
                  ✓ Each document has a unique identifier for verification
                </li>
                <li>
                  ✓ Tampering with any document will invalidate its fingerprint
                </li>
                <li>
                  ✓ This verification page is publicly accessible for
                  transparency
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px bg-gray-300 flex-1"></div>
            <p className="text-sm font-semibold text-gray-700">
              Official Document Verification
            </p>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
          <p className="text-sm font-semibold text-gray-700">
            VETSENSE Equine Care and Consulting
          </p>
          <p className="text-sm text-gray-600 italic">
            &quot;Our passion to care fuels our penchant to serve&quot;
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-1">
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              07067677446
            </span>
            <span className="flex items-center gap-1">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Vetsense.equinecare@gmail.com
            </span>
            <span className="flex items-center gap-1">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Kaduna, Nigeria
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
