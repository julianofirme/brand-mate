'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ArrowDownTrayIcon, ClipboardIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import ChatInterface from '@/components/ChatInterface'
import ReactMarkdown from 'react-markdown'

interface PlanResult {
  resumoNegocio: string
  socialMedia: string[]
  campanhasPagas: string[]
  contentMarketing: string[]
  emailMarketing: string[]
  kpis: string[]
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const [planResult, setPlanResult] = useState<PlanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const id = searchParams.get('id')

  useEffect(() => {
    const fetchResults = async () => {
      if (id) {
        try {
          const response = await fetch(`/api/get-plan?id=${id}`)
          if (response.ok) {
            const data = await response.json()
            setPlanResult(data.plan)
          } else {
            throw new Error('Falha ao recuperar o plano')
          }
        } catch (error) {
          console.error('Erro:', error)
          alert('Ocorreu um erro ao carregar o plano. Por favor, tente novamente.')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchResults()
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!planResult) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="text-2xl font-semibold text-gray-700">Plano não encontrado</div>
      </div>
    )
  }

  const renderSection = (title: string, items: string[]) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center"><CheckCircleIcon className="h-5 w-5 text-green-500 mr-1 flex-shrink-0"/> {title}</h3>
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mb-2" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-md font-semibold mb-2" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-indigo-600" {...props} />,
                p: ({ node, ...props }) => <p className="mb-3 text-gray-700" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                a: ({ node, ...props }) => (
                  <a className="text-indigo-600 hover:text-indigo-800 underline" {...props} />
                ),
              }}
              className="prose max-w-none"
            >
              {item}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-lg overflow-hidden"
        >
          <div className="px-4 py-5 sm:px-6 bg-indigo-600">
            <h1 className="text-3xl font-bold text-white">Seu Plano de Marketing Personalizado</h1>
            <p className="mt-1 max-w-2xl text-sm text-indigo-100">Gerado pela nossa IA especializada em marketing.</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Resumo do Negócio</h2>
              <p className="text-gray-700">{planResult.resumoNegocio}</p>
            </div>
            {renderSection("Social Media", planResult.socialMedia)}
            {renderSection("Campanhas Pagas", planResult.campanhasPagas)}
            {renderSection("Content Marketing", planResult.contentMarketing)}
            {renderSection("E-mail Marketing", planResult.emailMarketing)}
            {renderSection("KPIs", planResult.kpis)}
          </div>
        </motion.div>
        <div className="mt-6 flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
            Salvar como PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(planResult, null, 2))
              alert('Plano copiado para a área de transferência!')
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ClipboardIcon className="mr-2 h-5 w-5" />
            Copiar para Área de Transferência
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ChatBubbleLeftRightIcon className="mr-2 h-6 w-6" />
          Chat com IA
        </motion.button>
      </div>
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} businessId={id!} />
    </div>
  )
}
