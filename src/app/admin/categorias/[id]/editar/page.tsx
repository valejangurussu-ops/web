"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EventCategoryForm from "@/components/forms/EventCategoryForm";
import { EventCategory, EventCategoryFormData } from "@/types/eventCategory";
import { eventCategoryService } from "@/services/eventCategoryService";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditarCategoria() {
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const categoryData = await eventCategoryService.getCategoryById(categoryId);
        if (categoryData) {
          setCategory(categoryData);
        } else {
          setError("Categoria não encontrada");
        }
      } catch (err) {
        console.error("Erro ao carregar categoria:", err);
        setError("Erro ao carregar detalhes da categoria para edição.");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const handleSubmit = async (categoryData: EventCategoryFormData) => {
    try {
      setIsSubmitting(true);
      await eventCategoryService.updateCategory(categoryId, categoryData);
      router.push(`/admin/categorias/${categoryId}`);
    } catch (error: unknown) {
      console.error("Erro ao atualizar categoria:", error);
      // Re-throw o erro para que o formulário possa capturá-lo
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/categorias/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500 dark:text-gray-400">Carregando categoria para edição...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`Editar - ${category.label}`}
        breadcrumbs={[
          { label: "Categorias", href: "/admin/categorias" },
          { label: category.label, href: `/admin/categorias/${category.id}` },
          { label: "Editar", href: `/admin/categorias/${category.id}/editar` },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title={`Editar ${category.label}`}>
          <EventCategoryForm
            category={category}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
