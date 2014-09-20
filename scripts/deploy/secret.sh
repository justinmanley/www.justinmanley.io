#!/bin/bash

# download secrets from AWS and place them in the appropriate places.

# end with nonzero exit code if any command fails 
set -e

# get application secrets
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.secret.yml config/secret.yml

# copy .netrc file to enable deploy.sh to commit to github
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.netrc ~/.netrc
