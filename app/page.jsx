"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <Link href="/">
                <Image
                  src="/vetsense_logo.jpg"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain rounded-full"
                />
              </Link>
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">VETSENSE</h1>
              <p className="text-xs text-gray-600">Equine Care & Consulting</p>
            </div>
          </div>
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Professional Horse Management System
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete equine veterinary document management and horse care
            platform for modern veterinary practices.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Verify Document
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
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
            <h3 className="text-xl font-bold mb-2">Digital Passports</h3>
            <p className="text-gray-600">
              Generate official equine e-passports with automatic sequential
              numbering and digital authentication seals.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Medical Records</h3>
            <p className="text-gray-600">
              Complete medical history tracking, vaccination schedules, and
              automated reminder notifications.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
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
            <h3 className="text-xl font-bold mb-2">Secure Verification</h3>
            <p className="text-gray-600">
              Public document verification with SHA256 fingerprints and digital
              seal authentication.
            </p>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-20 text-gray-600">
          <p className="text-sm italic mb-2">
            &quot;Our passion to care fuels our penchant to serve&quot;
          </p>
          <p className="text-sm">
            <Link
              href="https://wa.me/2347067677446"
              target="_blank"
              rel="noopener noreferrer"
            >
              📞 07067677446
            </Link>{" "}
            •{" "}
            <a href="mailto:Vetsense.equinecare@gmail.com">
              ✉ vetsense.equinecare@gmail.com
            </a>{" "}
            • 📍 Kaduna, Nigeria
          </p>
        </footer>
      </main>
    </div>
  );
}
