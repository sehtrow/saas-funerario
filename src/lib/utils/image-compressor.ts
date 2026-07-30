// src/lib/utils/image-compressor.ts
import imageCompression from "browser-image-compression";

/**
 * Comprime y redimensiona la imagen cargada por el usuario en el navegador.
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5,           // Tamaño máximo final: ~500KB
    maxWidthOrHeight: 800,    // Ancho/Alto máximo: 800px (Suficiente para Smart TV)
    useWebWorker: true,
    fileType: "image/webp",  // Convertir a formato moderno WebP
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Error comprimiendo imagen:", error);
    // En caso de fallo, retorna el archivo original
    return file;
  }
}