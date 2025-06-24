import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

export async function uploadTreatmentImage(file: File, patientId: string, treatmentId: string) {
  try {
    console.log("Iniciando proceso de carga de imagen...", { patientId, treatmentId, fileName: file.name })

    // Verificar el bucket antes de subir
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      throw new Error(`Error al verificar buckets: ${bucketsError.message}`)
    }

    const bucket = buckets.find((b: any) => b.name === "treatment-images")
    if (!bucket) {
      throw new Error('Bucket "treatment-images" no encontrado')
    }

    // Validar el archivo
    if (!file) {
      throw new Error("No se proporcionó ningún archivo")
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("El archivo excede el tamaño máximo permitido de 5MB")
    }

    // Crear estructura de carpetas y nombre de archivo
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const fileName = `${patientId}/${treatmentId}/${uuidv4()}.${fileExt}`

    console.log("Subiendo archivo:", fileName)

    // Intentar subir el archivo
    const { data, error: uploadError } = await supabase.storage.from("treatment-images").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false, // Cambiado a false para evitar sobrescrituras accidentales
      contentType: file.type, // Agregar tipo de contenido explícito
    })

    if (uploadError) {
      console.error("Error detallado de subida:", uploadError)
      throw new Error(`Error al subir imagen: ${uploadError.message}`)
    }

    if (!data?.path) {
      throw new Error("No se recibió la ruta del archivo subido")
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage.from("treatment-images").getPublicUrl(data.path)

    if (!urlData?.publicUrl) {
      throw new Error("No se pudo generar la URL pública")
    }

    // Verificar que la URL es accesible
    try {
      const response = await fetch(urlData.publicUrl, { method: "HEAD" })
      if (!response.ok) {
        throw new Error(`La URL no es accesible: ${response.status}`)
      }
    } catch (error) {
      console.error("Error al verificar URL:", error)
      // No lanzamos el error aquí para no interrumpir el proceso
    }

    console.log("Imagen subida exitosamente:", {
      path: data.path,
      url: urlData.publicUrl,
    })

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error en uploadTreatmentImage:", error)
    throw error
  }
}

export async function deleteTreatmentImage(filePath: string) {
  try {
    const { error } = await supabase.storage.from("treatment-images").remove([filePath])

    if (error) {
      throw new Error(`Error al eliminar imagen: ${error.message}`)
    }
  } catch (error) {
    console.error("Error al eliminar imagen:", error)
    throw error
  }
}

export async function checkBucketExists(): Promise<boolean> {
  try {
    console.log("Verificando existencia del bucket 'treatment-images'...")
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error("Error al listar buckets:", error)
      return false
    }

    const bucketExists = buckets.some((bucket: any) => bucket.name === "treatment-images")
    console.log(`Bucket 'treatment-images' ${bucketExists ? "existe" : "no existe"}`)

    return bucketExists
  } catch (error) {
    console.error("Error al verificar la existencia del bucket:", error)
    return false
  }
}

export async function createBucketIfNotExists(): Promise<boolean> {
  try {
    const bucketExists = await checkBucketExists()
    if (bucketExists) {
      console.log("Bucket 'treatment-images' already exists.")
      return true
    }

    console.log("Intentando crear bucket 'treatment-images'...")
    const { data, error } = await supabase.storage.createBucket("treatment-images", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    })

    if (error) {
      console.error("Error creating bucket:", error)
      return false
    }

    console.log("Bucket 'treatment-images' created successfully:", data)
    return true
  } catch (error) {
    console.error("Error al crear el bucket:", error)
    return false
  }
}

export async function verifyBucketAccess() {
  try {
    // Verificar que el bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      throw new Error(`Error al listar buckets: ${bucketsError.message}`)
    }

    const bucket = buckets.find((b: any) => b.name === "treatment-images")
    if (!bucket) {
      return {
        exists: false,
        error: "Bucket no encontrado",
      }
    }

    // Intentar listar contenido
    const { data, error: listError } = await supabase.storage.from("treatment-images").list()

    if (listError) {
      return {
        exists: true,
        accessible: false,
        error: listError.message,
      }
    }

    return {
      exists: true,
      accessible: true,
      files: data.length,
    }
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}
