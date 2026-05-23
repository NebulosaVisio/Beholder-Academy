# Segurança — Beholder Academy

## Reportar Vulnerabilidades

Se você encontrou uma vulnerabilidade de segurança no Beholder Academy, por favor **não abra uma issue pública**.

Envie um email para: **contato@beholderacademy.com.br**

Inclua:
- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial

Responderemos em até 48 horas.

## Práticas de Segurança

### Headers HTTP (via .htaccess)

| Header | Valor |
|--------|-------|
| Content-Security-Policy | `default-src 'self'` + domínios permitidos |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | Câmera, microfone, geolocalização e pagamento bloqueados |

### Armazenamento de Dados

- **Zero dados sensíveis** — nenhuma senha, CPF ou dado pessoal é coletado
- Todo o estado do jogo é armazenado em `localStorage` do próprio navegador do usuário
- Não há banco de dados nem backend
- O "login" é apenas uma identificação local para personalizar a experiência

### Sanitização

- Campos de busca utilizam `textContent` (sem `innerHTML`)
- Build script aplica `escapeHtml()` para prevenir XSS nos dados de conteúdo
- CSP restringe execução de scripts a `'self'` e `'unsafe-inline'` (necessário para scripts inline)
