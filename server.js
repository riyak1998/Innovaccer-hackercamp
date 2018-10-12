const express=require('express');
const app=express();
const bp=require('body-parser');
const req1=require('request');
const req2=require('request');
const req3=require('request');

let token =
"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImRhbWFrYmFqYWozMDA3QGdtYWlsLmNvbSIsInJvbGUiOiJVc2VyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc2lkIjoiNDAyMiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvdmVyc2lvbiI6IjIwMCIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbGltaXQiOiI5OTk5OTk5OTkiLCJodHRwOi8vZXhhbXBsZS5vcmcvY2xhaW1zL21lbWJlcnNoaXAiOiJQcmVtaXVtIiwiaHR0cDovL2V4YW1wbGUub3JnL2NsYWltcy9sYW5ndWFnZSI6ImVuLWdiIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9leHBpcmF0aW9uIjoiMjA5OS0xMi0zMSIsImh0dHA6Ly9leGFtcGxlLm9yZy9jbGFpbXMvbWVtYmVyc2hpcHN0YXJ0IjoiMjAxOC0xMC0xMSIsImlzcyI6Imh0dHBzOi8vc2FuZGJveC1hdXRoc2VydmljZS5wcmlhaWQuY2giLCJhdWQiOiJodHRwczovL2hlYWx0aHNlcnZpY2UucHJpYWlkLmNoIiwiZXhwIjoxNTM5MzU5MTE0LCJuYmYiOjE1MzkzNTE5MTR9.RbBAF7GW6JLasuVIHqx_4Q0Mn_2QPAz9Yx_uyVFZF5s"
const database=require('./database.js')
const scrapeData=require('./scrapeData.js')

app.use('/',express.static('public'));
app.use(bp.urlencoded({extended:true}));
app.use(bp.json());


app.listen('9000', function(){
  console.log("Connected to server 9000");
  database.connect();

})

app.get('/',function(req,res){
  console.log("going to / route");
  res.send("display xyz");
})

app.post('/findTreatment',function(req,res){
  console.log('finding treatment');
  req.body.diagnosis=req.body.diagnosis.toLowerCase();
  database.findTreatment(req.body.diagnosis,function(result){
    console.log(result);
    console.log(req.body.diagnosis);
    if(result.length==0){
      scrapeData.scrape(req.body.diagnosis,function(err,data){
        database.updateTreatment(req.body.diagnosis,JSON.stringify(data),function(err,final){
          if(err) res.json({success:false,err});
          // console.log(data);
          final.treatment = JSON.parse(final.treatment);
          console.log(final.treatment);
          res.json({success:true,msg:"treatment found",body:final});
        })
      })
    }else{
      res.json({success:true,msg:"treatment found in db",body:result});
    }
  });
})

app.get('/getSymptom', function(req, res){
  console.log("we are in get symptom route");
  let b;
  req1.get(`https://sandbox-healthservice.priaid.ch/symptoms?token=${token}&format=json&language=en-gb`,(err,result,body)=> {
    if(err){
      // console.log(error);
      throw err;
    }
    console.log(JSON.parse(body));
    res.json(JSON.parse(body));
    // b=stringify(body);
  })

})



app.post('/getDiagnosis', function(req,res){
  console.log("we now have to display issue associated with a certain illnes");
  var n=req.body.name
  var age=req.body.age;
  var gen=req.body.gender;
  req1.get(`https://sandbox-healthservice.priaid.ch/symptoms?token=${token}&format=json&language=en-gb`,(err,res1,body)=> {
    if(err){
      console.log(error);

    }
    body=JSON.parse(body);
    for(let i=0;i<body.length;i++)
    {
      console.log("hello",body[i])
      if(body[i].Name===n)
      {
        let id=body[i].ID;
        req2.get("https://sandbox-healthservice.priaid.ch/diagnosis?symptoms=["+id+"]&gender="+gen+"&year_of_birth="+age+`&token=${token}&format=json&language=en-gb`
          ,(err,res2,body)=>{
          if(err)
          {
            throw err;
            // console.log("there is error in apicall in getissue ");
          }
          // console.log("displaying the issuees related to the symptomsm")
          res.json(JSON.parse(body));
        })
        break;
      }
    }
})

});

app.post("/parseText",function(req,res){
  let strToSearch=req.body.str;
  let age=req.body.age;
  let gen=req.body.gen;
  var options = { method: 'POST',
  url: 'https://api.infermedica.com/v2/parse',
  headers:
   {
     'content-type': 'application/json',
     'app-key': 'f32614bb41af862061e170e575f06698',
     'app-id': '1037992e'
   },
  body: { text: strToSearch },
  json: true };

  req3(options, function (error, response, body) {
    if (error) throw error;
    for(let i=0;i<body.mentions.length;i++){
      let n=body.mentions[i].name;
      console.log("1:"+n);
      req1.get(`https://sandbox-healthservice.priaid.ch/symptoms?token=${token}&format=json&language=en-gb`,(err,res1,body)=> {
        if(err){
          console.log(error);

        }
        body=JSON.parse(body);
        console.log(body);
        for(let i=0;i<body.length;i++)
        {
          console.log("hello",body[i])
          if(body[i].Name===n)
          {
            let id=body[i].ID;
            req2.get("https://sandbox-healthservice.priaid.ch/diagnosis?symptoms=["+id+"]&gender="+gen+"&year_of_birth="+age+`&token=${token}&format=json&language=en-gb`
              ,(err,res2,body)=>{
              if(err)
              {
                throw err;
                // console.log("there is error in apicall in getissue ");
              }
              // console.log("displaying the issuees related to the symptomsm")
              res.json(JSON.parse(body));
            })
            break;
          }
        }
    })
    }
    console.log("2:"+body);
  });
})

app.get('/getDoctors',(req,res)=>{
  let lat = req.query.lat;
  let lng = req.query.lng;
  let gurl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=300&type=doctor&key=AIzaSyB4Vk4A6G4JdfmazzQfsnndZmfKn3Yp15k`
  req1(gurl,(er,response,body1)=>{
    if(er) res.send(err);
    // res.send(JSON.parse(body1));
    body = JSON.parse(body1).results;
    if(body.length>0){
        let result = [];
        body.forEach((x,i)=>{
          let final = {
            name:x.name,
            location:x.geometry.location,
            openNow:x.opening_hours?x.opening_hours.open_now:true,
            address:x.vicinity,
            rating:x.rating
          }
          if(final.openNow){
            result.push(final);
          }
        })
        res.json({success:true,result,"next_page_token":body1.next_page_token});
    }
    else{
        res.send({success:false,msg:"api limit exceeded"});
    }

  })
})
