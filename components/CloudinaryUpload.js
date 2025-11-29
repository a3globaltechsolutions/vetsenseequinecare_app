"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Image from "next/image";

export default function CloudinaryUpload({ onUploadComplete, currentImage }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);

  // ----------- IMAGE COMPRESSION FUNCTION -----------
  const compressImage = (file, maxWidth = 1000, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image(); // FIXED
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleSize = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = (err) => reject(err);
    });
  };

  const handleUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);

    // ------- COMPRESS IMAGE BEFORE UPLOAD -------
    const compressedBlob = await compressImage(file);
    const compressedFile = new File([compressedBlob], file.name, {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("file", compressedFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.url) throw new Error("Upload failed");

      setPreviewUrl(data.url);
      onUploadComplete(data.url);

      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        id="horse-image-upload"
        className="hidden"
      />

      <label
        htmlFor="horse-image-upload"
        className={`block w-full text-sm text-gray-700 border-2 border-dashed border-gray-300 
        rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 transition-colors
        ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-purple-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Uploading...</span>
          </div>
        ) : (
          <div>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-2 text-sm">
              <span className="font-semibold text-purple-600">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, JPEG up to 5MB
            </p>
          </div>
        )}
      </label>

      {previewUrl && (
        <div className="relative">
          <div className="relative w-full h-48">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              sizes="100vw"
              className="object-cover rounded-lg border-2 border-gray-200"
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              onUploadComplete("");
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
