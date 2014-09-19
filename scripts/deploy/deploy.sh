git clone https://github.com/manleyjster/www.justinmanley.io.git

cd www.justinmanley.io
git checkout master

npm install
bower install

# Retrieve and generate dynamic content and build site
grunt build

# allow the site's static assets to be recognized by git
sed -i '/site\/assets\/bower_components/d' .gitignore

# deploy to gh-pages branch.  See: 
#	http://www.damian.oquanta.info/posts/one-line-deployment-of-your-site-to-gh-pages.html
#   http://lukecod.es/2014/08/15/deploy-a-static-subdirectory-to-github-pages/
git add --all site
git commit -m "Generate website on $(date +\"%m-%d-%Y\") at $(date +\"%H-%M-%S\")."

# check out a new local branch containing the site/ directory
git subtree split --prefix site -b gh-pages

# force push the gh-pages branch
git push -f origin gh-pages:gh-pages
