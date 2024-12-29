'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MarketingForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    negocio: '',
    segmento: '',
    publicoAlvo: '',
    objetivos: '',
    orcamento: '',
    localizacao: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/results?id=${result.id}`)
      } else {
        throw new Error('Falha ao gerar o plano de marketing')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Ocorreu um erro ao gerar o plano de marketing. Por favor, tente novamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="negocio" className="block text-sm font-medium text-gray-700">Nome do Negócio</label>
          <input
            type="text"
            id="negocio"
            name="negocio"
            value={formData.negocio}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="segmento" className="block text-sm font-medium text-gray-700">Segmento de Mercado</label>
          <input
            type="text"
            id="segmento"
            name="segmento"
            value={formData.segmento}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <label htmlFor="publicoAlvo" className="block text-sm font-medium text-gray-700">Público-Alvo</label>
        <textarea
          id="publicoAlvo"
          name="publicoAlvo"
          value={formData.publicoAlvo}
          onChange={handleChange}
          required
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        ></textarea>
      </div>
      <div>
        <label htmlFor="objetivos" className="block text-sm font-medium text-gray-700">Objetivos</label>
        <input
          type="text"
          id="objetivos"
          name="objetivos"
          value={formData.objetivos}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="orcamento" className="block text-sm font-medium text-gray-700">Orçamento</label>
          <input
            type="text"
            id="orcamento"
            name="orcamento"
            value={formData.orcamento}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="localizacao" className="block text-sm font-medium text-gray-700">Localização (opcional)</label>
          <input
            type="text"
            id="localizacao"
            name="localizacao"
            value={formData.localizacao}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Gerar Plano de Marketing
        </button>
      </div>
    </form>
  )
}

