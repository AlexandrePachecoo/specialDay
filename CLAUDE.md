# CLAUDE.md

Guia para o Claude Code trabalhar neste repositório.

## Visão geral

**specialDay** — plataforma de cartas virtuais emocionais, compartilháveis por link. Sem login. O usuário entra, escreve, personaliza, paga via PIX, recebe link público + link secreto de edição, e compartilha. Opcionalmente recebe uma cópia impressa em casa.

Casos de uso: pedido de namoro, aniversário, carta para o futuro, pedido de desculpas, amizade, datas comemorativas.

## Stack

- **Next.js 15** App Router em JavaScript puro (sem TypeScript).
- **Tailwind CSS 3** + **shadcn/ui** (adaptado: componentes manuais usando Radix + CVA + tailwind-merge, sem o CLI TS-first).
- **Framer Motion** para todas as animações.
- **Supabase** (Postgres + Storage). Service role usado **somente no servidor** — nada de Supabase direto no client.
- **AbacatePay** para PIX (cobrança inline com brCode + QR base64).
- **Melhor Envio** (opcional) para cotação de frete da foto física. Fallback: tabela fixa por prefixo de CEP em `lib/shipping.js`.
- **ViaCEP** para autocompletar endereço no form.
- **qrcode** lib para gerar QR de share/preview da foto física.
- **bcryptjs** para senhas; **nanoid** para slug/token.
- **sonner** para toasts; **lucide-react** para ícones.
- Deploy Vercel.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencher SUPABASE_*, ABACATEPAY_*, ADMIN_*
npm run dev
```

Vars obrigatórias: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ABACATEPAY_API_KEY`, `ABACATEPAY_WEBHOOK_SECRET`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (mín. 16 chars). Sem `ABACATEPAY_API_KEY` a carta é criada mas não gera PIX (cai em pendente, admin marca manualmente). Sem `MELHOR_ENVIO_TOKEN` usamos a tabela fixa de frete.

## Estrutura

```
src/
├── middleware.js                                   # gate leve do /admin (presence do cookie)
├── app/
│   ├── layout.js                      # fonts + metadata + Toaster
│   ├── page.js                        # landing
│   ├── globals.css                    # tokens, base, prose-letter
│   ├── create/page.js                 # form de criação
│   ├── c/[slug]/                      # viewer público (dinâmico)
│   │   ├── page.js                    # server: roteia para awaiting-payment/gate/countdown/render
│   │   ├── AwaitingPayment.jsx        # tela PIX (QR + copia-cola + timer)
│   │   ├── LetterClient.jsx           # client wrapper para password gate
│   │   ├── not-found.js
│   │   └── loading.js
│   ├── edit/[token]/                  # editor sem login
│   │   ├── page.js
│   │   └── not-found.js
│   ├── admin/                         # painel de pedidos (cookie HMAC)
│   │   ├── layout.js                  # valida sessão (server, Node runtime)
│   │   ├── page.js                    # lista de pedidos
│   │   ├── FilterBar.jsx
│   │   ├── LogoutButton.jsx
│   │   ├── login/                     # /admin/login
│   │   │   ├── page.js
│   │   │   └── LoginForm.jsx
│   │   └── orders/[id]/page.js        # detalhe + mudar status
│   └── api/
│       ├── letters/route.js                       # POST criar carta + cria PIX
│       ├── letters/[slug]/unlock/route.js         # POST validar senha
│       ├── letters/edit/[token]/route.js          # GET + PUT
│       ├── upload/route.js                        # POST signed upload URL
│       ├── shipping/quote/route.js                # POST cotação de frete por CEP
│       ├── webhooks/abacatepay/route.js           # POST webhook PIX pago
│       └── admin/
│           ├── login/route.js                     # POST autentica + seta cookie
│           ├── logout/route.js                    # POST limpa cookie
│           └── orders/[id]/route.js               # PATCH status pagamento/envio
│
├── components/
│   ├── ui/             # button, input, textarea, card, dialog, switch, radio-group, badge, label
│   ├── animations/     # FadeIn, Reveal
│   ├── sections/       # Navbar, Hero, HowItWorks, Demo, Templates, FAQ, CTA, Footer, SectionHeader
│   ├── forms/          # CreateLetterForm, EditLetterForm, ThemePicker, CoverUploader,
│   │                   #   MomentsUploader, PhysicalPhotoCard, AddressForm, PhotoQRPreview, PreviewModal
│   ├── letter/         # LetterRenderer, EnvelopeOpen, PasswordGate, LockedCountdown,
│   │                   #   MusicPlayer, ThemeDecorations, MomentsCarousel, TimerDisplay
│   └── shared/         # CopyButton, ShareButtons, SuccessScreen, LoadingState
│
├── services/
│   ├── supabase.js       # singleton service-role
│   ├── letters.js        # CRUD + listOrders/getOrderById/updateOrderStatus + markAsPaid + expireOldLetters
│   ├── storage.js        # createCoverUploadUrl, getPublicUrl
│   ├── abacatePay.js     # createPixCharge, getPixCharge, getWebhookSecret, isAbacatePayConfigured
│   └── melhorEnvio.js    # quoteShipping, pickCheapest, isMelhorEnvioConfigured
│
├── lib/
│   ├── utils.js          # cn, absoluteUrl
│   ├── slug.js           # generateSlug, generateEditToken, slugify (com reserved set)
│   ├── password.js       # bcrypt wrappers
│   ├── validators.js     # validateLetterPayload + sanitizeText (inclui endereço/moments)
│   ├── ratelimit.js      # in-memory bucket por IP
│   ├── shipping.js       # tabela fixa de frete por prefixo de CEP (fallback do Melhor Envio)
│   ├── viacep.js         # fetch endereço por CEP
│   ├── uploadImage.js    # compressão client-side (canvas)
│   ├── errors.js         # serverErrorResponse + logServerError
│   ├── adminAuth.js      # HMAC SHA-256 + timingSafeEqual (Node-only)
│   └── adminCookie.js    # constantes compartilháveis com Edge middleware
│
├── hooks/                # useClipboard, useDebounce, useCountdown
├── utils/                # format (date, number, truncate)
└── constants/            # themes, templates, site, pricing
```

