//src/app/imovel/[id].tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { Gyroscope } from "expo-sensors";
import { ArrowLeft, Navigation, Info, Camera, Play } from "lucide-react-native";
import api from "@/src/lib/api";

const { width } = Dimensions.get("window");

export default function ImovelDetalhes() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [imovel, setImovel] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"tour" | "info" | "percurso">(
    "tour",
  );
  const webviewRef = useRef<WebView>(null);
  // Buscar dados do imóvel no Railway
  useEffect(() => {
    api.get(`/imoveis`).then((res) => {
      const encontrou = res.data.find((i: any) => i.id === Number(id));
      setImovel(encontrou);
    });
  }, [id]);

  useEffect(() => {
    let subscription: any;

    if (viewMode === "tour" && imovel) {
      Gyroscope.setUpdateInterval(16);
      subscription = Gyroscope.addListener((gyroData) => {
        // Envia o movimento para o Pannellum via ponte segura
        webviewRef.current?.postMessage(
          JSON.stringify({
            type: "gyro",
            x: gyroData.x,
            y: gyroData.y,
          }),
        );
      });
    }

    return () => subscription?.remove();
  }, [viewMode, imovel]);

  if (!imovel)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Carregando...</Text>
      </View>
    );

  const foto360 = imovel.midias?.find((m: any) => m.tipo === "foto_360")?.url;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER FLUTUANTE */}
      <View className="absolute top-12 left-5 z-50 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/90 p-3 rounded-full shadow-lg"
        >
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <View className="bg-indigo-600 px-4 py-2 rounded-2xl shadow-lg">
          <Text className="text-white font-black text-xs uppercase tracking-widest">
            {imovel.titulo}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" stickyHeaderIndices={[1]}>
        {/* 1. VISUALIZADOR 360 (A MÁGICA) */}
        <View style={{ height: 450 }} className="bg-black">
          {foto360 ? (
            <WebView
              ref={webviewRef} // <--- CONECTA A PONTE AQUI
              originWhitelist={["*"]}
              allowsInlineMediaPlayback
              scrollEnabled={false}
              source={{
                html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
                    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
                    <style>
                      #panorama { width: 100vw; height: 100vh; }
                      body { margin: 0; }
                    </style>
                  </head>
                  <body>
                    <div id="panorama"></div>
                    <script>
                      const viewer = pannellum.viewer('panorama', {
                        "type": "equirectangular",
                        "panorama": "${foto360}",
                        "autoLoad": true,
                        "showControls": false
                      });
                      
                      // Função para receber dados do Giroscópio do React Native
                      window.addEventListener('message', (event) => {
                        const data = JSON.parse(event.data);
                        if(data.type === 'gyro') {
                          const currentYaw = viewer.getYaw();
                          const currentPitch = viewer.getPitch();
                          viewer.setYaw(currentYaw - (data.y * 2));
                          viewer.setPitch(currentPitch + (data.x * 2));
                        }
                      });
                    </script>
                  </body>
                </html>
              `,
              }}
              onLoad={(e) => {
                // Iniciar o sensor assim que a página carregar
                Gyroscope.setUpdateInterval(16); // 60 FPS
                Gyroscope.addListener((gyroData) => {
                  // Envia os dados do sensor para dentro da WebView
                  // @ts-ignore
                  this?.webview?.postMessage(
                    JSON.stringify({ type: "gyro", ...gyroData }),
                  );
                });
              }}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Camera size={48} color="#333" />
              <Text className="text-gray-500 mt-4 font-bold">
                Tour não disponível
              </Text>
            </View>
          )}
        </View>

        {/* 2. MENU DE NAVEGAÇÃO INTERNA */}
        <View className="bg-white flex-row justify-around p-4 border-b border-gray-100 shadow-sm">
          <TouchableOpacity
            onPress={() => setViewMode("tour")}
            className={`items-center px-4 py-2 rounded-2xl ${viewMode === "tour" ? "bg-indigo-50" : ""}`}
          >
            <Camera
              size={20}
              color={viewMode === "tour" ? "#6366f1" : "#9ca3af"}
            />
            <Text
              className={`text-[10px] font-bold mt-1 ${viewMode === "tour" ? "text-indigo-600" : "text-gray-400"}`}
            >
              TOUR
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode("percurso")}
            className={`items-center px-4 py-2 rounded-2xl ${viewMode === "percurso" ? "bg-indigo-50" : ""}`}
          >
            <Navigation
              size={20}
              color={viewMode === "percurso" ? "#6366f1" : "#9ca3af"}
            />
            <Text
              className={`text-[10px] font-bold mt-1 ${viewMode === "percurso" ? "text-indigo-600" : "text-gray-400"}`}
            >
              CHEGADA
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. CONTEÚDO DINÂMICO */}
        <View className="p-6">
          {viewMode === "tour" && (
            <View>
              <Text className="text-2xl font-black text-gray-900">
                {imovel.titulo}
              </Text>
              <Text className="text-indigo-600 font-black text-3xl my-2">
                R$ {Number(imovel.precoVenda).toLocaleString("pt-BR")}
              </Text>
              <Text className="text-gray-500 leading-6 mt-4">
                {imovel.descricao}
              </Text>
            </View>
          )}

          {viewMode === "percurso" && (
            <View className="bg-indigo-900 p-8 rounded-[32px]">
              <Text className="text-white font-black text-xl mb-6">
                Guia de Percurso
              </Text>
              {imovel.instrucoes?.map((ins: any, idx: number) => (
                <View key={ins.id} className="flex-row gap-4 mb-6">
                  <View className="w-8 h-8 rounded-full bg-indigo-500 justify-center items-center">
                    <Text className="text-white font-bold">{idx + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-indigo-200 font-bold uppercase text-[10px]">
                      {ins.titulo}
                    </Text>
                    <Text className="text-white text-xs mt-1">
                      {ins.descricao}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* BOTÃO DE CONTATO FIXO */}
      <View className="absolute bottom-10 left-6 right-6">
        <TouchableOpacity className="bg-green-500 p-6 rounded-[24px] flex-row justify-center items-center gap-3 shadow-xl">
          <Play size={24} color="white" />
          <Text className="text-white font-black text-lg">
            FALAR COM CONSULTOR
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
