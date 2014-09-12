git clone https://github.com/manleyjster/www.justinmanley.io.git

cd www.justinmanley.io
git checkout master

# Retrieve and generate dynamic content and build site
grunt build

# deploy to gh-pages branch.  See: http://www.damian.oquanta.info/posts/one-line-deployment-of-your-site-to-gh-pages.html
git subtree split --prefix site -b gh-pages
git push -f origin gh-pages:gh-pages
git branch -D gh-pages