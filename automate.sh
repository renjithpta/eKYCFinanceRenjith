#!/bin/bash


for CONTAINER in $(docker ps -f label=fabric-environment-name="Finance Fabric" -q -a); do
    docker rm -f ${CONTAINER}
done
for VOLUME in $(docker volume ls -f label=fabric-environment-name="Local Fabric" -q); do
    docker volume rm -f ${VOLUME}
done
if [ -d wallets ]; then
    for WALLET in $(ls wallets); do
        rm -rf wallets/${WALLET}/*
    done
fi

pushd network
echo " ======= destorying network ============================"
ansible-playbook --extra-vars state=absent playbook.yml

echo "============= starting network - RUnning playbook ========"
ansible-playbook playbook.yml
popd


containers=$(sudo docker ps | awk '{if(NR>1) print $NF}')
host=$(hostname)

count=0
echo "====================Containers=========================="
# loop through all containers
for container in $containers
 do
  echo "Containers:" $container
  count=$(( $count + 1 ))
done

echo "====================Containers==========================" $count

if(test $count -ne 11); then

echo 'Network not started properly!'
exit 1

fi