## Modelo de dados

Tabela **`letters`** (migrations em `supabase/migrations/0001` a `0006`):

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `slug` | text unique | público em `/c/:slug` (8 chars a-z0-9 ou custom) |
| `edit_token` | text unique | secreto, 24 chars nanoid — única forma de editar |
| `title`, `content` | text | obrigatórios |
| `sender_name`, `recipient_name` | text | opcionais |
| `theme` | text | id do catálogo em `constants/themes.js` |
| `cover_image`, `cover_position` | text | capa + `'50% 50%'` para reposicionar |
| `moments` | jsonb | array `[{ url, caption }]` — até 10 momentos |
| `music_url` | text | YouTube |
| `visibility` | text | `public` ou `private` |
| `password_hash` | text | bcrypt; só presente se `visibility=private` |
| `unlock_date` | timestamptz | se setado, carta só abre depois |
| `timer_type` | text | `countdown` ou `countup` |
| `timer_label`, `timer_date` | text/timestamptz | rótulo + data de referência do timer |
| `physical_photo_enabled` | bool | se o usuário pediu impressão física |
| `physical_photo_url` | text | foto a imprimir (null = reusa `cover_image`) |
| `shipping_address` | jsonb | `{ cep, street, number, complement, neighborhood, city, uf, recipient }` — PII |
| `shipping_cost_cents` | int | snapshot do frete |
| `shipping_region` | text | rótulo legível (RS, SC/PR, Sudeste, NE, CO, N) |
| `shipping_status` | text | `pending` → `paid` → `shipped` → `delivered` (ou `canceled`) |
| `payment_status` | text | `awaiting_payment` → `paid` (ou `expired`/`refunded`) |
| `payment_provider` | text | hoje só `abacatepay` |
| `payment_id` | text | id do gateway |
| `payment_amount_cents` | int | total cobrado (carta + foto + frete), em centavos |
| `payment_url` | text | reservado (PIX hoje é inline; ver brcode abaixo) |
| `payment_pix_brcode` | text | PIX copia-e-cola (EMV) |
| `payment_pix_qr_base64` | text | `data:image/png;base64,...` do QR |
| `payment_paid_at` | timestamptz | quando o webhook confirmou |
| `payment_expires_at` | timestamptz | 20min após criação |
| `views` | int | contador best-effort |
| `created_at`, `updated_at` | timestamptz | trigger automático |

