rm -rf build

COFFEE=coffee
RJS=node_modules/requirejs/bin/r.js
 
$COFFEE -o src/js -c `find src/coffee/ -name "*.coffee"`
node $RJS -o src/app.build.js
# Add-on packages not included in ducttape.js

