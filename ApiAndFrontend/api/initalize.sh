#!/bin/bash

rm -rf gateway/local/gen_local_wallet_fi1/*
rm -rf gateway/local/gen_local_wallet_fi2/*
rm -rf gateway/local/gen_local_wallet_fi3/*
pushd utils
node enrollAdmin.js fi1
sleep 2
node enrollAdmin.js fi2
sleep 1
node enrollAdmin.js fi3
sleep 2
node registerUser.js fi1 admin FI1
sleep 1
node registerUser.js fi2 admin FI2
sleep 3
node registerUser.js fi3 admin FI3
node invoke.js fi1 FI1 init
sleep 1
node populate.js fi1 FI1
sleep 1
popd