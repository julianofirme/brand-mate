import MultiStepForm from '@/components/MultiStepForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gere seu Plano de Marketing</h2>
          <MultiStepForm />
        </div>
      </div>
    </div>
  )
}

