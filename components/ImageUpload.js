"use client";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

export function ImageUpload({ onUpload, folder = "vetsense" }) {
  const [uploading, setUploading] = useState(false);

  return (
    <CldUploadWidget
      uploadPreset="vetsense"
      options={{
        folder: folder,
        sources: ["local", "camera"],
        multiple: false,
        maxFiles: 1,
      }}
      onUpload={(result, widget) => {
        if (result.event === "success") {
          setUploading(false);
          onUpload(result.info);
        }
      }}
      onUploadAdded={() => {
        setUploading(true);
      }}
    >
      {({ open }) => (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => open()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors disabled:opacity-50"
          >
            <div className="space-y-2">
              <div className="mx-auto w-8 h-8 text-gray-400">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {uploading ? "Uploading..." : "Click to upload image"}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
            </div>
          </button>
        </div>
      )}
    </CldUploadWidget>
  );
}
