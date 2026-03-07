#!/bin/bash

VENUES_JSON="./venues.json"
DB_NAME=realaletrail
DB_USER=realaletrail
DB_HOST=db
DB_PASSWORD_FILE="temp.secret"

echo "realaletrail" > $DB_PASSWORD_FILE
DB_PASSWORD_FILE_PATH=`realpath $DB_PASSWORD_FILE`

poetry run python src/api/populate.py $VENUES_JSON $DB_HOST $DB_NAME $DB_USER $DB_PASSWORD_FILE_PATH

rm $DB_PASSWORD_FILE_PATH
