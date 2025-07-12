deploy:
	git pull
	docker compose -f docker-compose.prod.yml build
	docker compose -f docker-compose.prod.yml up -d

prod:
	docker compose -f docker-compose.prod.yml build
	docker compose -f docker-compose.prod.yml up -d

up:
	docker compose -f docker-compose.yml up -d