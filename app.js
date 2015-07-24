/*
* All native node.js basic web server with routing, upload and download
*
* Luke Van Horn
*
* https://github.com/lukevanhorn
* License: MIT, open source 
*
*/


'use strict'

var app = require('http').createServer(handler)
var fs = require('fs');
var url = require('url');

//default 'index' landing page
var landingPage = './public/index.html';

//a list of directory paths to search for a requested file
var searchPaths = ['./public', './public/data'];

//data directory (used for saving and listing uploaded files)
var dataDir = './public/data';

//a list of routes and handler functions
//handler functions must accept (req,res) as arguments
var routes = [ ['/', landing], ['/list', listFiles ], ['/upload/', upload]];

//start listening
app.listen(process.env.PORT || 8080);


function handler (req, res) {

	var filepath = req.url;
    var route = filepath;
    if(filepath.indexOf('.') > -1) {
        route = filepath.substring(0,filepath.lastIndexOf('/') + 1).toLowerCase();
    } 

    
    try {
        
        //first, look for a static file
        if(req.method === 'GET' && filepath.indexOf('.') > -1) {
            
            //search the provided paths
            if(searchPaths.some(function(p) {
                    if(fs.existsSync(p + filepath)) {
                        filepath = p + filepath;
                        return true;
                    }
                    return false;
                })) 
            {
                return staticFile(filepath, req, res);
            }
        }
        
        //next, look for route handlers
        for(var i = 0; i < routes.length; i++) {
            if(route === routes[i][0]) {
                return routes[i][1].call(this, req, res);
            }
        }

        //no file or route found
        res.writeHead(500);
        return res.end('Error loading ' + req.url);
        
    } catch(e) {
        console.log(e);
        res.writeHead(500);
        return res.end('Unknown error: ' + e.toString());    
    }
}

/////////////////////////////////////////////////////////////////
//  Route Handling Functions


//return the default landing page
function landing(req, res) {
        
    return staticFile(landingPage, req, res);
}

//setup header content type for static files
function staticFile(filepath, req, res)
 {
        var header = {'Content-Type': 'text/html'};
        var filetype = filepath.substr(filepath.lastIndexOf('.')+1);
            
        switch(filetype) {
            case 'csv':
                header['Content-Type'] = 'text/plain';
                break;                
            case 'css':
                header['Content-Type'] = 'text/css';
                break;
            case 'json':
                header['Content-Type'] = 'text/json';
                break;
            case 'js':
                header['Content-Type'] = 'text/javascript';
                break;
            case 'zip':
                header['Content-Type'] = 'application/zip';
                break;
            case 'woff':
                header['Content-Type'] = 'font/opentype';
                break;
            case 'png':
                header['Content-Type'] = 'image/png';
                break;
            default:
                break;
        }

        return sendFile(filepath, header, req, res);
 }
 
//return the data files list
function listFiles(req, res) {
    fs.readdir(dataDir, function(e, files) {
        if(e) {
            res.writeHead(500);
            return res.end(e);
        }
        
        return res.end(files.sort().reverse().join());
    });
}

//send smaller static files that do not require chunked encoding
function sendFile(filepath, header, req, res) {

    var size =  fs.statSync(filepath).size;    
    header['Content-Length'] = size;

    if((size > 1024 * 1000)) {
        return sendLargeFile(filepath, header, req, res);
    }

    fs.readFile(filepath,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + filepath);
            }

            res.writeHead(200, header);
            res.end(data);
        }
    );
}

//use streams to pipe larger downloads
function sendLargeFile(filepath, header, req, res) {
    
    header['Accept-Ranges'] = 'bytes';

    var size =  fs.statSync(filepath).size;   
    var from = 0;
    var to = size - 1;

    var range = req.headers['content-range'];
    if(range) {
        var parts = range.split['-'];
        from = +(parts[0].replace('bytes ', ''));
        if(parts[1]) {
            to = +parts[1].split('/')[0];
        }

        if(to > (size - 1)) {
            res.writeHead(416);
            header['Content-Range'] = 'bytes */*';
            return res.end();        
        } 

        header['Content-Length'] = to - from;
        header['Content-Range'] = 'bytes ' + from + '-' + to + '/' + size;
    }       

    res.writeHead(200, header);
    var readStream = fs.createReadStream(filepath, {start: from, end: to});

    return readStream.pipe(res);
}

//handle uploads from client
function upload(req, res) {

    if(req.headers['content-type'] != 'application/octet-stream') {
        return upload(req, res);
    }
        
    var chunks = [];
    var size = 0;
    var reqUrl = url.parse(req.url);
    var filePath = dataDir + reqUrl.pathname.substring(reqUrl.pathname.lastIndexOf('/'));

    req.on('data', function(chunk) { 
        size += chunk.length;
        chunks.push(chunk);
    });
    
    req.on('end', function() {
        var data = Buffer.concat(chunks, size);
        try {
            fs.writeFile(filePath, data, function (e) {
                if(e) {
                    res.writeHead(500);
                    return res.end(e);
                }
                
                res.writeHead(200);
                return res.end();
            });		 
        } catch(e) {
            res.writeHead(500);
            return res.end(e);
        }
    });
}
