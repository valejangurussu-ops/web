"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EventCategoryForm from "@/components/forms/EventCategoryForm";
import { EventCategoryFormData } from "@/types/eventCategory";
import { eventCategoryService } from "@/services/eventCategoryService";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NovaCategoria() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (categoryData: EventCategoryFormData) => {
    try {
      setIsSubmitting(true);
      await eventCategoryService.createCategory(categoryData);
      router.push("/admin/categorias");
    } catch (error: unknown) {
      console.error("Erro ao criar categoria:", error);
      // Re-throw o erro para que o formulário possa capturá-lo
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/categorias");
  };

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Nova Categoria"
        breadcrumbs={[
          { label: "Categorias", href: "/admin/categorias" },
          { label: "Nova", href: "/admin/categorias/novo" }
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Criar Nova Categoria">
          <EventCategoryForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
