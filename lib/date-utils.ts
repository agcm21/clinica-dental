/**
 * Utility functions for handling dates consistently across the application
 * to avoid timezone issues
 */
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Formats a date string from the database for display in the UI
 * Handles timezone issues by using a fixed time and adjusting if needed
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return ""

  try {
    // Create date with fixed noon time to avoid timezone issues
    const date = new Date(`${dateString}T12:00:00`)

    // Check if the date in the database is already correct by comparing raw values
    const dbDate = new Date(dateString)
    const dbDay = dbDate.getUTCDate() // Use UTC methods to avoid timezone issues
    const displayDay = date.getDate()

    // Log for debugging
    console.log(`Date string: ${dateString}, DB day: ${dbDay}, Display day: ${displayDay}`)

    // If there's a discrepancy, adjust the date
    let adjustedDate = date
    if (dbDay !== displayDay) {
      adjustedDate = addDays(date, 1)
      console.log(`Adjusted date: ${adjustedDate.toISOString()}`)
    }

    return format(adjustedDate, "EEEE, d 'De' MMMM 'De' yyyy", { locale: es })
  } catch (error) {
    console.error("Error formatting date:", error, "for date string:", dateString)
    return dateString // Return original string if there's an error
  }
}

/**
 * Formats a date for storage in the database
 * Ensures consistent YYYY-MM-DD format regardless of timezone
 */
export function formatDateForDatabase(dateString: string): string {
  if (!dateString) return ""

  try {
    // Create date with fixed noon time to avoid timezone issues
    const localDate = new Date(`${dateString}T12:00:00`)

    // Generate YYYY-MM-DD format manually to avoid timezone conversions
    const year = localDate.getFullYear()
    const month = String(localDate.getMonth() + 1).padStart(2, "0")
    const day = String(localDate.getDate()).padStart(2, "0")

    const formattedDate = `${year}-${month}-${day}`
    console.log(`Original: ${dateString}, Formatted for DB: ${formattedDate}`)

    return formattedDate
  } catch (error) {
    console.error("Error formatting date for database:", error)
    return dateString
  }
}

/**
 * Compares two date strings to check if they represent the same day
 * Useful for checking if a date needs adjustment
 */
export function isSameDay(date1: string, date2: string): boolean {
  if (!date1 || !date2) return false

  const d1 = new Date(`${date1}T12:00:00`)
  const d2 = new Date(`${date2}T12:00:00`)

  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

/**
 * Debug function to log date information
 */
export function debugDate(label: string, dateString: string): void {
  console.log(`--- ${label} ---`)
  console.log("Original string:", dateString)

  const date = new Date(dateString)
  console.log("As Date object:", date)
  console.log("ISO string:", date.toISOString())
  console.log("Local string:", date.toString())
  console.log("UTC string:", date.toUTCString())
  console.log("Day (local):", date.getDate())
  console.log("Day (UTC):", date.getUTCDate())
  console.log("----------------")
}
