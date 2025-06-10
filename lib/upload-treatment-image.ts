import { supabase } from "./supabase-client"

export async function uploadTreatmentImage(file: File) {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage.from("treatment-images").upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from("treatment-images").getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error:", error)
    throw error
  }
}
