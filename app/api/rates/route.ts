import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { ratesService } from "@/services/ratesService";
import { z } from "zod";

// Función para convertir Decimals de Prisma a números
function convertDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  // Verificar si es un objeto Decimal de Prisma (tiene propiedades s, e, d)
  if (typeof obj === 'object' && obj !== null && 's' in obj && 'e' in obj && 'd' in obj) {
    console.log("Converting Prisma Decimal:", obj);
    // Convertir usando el método toString() del Decimal
    return parseFloat(obj.toString());
  }

  // Verificar por constructor name como respaldo
  if (typeof obj === 'object' && obj.constructor && obj.constructor.name === 'Decimal') {
    console.log("Converting Decimal by constructor:", obj);
    return parseFloat(obj.toString());
  }

  // Verificar si es un array
  if (Array.isArray(obj)) {
    return obj.map(convertDecimalsToNumbers);
  }

  // Si es un objeto regular, procesar recursivamente
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDecimalsToNumbers(value);
    }
    return converted;
  }

  return obj;
}

const createRateSchema = z.object({
  roomId: z.number(),
  name: z.string().min(1),
  type: z.enum(["BASE", "SEASONAL", "WEEKEND", "SPECIAL"]),
  subtotal: z.number().min(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  validDays: z.array(z.string()).default([]),
  minNights: z.number().nullable().optional(),
  maxNights: z.number().nullable().optional(),
});

// GET /api/rates - Obtener todas las tarifas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const roomType = searchParams.get("roomType");
    const rateType = searchParams.get("rateType");
    const isActive = searchParams.get("isActive");

    const filters = {
      ...(roomId && { roomId: parseInt(roomId) }),
      ...(roomType && roomType !== "all" && { roomType }),
      ...(rateType && rateType !== "all" && { rateType: rateType as any }),
      ...(isActive !== null && { isActive: isActive === "true" }),
    };

    const rates = await ratesService.getAllRates(filters);

    console.log("Raw rates from service:", rates);
    console.log("First rate basePrice:", rates[0]?.basePrice, "type:", typeof rates[0]?.basePrice);

    // Convertir Decimals a números para el frontend
    const convertedRates = convertDecimalsToNumbers(rates);

    console.log("Converted rates:", convertedRates);
    console.log("First converted rate basePrice:", convertedRates[0]?.basePrice, "type:", typeof convertedRates[0]?.basePrice);

    return NextResponse.json({
      success: true,
      rates: convertedRates,
    });
  } catch (error) {
    console.error("Error fetching rates:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/rates - Crear nueva tarifa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar permisos de administrador
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "No tienes permisos para crear tarifas" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createRateSchema.parse(body);

    // Transformar fechas si están presentes
    const rateData = {
      ...validatedData,
      validFrom: validatedData.validFrom ? new Date(validatedData.validFrom) : undefined,
      validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : undefined,
      minNights: validatedData.minNights || undefined,
      maxNights: validatedData.maxNights || undefined,
      createdBy: session.user.username || session.user.id,
    };

    const newRate = await ratesService.createRate(rateData);

    // Convertir Decimals a números para el frontend
    const convertedRate = convertDecimalsToNumbers(newRate);

    return NextResponse.json({
      success: true,
      rate: convertedRate,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating rate:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
