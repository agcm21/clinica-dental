"use client"

import { useState } from "react"
import { X, Mail, Phone, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { treatmentOptions } from "@/lib/treatment-prices"
import { formatCurrency } from "@/lib/utils"

interface PresupuestoPreviewProps {
  presupuesto: any
  onSend: (method: string) => Promise<void>
  onClose: () => void
  isOpen: boolean
}

export function PresupuestoPreview({ presupuesto, onSend, onClose, isOpen }: PresupuestoPreviewProps) {
  const [activeTab, setActiveTab] = useState("email")
  const [isSending, setIsSending] = useState(false)

  const handleSend = async (method: string) => {
    try {
      setIsSending(true)
      await onSend(method)
    } catch (error) {
      console.error("Error al enviar:", error)
    } finally {
      setIsSending(false)
      onClose()
    }
  }

  const getTreatmentLabel = (value: string) => {
    const treatment = treatmentOptions.find((t) => t.value === value)
    return treatment ? treatment.label : value
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Vista previa del presupuesto</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Correo electrónico</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>PDF</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Vista previa del correo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="mb-6 text-center">
                    <h1 className="text-xl font-bold text-blue-600 mb-2">Clínica Dental</h1>
                    <p className="text-sm text-gray-500">Su salud dental es nuestra prioridad</p>
                  </div>

                  <div className="mb-6">
                    <p className="mb-2">
                      Estimado/a{" "}
                      <strong>
                        {presupuesto.nombre} {presupuesto.apellido}
                      </strong>
                      ,
                    </p>
                    <p className="text-gray-700">
                      Nos complace presentarle el presupuesto solicitado para su tratamiento dental. A continuación
                      encontrará los detalles del servicio y costos asociados.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-blue-600">Detalles del presupuesto</h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <p className="text-gray-600">Tratamiento:</p>
                        <p className="col-span-2 font-medium">{getTreatmentLabel(presupuesto.tratamiento)}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <p className="text-gray-600">Descripción:</p>
                        <p className="col-span-2">{presupuesto.descripcion || "No se proporcionó una descripción"}</p>
                      </div>
                      {presupuesto.imagen && (
                        <div className="mt-4">
                          <p className="text-gray-600 mb-2">Imagen de referencia:</p>
                          <img
                            src={
                              typeof presupuesto.imagen === "string"
                                ? presupuesto.imagen
                                : URL.createObjectURL(presupuesto.imagen)
                            }
                            alt="Imagen de referencia"
                            className="max-w-full h-auto rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                      <div className="mt-4 border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total:</span>
                          <span>${formatCurrency(presupuesto.monto)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-700">
                      Este presupuesto tiene una validez de 30 días a partir de la fecha de emisión. Si tiene alguna
                      pregunta o desea programar su tratamiento, no dude en contactarnos.
                    </p>
                  </div>

                  <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
                    <p>Clínica Dental</p>
                    <p>Dirección: Av. Principal #123</p>
                    <p>Teléfono: (123) 456-7890</p>
                    <p>Email: info@clinicadental.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Vista previa de WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-sm font-sans">
                  <p className="mb-4">🦷 *CLÍNICA DENTAL - PRESUPUESTO* 🦷</p>

                  <p className="mb-2">Hola *{presupuesto.nombre}*,</p>
                  <p className="mb-4">Le enviamos el presupuesto solicitado para su tratamiento dental:</p>

                  <p className="mb-1">*Tratamiento:* {getTreatmentLabel(presupuesto.tratamiento)}</p>
                  {presupuesto.descripcion && <p className="mb-1">*Descripción:* {presupuesto.descripcion}</p>}
                  <p className="mb-4">*Monto total:* $*{formatCurrency(presupuesto.monto)}*</p>

                  <p className="mb-4">
                    Este presupuesto tiene una validez de 30 días. Para agendar su cita o más información, contáctenos
                    al (123) 456-7890.
                  </p>

                  <p>¡Gracias por confiar en nosotros!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pdf" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Vista previa del PDF</span>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Descargar PDF</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="text-center mb-6">
                    <h1 className="text-xl font-bold">PRESUPUESTO DENTAL</h1>
                    <p className="text-sm text-gray-500">
                      No. {presupuesto.id?.substring(0, 8) || "TEMP-" + Date.now().toString().substring(0, 8)}
                    </p>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <h2 className="text-sm font-semibold uppercase text-gray-500 mb-1">DATOS DEL PACIENTE</h2>
                      <p>
                        <strong>Nombre:</strong> {presupuesto.nombre} {presupuesto.apellido}
                      </p>
                      <p>
                        <strong>Cédula:</strong> {presupuesto.cedula}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {presupuesto.telefono}
                      </p>
                      {presupuesto.email && (
                        <p>
                          <strong>Email:</strong> {presupuesto.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold uppercase text-gray-500 mb-1">DATOS DEL PRESUPUESTO</h2>
                      <p>
                        <strong>Fecha:</strong> {new Date().toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Validez:</strong> 30 días
                      </p>
                      <p>
                        <strong>Método de pago:</strong> Efectivo, tarjeta o transferencia
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">DETALLE DEL PRESUPUESTO</h2>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-left">Concepto</th>
                          <th className="border border-gray-300 p-2 text-left">Descripción</th>
                          <th className="border border-gray-300 p-2 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-2">{getTreatmentLabel(presupuesto.tratamiento)}</td>
                          <td className="border border-gray-300 p-2">
                            {presupuesto.descripcion || "Tratamiento dental"}
                          </td>
                          <td className="border border-gray-300 p-2 text-right">
                            ${formatCurrency(presupuesto.monto)}
                          </td>
                        </tr>
                        <tr className="bg-gray-50 font-bold">
                          <td className="border border-gray-300 p-2" colSpan={2}>
                            TOTAL
                          </td>
                          <td className="border border-gray-300 p-2 text-right">
                            ${formatCurrency(presupuesto.monto)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {presupuesto.imagen && (
                    <div className="mb-6">
                      <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">IMAGEN DE REFERENCIA</h2>
                      <div className="flex justify-center">
                        <img
                          src={
                            typeof presupuesto.imagen === "string"
                              ? presupuesto.imagen
                              : URL.createObjectURL(presupuesto.imagen)
                          }
                          alt="Imagen de referencia"
                          className="max-w-full h-auto rounded-lg border border-gray-200 max-h-48"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">NOTAS</h2>
                    <p className="text-sm text-gray-700">
                      Este presupuesto no incluye tratamientos adicionales que pudieran ser necesarios durante el
                      proceso. La tarifa puede variar si las condiciones del tratamiento cambian.
                    </p>
                  </div>

                  <div className="text-center mt-8 pt-4 border-t text-xs text-gray-500">
                    <p>Clínica Dental - Av. Principal #123 - (123) 456-7890 - info@clinicadental.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4 gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => handleSend(activeTab)} disabled={isSending} className="bg-blue-600 hover:bg-blue-700">
            {isSending
              ? "Enviando..."
              : `Enviar por ${activeTab === "email" ? "correo" : activeTab === "whatsapp" ? "WhatsApp" : "correo con PDF"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


