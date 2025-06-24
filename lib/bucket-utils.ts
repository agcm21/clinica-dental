import { supabase } from "./supabase"

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
