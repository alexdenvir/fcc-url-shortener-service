'use strict';

var bodyParser = require('body-parser');
var dns = require('dns');
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI)
  .catch(err => {
  console.log(err)
})

console.log(mongoose.connection.readyState);

let Schema = mongoose.Schema;

let ShortUrlSchema = new Schema({
  "original_url": String
});

let ShortUrl = mongoose.model('ShortUrl', ShortUrlSchema)

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  let orig = req.body.url;
  
  let host = orig[4] == 's' ? orig.substr(8) : orig.substr(7)
  
  dns.lookup(host, (err, addr) => {
    if (err) {
      return res.json({"error": "Invalid URL"})
    
    }
    
    let url = new ShortUrl({"original_url": orig})
  
  url.save((err, data) => {
    if (err) {
      return res.json({"error": "Error connecting to database", "detail": err})
    }
    
    return res.json(
      {
        "original_url": data.original_url,
        "short_url": data.id
      }
    )
  })
  })
});

app.get("/api/shorturl/:id", (req, res) => {
  ShortUrl.findById(req.params.id, (err, data) => {
    if (!err) {
      res.redirect(data.original_url)
    } else {
      res.json({"error": "invalid URL"})
    }
  })
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});