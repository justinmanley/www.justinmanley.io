#!/bin/bash

# download secrets from AWS and place them in the appropriate places.

# end with nonzero exit code if any command fails 
set -e

# get application secrets
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.secret.yml /home/ec2-user/www.justinmanley.io/config/secret.yml
ls -al config
head -n 1 config/secret.yml

# copy .netrc file to enable deploy.sh to commit to github
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.netrc /home/ec2-user/.netrc
