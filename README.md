# Cofre de senhas

**Acesse o site:** [https://aeevelynndosantos-star.github.io/cofre_senhas/](https://aeevelynndosantos-star.github.io/cofre_senhas/)

Um cofre de senhas com visual retrô, feito só com **HTML, CSS e JavaScript puro** (sem frameworks e sem build). Tem tela de entrada com contas, temas de cores, player de música, animações de gatinho e uma interface em "moldura" de janela pixelada.

> Projeto de estudo/diversão. Antes de guardar senhas importantes, revise a parte de criptografia (`js/crypto.js`) e entenda como e onde os dados são armazenados.

---

## Funcionalidades

- **Tela de entrada** com contas de usuário
- **Cofre** para guardar e consultar senhas
- **Criptografia** dos dados (módulo `crypto.js`)
- **Temas de cores** (o tema padrão é `verde`), aplicados pelo atributo `data-theme` no `<html>`
- **Player de música** dentro do cofre, com 3 faixas e os controles: reiniciar, anterior, tocar/pausar, próxima e parar. O visor mostra o nome da faixa, o estado e a barra de progresso
- **Gatinhos e efeitos de animação**, incluindo um cantinho animado na tela
- **Avisos (toast)** para feedback de ações
- Interface em **português (pt-BR)**

---

## Como usar

O jeito mais rápido é abrir direto no navegador: [https://aeevelynndosantos-star.github.io/cofre_senhas/](https://aeevelynndosantos-star.github.io/cofre_senhas/)

Para rodar localmente, não precisa instalar nada.

1. Baixe ou clone o repositório:
   ```bash
   git clone <URL-DO-REPOSITORIO>
   cd <NOME-DA-PASTA>
   ```
2. Abra o `index.html` no navegador.

Se algum recurso (como o áudio) não funcionar abrindo o arquivo direto, rode um servidor local simples:

```bash
python3 -m http.server 8000
npx serve .
```

Depois acesse `http://localhost:8000`.

---

## Estrutura do projeto

```
.
├── index.html          # Página única; carrega estilos e scripts
├── css/
│   ├── temas.css       # Paletas de cores (temas)
│   ├── base.css        # Moldura e layout geral
│   ├── componentes.css # Botões, campos, etc.
│   ├── player.css      # Player de música
│   └── gatos.css       # Efeitos de animação
├── js/
│   ├── imagens.js      # Imagens usadas no site
│   ├── utils.js        # Funções utilitárias
│   ├── pixel.js        # Elementos/estilo pixelado
│   ├── crypto.js       # Criptografia
│   ├── vault.js        # Lógica do cofre
│   ├── contas.js       # Contas de usuário
│   ├── tema.js         # Troca de tema
│   ├── efeitos.js      # Efeitos visuais
│   ├── player.js       # Player de música
│   ├── ui-entrada.js   # Interface da tela de entrada
│   ├── ui-cofre.js     # Interface do cofre
│   ├── gatos.js        # Animação dos gatinhos
│   └── main.js         # Ponto de entrada (inicia o app)
├── img/                # Imagens
├── musicas/            # Faixas do player
└── .git/
```

### Ordem de carregamento

Os scripts são carregados em sequência no `index.html` e **a ordem importa**: os módulos de base (`imagens`, `utils`, `pixel`, `crypto`) vêm primeiro, depois a lógica (`vault`, `contas`, `tema`, `efeitos`, `player`), em seguida as telas (`ui-entrada`, `ui-cofre`, `gatos`) e, por fim, o `main.js`, que inicia tudo.

Os estilos seguem a mesma lógica: temas → base → componentes → player → gatos.

---

## Personalização

- **Temas:** edite `css/temas.css` para criar ou ajustar paletas e use o seletor de tema do app (`js/tema.js`).
- **Músicas:** coloque os arquivos de áudio na pasta `musicas/` e registre as faixas em `js/player.js`.
- **Imagens:** coloque os arquivos em `img/` e referencie em `js/imagens.js`.

---

## Tecnologias

- HTML5
- CSS3 (variáveis de tema)
- JavaScript (vanilla)

---

## Segurança

- Use uma senha mestra forte.
- Os dados ficam no seu navegador/dispositivo, a menos que você configure um servidor. Limpar os dados do navegador pode apagar o cofre, então mantenha um backup (exportação).
- Não use este projeto como substituto de um gerenciador de senhas profissional sem uma revisão de segurança.

---

## Licença

Defina aqui a licença do projeto (por exemplo, MIT).
