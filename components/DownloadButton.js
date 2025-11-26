import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DownloadButton({ fileUrl, fileName }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // 🔥 USE YOUR REAL FILENAME HERE
      link.download = fileName || "Vetsense_Equine_Care_Passport.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="w-full bg-purple-600 hover:bg-purple-700 text-sm h-9"
    >
      {loading ? "Downloading..." : "Download PDF"}
    </Button>
  );
}
