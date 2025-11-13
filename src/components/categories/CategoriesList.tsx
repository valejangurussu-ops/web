"use client";

import React, { useEffect, useState } from "react";
import { eventCategoryService } from "@/services/eventCategoryService";
import { EventCategory } from "@/types/eventCategory";

export function CategoriesList() {
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
      {categories.map((category) => (
        <span
          key={category.id}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: category.color + '20', // Adiciona transparência
            color: category.color,
            border: `1px solid ${category.color}40`
          }}
        >
          {category.label}
        </span>
      ))}
    </div>
  );
}