`expire_pending_letters()` (SQL function em `0005_payment.sql`) marca cartas pendentes vencidas como `expired`. Chamamos `expireOldLetters()` em JS no GET de `/c/:slug` (lazy expire). PII (`shipping_address`, `edit_token`, `password_hash`) só aparece em `FULL_COLUMNS` no service.

Bucket de storage: **`letters`** (público). Path padrão: `covers/<nanoid>-<timestamp>.<ext>` e `moments/<nanoid>-<timestamp>.<ext>`.

## Preços

Definidos em **`src/constants/pricing.js`** — calculados no servidor, nunca confiar no client:

- Carta digital: **R$ 9,90** (`BASE_PRICE_CENTS = 990`).
- Carta com foto física impressa: **R$ 19,90** (`WITH_PHOTO_PRICE_CENTS = 1990`) + frete por CEP.
- Tempo para pagar antes de expirar: **20 min** (`PAYMENT_EXPIRY_MINUTES`).

`computeAmountCents({ physicalPhotoEnabled, shippingCostCents })` é a fonte da verdade.

## Fluxos

### Criação
1. Form em `/create` → `POST /api/letters` com payload validado/sanitizado (inclui moments + endereço + flag de foto física).
2. Se `physicalPhotoEnabled` e `MELHOR_ENVIO_TOKEN` configurado, recota frete pela API (sobrescreve a tabela fixa).
3. Service gera `slug` + `edit_token`, faz hash da senha (se houver), insere row com `payment_status=awaiting_payment` e `payment_expires_at = now + 20min`.
4. `createPixCharge` no AbacatePay → grava `payment_id`, `payment_pix_brcode`, `payment_pix_qr_base64` via `attachPayment`. Falha do gateway é logada mas não derruba a criação (admin pode marcar manualmente).
5. Resposta: `{ slug, editToken, pix: { brCode, brCodeBase64, expiresAt }, amountCents, physicalOrder }`. Front renderiza `SuccessScreen` com os links + instruções de pagamento.

### Pagamento
1. Enquanto `payment_status=awaiting_payment`, `/c/:slug` renderiza `AwaitingPayment` (QR + copia-cola + countdown).
2. Pagamento ocorre via app do banco. AbacatePay chama `POST /api/webhooks/abacatepay`.
3. Validamos o segredo e chamamos `markAsPaid({ paymentId, externalSlug })` — idempotente. Carta vira pública. Se tinha foto física, `shipping_status` vai de `pending` → `paid` (entra na fila do admin para impressão).
4. `expireOldLetters()` roda fire-and-forget no GET de `/c/:slug` para marcar pendências estouradas como `expired`.

### Viewer (`/c/:slug`)
1. Server Component busca a row.
2. `payment_status` ≠ `paid` → `AwaitingPayment` (ou 404 se `expired`/`refunded`). Metadata fica `noindex` antes do pagamento confirmar.
3. `unlock_date` no futuro → `LockedCountdown`.
4. `visibility=private` → `LetterClient` (client) com `PasswordGate`, que chama `POST /api/letters/:slug/unlock`.
5. Caso contrário → `LetterRenderer` direto (com `MomentsCarousel`, `TimerDisplay`, `MusicPlayer` conforme campos).
6. `incrementViews` é chamado fire-and-forget.

### Edição (`/edit/:token`)
1. Server Component busca por `edit_token`.
2. `EditLetterForm` (client) salva via `PUT /api/letters/edit/:token`.
3. Pedido de foto física **não é editável** pela rota de edição (mudar endereço/foto invalidaria o frete e o snapshot do pedido).

### Upload de capa / momentos
1. Client comprime imagem (canvas, max 1600px, JPEG q=0.85) em `lib/uploadImage.js`.
2. `POST /api/upload` retorna `signedUrl` + `publicUrl`.
3. Client faz PUT direto no Supabase Storage.
4. `publicUrl` é gravada em `letters.cover_image` ou no array `moments`.

### Cotação de frete
- `POST /api/shipping/quote` → body `{ cep }`. Retorna `{ cost, region, days, formatted }`.
- Quando `MELHOR_ENVIO_TOKEN` está setado, usa a API; caso contrário usa `lib/shipping.js` (tabela fixa).
- `lib/viacep.js` é usado pelo front para autocompletar rua/bairro/cidade/UF a partir do CEP.

