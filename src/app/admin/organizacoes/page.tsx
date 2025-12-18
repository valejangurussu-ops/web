"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthLevel } from "@/hooks/useAuthLevel";
import { useAuth } from "@/contexts/AuthContext";
import { getUserOrganizationId } from "@/utils/permissions";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrganizationsTable from "@/components/tables/OrganizationsTable";

export default function Organizacoes() {
  const router = useRouter();
  const { isOrganization, loading: authLevelLoading } = useAuthLevel();
  const { user } = useAuth();

  useEffect(() => {
    const redirectIfOrganizationAdmin = async () => {
      if (authLevelLoading) return;

      if (isOrganization && user) {
        // Get organization ID for organization admins
        const orgId = await getUserOrganizationId(user.id);

        // If not found, try via API (for additional users with metadata)
        if (!orgId) {
          try {
            const response = await fetch('/api/users/organizations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userIds: [user.id] }),
            });

            if (response.ok) {
              const data = await response.json();
              const org = data.organizations?.[user.id];
              if (org) {
                router.replace(`/admin/organizacoes/${org.id}`);
                return;
              }
            }
          } catch (error) {
            console.error('Erro ao buscar organização via API:', error);
          }
        } else {
          router.replace(`/admin/organizacoes/${orgId}`);
        }
      }
    };

    redirectIfOrganizationAdmin();
  }, [isOrganization, user, authLevelLoading, router]);

  if (authLevelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (isOrganization) {
    return null; // Redirecionando...
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Organizações" />
      <div className="space-y-6">
        <ComponentCard title="Gerenciamento de Organizações">
          <OrganizationsTable />
        </ComponentCard>
      </div>
    </div>
  );
}
