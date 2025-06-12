build:
	git pull
	npm i
	npm run build
	pm2 restart ecosystem.config.cjs
