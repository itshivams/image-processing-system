import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-6 py-12">
      <header className="w-full max-w-6xl flex justify-between items-center py-6">
        <h1 className="text-3xl font-bold text-gray-900">Image Processing System</h1>
        <nav className="space-x-6">
          <Link href="#features" className="text-gray-700 hover:text-gray-900">Features</Link>
          <Link href="#tech-stack" className="text-gray-700 hover:text-gray-900">Tech Stack</Link>
          <Link href="#get-started" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Get Started</Link>
        </nav>
      </header>
      
      <main className="w-full max-w-4xl text-center mt-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">Effortless Image Processing</h2>
        <p className="text-lg text-gray-600 mb-8">
          Upload images from CSV, process them asynchronously, and get optimized results.
        </p>
        <Link href="#get-started" className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700">
          Get Started
        </Link>
      </main>

      <section id="features" className="w-full max-w-6xl mt-20">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard title="CSV Upload" description="Easily upload product details & image URLs." />
          <FeatureCard title="Asynchronous Processing" description="Images are processed efficiently in the background." />
          <FeatureCard title="Supabase Storage" description="Compressed images are stored securely in Supabase." />
        </div>
      </section>
      
      <section id="tech-stack" className="w-full max-w-6xl mt-20">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Tech Stack</h3>
        <p className="text-gray-700 text-lg">Next.js | Supabase | Redis | BullMQ | Sharp</p>
      </section>
      
      <footer id="get-started" className="w-full max-w-6xl text-center mt-20 py-10 border-t">
        <h3 className="text-xl font-semibold text-gray-900">Start Processing Images Today!</h3>
        <Link href="/api/upload" className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg text-lg hover:bg-green-700 inline-block">
          Upload CSV
        </Link>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}
