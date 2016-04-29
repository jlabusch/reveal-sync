DOCKER=docker
COMPOSE=docker-compose
IMAGES=downlink/reveal-sync-app downlink/reveal-sync-static

.PHONY: all images dist run clean

all: images dist

images:
	$(COMPOSE) build static app

dist:
	for i in $(IMAGES); do $(DOCKER) save -o $$(basename $$i).tar $$i; done
	tar -jcvf reveal-sync_$$(date +%Y-%m-%d).tbz2 reveal-sync*.tar
	rm -v reveal-sync*.tar
	@echo "*** Now copy reveal-sync*.tar.gz to your server."

run:
	$(COMPOSE) up -d
	$(COMPOSE) logs

clean:
	$(DOCKER) rmi $$($(DOCKER) images --filter dangling=true -q) $(IMAGES) || :

