"use client";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useState } from "react";

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Seu navegador não suporta voz.");

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processCommand(text); // Aqui enviamos o texto para a IA ou n8n
    };

    recognition.start();
  };

  const processCommand = (text: string) => {
    console.log("Comando recebido:", text);
    // Ex: "Sismob, buscar casas" -> O sistema faz a busca
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {transcript && (
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-indigo-100 text-sm font-medium animate-bounce">
          "{transcript}"
        </div>
      )}
      <button
        onClick={startListening}
        className={`p-4 rounded-full shadow-2xl transition-all ${
          isListening
            ? "bg-red-500 scale-110"
            : "bg-indigo-600 hover:bg-indigo-700"
        } text-white`}
      >
        {isListening ? <Loader2 className="animate-spin" /> : <Mic size={24} />}
      </button>
    </div>
  );
}
