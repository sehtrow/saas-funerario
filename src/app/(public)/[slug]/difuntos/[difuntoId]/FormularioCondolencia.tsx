'use client';

import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { enviarCondolencia } from '@/app/actions/condolencias';
import { getPresignedUrlAction } from '@/app/actions/admin'; // 👈 Importamos tu acción existente para R2
import { ImagePlus, X } from 'lucide-react';

interface DifuntoType {
  id: string;
  funerariaId: string;
  nombre: string;
  apellido: string;
  funeraria: {
    nombre: string;
  };
}

interface FormularioCondolenciaProps {
  difunto: DifuntoType;
  slug: string;
}

export default function FormularioCondolencia({ difunto, slug }: FormularioCondolenciaProps) {
  const [nombreAutor, setNombreAutor] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manejar y comprimir la imagen seleccionada
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const options = {
      maxSizeMB: 0.8,        // Tamaño máximo cercano a 800KB
      maxWidthOrHeight: 1200, // Resolución ideal y nítida para pantallas TV y web
      useWebWorker: true,
      fileType: 'image/webp', // Formato optimizado WebP
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setImagen(compressedFile);
      setPreviewUrl(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error('Error al comprimir la imagen:', err);
      setError('No se pudo procesar la imagen adjunta.');
    }
  };

  const removeImage = () => {
    setImagen(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombreAutor.trim() || !mensaje.trim()) {
      setError('Por favor completa los campos obligatorios.');
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      let fotoUrlPublica = '';

      // 1. Si hay imagen comprimida, la subimos primero a R2 mediante la Presigned URL
      if (imagen) {
        const presignedRes = await getPresignedUrlAction(imagen.name, imagen.type, slug);

        if (!presignedRes.success || !presignedRes.uploadUrl || !presignedRes.publicUrl) {
          throw new Error(presignedRes.error || 'No se pudo preparar la subida de la imagen.');
        }

        // Subida directa a Cloudflare R2 desde el navegador (evita saturar Next.js)
        const uploadRes = await fetch(presignedRes.uploadUrl, {
          method: 'PUT',
          body: imagen,
          headers: { 'Content-Type': imagen.type },
        });

        if (!uploadRes.ok) {
          throw new Error('Fallo al subir la imagen a la nube.');
        }

        fotoUrlPublica = presignedRes.publicUrl;
      }

      // 2. Preparamos el FormData con los datos del formulario y la URL pública de la imagen
      const formData = new FormData();
      formData.append('funerariaId', difunto.funerariaId);
      formData.append('difuntoId', difunto.id);
      formData.append('slug', slug);
      formData.append('nombreAutor', nombreAutor);
      formData.append('parentesco', parentesco);
      formData.append('mensaje', mensaje);
      
      if (fotoUrlPublica) {
        formData.append('fotoUrl', fotoUrlPublica);
      }

      const res = await enviarCondolencia(formData);

      setEnviando(false);

      if (res && res.success) {
        setEnviado(true);
        setImagen(null);
        setPreviewUrl(null);
      } else {
        setError(res?.error || 'No se pudo registrar la condolencia.');
      }
    } catch (err: any) {
      setEnviando(false);
      setError(err.message || 'Error de conexión con el servidor. Revisa tu red.');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
          {difunto.funeraria.nombre}
        </p>
        <h1 className="text-2xl font-serif font-bold text-slate-900 mt-2">
          En memoria de {difunto.nombre} {difunto.apellido}
        </h1>
      </div>

      {enviado ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Mensaje Recibido</h2>
          <p className="text-sm text-slate-600">Muchas gracias. Tu mensaje ha sido registrado.</p>
          <button
            onClick={() => {
              setEnviado(false);
              setNombreAutor('');  // 👈 Limpiamos el nombre
              setParentesco('');
              setMensaje('');
              setImagen(null);     // 👈 Limpiamos la imagen seleccionada
              setPreviewUrl(null); // 👈 Limpiamos la vista previa
            }}
            className="mt-4 text-xs text-slate-900 underline cursor-pointer"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tu Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombreAutor}
              onChange={(e) => setNombreAutor(e.target.value)}
              placeholder="Ej. María Fernández"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Relación o Parentesco <span className="text-slate-400">(Opcional)</span>
            </label>
            <input
              type="text"
              value={parentesco}
              onChange={(e) => setParentesco(e.target.value)}
              placeholder="Ej. Amiga de la infancia"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Mensaje de Condolencia <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Escribe aquí tus palabras..."
              className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950 resize-none"
            />
          </div>

          {/* Sección de adjuntar imagen */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Fotografía u Recuerdo <span className="text-slate-400">(Opcional)</span>
            </label>
            
            {previewUrl ? (
              <div className="relative w-full h-32 bg-slate-100 rounded-xl border border-slate-300 overflow-hidden flex items-center justify-center">
                <img src={previewUrl} alt="Vista previa" className="h-full object-contain" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 bg-slate-50/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                  <ImagePlus className="w-6 h-6 text-slate-400 mb-1" />
                  <p className="text-xs text-slate-500">Haz clic para subir una foto</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl transition shadow-sm cursor-pointer"
          >
            {enviando ? 'Enviando...' : 'Enviar Condolencia'}
          </button>
        </form>
      )}
    </div>
  );
}