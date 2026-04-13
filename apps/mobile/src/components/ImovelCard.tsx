import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MapPin, Camera, Play, Navigation } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function ImovelCard({ imovel }: { imovel: any }) {
  const router = useRouter();
  const imagemCapa =
    imovel.midias?.find((m: any) => m.isCapa)?.url || imovel.midias?.[0]?.url;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/imovel/${imovel.id}`)}
      className="bg-white rounded-[32px] mb-6 overflow-hidden shadow-sm border border-gray-100"
    >
      {/* IMAGEM COM BADGE 360 */}
      <View className="relative h-56 w-full">
        <Image
          source={{ uri: imagemCapa || "https://via.placeholder.com/400" }}
          className="w-full h-full object-cover"
        />
        <View className="absolute top-4 left-4 bg-indigo-600 px-3 py-1.5 rounded-full flex-row items-center">
          <Camera size={14} color="white" />
          <Text className="text-white text-[10px] font-black ml-1 uppercase">
            360° Disponível
          </Text>
        </View>
      </View>

      {/* CONTEÚDO */}
      <View className="p-5">
        <Text className="text-xl font-black text-gray-900 mb-1">
          {imovel.titulo}
        </Text>

        <View className="flex-row items-center mb-4">
          <MapPin size={14} color="#6366f1" />
          <Text className="text-gray-400 text-xs ml-1 font-medium">
            {imovel.enderecoOriginal}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-2">
          <View>
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Valor
            </Text>
            <Text className="text-2xl font-black text-indigo-600">
              R$ {Number(imovel.precoVenda).toLocaleString("pt-BR")}
            </Text>
          </View>

          {/* BOTÕES DE AÇÃO RÁPIDA (O DIFERENCIAL) */}
          <View className="flex-row gap-2">
            <TouchableOpacity className="bg-gray-900 p-4 rounded-2xl shadow-lg">
              <Navigation size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/imovel/${imovel.id}?view=tour`)}
              className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200"
            >
              <Camera size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
