//src/app/(tabs)/index.tsx
import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Building2, Search } from "lucide-react-native";
import api from "@/src/lib/api";
import ImovelCard from "@/src/components/ImovelCard";

export default function HomeScreen() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ID da sua imobiliária para o teste mobile
  const IMOBILIARIA_ID = "94e23a19-98ce-4f42-8c0a-1f1f4d32cfce";

  const loadData = async () => {
    try {
      const res = await api.get("/imoveis", {
        params: { imobiliariaId: IMOBILIARIA_ID },
      });
      setImoveis(res.data);
    } catch (e) {
      console.error("Erro ao carregar app", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="p-5"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
          />
        }
      >
        {/* HEADER TOP DAS GALÁXIAS */}
        <View className="flex-row justify-between items-center mb-8 mt-4">
          <View>
            <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              Bem-vindo ao
            </Text>
            <Text className="text-3xl font-black text-gray-900">
              SIS<Text className="text-indigo-600">MOB</Text>
            </Text>
          </View>
          <View className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <Building2 size={24} color="#6366f1" />
          </View>
        </View>

        {/* LISTAGEM */}
        <Text className="text-lg font-bold text-gray-800 mb-4">
          Imóveis em Destaque
        </Text>

        {imoveis.map((item: any) => (
          <ImovelCard key={item.id} imovel={item} />
        ))}

        {imoveis.length === 0 && !loading && (
          <View className="py-20 items-center">
            <Text className="text-gray-400 font-medium">
              Nenhum imóvel encontrado.
            </Text>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
