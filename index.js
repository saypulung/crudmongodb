var express = require('express')
var path = require('path')
var mongodb = require('mongodb')
var bodyParser = require('body-parser')

var MongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/db_latihan";

var app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs')

app.get('/',function(req,res){
    var parseData = {};
    parseData.page = 'dash';
    parseData.title = 'Halaman Depan';
    res.render('parts/layout',parseData);
})
app.get('/listdata',function(req,res){
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("01_orang").find().toArray(function(err, result) {
            if (err) throw err;
            var parseData = {};
            parseData.page = 'dataoranglist';
            parseData.title = 'Daftar Data';
            parseData.data_orang = result;
            //console.log(parseData);
            res.render('parts/layout',parseData);
            db.close();
        });
    }); 
})
app.get('/editdata/(:id)',function(req,res){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("01_orang").findOne({_id:mongodb.ObjectID(req.params.id)}, function(err, result) {
            if (err) throw err;
            var parseData = {};
            parseData.page = 'dataorangform';
            parseData.mode = 'edit';
            parseData.title = 'Edit Data';
            parseData.data_orang = result;
            console.log(parseData);
            res.render('parts/layout',parseData);
            db.close();
        })
    })

})
app.post('/hapusdata/(:id)',function(req,res){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var myquery = { _id:mongodb.ObjectID(req.params.id) };
        db.collection("01_orang").remove(myquery, function(err, obj) {
            if (err) throw err;
            console.log(obj.result.n + " document(s) deleted");
            db.close();
        });
    });
    res.writeHead(302, {
        'Location': '/listdata'
    });
})
app.get('/tambahdata',function(req,res){
    var parseData ={};
    parseData.page='dataorangform';
    parseData.mode='tambah';
    parseData.title = 'Tambah Data';
    res.render('parts/layout',parseData)
})
app.post('/simpandata',function(req,res){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var tgl_lahir = req.param('tanggal_lahir');
        var [day, month, year] = tgl_lahir.split('/');
        tgl_lahir = new Date(year,month,day);
        tgl_lahir = tgl_lahir.toISOString();
        var data_post = {
            nama:req.param('nama'), 
            alamat:req.param('alamat'), 
            tanggal_lahir:tgl_lahir, 
        }
        var mod = req.param('mode');
        if(mod == 'tambah'){
            db.collection('01_orang').insertOne(data_post,function(err,res){
                if(err) throw err;
                console.log('Berhasil ditambah')
                db.close();
            })
        }else
        if(mod == 'edit'){
            var id = req.param('_id');
            db.collection('01_orang').updateOne({_id:mongodb.ObjectID(id)},data_post,function(err,res){
                if (err) throw err;
                console.log("1 document updated");
                db.close();
            })
        }
        res.writeHead(302, {
            'Location': '/listdata'
            //add other headers here...
        });
        res.end();
        console.log(data_post);
    })
})
app.listen(3000,function(){
    console.log("Jalan di 3000")
})