import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

// GET - Obtener todos los pacientes
export async function GET() {
  console.log("GET /api/patients - Iniciando solicitud");
  
  try {
    const supabase = getSupabaseClient();
    
    console.log("GET /api/patients - Conectando a Supabase");
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/patients - Error de Supabase:", error);
      return NextResponse.json({ error: error instanceof Error ? (error instanceof Error ? error.message : "Error desconocido") : "Error desconocido" }, { status: 500 });
    }

    console.log(`GET /api/patients - Éxito, ${data?.length || 0} pacientes encontrados`);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET /api/patients - Error inesperado:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Crear un nuevo paciente
export async function POST(request: Request) {
  console.log("POST /api/patients - Iniciando solicitud");
  
  try {
    const patientData = await request.json();
    console.log("POST /api/patients - Datos recibidos:", patientData);
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("patients")
      .insert([patientData])
      .select();

    if (error) {
      console.error("POST /api/patients - Error de Supabase:", error);
      return NextResponse.json({ error: error instanceof Error ? (error instanceof Error ? error.message : "Error desconocido") : "Error desconocido" }, { status: 500 });
    }

    console.log("POST /api/patients - Paciente creado con éxito");
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/patients - Error inesperado:", error);
    return NextResponse.json({ error: "Error al crear paciente" }, { status: 500 });
  }
}

