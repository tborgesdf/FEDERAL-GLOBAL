/**
 * BreakpointTester - Componente para teste visual de responsividade
 * 
 * Exibe informações em tempo real sobre:
 * - Breakpoint atual
 * - Dimensões da tela
 * - Grid ativo
 * - Margins/Gutters
 * 
 * USO: Adicionar temporariamente ao App.tsx para testes
 */

import { useState, useEffect } from "react";
import { Monitor, Smartphone, Tablet, Laptop } from "lucide-react";

export default function BreakpointTester() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getBreakpoint = () => {
    const width = windowSize.width;
    
    if (width < 768) {
      return {
        name: width < 430 ? "Mobile" : "Phablet",
        icon: Smartphone,
        color: "#2BA84A",
        columns: 4,
        gutter: 12,
        margin: 16,
        range: width < 430 ? "360px-429px" : "430px-767px"
      };
    } else if (width < 1024) {
      return {
        name: "Tablet",
        icon: Tablet,
        color: "#0A4B9E",
        columns: 8,
        gutter: 16,
        margin: 32,
        range: "768px-1023px"
      };
    } else if (width < 1440) {
      return {
        name: "Laptop",
        icon: Laptop,
        color: "#7C6EE4",
        columns: 12,
        gutter: 24,
        margin: 48,
        range: "1024px-1439px"
      };
    } else {
      return {
        name: "Desktop",
        icon: Monitor,
        color: "#0058CC",
        columns: 12,
        gutter: 24,
        margin: 80,
        range: "1440px+"
      };
    }
  };

  const breakpoint = getBreakpoint();
  const Icon = breakpoint.icon;

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: breakpoint.color,
          color: "white",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9998,
          transition: "all 0.3s"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <Icon size={24} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        backgroundColor: "white",
        border: `3px solid ${breakpoint.color}`,
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        zIndex: 9998,
        minWidth: "280px",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: breakpoint.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Icon size={24} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "16px", color: "#111827" }}>
              {breakpoint.name}
            </div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>
              {breakpoint.range}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#F3F4F6",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            color: "#6B7280",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#E5E7EB";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#F3F4F6";
          }}
        >
          ×
        </button>
      </div>

      {/* Divisor */}
      <div style={{ height: "1px", backgroundColor: "#E5E7EB", margin: "16px 0" }} />

      {/* Informações */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Dimensões */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#6B7280", fontSize: "13px" }}>Dimensões:</span>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#111827" }}>
            {windowSize.width} × {windowSize.height}px
          </span>
        </div>

        {/* Grid */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#6B7280", fontSize: "13px" }}>Grid:</span>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#111827" }}>
            {breakpoint.columns} colunas
          </span>
        </div>

        {/* Gutter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#6B7280", fontSize: "13px" }}>Gutter:</span>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#111827" }}>
            {breakpoint.gutter}px
          </span>
        </div>

        {/* Margin */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#6B7280", fontSize: "13px" }}>Margin:</span>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#111827" }}>
            {breakpoint.margin}px
          </span>
        </div>
      </div>

      {/* Divisor */}
      <div style={{ height: "1px", backgroundColor: "#E5E7EB", margin: "16px 0" }} />

      {/* Alertas de Design */}
      <div style={{ fontSize: "12px", color: "#6B7280", lineHeight: "1.6" }}>
        {windowSize.width < 360 && (
          <div style={{ padding: "8px", backgroundColor: "#FEF2F2", borderRadius: "8px", color: "#DC2626", marginBottom: "8px" }}>
            ⚠️ Largura abaixo do mínimo recomendado (360px)
          </div>
        )}
        
        {windowSize.width >= 360 && windowSize.width < 768 && (
          <div style={{ padding: "8px", backgroundColor: "#F0FDF4", borderRadius: "8px", color: "#16A34A" }}>
            ✓ Layout mobile ativo
          </div>
        )}
        
        {windowSize.width >= 768 && windowSize.width < 1024 && (
          <div style={{ padding: "8px", backgroundColor: "#EFF6FF", borderRadius: "8px", color: "#2563EB" }}>
            ✓ Layout tablet ativo
          </div>
        )}
        
        {windowSize.width >= 1024 && (
          <div style={{ padding: "8px", backgroundColor: "#F5F3FF", borderRadius: "8px", color: "#7C3AED" }}>
            ✓ Layout desktop ativo
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #E5E7EB", fontSize: "11px", color: "#9CA3AF", textAlign: "center" }}>
        Federal Express Brasil • Design System v1.0
      </div>
    </div>
  );
}
