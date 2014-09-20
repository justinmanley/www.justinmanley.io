# download secrets from AWS and place them in the appropriate places.

# copy .netrc file to enable deploy.sh to commit to github
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.netrc ~/.netrc

# get application secrets
aws s3 cp s3://ZjY2ZGYyZGNlMDg5ZmY4NmU0YWYwNzgz/.secrets/www.justinmanley.io.secret.yml ~/www.justinmanley.io/config/secret.yml
