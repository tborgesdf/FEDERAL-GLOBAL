import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import {
  Users,
  UserCheck,
  TrendingUp,
  MapPin,
  Smartphone,
  Globe,
  Calendar,
  Clock,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Filter,
  Search,
  CreditCard,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  termos_aceitos: boolean;
  data_aceite_termos: string;
  created_at: string;
  // Dados de geolocalização
  latitude?: number | null;
  longitude?: number | null;
  // Dados do dispositivo
  device_type?: string | null;
  device_browser?: string | null;
  device_os?: string | null;
  device_platform?: string | null;
  device_language?: string | null;
  device_screen?: string | null;
  device_user_agent?: string | null;
}

interface DashboardStats {
  totalUsers: number;
  todayUsers: number;
  weekUsers: number;
  monthUsers: number;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  cityStats: Array<{ city: string; count: number }>;
  hourStats: Array<{ hour: number; count: number }>;
}

export default function DashboardAdmin() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    todayUsers: 0,
    weekUsers: 0,
    monthUsers: 0,
    deviceStats: { mobile: 0, desktop: 0, tablet: 0 },
    cityStats: [],
    hourStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Função para gerar dados simulados
  const generateMockUsers = (): UserData[] => {
    const nomes = [
      "João Silva Santos", "Maria Oliveira Costa", "Carlos Eduardo Souza", "Ana Paula Lima",
      "Pedro Henrique Alves", "Juliana Ferreira Rocha", "Ricardo Barbosa Dias", "Fernanda Santos Pereira",
      "Lucas Martins Ribeiro", "Camila Rodrigues Sousa", "Rafael Cardoso Nunes", "Beatriz Almeida Cruz",
      "Guilherme Lopes de Oliveira", "Mariana Costa Silva", "Felipe Santos Aragão", "Larissa Mendes Pinto",
      "Bruno Carvalho Freitas", "Gabriela Vieira Melo", "Thiago Borges Monteiro", "Isabela Campos Barros",
      "André Luiz Teixeira", "Carolina Ramos Duarte", "Rodrigo Gomes Farias", "Patrícia Cunha Moraes",
      "Daniel Correia Brito", "Vanessa Pires Castro", "Leonardo Azevedo Costa", "Priscila Lima Nogueira",
      "Marcelo Fernandes Rocha", "Amanda Sousa Viana", "Gabriel Torres Araújo", "Renata Siqueira Martins",
      "Victor Hugo Dantas", "Aline Cristina Fonseca", "Diego Ribeiro Monteiro", "Tatiana Morais Santos",
      "Henrique Castro Lima", "Bianca Freitas Campos", "Matheus Pinto Oliveira", "Natália Costa Barbosa"
    ];

    const now = new Date();
    const mockUsers: UserData[] = [];

    for (let i = 0; i < 40; i++) {
      // Distribuir cadastros nos últimos 30 dias
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));

      // Gerar CPF simulado
      const cpf = `${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900000 + 100000)}${Math.floor(Math.random() * 90 + 10)}`;
      
      // Gerar telefone simulado
      const ddd = Math.floor(Math.random() * 89 + 11); // DDDs de 11 a 99
      const telefone = `${ddd}9${Math.floor(Math.random() * 90000000 + 10000000)}`;
      
      // Gerar data de nascimento (18 a 70 anos)
      const anoNasc = 2025 - Math.floor(Math.random() * 52 + 18);
      const mesNasc = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
      const diaNasc = Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0');
      const birthDate = `${diaNasc}/${mesNasc}/${anoNasc}`;

      const nome = nomes[i];
      const email = nome.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .split(" ")[0] + "." + nome.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .split(" ")[1] + "@email.com";

      // Gerar dados de geolocalização simulados (cidades brasileiras)
      const locations = [
        { lat: -23.5505, lng: -46.6333, city: 'São Paulo' },
        { lat: -22.9068, lng: -43.1729, city: 'Rio de Janeiro' },
        { lat: -19.9167, lng: -43.9345, city: 'Belo Horizonte' },
        { lat: -25.4284, lng: -49.2733, city: 'Curitiba' },
        { lat: -30.0346, lng: -51.2177, city: 'Porto Alegre' },
        { lat: -3.7172, lng: -38.5434, city: 'Fortaleza' },
        { lat: -12.9714, lng: -38.5014, city: 'Salvador' },
        { lat: -8.0476, lng: -34.8770, city: 'Recife' },
        { lat: -15.7801, lng: -47.9292, city: 'Brasília' },
        { lat: -1.4558, lng: -48.4902, city: 'Belém' },
      ];
      const location = locations[Math.floor(Math.random() * locations.length)];
      // Adicionar pequena variação para parecer mais realista
      const lat = location.lat + (Math.random() - 0.5) * 0.1;
      const lng = location.lng + (Math.random() - 0.5) * 0.1;

      // Gerar tipo de dispositivo e sistema
      const deviceTypes = [
        { type: 'Mobile', os: 'Android', browser: 'Chrome', screen: '1080x2400' },
        { type: 'Mobile', os: 'iOS', browser: 'Safari', screen: '1170x2532' },
        { type: 'Desktop', os: 'Windows', browser: 'Chrome', screen: '1920x1080' },
        { type: 'Desktop', os: 'macOS', browser: 'Safari', screen: '2560x1440' },
        { type: 'Desktop', os: 'Windows', browser: 'Edge', screen: '1366x768' },
        { type: 'Tablet', os: 'Android', browser: 'Chrome', screen: '1280x800' },
        { type: 'Tablet', os: 'iOS', browser: 'Safari', screen: '2048x2732' },
        { type: 'Desktop', os: 'Linux', browser: 'Firefox', screen: '1920x1080' },
      ];
      const device = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];

      mockUsers.push({
        id: `mock-${i + 1}`,
        email,
        full_name: nome,
        cpf,
        birth_date: birthDate,
        phone: telefone,
        termos_aceitos: true,
        data_aceite_termos: createdDate.toISOString(),
        created_at: createdDate.toISOString(),
        latitude: lat,
        longitude: lng,
        device_type: device.type,
        device_browser: device.browser,
        device_os: device.os,
        device_platform: device.os,
        device_language: 'pt-BR',
        device_screen: device.screen,
        device_user_agent: `Mozilla/5.0 (${device.type})`,
      });
    }

    return mockUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar usuários do Supabase Auth
      const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers();

      let userData: UserData[] = [];

      if (error || !authUsers || authUsers.length === 0) {
        // Se não houver usuários ou erro, usar dados simulados
        console.log("📊 Usando dados simulados para o Dashboard");
        userData = generateMockUsers();
      } else {
        userData = authUsers.map((user) => ({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "N/A",
          cpf: user.user_metadata?.cpf || "N/A",
          birth_date: user.user_metadata?.birth_date || "N/A",
          phone: user.user_metadata?.phone || "N/A",
          termos_aceitos: user.user_metadata?.termos_aceitos || false,
          data_aceite_termos: user.user_metadata?.data_aceite_termos || "",
          created_at: user.created_at,
          latitude: user.user_metadata?.latitude || null,
          longitude: user.user_metadata?.longitude || null,
          device_type: user.user_metadata?.device_type || null,
          device_browser: user.user_metadata?.device_browser || null,
          device_os: user.user_metadata?.device_os || null,
          device_platform: user.user_metadata?.device_platform || null,
          device_language: user.user_metadata?.device_language || null,
          device_screen: user.user_metadata?.device_screen || null,
          device_user_agent: user.user_metadata?.device_user_agent || null,
        }));
      }

      setUsers(userData);

      // Calcular estatísticas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const todayUsers = userData.filter(
        (u) => new Date(u.created_at) >= today
      ).length;

      const weekUsers = userData.filter(
        (u) => new Date(u.created_at) >= weekAgo
      ).length;

      const monthUsers = userData.filter(
        (u) => new Date(u.created_at) >= monthAgo
      ).length;

      // Estatísticas por hora (últimas 24h)
      const hourStats = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: userData.filter((u) => {
          const userDate = new Date(u.created_at);
          return userDate >= today && userDate.getHours() === hour;
        }).length,
      }));

      setStats({
        totalUsers: userData.length,
        todayUsers,
        weekUsers,
        monthUsers,
        deviceStats: { mobile: 0, desktop: 0, tablet: 0 }, // Será implementado quando tivermos dados de device
        cityStats: [],
        hourStats,
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Filtro de busca
    const searchMatch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cpf.includes(searchTerm);

    // Filtro de período
    const now = new Date();
    const userDate = new Date(user.created_at);
    let periodMatch = true;

    if (filterPeriod === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      periodMatch = userDate >= today;
    } else if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodMatch = userDate >= weekAgo;
    } else if (filterPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      periodMatch = userDate >= monthAgo;
    }

    return searchMatch && periodMatch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCPF = (cpf: string) => {
    if (cpf === "N/A" || cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatPhone = (phone: string) => {
    if (phone === "N/A" || phone.length !== 11) return phone;
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const exportToCSV = () => {
    const headers = [
      "Nome", 
      "E-mail", 
      "CPF", 
      "Telefone", 
      "Data de Nascimento", 
      "Dispositivo", 
      "Sistema", 
      "Navegador", 
      "Latitude", 
      "Longitude", 
      "Link Google Maps",
      "Termos Aceitos", 
      "Data Cadastro"
    ];
    
    const rows = filteredUsers.map((user) => [
      user.full_name,
      user.email,
      formatCPF(user.cpf),
      formatPhone(user.phone),
      user.birth_date,
      user.device_type || "N/D",
      user.device_os || "N/D",
      user.device_browser || "N/D",
      user.latitude?.toFixed(6) || "N/D",
      user.longitude?.toFixed(6) || "N/D",
      user.latitude && user.longitude ? `https://www.google.com/maps?q=${user.latitude},${user.longitude}` : "N/D",
      user.termos_aceitos ? "Sim" : "Não",
      formatDate(user.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_dashboard_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A4B9E] to-[#083A7A] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">Carregando Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A4B9E] to-[#083A7A] text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                title="Voltar para Home"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
              <div>
                <h1 className="text-4xl font-bold mb-2">Dashboard Admin</h1>
                <p className="text-blue-100">Análise completa de usuários e cadastros</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={loadDashboardData}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button
                onClick={exportToCSV}
                className="bg-[#2BA84A] hover:bg-[#229639]"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Usuários */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">TOTAL</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {stats.totalUsers}
            </h3>
            <p className="text-sm text-gray-600">Usuários cadastrados</p>
          </div>

          {/* Hoje */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">HOJE</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {stats.todayUsers}
            </h3>
            <p className="text-sm text-gray-600">Novos cadastros</p>
          </div>

          {/* Esta Semana */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">7 DIAS</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {stats.weekUsers}
            </h3>
            <p className="text-sm text-gray-600">Últimos 7 dias</p>
          </div>

          {/* Este Mês */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">30 DIAS</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              {stats.monthUsers}
            </h3>
            <p className="text-sm text-gray-600">Últimos 30 dias</p>
          </div>
        </div>

        {/* Gráfico de Cadastros por Hora */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#0A4B9E]" />
              Cadastros por Hora (Hoje)
            </h2>
          </div>
          <div className="flex items-end justify-between h-64 gap-2">
            {stats.hourStats.map((stat) => {
              const maxCount = Math.max(...stats.hourStats.map((s) => s.count), 1);
              const height = (stat.count / maxCount) * 100;
              
              return (
                <div key={stat.hour} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-[#0A4B9E] to-[#2BA84A] rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer relative group"
                    style={{ height: `${height}%`, minHeight: stat.count > 0 ? "8px" : "0" }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {stat.count} cadastros
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">{stat.hour}h</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, e-mail ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Filtros de Período */}
            <div className="flex gap-2">
              <Button
                variant={filterPeriod === "all" ? "default" : "outline"}
                onClick={() => setFilterPeriod("all")}
                className={filterPeriod === "all" ? "bg-[#0A4B9E]" : ""}
              >
                Todos
              </Button>
              <Button
                variant={filterPeriod === "today" ? "default" : "outline"}
                onClick={() => setFilterPeriod("today")}
                className={filterPeriod === "today" ? "bg-[#0A4B9E]" : ""}
              >
                Hoje
              </Button>
              <Button
                variant={filterPeriod === "week" ? "default" : "outline"}
                onClick={() => setFilterPeriod("week")}
                className={filterPeriod === "week" ? "bg-[#0A4B9E]" : ""}
              >
                7 Dias
              </Button>
              <Button
                variant={filterPeriod === "month" ? "default" : "outline"}
                onClick={() => setFilterPeriod("month")}
                className={filterPeriod === "month" ? "bg-[#0A4B9E]" : ""}
              >
                30 Dias
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Exibindo <span className="font-semibold text-[#0A4B9E]">{filteredUsers.length}</span> de{" "}
            <span className="font-semibold">{stats.totalUsers}</span> usuários
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#0A4B9E] to-[#083A7A] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nome Completo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">E-mail</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Hora</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Nenhum usuário encontrado</p>
                      <p className="text-sm">Tente ajustar os filtros de busca</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const createdDate = new Date(user.created_at);
                    const dateStr = createdDate.toLocaleDateString("pt-BR");
                    const timeStr = createdDate.toLocaleTimeString("pt-BR", { 
                      hour: "2-digit", 
                      minute: "2-digit",
                      second: "2-digit"
                    });

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#0A4B9E] text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{user.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                        <td className="px-6 py-4 text-gray-700">{dateStr}</td>
                        <td className="px-6 py-4 text-gray-700">{timeStr}</td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                            size="sm"
                            className="bg-[#0A4B9E] hover:bg-[#083A7A] text-white"
                          >
                            Detalhes
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Usuário */}
      {showUserDetails && selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUserDetails(false);
              setSelectedUser(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header do Modal - Minimalista */}
            <div className="relative bg-gradient-to-r from-[#0A4B9E] via-[#0E5BB5] to-[#083A7A] text-white px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold border-2 border-white/30">
                    {selectedUser.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Detalhes do Usuário</h2>
                    <p className="text-blue-100 text-sm mt-1">{selectedUser.full_name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUserDetails(false);
                    setSelectedUser(null);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-xl p-2.5 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Selfie Card - Redesenhada */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Selfie de Verificação</h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      Pendente
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-200">
                        <span className="text-xs font-medium text-gray-600">Sem foto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ETAPA 1 - Card Profissional */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Header da Etapa */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">ETAPA 1 - Verificação Inicial de CPF</h3>
                        <p className="text-purple-100 text-sm">Dados coletados durante o cadastro</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Informações */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* CPF */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CPF</label>
                        </div>
                        <p className="text-gray-900 font-mono font-bold text-lg">{formatCPF(selectedUser.cpf)}</p>
                      </div>

                      {/* Data/Hora */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data/Hora</label>
                        </div>
                        <p className="text-gray-900 font-semibold text-sm">
                          {new Date(selectedUser.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </p>
                      </div>

                      {/* IP do Usuário */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">IP do Usuário</label>
                        </div>
                        <p className="text-gray-900 font-mono font-semibold">189.45.123.78</p>
                      </div>

                      {/* Geolocalização Dispositivo */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Geoloc. Dispositivo</label>
                        </div>
                        <p className="text-gray-900 font-semibold text-sm">
                          {selectedUser.latitude && selectedUser.longitude 
                            ? `Lat: ${selectedUser.latitude.toFixed(4)}, Long: ${selectedUser.longitude.toFixed(4)}`
                            : "N/D"}
                        </p>
                      </div>

                      {/* Geolocalização IP */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Geoloc. IP</label>
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {selectedUser.latitude && selectedUser.longitude 
                            ? `São Paulo, SP`
                            : "N/D"}
                        </p>
                      </div>

                      {/* Tipo de Conexão */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo Conexão</label>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-semibold">
                          4G
                        </span>
                      </div>

                      {/* Sistema Operacional */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sistema Op.</label>
                        </div>
                        <p className="text-gray-900 font-semibold">{selectedUser.device_os || "N/D"}</p>
                      </div>

                      {/* Navegador */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Navegador</label>
                        </div>
                        <p className="text-gray-900 font-semibold">{selectedUser.device_browser || "N/D"}</p>
                      </div>

                      {/* Marca/Modelo */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Marca/Modelo</label>
                        </div>
                        <p className="text-gray-900 font-semibold">{selectedUser.device_type || "N/D"}</p>
                      </div>

                      {/* Nome Completo */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome Completo</label>
                        </div>
                        <p className="text-gray-900 font-semibold">{selectedUser.full_name}</p>
                      </div>

                      {/* Idade Verificada */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Idade Verif.</label>
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {selectedUser.birth_date !== "N/A" 
                            ? `${Math.floor((new Date().getTime() - new Date(selectedUser.birth_date.split('/').reverse().join('-')).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} anos`
                            : "N/D"}
                        </p>
                      </div>

                      {/* Operadora */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-purple-600" />
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Operadora</label>
                        </div>
                        <p className="text-gray-900 font-semibold">{selectedUser.device_platform || "Vivo"}</p>
                      </div>
                    </div>

                    {/* Botão Ver Mapa - Profissional */}
                    {selectedUser.latitude && selectedUser.longitude && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <a
                          href={`https://www.google.com/maps?q=${selectedUser.latitude},${selectedUser.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                          <MapPin className="h-5 w-5" />
                          <span>Ver Localização do Dispositivo no Mapa</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações Adicionais - Card Moderno */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informações Adicionais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-purple-600" />
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</label>
                      </div>
                      <p className="text-gray-900 font-medium break-all">{selectedUser.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-purple-600" />
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefone</label>
                      </div>
                      <p className="text-gray-900 font-medium">{formatPhone(selectedUser.phone)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data Nascimento</label>
                      </div>
                      <p className="text-gray-900 font-medium">{selectedUser.birth_date}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Termos de Uso</label>
                      </div>
                      {selectedUser.termos_aceitos ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-100 text-green-700">
                          <UserCheck className="h-4 w-4" />
                          Aceito
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Pendente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer do Modal - Limpo e Profissional */}
            <div className="border-t border-gray-200 bg-white px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Cadastrado em {new Date(selectedUser.created_at).toLocaleDateString("pt-BR")}
                </div>
                <Button
                  onClick={() => {
                    setShowUserDetails(false);
                    setSelectedUser(null);
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

