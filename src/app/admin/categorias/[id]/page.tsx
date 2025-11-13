"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { EventCategory } from "@/types/eventCategory";
import { eventCategoryService } from "@/services/eventCategoryService";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function DetalhesCategoria() {
  const router = useRouter();
  const params = useParams();
  const categoryId = parseInt(params.id as string);
  const [category, setCategory] = useState<EventCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError("Erro ao carregar detalhes da categoria.");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const handleDeleteCategory = async () => {
    if (!category) return;

    if (confirm(`Tem certeza que deseja excluir a categoria ${category.label}?`)) {
      try {
        const success = await eventCategoryService.deleteCategory(category.id);
        if (success) {
          router.push("/admin/categorias");
        } else {
          alert("Erro ao excluir categoria.");
        }
      } catch (err) {
        console.error("Erro ao excluir categoria:", err);
        alert("Erro ao excluir categoria.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500 dark:text-gray-400">Carregando categoria...</div>
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
        pageTitle={`Detalhes - ${category.label}`}
        breadcrumbs={[
          { label: "Categorias", href: "/admin/categorias" },
          { label: category.label, href: `/admin/categorias/${category.id}` }
        ]}
      />
      <div className="space-y-6">
        {/* Informações Básicas */}
        <ComponentCard title="Informações Básicas">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center space-x-4">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <span className="text-white font-medium text-2xl">
                  {category.label.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {category.label}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                  {category.color}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Detalhes Completos */}
        <ComponentCard title="Detalhes Completos">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Label
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{category.label}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cor (HEX)
                </label>
                <div className="mt-1 flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg border border-gray-300"
                    style={{ backgroundColor: category.color }}
                  />
                  <p className="text-sm text-gray-900 dark:text-white font-mono">
                    {category.color}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{category.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Criado em
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(category.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Preview */}
        <ComponentCard title="Preview">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Como esta categoria aparecerá nos eventos:
            </p>
            <div className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {category.label}
              </span>
            </div>
          </div>
        </ComponentCard>

        {/* Ações */}
        <ComponentCard title="Ações">
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/admin/categorias/${category.id}/editar`)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar
            </button>
            <button
              onClick={handleDeleteCategory}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Excluir
            </button>
            <button
              onClick={() => router.push("/admin/categorias")}
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
