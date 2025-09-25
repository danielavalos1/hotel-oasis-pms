import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { ratesService } from "@/services/ratesService";
import { z } from "zod";

// Función para convertir Decimals de Prisma a números
function convertDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'object' && obj.constructor && obj.constructor.name === 'Decimal') {
    return parseFloat(obj.toString());
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertDecimalsToNumbers);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDecimalsToNumbers(value);
    }
    return converted;
  }
  
  return obj;
}

const updateRateSchema = z.object({
  roomId: z.number().optional(),
  name: z.string().min(1).optional(),
  type: z.enum(["BASE", "SEASONAL", "WEEKEND", "SPECIAL"]).optional(),
  subtotal: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  validFrom: z.string().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  validDays: z.array(z.string()).optional(),
  minNights: z.number().nullable().optional(),
  maxNights: z.number().nullable().optional(),
});

// GET /api/rates/[id] - Obtener una tarifa específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de tarifa inválido" },
        { status: 400 }
      );
    }

    const rate = await ratesService.getRate(id);
    
    if (!rate) {
      return NextResponse.json(
        { error: "Tarifa no encontrada" },
        { status: 404 }
      );
    }

    // Convertir Decimals a números para el frontend
    const convertedRate = convertDecimalsToNumbers(rate);

    return NextResponse.json({
      success: true,
      rate: convertedRate,
    });
  } catch (error) {
    console.error("Error fetching rate:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/rates/[id] - Actualizar una tarifa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "No tienes permisos para actualizar tarifas" },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de tarifa inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateRateSchema.parse(body);

    // Transformar fechas si están presentes
    const updateData = {
      id,
      ...validatedData,
      validFrom: validatedData.validFrom ? new Date(validatedData.validFrom) : undefined,
      validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : undefined,
      minNights: validatedData.minNights || undefined,
      maxNights: validatedData.maxNights || undefined,
    };

    const updatedRate = await ratesService.updateRate(updateData);

    // Convertir Decimals a números para el frontend
    const convertedRate = convertDecimalsToNumbers(updatedRate);

    return NextResponse.json({
      success: true,
      rate: convertedRate,
    });

  } catch (error) {
    console.error("Error updating rate:", error);
    
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

// DELETE /api/rates/[id] - Eliminar una tarifa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: "No tienes permisos para eliminar tarifas" },
        { status: 403 }
      );
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID de tarifa inválido" },
        { status: 400 }
      );
    }

    await ratesService.deleteRate(id);

    return NextResponse.json({
      success: true,
      message: "Tarifa eliminada correctamente",
    });

  } catch (error) {
    console.error("Error deleting rate:", error);
    
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
