#!/bin/bash

VENUES_JSON="./venues.json"

if [ -z "$DB_PASSWORD_FILE" ]; then
    DB_PASSWORD_FILE="temp.secret"
    echo "realaletrail" > $DB_PASSWORD_FILE
fi

DB_PASSWORD_FILE_PATH=`realpath $DB_PASSWORD_FILE`

poetry run python src/api/populate.py $VENUES_JSON $DB_HOST $DB_NAME $DB_USER $DB_PASSWORD_FILE_PATH
