"use client";

import React, { useState, useEffect } from "react";
import { Organization, OrganizationFormData } from "@/types/organization";

interface OrganizationFormProps {
  organization?: Organization | null;
  onSubmit: (data: OrganizationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function OrganizationForm({ organization, onSubmit, onCancel, isLoading = false }: OrganizationFormProps) {
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: "",
    whatsapp: "",
    location: "",
    location_link: "",
    slogan: "",
    website: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        whatsapp: organization.whatsapp || "",
        location: organization.location || "",
        location_link: organization.location_link || "",
        slogan: organization.slogan || "",
        website: organization.website || "",
      });
    }
  }, [organization]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (formData.whatsapp && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "WhatsApp deve estar no formato (11) 99999-9999";
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Website deve começar com http:// ou https://";
    }

    if (formData.location_link && !/^https?:\/\/.+/.test(formData.location_link)) {
      newErrors.location_link = "Link da localização deve começar com http:// ou https://";
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
      console.error("Erro ao salvar organização:", error);
    }
  };

  const handleInputChange = (field: keyof OrganizationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Nome */}
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Digite o nome da organização"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Slogan */}
        <div className="sm:col-span-2">
          <label htmlFor="slogan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Slogan
          </label>
          <input
            type="text"
            id="slogan"
            value={formData.slogan}
            onChange={(e) => handleInputChange("slogan", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white border-gray-300"
            placeholder="Digite o slogan da organização"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            WhatsApp
          </label>
          <input
            type="text"
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => handleInputChange("whatsapp", formatPhone(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.whatsapp ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
          {errors.whatsapp && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.whatsapp}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.website ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="https://exemplo.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.website}</p>
          )}
        </div>

        {/* Localização */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Localização
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white border-gray-300"
            placeholder="Digite a localização da organização"
          />
        </div>

        {/* Link da Localização */}
        <div>
          <label htmlFor="location_link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Link da Localização
          </label>
          <input
            type="url"
            id="location_link"
            value={formData.location_link}
            onChange={(e) => handleInputChange("location_link", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.location_link ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="https://maps.google.com/..."
          />
          {errors.location_link && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location_link}</p>
          )}
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
          {isLoading ? "Salvando..." : organization ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
}
