-- 0263 — o rodapé da barra lateral nomeia o COMMIT instalado, não só o SHA.
--
-- Numa instalação que segue a `main` (fora de release), `current_version` é um
-- SHA curto: "bc962e3f" não diz a uma pessoa o que está rodando. O agente do
-- host já está diante do repositório e sabe o assunto do commit instalado
-- (`git log -1 --format=%s`); o que faltava era esse assunto chegar à tela.
--
-- `current_subject` guarda esse assunto. Aditivo e idempotente: agente antigo
-- que ainda não envia o campo grava '' (o default), e a tela mostra o que
-- `current_version` sempre mostrou — o rodapé só compõe "assunto - versão"
-- quando há assunto E a instalação está fora de release (em tag, o número da
-- versão É o nome; o assunto de um commit de release é ruído).

alter table public.system_version
  add column if not exists current_subject text not null default '';

comment on column public.system_version.current_subject is
  'Assunto do commit instalado (%s de git log -1), enviado pelo agente do host no heartbeat. Vazio para agente antigo que ainda não envia o campo; a tela mostra o que current_version já mostrava.';
