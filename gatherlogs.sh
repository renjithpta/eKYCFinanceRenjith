#!/bin/bash

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.



BASEDIR=$(pwd)

echo '##########################'
echo '# CREATING LOG DIRECTORY #'
echo '##########################'
NOW=$(date "+%Y%m%d_%H%M%S")
OUTPUT_DIR="$BASEDIR/vm_demo_logs_$NOW"

mkdir "$OUTPUT_DIR"

SCRIPTS_OUTPUT_DIR="$OUTPUT_DIR/scripts"
NETWORK_OUTPUT_DIR="$OUTPUT_DIR/network"
CHAINCODE_OUTPUT_DIR="$OUTPUT_DIR/chaincode"
APP_OUTPUT_DIR="$OUTPUT_DIR/apps"

mkdir "$SCRIPTS_OUTPUT_DIR"
mkdir "$NETWORK_OUTPUT_DIR"
mkdir "$CHAINCODE_OUTPUT_DIR"
mkdir "$APP_OUTPUT_DIR"

echo '#########################'
echo '# GETHERING SCRIPT LOGS #'
echo '#########################'
cp -a "$BASEDIR/logs/." "$SCRIPTS_OUTPUT_DIR"

echo '##########################'
echo '# GATHERING NETWORK LOGS #'
echo '##########################'
for CONTAINER in $(docker ps -f label=fabric-environment-name="Finance Fabric" -q -a); do

    docker container logs $CONTAINER &> "$NETWORK_OUTPUT_DIR/$container.log"
done

echo '############################'
echo '# GATHERING CHAINCODE LOGS #'
echo '############################'
for participant in 'arium' 'vda' 'prince'; do
    for container in $(docker ps -a | grep "dev-peer0.$participant" | awk '{print $1}'); do
        docker container logs $container &> "$CHAINCODE_OUTPUT_DIR/$participant.log"
    done
done



echo '###############'
echo '# MAKING ZIP #'
echo '##############'
zip -r "$OUTPUT_DIR.zip" "$OUTPUT_DIR"
#rm -rf "$OUTPUT_DIR"

echo '###########################'
echo '# GATHERING LOGS COMPLETE #'
echo '###########################'

echo "Created Zip $OUTPUT_DIR.zip"