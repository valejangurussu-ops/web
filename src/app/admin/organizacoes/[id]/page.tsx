"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Organization } from "@/types/organization";
import { organizationService } from "@/services/organizationService";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function DetalhesOrganizacao() {
  const router = useRouter();
  const params = useParams();
  const organizationId = parseInt(params.id as string);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError("Erro ao carregar detalhes da organização.");
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      loadOrganization();
    }
  }, [organizationId]);

  const handleDeleteOrganization = async () => {
    if (!organization) return;

    if (confirm(`Tem certeza que deseja excluir a organização ${organization.name}?`)) {
      try {
        const success = await organizationService.deleteOrganization(organization.id);
        if (success) {
          router.push("/admin/organizacoes");
        } else {
          alert("Erro ao excluir organização.");
        }
      } catch (err) {
        console.error("Erro ao excluir organização:", err);
        alert("Erro ao excluir organização.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500 dark:text-gray-400">Carregando organização...</div>
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
        pageTitle="Detalhes da Organização"
        breadcrumbs={[
          { label: "Organizações", href: "/admin/organizacoes" },
          { label: organization.name, href: `/admin/organizacoes/${organization.id}` }
        ]}
      />
      <div className="space-y-6">
        {/* Informações Básicas */}
        <ComponentCard title="Informações Básicas">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-2xl">
                  {organization.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome
                </label>
                <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                  {organization.name}
                </p>
              </div>
              {organization.slogan && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slogan
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white italic">
                    &quot;{organization.slogan}&quot;
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Criado em
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(organization.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Informações de Contato */}
        <ComponentCard title="Informações de Contato">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {organization.whatsapp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    WhatsApp
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {organization.whatsapp}
                  </p>
                </div>
              )}
              {organization.website && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Website
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {organization.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {organization.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Localização
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {organization.location}
                  </p>
                </div>
              )}
              {organization.location_link && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Link da Localização
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    <a
                      href={organization.location_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Ver no mapa
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </ComponentCard>

        {/* Ações */}
        <ComponentCard title="Ações">
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/admin/organizacoes/${organization.id}/editar`)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar
            </button>
            <button
              onClick={handleDeleteOrganization}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Excluir
            </button>
            <button
              onClick={() => router.push("/admin/organizacoes")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Voltar
            </button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