### Admin
- `/admin/login` valida `ADMIN_PASSWORD` via `timingSafeEqual` e seta cookie httpOnly assinado HMAC-SHA256 (TTL 12h).
- Middleware Edge faz só presence check do cookie. Validação HMAC completa acontece no `layout.js` do `/admin` (server, Node runtime — `node:crypto` não roda em Edge).
- `/admin` lista pedidos (`listOrders`) com filtros por status + se tem foto física.
- `/admin/orders/[id]` mostra detalhe + permite mudar `shipping_status` e `payment_status` via `PATCH /api/admin/orders/:id`.

## Temas

`src/constants/themes.js` é um objeto `{ id: { name, emoji, decoration, vars } }`. `vars` vira CSS vars (`--letter-bg`, `--letter-surface`, `--letter-ink`, fontes...) aplicadas no `LetterRenderer`. `decoration` é consumido por `ThemeDecorations` (hearts, stars, sakura, confetti, paper, none).

Temas atuais: `romantic`, `minimal`, `vintage`, `dark`, `anime`, `birthday` (6 ao todo).

**Para adicionar um tema novo**: adicione um entry em `THEMES`. Decoração nova exige um branch novo em `ThemeDecorations`.

## Segurança e abuso

- **Service role só no servidor** (`src/services/supabase.js`). Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no client.
- **AbacatePay/Melhor Envio**: API keys e tokens só no servidor. Webhook valida `ABACATEPAY_WEBHOOK_SECRET`.
- **Admin**: cookie HMAC + `timingSafeEqual` na comparação de senha. `ADMIN_SESSION_SECRET` precisa ter pelo menos 16 chars.
- **Sanitização** via `sanitizeText` remove tags perigosas e handlers `on*=`. Renderização usa `whitespace-pre-wrap`, sem `dangerouslySetInnerHTML`. Aplicada também em campos de endereço e captions de momentos.
- **Preço calculado no servidor** (`computeAmountCents`). O valor do frete é re-cotado server-side antes de gravar.
- **Rate limit** in-memory (`src/lib/ratelimit.js`): 6 cartas/min, 10 unlocks/min/slug, 20 edits/min, 20 uploads/min, todos por IP. Trocar por Upstash quando o tráfego crescer.
- **Brute force**: PasswordGate e admin login são protegidos pelo rate limit acima.

## Convenções

- ESM apenas (`"type": "module"`). Sem `require`.
- Server Components por padrão. `'use client'` só quando há estado/efeitos.
- Imports com alias `@/` (configurado em `jsconfig.json`).
- Componentes pequenos. Forms são o único arquivo "grosso" — partidos em `Field` reutilizável.
- Tailwind com tokens em `:root` (HSL). Dark mode via classe `.dark` (preparado mas não exposto no UI ainda).
- `node:crypto` (e qualquer lib Node-only) só em arquivos rodando em Node runtime. Para middleware/Edge use Web Crypto ou módulos puros (`lib/adminCookie.js` é o exemplo).

## Limites

- `LIMITS.title = 80`, `LIMITS.content = 5000`, `LIMITS.name = 60`, `LIMITS.password = 64`.
- `LIMITS.moments = 10`, `LIMITS.momentCaption = 140`.
- `LIMITS.address`: street 120, number 20, complement 80, neighborhood 80, city 80, recipient 80.
- Upload máx 8MB (validado client + server).

## Gotchas

- **`params` é Promise no Next 15** — sempre `const { slug } = await params`. Vale também para `searchParams`.
- **Toda página com dados do Supabase** marca `export const dynamic = 'force-dynamic'` e `revalidate = 0` para não cachear.
- **`incrementViews`** é fire-and-forget; race condition de contador é aceitável.
- **`expireOldLetters`** também é fire-and-forget no GET do viewer — lazy expire sem cron.
- **Token de edição é a única chave** — não há fluxo de recuperação. Avisar isso no `SuccessScreen` é crítico.
- **Foto física não é editável** depois de criada (endereço/foto/frete são imutáveis na v1).
- **Bucket `letters` precisa ser público** para servir as capas sem signed URL. Se preferir privado, gerar signed URL no render.
- **Webhook idempotente**: `markAsPaid` checa `payment_status` antes de atualizar — receber o mesmo evento duas vezes é seguro.
- **AbacatePay sem config** cai em fluxo manual: carta criada, sem QR, admin marca como paga em `/admin/orders/:id`.
