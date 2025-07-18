deploy:
	git pull
	docker compose --no-ansi --progress=plain -f docker-compose.prod.yml build
	docker compose --no-ansi --progress=plain -f docker-compose.prod.yml up -d

prod:
	docker compose --no-ansi --progress=plain -f docker-compose.prod.yml build
	docker compose --no-ansi --progress=plain -f docker-compose.prod.yml up -d

up:
	docker compose --no-ansi --progress=plain -f docker-compose.yml up -d