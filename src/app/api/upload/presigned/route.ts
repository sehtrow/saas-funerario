// src/app/api/upload/presigned/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/storage/r2";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { fileType, difuntoId } = await req.json();

    if (!fileType || !difuntoId) {
      return NextResponse.json(
        { error: "fileType y difuntoId son requeridos" },
        { status: 400 }
      );
    }

    // Validar extensión / MIME type permitido (Imágenes únicamente)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "Formato de archivo no soportado. Debe ser imagen (JPG, PNG, WEBP)" },
        { status: 400 }
      );
    }

    // Ruta estructurada en el Bucket R2: difuntos/[difuntoId]/[uuid].[ext]
    const extension = fileType.split("/")[1] || "webp";
    const fileKey = `difuntos/${difuntoId}/${uuidv4()}.${extension}`;

    const { uploadUrl, publicUrl, key } = await getPresignedUploadUrl(fileKey, fileType);

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Error al generar Presigned URL R2:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la subida" },
      { status: 500 }
    );
  }
}