import { Linkedin, Youtube, Instagram, MessageCircle } from "lucide-react";
import logoImage from "figma:asset/fdb4ef494a99e771ad2534fa1ee70561858f6471.png";

export default function Footer() {
  return (
    <footer className="bg-[#0A4B9E] py-16 text-white">
      <div className="mx-auto max-w-[1440px] px-20">
        <div className="grid grid-cols-3 gap-12">
          {/* Coluna 1 - Logo */}
          <div>
            <div
              className="inline-block rounded-xl bg-white/60 p-3 shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
              style={{ backdropFilter: "blur(8px)" }}
            >
              <img
                src={logoImage}
                alt="Federal Express Brasil"
                className="h-8 w-auto"
              />
            </div>
            <p
              className="mt-4"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: "1.6"
              }}
            >
              Soluções migratórias completas para você e sua família. Unindo
              pessoas, culturas e oportunidades desde 2010.
            </p>
          </div>

          {/* Coluna 2 - Links */}
          <div>
            <h3
              className="mb-4"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "18px",
                fontWeight: 600,
                color: "white"
              }}
            >
              Links éšteis
            </h3>
            <nav>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-[#2BA84A]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "rgba(255, 255, 255, 0.9)"
                    }}
                  >
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-[#2BA84A]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "rgba(255, 255, 255, 0.9)"
                    }}
                  >
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-[#2BA84A]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "rgba(255, 255, 255, 0.9)"
                    }}
                  >
                    Contato
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="transition-colors hover:text-[#2BA84A]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 400,
                      color: "rgba(255, 255, 255, 0.9)"
                    }}
                  >
                    Sobre Nós
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Coluna 3 - Redes Sociais */}
          <div>
            <h3
              className="mb-4"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: "18px",
                fontWeight: 600,
                color: "white"
              }}
            >
              Conecte-se Conosco
            </h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-all hover:bg-[#2BA84A] hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-all hover:bg-[#2BA84A] hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-all hover:bg-[#2BA84A] hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            {/* QR Code WhatsApp */}
            <div className="mt-6">
              <p
                className="mb-2"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.9)"
                }}
              >
                Fale conosco via WhatsApp
              </p>
              <div className="flex items-center gap-3">
                {/* Placeholder QR Code */}
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-white p-2">
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-600">
                    QR Code
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <MessageCircle className="h-6 w-6 text-[#2BA84A]" />
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 400,
                      color: "rgba(255, 255, 255, 0.8)"
                    }}
                  >
                    Escaneie para iniciar uma conversa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha de separação */}
        <div className="my-8 border-t border-white/20" />

        {/* Copyright */}
        <p
          className="text-center"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.8)"
          }}
        >
          © 2025 Federal Express Brasil "” Soluções Migratórias. Todos os direitos
          reservados.
        </p>

        {/* Desenvolvedor */}
        <p
          className="text-center mt-2"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.8)"
          }}
        >
          <a
            href="https://www.deltafoxconsult.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#2BA84A] hover:underline"
            style={{
              color: "rgba(255, 255, 255, 0.8)"
            }}
          >
            Sistema desenvolvido por Deltafox Consultoria
          </a>
        </p>
      </div>
    </footer>
  );
}

