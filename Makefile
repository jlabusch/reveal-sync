DOCKER=docker
COMPOSE=docker-compose
IMAGES=downlink/reveal-sync-app downlink/reveal-sync-static

.PHONY: all images dist run clean

all: images dist

images:
	$(COMPOSE) build static app

dist:
	for i in $(IMAGES); do $(DOCKER) save -o $$(basename $$i).tar $$i; done
	@DAYSTAMP=$$(date +%Y-%m-%d); \
        tar -jcvf reveal-sync_$$DAYSTAMP.tbz2 reveal-sync*.tar && \
	    rm -vf reveal-sync_{app,static}.tar && \
	    echo "*** Now copy reveal-sync_$$DAYSTAMP.tbz2 to your server."

run:
	$(COMPOSE) up -d
	$(COMPOSE) logs

clean:
	$(DOCKER) rmi $$($(DOCKER) images --filter dangling=true -q) $(IMAGES) || :
	rm -f reveal_sync*.tar *.tbz2

