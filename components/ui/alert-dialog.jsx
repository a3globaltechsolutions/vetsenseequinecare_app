"use client";

import * as React from "react";

const AlertDialog = ({ children, open, onOpenChange }) => {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => onOpenChange(false)}
          />
          {/* Content */}
          {children}
        </div>
      )}
    </>
  );
};

const AlertDialogContent = ({ children, className, ...props }) => {
  return (
    <div
      className={`relative z-50 bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDialogHeader = ({ children, className, ...props }) => {
  return (
    <div className={`p-6 pb-2 ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

const AlertDialogTitle = ({ children, className, ...props }) => {
  return (
    <h2 className={`text-lg font-semibold mb-2 ${className || ""}`} {...props}>
      {children}
    </h2>
  );
};

const AlertDialogDescription = ({ children, className, ...props }) => {
  return (
    <div className={`text-sm text-gray-600 ${className || ""}`} {...props}>
      {children}
    </div>
  );
};

const AlertDialogFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={`p-6 pt-4 flex justify-end gap-2 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDialogCancel = ({ children, onClick, disabled, ...props }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {children}
    </button>
  );
};

const AlertDialogAction = ({
  children,
  onClick,
  disabled,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${
        className || ""
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
