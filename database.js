var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var treatSchema= new Schema({
    id   : ObjectId,
    name     : String,
    treatment : String
});




var treat = mongoose.model('treat',treatSchema);


function connect(callback){
  console.log("Waiting for db");
mongoose.connect('mongodb://localhost:27017/riyamed',function(err){
  if(err) throw err;
  console.log("connected");
  callback();
});
}


function updateTreatment(diagnosis,result,callback){
  var item= new treat({'name': diagnosis, 'treatment':result});

  treat.create( item, function(err,treatFin){
    // if(err) th;
    console.log("Ho gaya add");
    console.log(treatFin);
    callback(err,treatFin);
  });
}

function findTreatment(diagnosis,callback){
  console.log("finding it");
  treat.find({'name': diagnosis },function (err,result) {
    if (err) throw err;
    callback(result);
  })
}



module.exports={
  connect,findTreatment,updateTreatment
}
