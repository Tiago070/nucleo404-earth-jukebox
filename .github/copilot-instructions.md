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