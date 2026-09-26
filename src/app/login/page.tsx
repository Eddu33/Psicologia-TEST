"use client";

import { login } from "@/app/auth-actions";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Ingreso a Profesionales</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Usuario</label>
            <input type="text" name="username" required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input type="password" name="password" required className="w-full border p-2 rounded" />
          </div>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded font-medium mt-4 hover:bg-blue-700">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
