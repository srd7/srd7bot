#!/bin/sh

mongo admin --eval "db.createUser({user: '$MONGODB_USER', pwd: '$MONGODB_PASS', roles:[{role:'userAdmin',db:'$MONGODB_DATABASE'}]});"
