"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrganizationForm from "@/components/forms/OrganizationForm";
import { OrganizationFormData } from "@/types/organization";
import { organizationService } from "@/services/organizationService";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NovaOrganizacao() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (organizationData: OrganizationFormData) => {
    try {
      setIsSubmitting(true);
      await organizationService.createOrganization(organizationData);
      router.push("/admin/organizacoes");
    } catch (error) {
      console.error("Erro ao criar organização:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/organizacoes");
  };

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Nova Organização"
        breadcrumbs={[
          { label: "Organizações", href: "/admin/organizacoes" },
          { label: "Nova", href: "/admin/organizacoes/novo" }
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Criar Nova Organização">
          <OrganizationForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
