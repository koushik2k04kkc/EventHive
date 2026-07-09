import React from "react";

export default function Avatar({ user, size = "md", className = "" }) {
  const name = user?.name || user?.username || "User";
  const imageUrl = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff`;

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base"
  };

  return (
    <img
      src={imageUrl}
      alt={name}
      className={`rounded-full object-cover ring-2 ring-white ${sizeClasses[size] || sizeClasses.md} ${className}`.trim()}
    />
  );
}
