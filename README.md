# AniMedia
 Anime&Manga dynamic library site

# Recomendações para o ambiente dev
- GitHub

- Node.js

- NPM

	+ typescript ([sudo] npm install -g typescript)

- Visual Studio Code ou Sublime

	+ typescript

# Organização
- out: resultado final, arquivos transpilados.
	
	- site: todos os arquivos copiados/transpilados/convertidos.

	- utils: src/utils transpilado para js.

- src
	
	- copy: arquivos que não sofreram nenhum tipo de preprocessamento.

	- tnode: back-end, veja a tabela.
	
	- tweb: front-end, veja a tabela.

	- utils: scripts para transpilação/conversão e automação do build release.

# Conversões de 'src/x' para 'out/site'

| pasta | typescript        | imagens            | ejs/pug            | sass/scss/less     |
| ---   | ---               | ---                | ---                | ---                |
| copy  | copiado           | copiado            | copiado            | copiado            |
| tnode | transpilado p/ js | convertido p/ webp | copiado            | transpilado /p css |
| tweb  | transpilado p/ js | convertido p/ webp | renderizado /p html| transpilado /p css |

# Scripts do NPM
- start: roda o out/site/index.js.

- watch: roda o watcher, que ira copiar/transpilar/converter os arquivos da pasta src para o out de acordo com as alterações feitas (recomendado mate-lo aberto enquanto programa, para ter um feedback imediato).

- release: transpila com otimizações para produção.

- utils: transpila src/utils para out/utils 