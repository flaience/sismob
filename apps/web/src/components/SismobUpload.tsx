"use client";
import { useState } from "react";
import { UploadCloud, X, Image as ImageIcon, Camera } from "lucide-react";
import api from "@/lib/api";

export default function SismobUpload({
  label,
  value,
  onChange,
  multiple = false,
  is360 = false,
}: any) {
  const [uploading, setLoading] = useState(false);

  const handleUpload = async (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const formData = new FormData();

    // O SEGREDO: O nome tem que ser 'files' (plural) para bater com o Controller
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Se for galeria (Imóvel), ele concatena as fotos novas com as que já estavam lá
      if (multiple) {
        onChange([...(value || []), ...res.data]);
      } else {
        // Se for Logo (Imobiliária), apenas substitui pela primeira
        onChange(res.data[0].url);
      }
      console.log("✅ Upload concluído e estado atualizado!");
    } catch (err) {
      alert(
        "Falha no upload das imagens. Verifique se o módulo Files está no AppModule.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">
        {label}
      </label>

      <div className="flex flex-wrap gap-4 p-6 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all">
        {/* PREVIEW DA IMAGEM (OU LOGO) */}
        {!multiple && value && (
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-md">
            <img src={value} className="w-full h-full object-cover" />
            <button
              onClick={() => onChange("")}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* INPUT DE ARQUIVO DISFARCADO DE BOTÃO */}
        <label className="cursor-pointer flex flex-col items-center justify-center w-32 h-32 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all border border-slate-100 group">
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          ) : (
            <>
              {is360 ? (
                <Camera className="text-slate-300 group-hover:text-indigo-600" />
              ) : (
                <UploadCloud className="text-slate-300 group-hover:text-indigo-600" />
              )}
              <span className="text-[9px] font-black text-slate-400 mt-2">
                SUBIR {is360 ? "360°" : "FOTO"}
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
