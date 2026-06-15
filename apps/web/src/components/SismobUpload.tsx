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

  const imageUrl = typeof value === "string" ? value : value?.url;

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-500">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">
        {label}
      </label>

      <div className="flex flex-wrap gap-4 p-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all shadow-inner">
        {/* CASE 1: GALERIA MÚLTIPLA (Imóveis) */}
        {multiple &&
          imagens.map((img: any, idx: number) => (
            <div
              key={idx}
              className="relative w-40 h-40 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white group animate-in zoom-in duration-300"
            >
              <img
                src={img.url || img}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                alt="Preview"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
              >
                <X size={14} />
              </button>

              {/* Indicadores de Tipo (360 ou Capa) */}
              <div className="absolute bottom-3 left-3 flex gap-2">
                {img.tipo === "foto_360" && (
                  <span className="bg-orange-500 text-white p-1.5 rounded-lg shadow-md border border-white/20">
                    <Camera size={12} />
                  </span>
                )}
                {img.is_capa && (
                  <span className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-md border border-white/20">
                    <ImageIcon size={12} />
                  </span>
                )}
              </div>
            </div>
          ))}

        {/* CASE 2: IMAGEM ÚNICA (Logo da Imobiliária / Perfil) */}
        {!multiple && imageUrl && (
          <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white group animate-in scale-in duration-300">
            <img
              src={imageUrl}
              className="w-full h-full object-contain bg-white transition-transform group-hover:scale-105"
              alt="Logo Preview"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* BOTÃO DE ADICIONAR (ATALHO UNIVERSAL) */}
        {/* Só mostra o botão de adicionar se for múltiplo OU se ainda não tiver imagem única */}
        {(multiple || !imageUrl) && (
          <label className="cursor-pointer w-40 h-40 bg-white rounded-[2rem] shadow-sm flex flex-col items-center justify-center hover:scale-105 hover:shadow-xl hover:border-indigo-200 transition-all border border-slate-100 group">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Subindo...
                </span>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                  <UploadCloud
                    className="text-slate-300 group-hover:text-indigo-600 transition-colors"
                    size={32}
                  />
                </div>
                <span className="text-[9px] font-black text-slate-400 mt-3 uppercase tracking-widest">
                  {multiple ? "Adicionar" : "Subir Logo"}
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
        )}
      </div>
    </div>
  );
}
