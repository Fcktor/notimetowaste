#!/bin/bash
export PATH="/home/fucktor/.local/share/fnm/node-versions/v22.21.0/installation/bin:$PATH"
cd "$(dirname "$0")/shopify-crud"
/home/fucktor/.local/share/fnm/node-versions/v22.21.0/installation/bin/node node_modules/.bin/next dev
