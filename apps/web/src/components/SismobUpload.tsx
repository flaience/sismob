"use client";
import { useState } from "react";
import {
  UploadCloud,
  X,
  Camera,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

export default function SismobUpload({
  label,
  value,
  onChange,
  multiple = false,
}: any) {
  const [loading, setLoading] = useState(false);

  // Garante que 'value' seja sempre um array para a galeria
  const imagens = Array.isArray(value) ? value : value ? [{ url: value }] : [];

  const handleUpload = async (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // A API retorna um array de objetos: [{url: '...'}, {url: '...'}]
      const novasImagens = res.data;

      if (multiple) {
        // Galeria: Adiciona as novas fotos ao que já existia
        onChange([...imagens, ...novasImagens]);
      } else {
        // Logo/Perfil: Pega apenas a primeira URL (string pura)
        onChange(novasImagens[0].url);
      }
      console.log("✅ Imagens carregadas no estado!");
    } catch (err) {
      alert("Falha no processamento das imagens.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImgs = imagens.filter((_, i) => i !== index);
    onChange(multiple ? newImgs : "");
  };

  return (
    <div className="space-y-4 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">
        {label}
      </label>

      <div className="flex flex-wrap gap-4 p-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all">
        {/* RENDERIZAÇÃO DAS FOTOS EXISTENTES */}
        {imagens.map((img: any, idx: number) => (
          <div
            key={idx}
            className="relative w-40 h-40 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white group"
          >
            <img
              src={img.url || img}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              alt="Preview"
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={14} />
            </button>
            {/* Tag para identificar se é 360 ou Capa */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              {img.tipo === "foto_360" && (
                <span className="bg-orange-500 text-white p-1 rounded-lg">
                  <Camera size={10} />
                </span>
              )}
              {img.is_capa && (
                <span className="bg-emerald-500 text-white p-1 rounded-lg">
                  <ImageIcon size={10} />
                </span>
              )}
            </div>
          </div>
        ))}

        {/* BOTÃO DE ADICIONAR (ATALHO) */}
        <label className="cursor-pointer w-40 h-40 bg-white rounded-[2rem] shadow-sm flex flex-col items-center justify-center hover:scale-105 transition-all border border-slate-100 group">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-indigo-600" />
              <span className="text-[9px] font-black text-slate-400 uppercase">
                Subindo...
              </span>
            </div>
          ) : (
            <>
              <UploadCloud
                className="text-slate-300 group-hover:text-indigo-600 transition-colors"
                size={32}
              />
              <span className="text-[9px] font-black text-slate-400 mt-2 uppercase">
                Adicionar
              </span>
            </>
          )}
          <input
            type="file"
            hidden
            multiple={multiple}
            onChange={handleUpload}
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
}
