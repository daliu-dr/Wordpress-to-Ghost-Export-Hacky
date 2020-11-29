const fs = require('fs');
const GhostAdminAPI = require('@tryghost/admin-api');

// Note that you will need to create a custom API in Ghost first! https://ghost.org/integrations/custom-integrations/ 
// PREREQUISITES
// 1. You must update the URL and API key below in order for this to go to your own Ghost site! 
// 2. An 'images' folder with .jpg and .png images must be contained at the same level as the script. 
// 3. cd into the folder with the script and run "node ghost-image-upload.js" in Terminal to run this. 

const api = new GhostAdminAPI({
    url: '<<INSERT YOUR URL HERE>>',
    key: '<<INSERT YOUR API KEY HERE>>',
    version: 'v3'
});

var walkPath = './images';

var walk = function (dir, done) {
    fs.readdir(dir, function (error, list) {
        if (error) {
            return done(error);
        }

        var i = 0;

        (function next() {
            var file = list[i++];

            if (!file) {
                return done(null);
            }

            file = dir + '/' + file;

            fs.stat(file, function (error, stat) {

                if (stat && stat.isDirectory()) {
                    walk(file, function (error) {
                        next();
                    });
                } else {
                    // do stuff to file here
                    console.log(file);

                    // writing image files...very hacky! 
                    
                    try {
                        api.images.upload({
                            file: file
                        }, {
                            source: 'png'
                        })
                        .then(response => console.log(response))
                        .catch(error => console.error(error));
                        console.log("Uploaded " + file)
                    } catch (error) {
                        api.images.upload({
                            file: file
                        }, {
                            source: 'jpg'
                        })
                        .then(response => console.log(response))
                        .catch(error => console.error(error));
                        console.log("Uploaded " + file)
                    }
                    
                    next();

                }
            });
        })();
    });
};

// optional command line params
//      source for walk path
process.argv.forEach(function (val, index, array) {
    if (val.indexOf('source') !== -1) {
        walkPath = val.split('=')[1];
    }
});

console.log('-------------------------------------------------------------');
console.log('processing...');
console.log('-------------------------------------------------------------');

walk(walkPath, function (error) {
    if (error) {
        throw error;
    } else {
        console.log('-------------------------------------------------------------');
        console.log('Yay all done.');
        console.log('-------------------------------------------------------------');
    }
});
