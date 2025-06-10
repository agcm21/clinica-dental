// This file contains utilities for integrating with n8n workflows

/**
 * Prepares appointment data for n8n webhook
 * @param appointment The appointment data
 * @returns Formatted data for n8n
 */
export function prepareAppointmentForN8n(appointment: any) {
  const patient = appointment.patients || {}

  return {
    id: appointment.id,
    title: appointment.title || appointment.treatment_type,
    patientName: `${patient.first_name || ""} ${patient.last_name || ""}`.trim(),
    patientId: appointment.patient_id,
    patientEmail: patient.email || "",
    patientPhone: patient.phone || "",
    date: appointment.appointment_date,
    startTime: appointment.start_time,
    endTime: appointment.end_time,
    treatmentType: appointment.treatment_type,
    doctor: appointment.doctor || "",
    notes: appointment.notes || "",
    status: appointment.status,
    createdAt: appointment.created_at,
    updatedAt: appointment.updated_at,
  }
}

/**
 * Sends appointment data to n8n webhook
 * @param appointment The appointment data
 * @param webhookUrl The n8n webhook URL
 * @returns Response from the webhook
 */
export async function sendAppointmentToN8n(appointment: any, webhookUrl: string) {
  try {
    if (!webhookUrl) {
      throw new Error("N8n webhook URL is not configured")
    }

    const formattedData = prepareAppointmentForN8n(appointment)

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    })

    if (!response.ok) {
      throw new Error(`Error sending data to n8n: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error in n8n integration:", error)
    throw error
  }
}

/**
 * Webhook endpoint for n8n to fetch available slots
 * @param date The date to check
 * @returns Available time slots for the date
 */
export async function getAvailableSlotsForN8n(date: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/appointments/available-slots?date=${date}`)

    if (!response.ok) {
      throw new Error(`Error fetching available slots: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching available slots for n8n:", error)
    throw error
  }
}

/**
 * Creates an appointment from n8n data
 * @param appointmentData The appointment data from n8n
 * @returns The created appointment
 */
export async function createAppointmentFromN8n(appointmentData: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    })

    if (!response.ok) {
      throw new Error(`Error creating appointment: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating appointment from n8n:", error)
    throw error
  }
}
