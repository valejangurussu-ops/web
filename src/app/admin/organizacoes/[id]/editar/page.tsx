"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrganizationForm from "@/components/forms/OrganizationForm";
import { Organization, OrganizationFormData } from "@/types/organization";
import { organizationService } from "@/services/organizationService";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditarOrganizacao() {
  const router = useRouter();
  const params = useParams();
  const organizationId = parseInt(params.id as string);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        setLoading(true);
        const organizationData = await organizationService.getOrganizationById(organizationId);
        if (organizationData) {
          setOrganization(organizationData);
        } else {
          setError("Organização não encontrada");
        }
      } catch (err) {
        console.error("Erro ao carregar organização:", err);
        setError("Erro ao carregar detalhes da organização para edição.");
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      loadOrganization();
    }
  }, [organizationId]);

  const handleSubmit = async (organizationData: OrganizationFormData) => {
    try {
      setIsSubmitting(true);
      await organizationService.updateOrganization(organizationId, organizationData);
      router.push(`/admin/organizacoes/${organizationId}`);
    } catch (error) {
      console.error("Erro ao atualizar organização:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/organizacoes/${organizationId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500 dark:text-gray-400">Carregando organização para edição...</div>
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

  if (!organization) {
    return null;
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle="Editar Organização"
        breadcrumbs={[
          { label: "Organizações", href: "/admin/organizacoes" },
          { label: organization.name, href: `/admin/organizacoes/${organization.id}` },
          { label: "Editar", href: `/admin/organizacoes/${organization.id}/editar` },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title={`Editar ${organization.name}`}>
          <OrganizationForm
            organization={organization}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
