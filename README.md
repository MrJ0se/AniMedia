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

- src
	
	- copy: arquivos que não sofreram nenhum tipo de preprocessamento.

	- node-transpile: back-end, transpilados a cada execução do servidor.
	
	- web-transpile: front-end, transpilados durante a execução do servidor (desenvolvimento).

- utils

	- release-package-strip.js: cria um package.json para produção/release.

	- runtime-transpiler-monkey-path.js: usado no desenvolvimento, para transpilar durante a requisição, acelerando os testes (obs.: será implantado só no static() e no sendFile()).

# Scripts do NPM
- start: para desenvolvimento

	transpila o código do back-end para out e executa.

	\*obs: neste modo fica a cargo do servidor transpila o front-end servido para o cliente durante a solicitação, para debugar rápidamente o front-end.

- release: para produção

	transpila o código do back-end, o front-end e gerá out/package.json a partir de package.json pronto para produção utilizando utils/release-package-strip.js 
