"use client"

import Link from "next/link"
import { FileText, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function IndicadoresPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F6FAFB] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Agregar indicadores mensuales</h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Selecciona el tipo de indicador que deseas agregar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Agregar Variable Card */}
          <Link href="/dashboard/indicadores/variable">
            <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-sky-500 transition-all duration-300 cursor-pointer h-full shadow-sm">
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-100 rounded-full flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-sky-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Agregar Indicador</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Registra indicadores mensuales como número de acometidas, clientes, facturación y más.
                </p>
                <Button className="mt-4 bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto">Ir a Indicadores</Button>
              </div>
            </div>
          </Link>

          {/* Agregar Objetivo Card */}
          <Link href="/dashboard/indicadores/objetivo">
            <div className="group relative bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 hover:border-sky-500 transition-all duration-300 cursor-pointer h-full shadow-sm">
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-100 rounded-full flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                  <Target className="w-8 h-8 sm:w-10 sm:h-10 text-sky-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Agregar Objetivo</h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Ingresa objetivos anuales de ciertos indicadores segun cálculos establecidos.
                </p>
                <Button className="mt-4 bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto">Ir a Objetivos</Button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
