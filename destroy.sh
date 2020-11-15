#!/bin/bash

echo " =======  start destorying all docker netcontainers ============================"
for CONTAINER in $(docker ps -q -a); do
    docker rm -f ${CONTAINER}
done

echo " ======= finished destorying containers  ============================"

echo " =======  start destorying all docker volume ============================"
for VOLUME in $(docker volume ls -q); do
    docker volume rm -f ${VOLUME}
done
echo " ======= finished destorying docker volume  ============================"

pushd network
echo " ======= stopping  playbook  ============================"
ansible-playbook --extra-vars state=absent playbook.yml
popd
echo " ======= finished stopping  playbook ============================"