"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Organization } from "@/types/organization";
import { organizationService } from "@/services/organizationService";
import GenericDeleteConfirmModal from "../modals/GenericDeleteConfirmModal";
import { useRouter } from "next/navigation";

export default function OrganizationsTable() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar organizações
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const organizationsData = await organizationService.getAllOrganizations();
      setOrganizations(organizationsData);
    } catch (error) {
      console.error("Erro ao carregar organizações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  // Abrir página para criar organização
  const handleCreateOrganization = () => {
    router.push("/admin/organizacoes/novo");
  };

  // Abrir página para editar organização
  const handleEditOrganization = (organization: Organization) => {
    router.push(`/admin/organizacoes/${organization.id}/editar`);
  };

  // Ver detalhes da organização
  const handleViewOrganization = (organization: Organization) => {
    router.push(`/admin/organizacoes/${organization.id}`);
  };

  // Abrir modal de confirmação de exclusão
  const handleDeleteOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsDeleteModalOpen(true);
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!selectedOrganization) return;

    try {
      setIsSubmitting(true);
      const success = await organizationService.deleteOrganization(selectedOrganization.id);
      if (success) {
        setOrganizations(organizations.filter(org => org.id !== selectedOrganization.id));
      }
    } catch (error) {
      console.error("Erro ao excluir organização:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fechar modal de exclusão
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedOrganization(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500 dark:text-gray-400">Carregando organizações...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header com botão de adicionar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Organizações ({organizations.length})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie as organizações do sistema
          </p>
        </div>
        <button
          onClick={handleCreateOrganization}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nova Organização
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Nome
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Localização
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    WhatsApp
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Website
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Criado em
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Ações
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {organizations.map((organization) => (
                  <TableRow key={organization.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {organization.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {organization.name}
                          </span>
                          {organization.slogan && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              {organization.slogan}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="max-w-xs truncate">
                        {organization.location || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {organization.whatsapp || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {organization.website ? (
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 truncate max-w-xs block"
                        >
                          {organization.website}
                        </a>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {new Date(organization.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrganization(organization)}
                          className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                          title="Ver detalhes"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditOrganization(organization)}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Editar organização"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteOrganization(organization)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Excluir organização"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 6h18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modal de confirmação de exclusão */}
        <GenericDeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          item={selectedOrganization}
          onConfirm={handleConfirmDelete}
          isLoading={isSubmitting}
          itemType="organização"
        />
      </div>
    </div>
  );
}
