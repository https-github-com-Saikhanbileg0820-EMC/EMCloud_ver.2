#!/bin/bash

now=$(date +%Y%m%d%H%M%S)
CURRENT=$(cd $(dirname $0);pwd)
pluginFile=$(find $CURRENT -maxdepth 1  -name "*.zip" | awk -F/ '{print $NF}')
ppkFile=$(find $CURRENT -maxdepth 1 -name "*.ppk" | awk -F/ '{print $NF}')

if [ -n "$pluginFile" ] || [ -n "$ppkFile" ]; then
    mkdir -p ${CURRENT}/bk/${now}
fi

if [ $1 = "UPDATE" ]; then
    cp ${pluginFile} ${CURRENT}/bk/${now}
    kintone-plugin-packer --ppk ${ppkFile} src
else
    if [ -n "$pluginFile" ]; then
        mv ${pluginFile} ${CURRENT}/bk/${now}
    fi
    if [ -n "$ppkFile" ]; then
        mv ${ppkFile} ${CURRENT}/bk/${now}
    fi
    kintone-plugin-packer src
fi