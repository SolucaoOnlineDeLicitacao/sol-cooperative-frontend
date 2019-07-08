```bash
yarn add global @vue/cli # 3.0
vue create sdc-cooperative-frontend.vue
# manually select: pwa, router, ...
```

> É possível criar várias apps com a config `pages` no `vue.config.js`
> - @see https://cli.vuejs.org/config/#pages


bugs
- https://github.com/vuejs/vue-cli/issues/1132 (Safari macOS)


RUNNING
----
```bash
brew install yarn --without-node # since you have NVM or something controlling node versions
yarn install
yarn serve --port 8081
```

BUILDING
----
```bash
yarn run build
```

DEPLOYING

```
rsync -av --delete ./dist/ sol@sol-url.com:/app/sol-cooperative-frontend/production/releases/YYYYMMDDHHMMSS/
```

Acessando o servidor:

```
ssh sol@sol-url.com
cd /app/sol-cooperative-frontend/production/
unlink current && ln -s releases/YYYYMMDDHHMMSS/ current
```
