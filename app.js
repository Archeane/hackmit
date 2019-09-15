var express = require('express')
var app = express()
var fs = require('fs');
var request = require('request');

const accountSid = 'ACd2079c2b0acd87c6f3805ca56e576e14';
const authToken = 'aad21f98e687d4860287295ba1a72265';
const twilio_client = require('twilio')(accountSid, authToken);
const CosmosClient = require('@azure/cosmos').CosmosClient;
const config = require('./config');
var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');


const endpoint = config.endpoint;
const key = config.key;
const client = new CosmosClient({endpoint, key});

const databaseId = config.database.id;
const containerId = config.container.id;
const partitionKey = { kind: "text", paths: ["/objects"] };

async function createDatabase() {
	const { database } = await client.databases.createIfNotExists({ id: databaseId });
	//console.log(`Created database:\n${database.id}\n`);
}

async function readDatabase() {
	const { resource: databaseDefinition } = await client.database(databaseId).read();
}

async function readContainer() {
 	const { resource: containerDefinition } = await client.database(databaseId).container(containerId).read();
	//console.log(`Reading container:\n${containerDefinition.id}\n`);
}

async function queryContainer(query) {
  //console.log(`Querying container:\n${config.container.id}`);

  // query to return all children in a family
  const querySpec = {
     query: query,//"SELECT * FROM c ObjDetect",
     //parameters: [
        // {
          //   name: "@lastName",
            // value: "Andersen"
         //}
     //]

   };

   var result;
	 const { resources } = await client.database(databaseId).container(containerId).items.query(querySpec, {enableCrossPartitionQuery:true}).fetchAll();
	 for (var queryResult of resources) {
	     let resultString = JSON.stringify(queryResult);
	     result = resultString;
	     // console.log(resultString);
	     // console.log(`\tQuery returned ${resultString}\n`);
	 }
 return result;
};


createDatabase()
  .then(() => readDatabase())
  .then(() => readContainer())
  .catch((error) => { console.log(error);});



const dummy = "+16467688323"
const mine = "+16462887028"
const sanjana = "+14127088793"

var visualRecognition = new VisualRecognitionV3({
	version: '2018-03-19',
	iam_apikey: '2yYG7vUV38cTRsPElJeNhGFPcjcLVm5kMrEexDMN1ID4'
});

// var images_file= fs.createReadStream('./fruitbowl.jpg');
var classifier_ids = ["DefaultCustomModel_634540180"];
var threshold = 0.1;
// var download = function(uri, filename, callback){
//   request.head(uri, function(err, res, body){
//     console.log('content-type:', res.headers['content-type']);
//     console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//   });
// };



app.get('/actions', async function (req, res) {
	res.send(['hello world from server']);
	//hardcoded location
	var location = [42.358640, -71.096586]
	var result = await queryContainer("SELECT c.ImageLink FROM c WHERE c.LocationCoord = 42.35864");
	var image_url = JSON.parse(result)['ImageLink'];
	var file_name = 'test.jpg';
	
	// download(image_url, file_name, function(){
	// 	console.log('done');
		var params = {
			images_file: 'fruitbowl.jpg',
			classifier_ids: classifier_ids,
			threshold: threshold
		};

		visualRecognition.classify(params, function(err, response) {
			if (err) { 
				console.log(err);
			} else {
				console.log(JSON.stringify(response, null, 2))
			}
		});

})

app.get('/message', (req, res)=>{
	twilio_client.messages
      .create({body: '[firstname lastname] is experiencing a [natural disaster] at [140 Cambridge St.] on the [2nd] floor. The victim is taking safety precautions right now. If necessary, call them at [646-288-7028].', from: dummy, to: mine})
      .then(message => console.log(message.sid));
});	

app.listen(3000, () => console.log(`Example app listening on port 3000!`));

//const rp = require('request-promise');
// const cheerio = require('cheerio');
// const axios = require('axios');
// const request = require("request");
// //const url = 'http://hisz.rsoe.hu/alertmap/index2.php?area=usa';
// const url = 'http://feeds.feedburner.com/RsoeEdis-EarthquakeReportM25?format=xml';
// // axios.get(url).then(html =>{
// // 	//console.log(html);
// // 	 const $ = cheerio.load(html);
// // 	console.log($('div[id=bodycontainer]').html());
// // 	// console.log($('img').html());
// // })

// request(url, (err, res, html)=>{
// 	const $ = cheerio.load(html);
// 	console.log($.html());
// 	$('b:contains("Coordinate:")').each((i, e)=>{
// 		console.log(e);
// 		//console.log(JSON.parse(e));
// 	})
// 	//console.log(magnitudes);
// 	// let magnitudes = $('b:contains("Coordinate:")').next();
// 	// console.log(magnitudes);
// });


// var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
// var fs = require('fs');

// var visualRecognition = new VisualRecognitionV3({
//   version: '2018-03-19',
//   iam_apikey: '2yYG7vUV38cTRsPElJeNhGFPcjcLVm5kMrEexDMN1ID4',
//   classifier_ids: 'DefaultCustomModel_634540180'
// });

// var url= 'https://d6d2h4gfvy8t8.cloudfront.net/1792141-orig.jpg';

// var params = {
//   url: url,
// };

// visualRecognition.classify(params, function(err, response) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(JSON.stringify(response, null, 2))
//   }
// });