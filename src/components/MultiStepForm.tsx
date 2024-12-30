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
  const [isGenerating, setIsGenerating] = useState(false)
  const [businessId, setBusinessId] = useState('')
  const [formData, setFormData] = useState({
    negocio: '',
    segmento: '',
    publicoAlvo: '',
    objetivos: '',
    orcamento: '',
    localizacao: '',
    pdfUpload: undefined
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPdfFile(file)
      
      // Process PDF immediately after upload
      try {
        const formDataWithPdf = new FormData()
        formDataWithPdf.append('pdf', file)
        
        const pdfResponse = await fetch('/api/process-pdf', {
          method: 'POST',
          body: formDataWithPdf,
        });
        
        if (pdfResponse.ok) {
          const { businessId: id } = await pdfResponse.json();
          setBusinessId(id);
        }
      } catch (error) {
        console.error('Error processing PDF:', error);
        alert('Ocorreu um erro ao processar o PDF. Por favor, tente novamente.');
      }
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

  const generatePlan = async () => {
    if (isGenerating) return;
    
    try {
      setIsGenerating(true);
      
      const planData = {
        title: formData.negocio,
        businessData: {
          ...formData,
          businessId
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
        router.push(`/results?id=${result.id}`)
      } else {
        throw new Error('Falha ao gerar o plano de marketing')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Ocorreu um erro ao gerar o plano de marketing. Por favor, tente novamente.')
    } finally {
      setIsGenerating(false)
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
        <form onSubmit={(e) => {
          e.preventDefault();
          if (step < formFields.length - 1) {
            nextStep();
          }
        }}>
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
                          className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          <span>Upload um arquivo</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF até 10MB</p>
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
                <div className="text-sm text-indigo-600 mb-4">
                  {getFeedbackMessage()}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-8">
            {step > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Anterior
              </button>
            )}
            <div className="ml-auto">
              {step < formFields.length - 1 ? (
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={generatePlan}
                  disabled={isGenerating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Gerando Plano...' : 'Gerar Plano de Marketing'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
