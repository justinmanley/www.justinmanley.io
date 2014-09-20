#!/bin/bash

# download secrets from AWS and place them in the appropriate places.

# end with nonzero exit code if any command fails 
set -e

echo '$ ls -al config/'
ls -al config/

# get application secrets
echo '$ aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.secret.yml ~/www.justinmanley.io/config/secret.yml'
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.secret.yml ~/www.justinmanley.io/config/secret.yml

echo '$ ls -al config/'
ls -al config/

echo '$ aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.secret.yml secret.yml'
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.secret.yml secret.yml

echo '$ ls -al .'
ls -al .

echo '$ aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.secret.yml config/secret.yml'
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.secret.yml config/secret.yml

echo '$ ls -al config/'
ls -al config/

# copy .netrc file to enable deploy.sh to commit to github
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.netrc ~/.netrc

echo '$ echo $USER'
echo $USER

echo '$ ls -al ~ | grep netrc'
ls -al ~ | grep netrc