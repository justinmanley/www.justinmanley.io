# end with nonzero exit code if any command fails 
set -e

git clone https://github.com/manleyjster/www.justinmanley.io.git

cd www.justinmanley.io

scripts/deploy/secrets.sh
scripts/deploy/deploy.sh