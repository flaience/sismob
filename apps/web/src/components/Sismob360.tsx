"use client";
import { useEffect, useRef } from "react";

export default function Sismob360({ imageUrl }: { imageUrl: string }) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    // Carrega o script do Pannellum de forma industrial
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
    script.async = true;
    document.body.appendChild(script);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
    document.head.appendChild(link);

    script.onload = () => {
      viewerRef.current = (window as any).pannellum.viewer("container-360", {
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        autoRotate: -2,
      });
    };
  }, [imageUrl]);

  return (
    <div className="w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100">
      <div id="container-360" className="w-full h-full" />
    </div>
  );
}
