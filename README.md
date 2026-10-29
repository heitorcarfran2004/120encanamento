# HIDRODIAG · 120 Diagnósticos de Hidráulica Residencial: página de vendas

Modelada na página do Split da fábrica MVT (site.arquivopratico.online/ar-condicionado, Felipe Almeida, 26/10/2026):
mesma ordem de seções, 2 planos e 6 bônus. Prints dela em `Downloads\diagnósticos split.pdf`.
Estrutura copiada de `funis/diagnosticos-hardware-es` (mesmo motor de montagem).

Rodar local: `node servidor.cjs` → http://localhost:4244

Repositório: github.com/heitorcarfran2004/120encanamento. A pasta foi apagada da máquina em 29/10/2026 e remontada a partir do
histórico do Webdesigner; as imagens foram baixadas de novo das conversas do ChatGPT onde foram geradas.

## Como a página é feita
- `_fonte/index.html`: só o layout, com marcações `{{...}}`.
- `textos/pt.json`: todo o texto, preços, âncoras, parcelas, links do checkout e pixel.
- `node _montar.cjs` gera `index.html`. **Não edite o gerado.**
- `node conferir.cjs`: ids, carrosséis, imagens que faltam, imagens emprestadas, os 2 checkouts e marcações TROCAR.

## Oferta (dada pelo Heitor em 26/10/2026)
- **Básico R$ 17,90** ("de R$ 47,90", 4x de R$ 4,48): os 120 diagnósticos, índice, guia inicial, digital + A4.
- **Completo R$ 27,90** ("de R$ 147,90", 6x de R$ 6,32, selo MAIS VENDIDO): tudo do Básico + 6 bônus + atualizações futuras.
- 6 bônus a "R$ 27" cada, só no Completo: +40 Diagnósticos Extras de Problemas Menos Frequentes, +30 Diagnósticos de Erros
  de Instalação Hidráulica, Guia Rápido de Ferramentas para Diagnóstico, Tabela de Bitolas, Conexões e Pressões,
  Checklist Antes de Quebrar a Parede, Guia dos Erros de Diagnóstico Mais Comuns.
- Garantia de 30 dias. Acesso por e-mail na hora (a página não promete WhatsApp).

## Falta antes de publicar
- **Checkout:** `config.checkout.basico` e `.completo` estão `TROCAR-CHECKOUT-BASICO/COMPLETO`. O Cadastrador cola os
  links da Wiapy (`pay.wiapy.com/...`) ali e roda `node _montar.cjs`. Conferir as parcelas que a Wiapy mostrar.
- Fichas dos carrosséis: já são as nossas (`assets/fichas/a1-a6` e `b1-b6`, as 12 fichas dos criativos CRT 01-13).
- Pixel da Meta (`TROCAR-PIXEL-META`) e script da UTMify da conta (`TROCAR-UTMIFY-PIXEL`, colar no `<head>` do _fonte).
- Back redirect desligado (`config.backRedirect: false`): falta a oferta de saída (escada padrão R$ 8,90) e `_fonte/promo.html`.
  O script já deixa passar quem clica em `data-checkout` ou em link `pay.wiapy.com`.
- Termos de uso e política de privacidade (`href="#"`).

## O que a página promete e o entregável precisa ter
- Índice por sintoma e guia inicial de utilização (nos 2 planos).
- Versão para celular e versão imprimível em A4.
- Os 6 bônus, incluindo +40 e +30 diagnósticos extras (70 fichas além das 120).
- As descrições dos 8 blocos (`recebe.blocos`) foram conferidas com `Downloads\Hidraulica Diagnosticos\Entregavel\plano\indice-120.json`
  em 26/10/2026. Se o plano mudar, atualizar o pt.json.

## Imagens
Geradas no ChatGPT (prompts, brutas e o `gerar.sh` em `entregaveis/hidrodiag/landing/`), convertidas para `assets/*.webp`:
hero (caixa + fichas + 6 bônus; usado no hero, no "tudo o que vai receber" e no card do Completo), basico (caixa + fichas),
celular (mão com a ficha D-061 aberta diante da caixa acoplada), bonus-1..6. Selo de garantia e ícones são CSS/SVG da própria página.
