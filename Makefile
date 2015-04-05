include *.mk

.PHONY: all deploy-staging remove-staging deploy-prod remove-prod install run clean

all: $(GROUP_VARS) $(PACKAGE)
	@echo $(PACKAGE)

deploy-staging: $(GROUP_VARS) $(PACKAGE)
	cd ansible; ansible-playbook -i ./staging -K ./deploy.yml

remove-staging: $(GROUP_VARS)
	cd ansible; ansible-playbook -i ./staging -K ./remove.yml

deploy-prod: $(GROUP_VARS) $(PACKAGE)
	cd ansible; ansible-playbook -i ./production -K ./deploy.yml

remove-prod: $(GROUP_VARS)
	cd ansible; ansible-playbook -i ./production -K ./remove.yml

$(GROUP_VARS): $(GROUP_VARS).pgp package.json
	gpg -o $@ -d $<
	@grep appname $(GROUP_VARS) || echo "appname: "$(NAME) >> $(GROUP_VARS)
	@grep version $(GROUP_VARS) || echo "version: "$(VERSION) >> $(GROUP_VARS)
	@grep extractdir $(GROUP_VARS) || echo "extractdir: /opt/"$(NAME)-$(VERSION) >> $(GROUP_VARS)
	@grep installdir $(GROUP_VARS) || echo "installdir: /opt/"$(NAME) >> $(GROUP_VARS)

$(PACKAGE): package.json $(NODE_SOURCES)
	npm install
	test -f bower.json && ./node_modules/.bin/bower install || :
	mkdir -p build
	rsync -avz --include-from build-include . build/
	mkdir -p $$(dirname $@)
	cd build && tar -jcvf ../$@ *

clean:
	rm -fr node_modules build $(PACKAGE) $(GROUP_VARS)

