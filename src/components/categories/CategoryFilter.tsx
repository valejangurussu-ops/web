"use client";

import React, { useEffect, useState } from "react";
import { eventCategoryService } from "@/services/eventCategoryService";
import { EventCategory } from "@/types/eventCategory";
import { CategoryButton, AllCategoriesButton } from "./CategoryButton";

interface CategoryFilterProps {
  selectedCategory?: number | null;
  onCategoryChange?: (categoryId: number | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await eventCategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    const newSelectedCategory = selectedCategory === categoryId ? null : categoryId;
    onCategoryChange?.(newSelectedCategory);
  };

  if (loading) {
    return (
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">Nenhuma categoria disponível</p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {/* Botão "Todas" */}
      <AllCategoriesButton
        isSelected={selectedCategory === null}
        onClick={() => onCategoryChange?.(null)}
      />

      {/* Categorias */}
      {categories.map((category) => (
        <CategoryButton
          key={category.id}
          category={category}
          isSelected={selectedCategory === category.id}
          onClick={() => handleCategoryClick(category.id)}
        />
      ))}
    </div>
  );
}
