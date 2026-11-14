# Earth Jukebox

Vitrola interativa da Terra. A pessoa escolhe uma visualização oficial do Earth Information Center (EIC) da NASA, uma barra de varredura percorre o mapa e o navegador transforma os valores reais dos dados em música, em tempo real. Projeto do NASA Space Apps Challenge 2026, etapa Ceres-GO, desafio **The Earth Information Jukebox**.

> Preencher no sábado: nome da equipe, integrantes, URL da demonstração, URL do vídeo.

## Sumário

1. [O desafio](#1-o-desafio)
2. [Decisões de projeto](#2-decisões-de-projeto)
3. [Faixas (visualizações da NASA)](#3-faixas-visualizações-da-nasa)
4. [Arquitetura](#4-arquitetura)
5. [Pipeline de dados](#5-pipeline-de-dados)
6. [Cronograma oficial e plano de execução](#6-cronograma-oficial-e-plano-de-execução)
7. [Divisão de trabalho](#7-divisão-de-trabalho)
8. [Como usar o GitHub Copilot neste projeto](#8-como-usar-o-github-copilot-neste-projeto)
9. [Critérios dos jurados e como pontuar](#9-critérios-dos-jurados-e-como-pontuar)
10. [Teste com ouvinte](#10-teste-com-ouvinte)
11. [Submissão e pitch](#11-submissão-e-pitch)
12. [Riscos](#12-riscos)
13. [Créditos e referências](#13-créditos-e-referências)

---

## 1. O desafio

Fonte: aba Details e aba Resources da página oficial do desafio (copiadas em 13/11/2026).

- **Pedido:** construir uma "Earth Jukebox", ou seja, uma interface, script ou aplicação que pareie quadros visuais do EIC com sonificações dinâmicas geradas em tempo real.
- **Resultado esperado:** a pessoa seleciona ou experimenta uma visualização do EIC junto com o seu som.
- **Formatos aceitos de entrega:** jukebox web interativo, aplicativo desktop, endpoint de API ou uma playlist de áudios originais gerados, acompanhada da explicação do processo.
- **Acessibilidade é tema central:** a página cita leitor de tela, retorno tátil e texto descritivo rico como caminhos possíveis.
- **Musicalidade:** a página avisa que tradução direta de pixel para som tende a virar ruído e sugere escalas e harmonias.
- **Dificuldade e áreas:** Intermediate e Beginner/Youth; Arts & Multimedia, Earth Science e Software.

Nossa aposta: jukebox web que roda 100% no navegador (HTML, CSS e JavaScript puro, Canvas e Web Audio API), com gravações das faixas como reserva caso a demonstração ao vivo falhe.

---

## 2. Decisões de projeto

| # | Decisão | Motivo |
|---|---------|--------|
| D1 | **Valor vem da colorbar, nunca do brilho ou da cor.** Cada pixel é casado com a cor mais próxima da colorbar oficial e vira um valor numérico (unidade real). | Brilho não cresce com o valor, principalmente em colormaps divergentes. Na visualização de luzes noturnas, roxo é mais luz, laranja é menos luz e branco é "sem mudança": o branco é o pixel mais claro, então mapear brilho para altura faria "sem mudança" soar como extremo agudo. Isso afeta o critério Validity. |
| D2 | **Um modo por faixa:** espacial (um frame, varredura de oeste para leste) ou temporal (um passo por frame). O MVP faz só o espacial. | O eixo X é longitude em mapa estático. Tempo exige vários frames. |
| D3 | **Escala pentatônica maior, 15 notas (C3 a A5).** | Qualquer combinação soa agradável. A quantização esconde diferenças menores que 1/14 da faixa, e isso é declarado na legenda. |
| D4 | **Faixa de latitude como parâmetro** (global, norte, trópicos, sul). | A média da coluna inteira tende a achatar o sinal, porque muitas variáveis mudam mais com a latitude do que com a longitude. |
| D5 | **Cor só vira timbre quando a legenda diz que cor é categoria.** Timbre fixo por faixa por padrão. | A mesma cor significa coisas diferentes em datasets diferentes. |
| D6 | **Sem filtro de ressonância, sem Figma, sem framework.** | Complexidade sem retorno em 2 dias. Rascunho de tela no papel. |
| D7 | **Sem dependências externas em tempo de execução** (sem CDN, sem Google Fonts). | O Wi-Fi do evento pode falhar. |
| D8 | **Pixels não são medições calibradas.** Cada faixa mostra "modelo" ou "observação" e a fonte. | Honestidade científica, critério Validity. |
| D9 | **Pixels sem dado viram silêncio:** texto, selo, borda, fundo e transparência. | Evita sonificar elementos gráficos. |

---

## 3. Faixas (visualizações da NASA)

Lista oficial da aba Resources. Os identificadores SVS foram associados aos títulos pela ordem dos links da página, então **confirme cada um abrindo o link**. O conjunto completo está na galeria do EIC: https://svs.gsfc.nasa.gov/gallery/earth-information-center/

| Título na aba Resources | SVS | Uso na jukebox | Colorbar |
|---|---|---|---|
| Change in Night Lights between 2012 and 2023, EIC Version | [5313](https://svs.gsfc.nasa.gov/5313/) (original: [5276](https://svs.gsfc.nasa.gov/5276/)) | **Faixa 1.** Roxo mais luz, laranja menos luz, branco sem mudança. Altura alta = aumento de luz. | Sim, imagem separada na página 5276 |
| GEOS Aerosols | [5669](https://svs.gsfc.nasa.gov/5669/) | **Faixa 2.** Fumaça, poeira e outras partículas. Gancho local: queimadas no Cerrado, conferir a legenda. | Sim, publicada na página |
| GEDI Forest Height | [4950](https://svs.gsfc.nasa.gov/4950/) | **Faixa 3**, se tiver colorbar. Altura do dossel: relevante para Brasil. | Verificar às 09h40 |
| DYAMOND Global Carbon Dioxide | [5196](https://svs.gsfc.nasa.gov/5196/) | Alternativa à faixa 3, se tiver colorbar. | Verificar |
| Lightning Events Detected from the ISS 2017-2023 | [5011](https://svs.gsfc.nasa.gov/5011/) | Reserva: eventos viram percussão. Exige modo de eventos, só se sobrar tempo. | Verificar |
| Air Quality Model Runs | [5533](https://svs.gsfc.nasa.gov/5533/) | Reserva (frames individuais). | Verificar |
| Global Sea Surface Currents and Temperature | [3912](https://svs.gsfc.nasa.gov/3912/) | Reserva (temperatura do mar). | Verificar |
| Perpetual Ocean 2: Western Boundary Currents | [5425](https://svs.gsfc.nasa.gov/5425/) | Reserva artística: alto contraste, difícil de converter em valor. | Provavelmente não |
| A 3D View of an Atmospheric River | [4960](https://svs.gsfc.nasa.gov/4960/) | Reserva. | Verificar |
| Data Sonification: Caldwell 73 | [13786](https://svs.gsfc.nasa.gov/13786/) | Só referência conceitual da própria NASA. | Não se aplica |

**Regra:** se uma faixa não tem colorbar, ela só entra rotulada como "interpretação artística, sem valores calibrados".

**Dica para a faixa 1:** a versão EIC (5313) tem proporção mais larga e inclui recortes ampliados em partes da animação. Para decodificar, prefira o still do mapa plano da versão original (5276) e dê crédito às duas páginas.

---

## 4. Arquitetura

### Estrutura de pastas

```
earth-jukebox/
  index.html
  style.css
  app.js            interface, varredura e agendador de áudio
  tracks.js         catálogo das faixas (contrato entre dados e código)
  assets/
    frames/         PNG reduzidos (1024x512)
    colorbars/      só o gradiente, horizontal, mínimo à esquerda
  test/
    analisa.test.js testes em Node com imagem sintética
  playlist/         gravações das faixas (reserva)
  docs/
    teste-ouvinte.md
  .github/
    copilot-instructions.md
  README.md
```

### Contrato de uma faixa (`tracks.js`)

```js
{
  id: 'luzes-noturnas',
  titulo: 'Mudança nas luzes noturnas, 2012 a 2023',
  img: 'assets/frames/luzes.png',
  bar: 'assets/colorbars/luzes_bar.png',
  mapa: { x: 0, y: 0, w: 1024, h: 512 },  // recorte sem selo, legenda e data
  vmin: -1, vmax: 1, unidade: 'variação',  // LER NA COLORBAR OFICIAL
  onda: 'triangle',
  tipo: 'observação',                       // ou 'modelo'
  alt: 'Mapa-múndi com regiões em roxo (mais luz) e laranja (menos luz).',
  fonte: 'https://svs.gsfc.nasa.gov/5276/',
  creditos: 'NASA Scientific Visualization Studio'
}
```

Os valores `vmin` e `vmax` acima são placeholders. Leia os números reais nos rótulos da colorbar de cada faixa.

### Motor de visão

1. Desenhar o recorte `mapa` num canvas fora da tela e chamar `getImageData` uma vez ao carregar a faixa (não a cada quadro).
2. Montar a LUT lendo uma linha do meio da colorbar horizontal.
3. Para cada pixel opaco, achar a cor mais próxima da LUT, com cache por cor.
4. Se a distância ao quadrado passar do limite (`40*40*3`), o pixel é "sem dado".
5. Pesar cada linha por `cos(latitude)` (fórmula válida para mapa equiretangular).
6. Calcular a média em 64 colunas, só na faixa de latitude escolhida.
7. A barra de varredura é desenhada a partir do relógio do áudio, nunca o contrário.

### Motor de sonificação

```
n    = clamp((v - vmin) / (vmax - vmin), 0, 1)
i    = round(n * 14)
MIDI = 48 + 12 * floor(i / 5) + [0, 2, 4, 7, 9][i mod 5]
f    = 440 * 2^((MIDI - 69) / 12)        // C3 = 130,8 Hz a A5 = 880 Hz
pan  = -0.9 + 1.8 * coluna / 63            // longitude da esquerda para a direita
vol  = 0.5 + 0.5 * min(1, 8 * |salto| / (vmax - vmin))
```

- Envelope: ataque de 15 ms, decaimento de 60 ms até 60%, release de 150 ms até zero.
- Um passo = uma coluna. 3 a 10 passos por segundo.
- Notas agendadas com `ctx.currentTime` e antecedência de 0,2 s. Nunca criar osciladores dentro de `requestAnimationFrame`.
- Compressor no canal principal para evitar saturação.
- O `AudioContext` só é criado e retomado dentro de um clique.
- Coluna sem dado é pausa.
- Botão "Ouvir a escala" toca as 15 notas, da mínima à máxima: é a legenda sonora.

### Interface e acessibilidade

- Controles nativos: `select` de faixa, `select` de faixa de latitude, `button` Tocar e Pausar, `button` Ouvir a escala, `input range` de velocidade, todos com `label`.
- Botão **Modo Guiado**: carrega a faixa 1 e toca no mesmo clique (cumpre a regra de gesto do usuário).
- Texto visível com longitude e valor atual (`#agora`), sem `aria-live`, para o leitor de tela não falar por cima do som.
- `role="status"` só no resumo, atualizado ao trocar de faixa e ao fim da varredura: faixa, maior e menor valor com a longitude aproximada.
- `alt` descritivo no mapa e seção "Como ler o som" com a legenda em texto.
- Fonte clicável e crédito em cada faixa, com o rótulo "modelo" ou "observação".
- Foco visível, alvos de toque de pelo menos 44 px, contraste alto.
- Testar só com teclado, com leitor de tela (NVDA, VoiceOver ou TalkBack) e no celular.

---

## 5. Pipeline de dados

```bash
# 1. frame em PNG (evite JPEG: altera as cores e piora o casamento com a colorbar)
magick frame.png -resize 1024x512 assets/frames/NOME.png

# 2. colorbar: recortar só o gradiente, horizontal, mínimo à esquerda
magick colorbar.png -crop LARGURAxALTURA+X+Y +repage assets/colorbars/NOME_bar.png
magick assets/colorbars/NOME_bar.png -rotate 90 assets/colorbars/NOME_bar.png   # só se for vertical; conferir a direção

# 3. servidor local (file:// contamina o canvas e bloqueia módulos ES)
python3 -m http.server 8000     # abrir http://localhost:8000

# 4. frames de um vídeo (modo temporal, só se sobrar tempo)
ffmpeg -i video.mp4 -vf fps=1 frames/f_%03d.png
```

Regras:

- Ler `vmin` e `vmax` nos rótulos da colorbar e anotar em `tracks.js`.
- Definir o recorte `mapa` para excluir selo, data, legenda e bordas.
- Nunca usar imagem de outro domínio no canvas (CORS). Tudo local.
- Total de assets abaixo de 10 MB. Testar em modo avião.
- Dar crédito: as páginas do SVS pedem crédito ao NASA Scientific Visualization Studio. A aba Resources lembra que sites de terceiros têm regras próprias de uso de dados.

---

## 6. Cronograma oficial e plano de execução

Programação oficial da etapa Ceres (imagens divulgadas pela organização). Pontos que moldam o plano:

- A **submissão NASA é a Entrega 2, domingo às 12h00**. O produto precisa estar pronto no sábado à noite.
- Sábado de manhã só rende cerca de 2h20 de código seguido (das 09h40 às 12h00).
- A mentoria de MVP é às **15h10**: já precisa soar algo nela.

### Sábado 14/11

| Horário | Oficial | O que fazemos | Pronto quando |
|---|---|---|---|
| 08h00 | Credenciamento e coffee break | Confirmar equipe e desafio na plataforma. Criar o repositório, ativar o GitHub Pages, commitar README e `.github/copilot-instructions.md`. | Repositório existe e a página publica |
| 08h30 | Entrega 1: time e desafio. Palestra: Pitch | Entregar time e desafio. Uma pessoa assiste, outra cria as issues do backlog (seção 8). | Entrega 1 feita |
| 09h00 | Palestra: Ideação e Validação | Escolher a pergunta de validação (seção 10). Definir as 3 faixas. | 3 faixas escolhidas |
| 09h30 a 09h40 | Apresentação dos mentores | Anotar quem entende de acessibilidade, áudio e dados. | Lista de mentores |
| 09h40 | Mentorias de ideação | Levar: problema, usuário, regra "valor vem da colorbar" e as 3 faixas. Perguntar se a leitura por colorbar é aceitável e quem pode testar a escuta. | Feedback anotado |
| 09h40 a 12h00 | (livre) | **Fundação e visão:** servidor local, `tracks.js` com a faixa 1, `criaLUT` e `analisa`, teste em Node. Em paralelo: baixar e preparar as faixas 2 e 3. | `dados` no console bate com 3 pontos conferidos manualmente na colorbar |
| 12h00 | Almoço | Pausa de verdade. | |
| 13h00 a 14h45 | (livre) | **Som:** agendador, envelope, escala, pan, barra de varredura, botão Ouvir a escala. | Faixa 1 toca sem estalo e a melodia não é uma reta |
| 14h45 | Palestra: MVP | Uma pessoa assiste, as outras seguem. | |
| 15h10 | Mentorias de MVP | Demonstrar a faixa 1 soando, com legenda. Perguntar sobre validade e acessibilidade. | Máximo 3 mudanças anotadas |
| 16h30 | Coffee break | 15 minutos no máximo. | |
| 16h45 a 18h00 | (livre) | Integrar faixas 2 e 3 (só dados). **Publicar no Pages** e testar no celular. | URL pública funcionando |
| 18h00 | Mentorias de MVP (noturno) | Demonstrar 3 faixas. Perguntar sobre o teste com ouvinte. | |
| 18h30 a 20h30 | (livre) | Acessibilidade, rótulos modelo/observação, resumo em texto, créditos, Modo Guiado, teste com leitor de tela e com ouvinte, teste em modo avião. | Checklist da seção 11 completo, menos vídeo |
| **20h30** | | **FEATURE FREEZE.** Depois disso só bug, texto e deploy. Criar a tag `freeze`. | Tag criada |
| 20h30 a 22h00 | | Gravar o vídeo final (60 s), gravar as faixas em `playlist/`, escrever o rascunho do formulário da NASA, conferir o repositório público. | Vídeo e rascunho prontos |
| 22h00 | Encerramento do dia | Conferir com a organização se pode ficar depois deste horário. | |

### Domingo 15/11

| Horário | Oficial | O que fazemos |
|---|---|---|
| 08h30 | Roteiro do dia | Só bug crítico, no máximo 30 minutos. Nada de funcionalidade nova. |
| 09h15 | Mentorias: submissão NASA | Levar o formulário preenchido em rascunho e pedir revisão. |
| até 11h30 | | **Enviar a submissão** (meta). Margem de 30 minutos. |
| 12h00 | **Entrega 2: submissão NASA** e almoço | Limite oficial. |
| 12h45 a 14h00 | | Slides e ensaio do pitch. |
| 14h00 | Mentorias de pitch | Pedir crítica do roteiro. |
| 15h15 | Pré-pitch | Ensaio completo, com cronômetro. |
| 17h00 | **Entrega 3: pitch** | Entregar o que a organização pedir. |
| 18h15 | Apresentações dos pitches | |
| 20h30 | Resultado | |
| 21h00 | Fim do evento | |

Confirmar com a organização se o projeto pode ser atualizado depois da Entrega 2.

### Corte de escopo (nesta ordem)

1. Faixas além da terceira.
2. Comparação A/B de dois períodos.
3. Modo temporal (um passo por frame).
4. Textos longos por faixa.

**Nunca cortar:** colorbar como fonte do valor, legenda sonora, crédito e fonte na tela, resumo em texto, teste com ouvinte.

---

## 7. Divisão de trabalho

### Dupla

| Pessoa | Responsabilidade |
|---|---|
| P1 | Visão e som (`analisa`, `criaLUT`, agendador, envelope). Revisa tudo que o Copilot gerar nessas áreas. |
| P2 | Interface e acessibilidade, preparação das faixas (frames, colorbar, `vmin`, `vmax`, `mapa`, textos), deploy, README, vídeo e submissão. |

### Equipe de 3 ou 4

| Papel | Responsabilidade |
|---|---|
| A. Visão e som | `analisa`, LUT, agendador, escala, envelope. |
| B. Interface e acessibilidade | HTML, CSS, ARIA, teclado, Modo Guiado, testes com leitor de tela. |
| C. Dados e textos | Baixar e preparar faixas, ler `vmin` e `vmax`, `alt`, resumo, créditos, rótulos modelo/observação. |
| D. Pitch, vídeo e submissão | Roteiro, slides, vídeo, formulário da NASA, teste com ouvinte (pode ser dividido com C se a equipe for de 3). |

**Contrato:** o formato de `tracks.js` (seção 4) congela às 09h40. Assim C trabalha em faixas sem esperar o código de A.

---

## 8. Como usar o GitHub Copilot neste projeto

O Copilot escreve rápido, mas tende a entregar o mapeamento mais comum: brilho vira altura. Isso é justamente o que a decisão D1 proíbe. Por isso ele recebe regras, contrato e testes antes de escrever código.

### Pré-requisito

Confirme hoje à noite o que a sua conta do Copilot permite (chat e modo agente no editor; agente que trabalha a partir de issues, se estiver disponível no seu plano). Se o agente de issues não estiver disponível, use o chat do editor com os mesmos prompts.

### `.github/copilot-instructions.md`

```markdown
# Instruções para o Copilot

Projeto: Earth Jukebox. HTML, CSS e JavaScript puro com módulos ES. Sem build, sem framework, sem CDN.

Regras obrigatórias:
- Tudo roda offline a partir de arquivos locais. Nenhuma requisição externa.
- O valor de cada pixel vem da colorbar (LUT por cor mais próxima). Nunca derive valor de luminosidade ou matiz.
- Pixels transparentes ou fora da tolerância de cor são "sem dado" (NaN) e viram silêncio.
- O áudio só inicia dentro de um clique. Todo som tem envelope (ataque de pelo menos 10 ms e release até ganho zero).
- Agende notas com ctx.currentTime e antecedência de 0,2 s. Nunca crie osciladores dentro de requestAnimationFrame.
- Use a escala pentatônica maior com 15 notas, de C3 a A5.
- Acessibilidade: elementos nativos, label em todo controle, sem aria-live por passo.
- Textos da interface em português do Brasil, com acentuação correta e sem travessão.
- Uma mudança pequena por pull request, com a descrição de como testar.
```

### Backlog (uma issue por item, com critério de aceite)

| # | Issue | Critério de aceite |
|---|---|---|
| 1 | Estrutura inicial e servidor local | `python3 -m http.server` abre a página sem erro no console. |
| 2 | `criaLUT` e `analisa` com testes em Node | Imagem sintética de 8 cores devolve os valores esperados. Pixel transparente e pixel fora da tolerância viram NaN. |
| 3 | Motor de áudio (envelope, escala, pan, agendador) | Tocar a escala produz 15 notas ascendentes sem estalo. Pausar e retomar mantém a posição. |
| 4 | Interface base e barra de varredura | Barra acompanha o som. Troca de faixa e de faixa de latitude funciona. |
| 5 | Catálogo `tracks.js` com 3 faixas | Cada faixa carrega, tem `alt`, `fonte`, `creditos` e `tipo`. |
| 6 | Acessibilidade | Navegação só com teclado. Leitor de tela anuncia o resumo ao fim da varredura. |
| 7 | Modo Guiado | Um clique carrega a faixa 1 e toca. |
| 8 | Publicação no GitHub Pages | URL pública funciona no celular. |
| 9 | (reserva) Comparação A/B | Só se a hora estiver antes das 17h. |

### Modelo de prompt

```
Leia .github/copilot-instructions.md e o contrato de tracks.js no README.
Tarefa: [colar a issue].
Critério de aceite: [colar].
Não altere arquivos fora do escopo. Escreva o teste antes do código quando houver lógica numérica.
```

### Regras de revisão

- Ler o diff inteiro. Não aceitar código que o time não entende.
- Rodar os testes e **ouvir** o resultado. Teste verde não prova que soa bem.
- Rejeitar qualquer trecho que derive valor de brilho ou cor, que crie osciladores por quadro ou que carregue algo de fora.
- Se uma tarefa passar de 15 minutos de idas e vindas com o Copilot, escrever à mão.
- Registrar no README final o que foi gerado com apoio de IA e o que foi revisado por humanos.

---

## 9. Critérios dos jurados e como pontuar

Os cinco critérios globais do Space Apps são Impact, Creativity, Validity, Relevance e Presentation. A lista vem do guia de submissão de 2025; o guia de 2026 ainda precisa ser conferido.

| Critério | Pergunta do jurado | Como pontuamos |
|---|---|---|
| Impact | Quem ganha e quanto? | Estudantes e pessoas cegas ou com baixa visão. Só afirmar acessibilidade com o teste da seção 10 feito. |
| Creativity | O que é novo? | Leitura por colorbar com legenda sonora, pan por longitude e faixa de latitude. Cor para nota é a ideia mais óbvia e já aparece em outros repositórios, então não é o diferencial. |
| Validity | Funciona cientificamente? | Valor real e unidade na tela, rótulo modelo/observação, limites declarados (quantização, projeção, pixel não é medição calibrada). |
| Relevance | Responde ao desafio? | Quadros oficiais do EIC, som gerado ao vivo, acessibilidade como tema central. |
| Presentation | Comunicou bem? | Demo de 20 segundos com o Modo Guiado, ensaio com cronômetro, vídeo curto. O guia oficial de julgamento observa que equipes caprichosas nos outros critérios costumam negligenciar este. |

---

## 10. Teste com ouvinte

Objetivo: gerar o primeiro dado de validade e de impacto. Registrar o resultado em `docs/teste-ouvinte.md`.

Protocolo (10 minutos):

1. Quem testa não vê o mapa. Tocar a escala e explicar "grave é menos, agudo é mais".
2. Tocar a faixa 1 e perguntar: "Em que parte do som você acha que mais mudou?"
3. Mostrar o mapa e comparar com a resposta.
4. Perguntar o que ficou confuso e se o resumo em texto ajudou.

Idealmente com uma pessoa cega ou com baixa visão, ou com o núcleo de acessibilidade da instituição anfitriã. Se não houver, registrar isso com honestidade como limitação e como próximo passo.

---

## 11. Submissão e pitch

### Checklist da submissão (Entrega 2, domingo 12h00)

Os campos exatos do formulário de 2026 não foram verificados. Conferir na plataforma e tentar ter pronto:

- [ ] Repositório público com este README
- [ ] URL da demonstração publicada
- [ ] Vídeo curto (cerca de 60 s) mostrando o som funcionando
- [ ] Descrição do projeto e do problema
- [ ] Lista dos dados da NASA usados (SVS, com links)
- [ ] Explicação do mapeamento de imagem para som
- [ ] Limites declarados (D8) e resultado do teste com ouvinte
- [ ] Declaração de uso de IA, se o formulário pedir
- [ ] Créditos ao NASA Scientific Visualization Studio

### Roteiro do pitch

A duração oficial deve ser confirmada. Estrutura para 3 minutos:

| Tempo | Conteúdo |
|---|---|
| 0:00 a 0:25 | Problema: o EIC é visual e exclui quem não enxerga. |
| 0:25 a 1:15 | Demo ao vivo com o Modo Guiado: ouvir a escala e depois a varredura. |
| 1:15 a 1:55 | Como funciona e por que é válido: valor vem da colorbar, não do brilho. |
| 1:55 a 2:30 | Acessibilidade e resultado do teste com ouvinte. |
| 2:30 a 3:00 | Impacto e próximos passos (modo temporal, mais faixas). |

Plano B da demonstração: gravações em `playlist/` e vídeo de segurança.

---

## 12. Riscos

| Risco | Mitigação |
|---|---|
| Canvas contaminado (`SecurityError`) | Servidor local e assets no mesmo domínio. Nunca usar `file://`. |
| Áudio não toca | Iniciar só em clique. Testar no projetor com fone. |
| Estalos | Envelope em todas as notas e compressor no canal principal. |
| Melodia reta | Trocar a faixa de latitude antes de mudar a fórmula. |
| Faixa sem colorbar | Rotular como artística ou trocar de faixa. |
| Wi-Fi do evento | Nada externo em tempo de execução. Testar em modo avião. |
| Cópia do Copilot sai fora das regras | `copilot-instructions.md`, testes e revisão do diff. |
| Estourar o prazo de domingo 12h00 | Freeze no sábado às 20h30 e meta de envio às 11h30. |

---

## 13. Créditos e referências

Dados e visualizações: NASA Scientific Visualization Studio (SVS) e Earth Information Center (EIC), com os créditos de cada página.

- Página do desafio: https://www.spaceappschallenge.org/2026/challenges/the-earth-information-jukebox/
- Galeria do EIC no SVS: https://svs.gsfc.nasa.gov/gallery/earth-information-center/
- Guia de submissão (versão 2025): https://www.spaceappschallenge.org/resources/project-submission-guide
- Guia de julgamento e prêmios: https://spaceappschallenge.org/resources/judging-awards-guide
- Luzes noturnas: https://svs.gsfc.nasa.gov/5276/ e https://svs.gsfc.nasa.gov/5313/
- Aerossóis GEOS: https://svs.gsfc.nasa.gov/5669/
- Especificação Web Audio API: https://www.w3.org/TR/webaudio/