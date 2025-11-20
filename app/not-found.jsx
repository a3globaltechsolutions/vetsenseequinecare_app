import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 Graphic */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-700">404</span>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-200 rounded-full animate-bounce"></div>
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-300 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="absolute top-4 -right-4 w-3 h-3 bg-purple-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 max-w-sm mx-auto">
              Oops! The page you&apos;re looking for seems to have galloped
              away.
            </p>
          </div>

          {/* Horse Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center transform rotate-12">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
            <Link href="/" className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
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
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                Go Home
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="pt-4">
            <p className="text-sm text-gray-500">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
