import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-8">Agenda de Turnos - Psicología</h1>
      <div className="flex gap-4">
        <Link 
          href="/admisionista" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Panel Admisionistas
        </Link>
        <Link 
          href="/profesional" 
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
        >
          Panel Profesionales
        </Link>
      </div>
    </main>
  );
}
