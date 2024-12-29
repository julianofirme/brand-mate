'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useChat } from 'ai/react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const suggestedQuestions = [
  "Quais são as melhores práticas para engajar no Instagram?",
  "Como posso melhorar meu funil de vendas?",
  "Qual a frequência ideal de postagens nas redes sociais?",
  "Como medir o ROI das minhas campanhas de marketing?",
]

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
}

export default function ChatInterface({ isOpen, onClose, businessId }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      businessId
    }
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSuggestedQuestion = (question: string) => {
    handleInputChange({ target: { value: question } } as any)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-2xl"
          >
            <div className="flex justify-between items-center p-4 bg-indigo-600 text-white">
              <h2 className="text-xl font-bold">Chat com IA{businessId ? ' - Assistente da Marca' : ''}</h2>
              <button onClick={onClose} className="text-white hover:text-gray-200">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-4">
                    <p>Olá! Sou seu assistente de marketing digital{businessId ? ' especializado na sua marca' : ''}.</p>
                    <p>Como posso ajudar você hoje?</p>
                  </div>
                )}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 bg-gray-50">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Digite sua pergunta..."
                    className="flex-1 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </motion.button>
                </form>
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-full transition duration-150 ease-in-out"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
