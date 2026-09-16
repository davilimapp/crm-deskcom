"use client";
import Link from "next/link";

import { ArrowCircleUp } from "@/lib/ui/icons";
import { useT } from "@/hooks/i18n/useT";
import { useSystemVersion } from "@/hooks/system/useSystemVersion";
import { cn } from "@/lib/utils";

/**
 * Controle essencial da instalação: não é removível pela interface do vínculo.
 * Versão instalada no rodapé da sidebar. Vira um aviso clicável só para quem
 * é dono do servidor E tem versão nova — quem não pode atualizar não é
 * alertado sobre algo que não pode resolver.
 */
export function VersionFooter({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  /** Fecha a gaveta do mobile — é o único Link do drawer que não a recebia. */
  onNavigate?: () => void;
}) {
  const t = useT();
  const { data } = useSystemVersion();
  if (!data?.current_version) return null;

  const label = data.current_version.replace(/^v/i, "");
  // O nome que uma pessoa lê. Fora de release, `current_version` é um SHA
  // curto — "bc962e3f" não diz o que está rodando — e o assunto do commit
  // (`current_subject`, enviado pelo agente do host) nomeia: "versão zenfy
  // v1.1 - bc962e3f". Só fora de release: em tag, o número é o nome, e o
  // assunto de um commit de release é ruído. Em tag (ou com agente antigo,
  // que não envia o campo) a linha segue exatamente como era.
  const visivel =
    data.off_release && data.current_subject ? `${data.current_subject} - ${label}` : label;
  // Só acende quando existe versão nova de verdade. `off_release` sozinho não
  // conta: uma instalação de desenvolvimento sem versão publicada mais nova
  // ficava com o ponto pulsando pra sempre, e o texto "Nova versão · " com o
  // número vazio, apontando para uma tela que não tem o que oferecer.
  const alerta = data.is_owner && data.update_available;

  if (!alerta) {
    return (
      <p
        className={cn(
          "truncate px-3 py-1 text-[11px] text-muted-foreground",
          collapsed && "px-0 text-center",
        )}
        title={`${t("Versão")} ${visivel}`}
      >
        {/* Recolhida, só o número/SHA: o assunto cabe na barra aberta (w-60),
            não num quadrado de 4rem — e o title carrega o inteiro. */}
        {collapsed ? label.split(".").slice(0, 2).join(".") : `${t("versão")} ${visivel}`}
      </p>
    );
  }

  const novo = data.latest_version?.replace(/^v/i, "") ?? "";
  return (
    <Link
      href="/app/settings/atualizacao"
      onClick={onNavigate}
      title={`${t("Nova versão")} ${novo} ${t("disponível")}`}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-xs text-foreground hover:bg-accent/50",
        collapsed && "justify-center px-2",
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      {!collapsed && (
        <span className="truncate">
          {t("Nova versão")}
          {novo ? ` · ${novo}` : ""}
        </span>
      )}
      {collapsed && <ArrowCircleUp size={16} aria-hidden />}
    </Link>
  );
}
