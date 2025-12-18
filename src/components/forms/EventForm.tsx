"use client";

import React, { useState, useEffect } from "react";
import { Event, EventFormData } from "@/types/event";
import { Organization } from "@/types/organization";
import { EventCategory } from "@/types/eventCategory";
import { organizationService } from "@/services/organizationService";
import { eventCategoryService } from "@/services/eventCategoryService";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthLevel } from "@/hooks/useAuthLevel";
import { getUserOrganizationId } from "@/utils/permissions";

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function EventForm({ event, onSubmit, onCancel, isLoading = false }: EventFormProps) {
  const { user } = useAuth();
  const { isOrganization, loading: authLevelLoading } = useAuthLevel();
  const [userOrgId, setUserOrgId] = useState<number | null>(null);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    image: null,
    description: "",
    location: "",
    instructions: "",
    organization_id: null,
    event_category_id: null,
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar organizações e categorias
  useEffect(() => {
    const loadData = async () => {
      try {
        const [orgs, cats] = await Promise.all([
          organizationService.getAllOrganizations(),
          eventCategoryService.getAllCategories()
        ]);
        setOrganizations(orgs);
        setCategories(cats);

        // Se for organization admin, buscar sua organização e preencher automaticamente
        if (user && isOrganization) {
          const orgId = await getUserOrganizationId(user.id);
          if (orgId) {
            setUserOrgId(orgId);
            // Always set organization_id for organization users (both create and edit)
            // This ensures organization users can only create/edit events for their own organization
            setFormData(prev => ({ ...prev, organization_id: orgId }));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    if (!authLevelLoading) {
      loadData();
    }
  }, [user, isOrganization, authLevelLoading]);

  // Load event data after organizations are loaded (to avoid race conditions)
  useEffect(() => {
    if (event && !isOrganization) {
      // Only set event data for non-organization users
      // Organization users will have their organization_id set automatically above
      setFormData({
        title: event.title,
        image: event.image,
        description: event.description || "",
        location: event.location || "",
        instructions: event.instructions || "",
        organization_id: event.organization_id,
        event_category_id: event.event_category_id,
      });
    } else if (event && isOrganization && userOrgId) {
      // For organization users, load event data but keep their organization_id
      setFormData({
        title: event.title,
        image: event.image,
        description: event.description || "",
        location: event.location || "",
        instructions: event.instructions || "",
        organization_id: userOrgId, // Force organization_id to user's organization
        event_category_id: event.event_category_id,
      });
    }
  }, [event, isOrganization, userOrgId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Local é obrigatório";
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
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Digite o título do evento"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Imagem */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL da Imagem
          </label>
          <input
            type="url"
            id="image"
            value={formData.image || ""}
            onChange={(e) => handleInputChange("image", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white border-gray-300"
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Digite a descrição do evento"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Local */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Local *
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.location ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Digite o local do evento"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location}</p>
          )}
        </div>

        {/* Organização - Only show for super admins, hidden for organization users */}
        {!isOrganization && (
          <div>
            <label htmlFor="organization_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organização
            </label>
            <select
              id="organization_id"
              value={formData.organization_id || ""}
              onChange={(e) => handleInputChange("organization_id", e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white border-gray-300"
            >
              <option value="">Selecione uma organização (opcional)</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Categoria */}
        <div>
          <label htmlFor="event_category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoria
          </label>
          <select
            id="event_category_id"
            value={formData.event_category_id || ""}
            onChange={(e) => handleInputChange("event_category_id", e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white border-gray-300"
          >
            <option value="">Selecione uma categoria (opcional)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Instruções */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Instruções
          </label>
          <textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => handleInputChange("instructions", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white border-gray-300"
            placeholder="Digite as instruções do evento"
          />
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
          {isLoading ? "Salvando..." : event ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
}
