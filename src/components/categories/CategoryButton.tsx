"use client";

import React from "react";

interface CategoryButtonProps {
  category: {
    id: number;
    label: string;
    color: string;
  };
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

interface AllCategoriesButtonProps {
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function CategoryButton({
  category,
  isSelected,
  onClick,
  className = ""
}: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        isSelected ? 'text-white' : 'hover:opacity-80'
      } ${className}`}
      style={{
        backgroundColor: isSelected
          ? category.color
          : category.color + '20',
        color: isSelected
          ? 'white'
          : category.color,
        border: isSelected
          ? `1px solid ${category.color}`
          : `1px solid ${category.color}40`
      }}
    >
      {category.label}
    </button>
  );
}

export function AllCategoriesButton({
  isSelected,
  onClick,
  className = ""
}: AllCategoriesButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        isSelected
          ? 'bg-brand-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
    >
      Todas
    </button>
  );
}
