import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🐎 VETSENSE</h1>
        <p className="text-xl text-gray-600 mb-8">
          Equine Care & Management System
        </p>
        <div className="space-x-4">
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="outline">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
