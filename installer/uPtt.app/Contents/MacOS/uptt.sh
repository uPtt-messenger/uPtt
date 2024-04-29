#!/bin/bash

cd "$(dirname "$0")"

echo $(pwd)
echo "$(dirname "$0")"

"./uptt_mq_server.bin" &
sleep 2
"./uptt_backend.bin"