"use client";

import React, { useState } from "react";

interface Dream {
  id: number;
  category: string;
  description: string;
}

export function DreamsSection() {
  const [dreams, setDreams] = useState<Dream[]>([
    {
      id: 1,
      category: "Cultura",
      description: "Aprender a tocar violão"
    },
    {
      id: 2,
      category: "Trabalho",
      description: "Conseguir um emprego na área de tecnologia"
    },
    {
      id: 3,
      category: "Saúde",
      description: "Fazer mais atividades ao ar livre"
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [newDream, setNewDream] = useState({ category: "", description: "" });

  const handleAddDream = () => {
    if (newDream.category && newDream.description) {
      setDreams([...dreams, {
        id: Date.now(),
        category: newDream.category,
        description: newDream.description
      }]);
      setNewDream({ category: "", description: "" });
    }
  };

  const handleRemoveDream = (id: number) => {
    setDreams(dreams.filter(dream => dream.id !== id));
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-800">
          Meus Sonhos e Objetivos
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          {isEditing ? "Concluir" : "Editar"}
        </button>
      </div>

      <div className="space-y-3">
        {dreams.map((dream) => (
          <div key={dream.id} className="flex items-center justify-between bg-white rounded-lg p-3">
            <div className="flex-1">
              <span className="font-bold text-green-800">{dream.category}:</span>
              <span className="ml-2 text-gray-700">{dream.description}</span>
            </div>
            {isEditing && (
              <button
                onClick={() => handleRemoveDream(dream.id)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={newDream.category}
                  onChange={(e) => setNewDream({ ...newDream, category: e.target.value })}
                  placeholder="Ex: Cultura, Trabalho, Saúde..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={newDream.description}
                  onChange={(e) => setNewDream({ ...newDream, description: e.target.value })}
                  placeholder="Descreva seu objetivo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleAddDream}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Adicionar Objetivo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
