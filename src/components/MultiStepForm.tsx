'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRightIcon, ChevronLeftIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline'

const formFields = [
  { name: 'negocio', label: 'Nome do Negócio', type: 'text', placeholder: 'Ex: Minha Loja Online' },
  { name: 'segmento', label: 'Segmento de Mercado', type: 'text', placeholder: 'Ex: E-commerce de Moda' },
  { name: 'publicoAlvo', label: 'Público-Alvo', type: 'textarea', placeholder: 'Ex: Mulheres entre 25-40 anos interessadas em moda sustentável' },
  { name: 'objetivos', label: 'Objetivos', type: 'text', placeholder: 'Ex: Aumentar vendas online em 30%' },
  { name: 'orcamento', label: 'Orçamento', type: 'text', placeholder: 'Ex: R$ 5.000 por mês' },
  { name: 'localizacao', label: 'Localização (opcional)', type: 'text', placeholder: 'Ex: São Paulo, SP' },
  { name: 'pdfUpload', label: 'Upload do PDF da Marca (opcional)', type: 'file', accept: '.pdf' },
]

export default function MultiStepForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    negocio: '',
    segmento: '',
    publicoAlvo: '',
    objetivos: '',
    orcamento: '',
    localizacao: '',
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0])
    }
  }

  const nextStep = () => {
    if (step < formFields.length - 1) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const planData = {
        title: formData.negocio,
        businessData: {
          ...formData, 
        }
      }
  
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      })
  
      if (response.ok) {
        const result = await response.json()
        
        if (pdfFile) {
          const formDataWithPdf = new FormData()
          formDataWithPdf.append('pdf', pdfFile)
          formDataWithPdf.append('planId', result.id)
          
          await fetch('/api/upload-pdf', {
            method: 'POST',
            body: formDataWithPdf,
          })
        }
  
        router.push(`/results?id=${result.id}`)
      } else {
        throw new Error('Falha ao gerar o plano de marketing')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Ocorreu um erro ao gerar o plano de marketing. Por favor, tente novamente.')
    }
  }

  const currentField = formFields[step]

  const getFeedbackMessage = () => {
    if (step === formFields.length - 1 && !pdfFile) {
      return "Queremos saber mais! Adicione um PDF da marca para sugestões ainda mais personalizadas."
    }
    if (step === 1 && formData.segmento.length < 10) {
      return "Nos diga o que diferencia sua marca para melhores insights."
    }
    return ""
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-8 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Consultor de Marketing AI</h2>
        <div className="mb-8">
          <div className="flex justify-between">
            {formFields.map((_, index) => (
              <div
                key={index}
                className={`w-1/6 h-1 rounded-full ${
                  index <= step ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <label htmlFor={currentField.name} className="block text-sm font-medium text-gray-700 mb-2">
                  {currentField.label}
                </label>
                {currentField.type === 'textarea' ? (
                  <textarea
                    id={currentField.name}
                    name={currentField.name}
                    value={formData[currentField.name as keyof typeof formData] || ''}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder={currentField.placeholder}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                  />
                ) : currentField.type === 'file' ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <input
                    type={currentField.type}
                    id={currentField.name}
                    name={currentField.name}
                    value={formData[currentField.name as keyof typeof formData] || ''}
                    onChange={handleChange}
                    required
                    placeholder={currentField.placeholder}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                  />
                )}
              </div>
              {getFeedbackMessage() && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-indigo-600 mt-2"
                >
                  {getFeedbackMessage()}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-8">
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
            >
              <ChevronLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Anterior
            </motion.button>
            {step === formFields.length - 1 ? (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Gerar Plano
                <ChevronRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={nextStep}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Próximo
                <ChevronRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

