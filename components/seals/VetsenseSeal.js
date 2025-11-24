// components/seals/VetsenseSeal.js
"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function VetsenseSeal({
  type = "CIRCULAR",
  size = "md",
  showFingerprint = false,
}) {
  const [sealUrl, setSealUrl] = useState(null);
  const [fingerprint, setFingerprint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch active seal of this type
    fetch(`/api/seals/active?type=${type}`)
      .then((res) => {
        if (!res.ok) throw new Error("Seal not found");
        return res.json();
      })
      .then((data) => {
        setSealUrl(data.pngUrl);
        setFingerprint(data.fingerprint);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [type]);

  const sizeClasses = {
    xs: "w-12 h-12",
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  if (loading) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center`}
      >
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !sealUrl) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gray-200 rounded-full flex items-center justify-center`}
      >
        <span className="text-xs text-gray-500">No Seal</span>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center">
      <Image
        src={sealUrl}
        alt="VETSENSE Official Seal"
        className={`${sizeClasses[size]} object-contain`}
        loading="lazy"
      />
      {showFingerprint && fingerprint && (
        <p
          className="text-xs text-gray-500 mt-2 font-mono max-w-[200px] truncate"
          title={fingerprint}
        >
          {fingerprint}
        </p>
      )}
    </div>
  );
}
