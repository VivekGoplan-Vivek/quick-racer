
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(),'leaderboard.json');

function load(){
 try{
  return JSON.parse(fs.readFileSync(filePath,'utf8'));
 }catch{
  return [];
 }
}

function save(data){
 data.sort((a,b)=>b.score-a.score);
 fs.writeFileSync(filePath,JSON.stringify(data,null,2));
}

module.exports = (req,res)=>{

if(req.method==='GET'){
 res.setHeader('Content-Type','application/json');
 res.end(JSON.stringify(load()));
 return;
}

if(req.method==='POST'){

let body='';

req.on('data',chunk=>{
 body+=chunk;
});

req.on('end',()=>{

const {racer,pod,score}=JSON.parse(body);

const lb=load();

lb.push({
 racer,
 pod,
 score,
 ts:Date.now()
});

save(lb);

res.setHeader('Content-Type','application/json');

res.end(JSON.stringify({ok:true}));

});

return;
}

res.statusCode=405;
res.end();

}
