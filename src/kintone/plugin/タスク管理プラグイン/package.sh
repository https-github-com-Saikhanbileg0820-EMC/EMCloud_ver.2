#!/bin/bash

now=$(date +%Y%m%d%H%M%S)
CURRENT=$(cd $(dirname $0);pwd)
pluginFile=$(find $CURRENT -maxdepth 1  -name "*.zip" | awk -F/ '{print $NF}')
ppkFile=$(find $CURRENT -maxdepth 1 -name "*.ppk" | awk -F/ '{print $NF}')

mkdir -p ${CURRENT}/bk/${now}

if [ $1 = "UPDATE" ]; then
    cp ${pluginFile} ${CURRENT}/bk/${now}
    kintone-plugin-packer --ppk ${ppkFile} src
else
    mv ${pluginFile} ${CURRENT}/bk/${now}
    mv ${ppkFile} ${CURRENT}/bk/${now}
    kintone-plugin-packer src
fi