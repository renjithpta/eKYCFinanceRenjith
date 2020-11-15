

erase:
	./destroy.sh
	

start:
	cd network && ansible-playbook playbook.yml


install-api:
	cd ApiAndFrontend/api && npm i
	
initalize-api:
	cd ApiAndFrontend/api && ./initalize.sh

start-api:
	cd ApiAndFrontend/api && npm run start
	
start-all:
	make erase
	make start
	make clean
	make initalize-api
	make start-api



start-api:
	cd ApiAndFrontend/api && npm run start

clean:
	rm -rf ./wallet

