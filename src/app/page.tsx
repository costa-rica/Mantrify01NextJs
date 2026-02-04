import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-calm-50 to-primary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <Image
              src="/images/mantrifyLogo02.png"
              alt="Mantrify Logo"
              width={200}
              height={200}
              priority
              className="mx-auto"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-calm-900 mb-4">
            Welcome to Mantrify
          </h1>

          <p className="text-xl md:text-2xl text-calm-700 mb-8 max-w-2xl">
            Create personalized lightly guided meditations that combine purposeful affirmations
            with contemplative silences
          </p>

          <div className="card max-w-3xl w-full">
            <h2 className="section-heading text-center">Phase 1 Complete!</h2>
            <p className="text-calm-600 text-center">
              Next.js project successfully initialized with TypeScript, Tailwind CSS, and Winston logging.
            </p>
            <div className="mt-4 text-sm text-calm-500 text-center">
              Ready to build Phase 2: Core Infrastructure
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
