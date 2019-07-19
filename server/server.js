var fs = require("fs");
var express = require('express')
var bodyParser = require('body-parser');


var app = express();
var port = 8000 ;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

var server = app.listen(port, () => {
    console.log('server is listening on port', server.address().port)
})


app.put('/', (req, res) =>{
	console.log(req.body.wFilter);
	console.log(req.body.table);
	w5ndb.readDB(req, res);
});

// /:code would capture any data passed using this format /:1 (code would receive 1)

app.post('/:code', (req, res) =>{
	console.log(req.params.code + " , " + req.body.lname + ", " + req.body.fname);
	if (req.params.code == 1)
		w5ndb.writeTable(req, res);
	else if (req.params.code == 2)
		w5ndb.friendQ(req,res);
});