"use client";

import React, { useState, useEffect } from "react";
import { EventCategory, EventCategoryFormData } from "@/types/eventCategory";
import { eventCategoryService } from "@/services/eventCategoryService";

interface EventCategoryFormProps {
  category?: EventCategory | null;
  onSubmit: (data: EventCategoryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EventCategoryForm({ category, onSubmit, onCancel, isLoading = false }: EventCategoryFormProps) {
  const [formData, setFormData] = useState<EventCategoryFormData>({
    label: "",
    color: "#3B82F6", // Default blue color
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingCategories, setExistingCategories] = useState<EventCategory[]>([]);

  useEffect(() => {
    if (category) {
      setFormData({
        label: category.label,
        color: category.color,
      });
    }
  }, [category]);

  // Carregar categorias existentes para verificar cores utilizadas
  useEffect(() => {
    const loadExistingCategories = async () => {
      try {
        const categories = await eventCategoryService.getAllCategories();
        setExistingCategories(categories);
      } catch (error) {
        console.error('Erro ao carregar categorias existentes:', error);
      }
    };

    loadExistingCategories();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = "Label é obrigatório";
    }

    if (!formData.color.trim()) {
      newErrors.color = "Cor é obrigatória";
    } else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(formData.color)) {
      newErrors.color = "Cor deve estar no formato HEX (#RRGGBB)";
    } else if (isColorUsed(formData.color)) {
      const usedByCategory = getCategoryUsingColor(formData.color);
      newErrors.color = `Esta cor já está sendo usada pela categoria "${usedByCategory?.label}"`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: unknown) {
      console.error("Erro ao salvar categoria:", error);

      // Capturar erros do servidor e exibir no formulário
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message);
        if (errorMessage.includes('duplicate key') || errorMessage.includes('unique constraint')) {
          setErrors({ label: "Já existe uma categoria com este nome" });
        } else {
          setErrors({ label: errorMessage });
        }
      } else {
        setErrors({ label: "Erro ao salvar categoria. Tente novamente." });
      }
    }
  };

  const handleInputChange = (field: keyof EventCategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Verificar se uma cor já está sendo usada
  const isColorUsed = (color: string): boolean => {
    return existingCategories.some(cat =>
      cat.color.toLowerCase() === color.toLowerCase() &&
      (!category || cat.id !== category.id) // Excluir a categoria atual se estiver editando
    );
  };

  // Obter a categoria que está usando a cor
  const getCategoryUsingColor = (color: string): EventCategory | undefined => {
    return existingCategories.find(cat =>
      cat.color.toLowerCase() === color.toLowerCase() &&
      (!category || cat.id !== category.id)
    );
  };

  // Cores predefinidas para escolha rápida
  const predefinedColors = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
    "#6B7280", // Gray
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Label */}
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Label *
          </label>
          <input
            type="text"
            id="label"
            value={formData.label}
            onChange={(e) => handleInputChange("label", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.label ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Digite o nome da categoria"
          />
          {errors.label && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.label}</p>
          )}
        </div>

        {/* Color */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cor *
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              id="color"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
              className={`w-16 h-10 border rounded-lg cursor-pointer ${
                errors.color ? "border-red-500" : "border-gray-300"
              }`}
            />
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.color ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="#3B82F6"
            />
          </div>
          {errors.color && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.color}</p>
          )}
        </div>

        {/* Predefined Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cores Predefinidas
          </label>
          <div className="flex flex-wrap gap-2">
            {predefinedColors.map((color) => {
              const isUsed = isColorUsed(color);
              const usedByCategory = getCategoryUsingColor(color);
              const isSelected = formData.color === color;

              return (
                <div key={color} className="relative group">
                  <button
                    type="button"
                    onClick={() => !isUsed && handleInputChange("color", color)}
                    disabled={isUsed}
                    className={`w-8 h-8 rounded-lg border-2 transition-all relative ${
                      isSelected
                        ? "border-gray-900 dark:border-white scale-110"
                        : isUsed
                        ? "border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed"
                        : "border-gray-300 dark:border-gray-600 hover:scale-105 cursor-pointer"
                    }`}
                    style={{ backgroundColor: color }}
                    title={isUsed ? `Usado por: ${usedByCategory?.label}` : color}
                  >
                    {/* Traço transversal vermelho para cores usadas */}
                    {isUsed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-red-500 transform rotate-45"></div>
                      </div>
                    )}
                  </button>

                  {/* Tooltip com informações da categoria que usa a cor */}
                  {isUsed && usedByCategory && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Usado por: {usedByCategory.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Informação sobre cores usadas */}
          {predefinedColors.some(color => isColorUsed(color)) && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Cores com traço vermelho já estão sendo utilizadas por outras categorias
            </p>
          )}
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formData.label || "Nome da categoria"}
            </span>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : category ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
}
