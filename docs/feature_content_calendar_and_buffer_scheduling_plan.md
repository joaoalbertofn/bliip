# Plano de Implementação: Calendário Editorial & Agendamento no Buffer

Este documento descreve o plano técnico para implementar o **Calendário Editorial Interativo no Modal de Exportação**, com agendamento de data/hora no **Buffer** (como rascunho agendado) e sincronização de status no **Bliip** e no **Google Sheets**.

---

## 🎨 O Que Será Desenvolvido

### 1. Extensão do Modelo de Dados (`src/types/carousel.ts`)
- Adicionar ao tipo `Carousel`:
  - `status`: `'draft' | 'scheduled' | 'sent'` (Rascunho | Agendado | Enviado).
  - `scheduledAt?: string` (Data e hora ISO do agendamento, ex: `2026-07-28T10:00:00.000Z`).

---

### 2. Calendário Editorial Interativo no Modal de Exportação (`src/components/ExportModal.tsx`)
- **Visualização do Mês**:
  - Grid mensal interativo (Segunda a Domingo).
  - Navegação entre meses (‹ Mês Anterior | Próximo Mês ›).
- **Indicadores Visuais de Agenda**:
  - **Dias com Posts Agendados**: Exibe um badge roxo/amarelo com o ícone 🗓️ e a hora do post agendado.
  - **Dias Livres**: Destacados para seleção rápida.
- **Seletor de Hora**:
  - Entrada de hora personalizada (ex: `10:00`, `15:30`) ou botões de horários populares (`09:00`, `12:00`, `18:00`, `21:00`).
- **Ação de Envio**:
  - Botão *"Agendar Rascunho no Buffer para [DD/MM às HH:MM]"*.

---

### 3. Suporte a `scheduled_at` no Publisher Adapter (`src/lib/publishers/`)
- Atualizar a interface `StandardizedPostPayload` para aceitar `scheduledAt?: string`.
- Atualizar o `BufferPublisher.ts`:
  - Enviar o parâmetro `scheduled_at` na API do Buffer (`POST /1/updates/create.json`).
  - Manter o flag de rascunho ativo no Buffer para o post entrar na fila como rascunho agendado.

---

### 4. Status Agendado & Interatividade no Dashboard (`src/components/Dashboard.tsx`)
- **Card do Carrossel**:
  - Exibir a badge 🟣 `Agendado para 28/07 às 10:00` quando o post tiver data marcada.
- **Clique Interativo**:
  - Ao clicar na badge de status agendado em qualquer card do Dashboard, abre diretamente o modal com o calendário pré-selecionado na data do agendamento.

---

### 5. Sincronização com o Google Sheets (`src/app/api/lead-sync/route.ts`)
- Atualizar a API do lead sync para registrar/atualizar os posts agendados e suas respectivas datas na planilha.

---

## 🛠️ Modificações Arquiteturais por Arquivo

| Arquivo | Mudança |
| :--- | :--- |
| `src/types/carousel.ts` | [MODIFY] Adicionar `scheduledAt` e expandir `status` para `'scheduled'`. |
| `src/lib/publishers/PublishingAdapter.ts` | [MODIFY] Adicionar `scheduledAt` ao `StandardizedPostPayload`. |
| `src/lib/publishers/BufferPublisher.ts` | [MODIFY] Repassar `scheduled_at` para a API do Buffer. |
| `src/components/ExportModal.tsx` | [MODIFY] Integrar o componente de Calendário Mensal e Seletor de Hora. |
| `src/components/Dashboard.tsx` | [MODIFY] Exibir badge `Agendado` e permitir clique para abrir o calendário. |
| `src/hooks/useCarouselState.ts` | [MODIFY] Adicionar método `handleScheduleCarousel(id, scheduledAt)`. |
| `src/app/api/lead-sync/route.ts` | [MODIFY] Suportar registro de posts agendados na planilha. |

---

## 🧪 Plano de Verificação Automática & Manual

### Automated Tests
- `npx tsc --noEmit` (Verificar integridade de tipos TypeScript com `scheduledAt`).
- `npm run build` (Garantir build limpo da aplicação Next.js).

### Manual Verification
- Testar navegação do Calendário no Modal de Exportação.
- Agendar um carrossel para uma data específica.
- Confirmar alteração do status para `Agendado` no Dashboard.
- Confirmar envio do parâmetro `scheduled_at` para a API do Buffer.
