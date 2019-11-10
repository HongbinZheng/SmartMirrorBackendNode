const express = require('express');
const app =express();
const cors = require('cors');
const bodyParser = require('body-parser');
const {google} = require('googleapis');
const creds = require('./client_apis.json')
const fetch = require("node-fetch");
var request = require("request");
const config = require('./config.json')

var corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];


function toObject(arr) {
  var rv = {
    Date:'',
    Subject:'',
    From:'',
  };
  for (var i = 0; i < arr.length; ++i){
    if(arr[i].name === 'Date'){
      rv.Date = arr[i].value
    }
    if(arr[i].name === 'Subject'){
      rv.Subject = arr[i].value
    }
    if(arr[i].name === 'From'){
      rv.From = arr[i].value
    }
  }
  return rv;
}

const CLIENT_ID = config.CLIENT_ID
const CLIENT_SECRET = config.CLIENT_SECRET
app.get('/api/getrefreshtoken', (req,res)=>{
  var authCode = req.query.code
  console.log(authCode)
  console.log('call~')
  var options = {
    method: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form: {
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: authCode,
      redirect_uri: 'http://localhost:6000'
    }
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    body = JSON.parse(body)
    console.log(body);
    res.send({access_token:body.access_token,refresh_token: (body.refresh_token) ? body.refresh_token:null });
  });

})

app.get('/api/getGmail', (req,res)=>{
  var authCode = req.query.code
  // console.log(authCode)
  // console.log('call~')
  var gmailList = [];
  var options = {
    method: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form: {
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: authCode,
      //redirect_uri: 'http://localhost:6000'
    }
  };
  request(options, async function (error, response, body) {
    if (error) throw new Error(error);
    body = JSON.parse(body)
    //////Get gmail items 
    const {client_secret, client_id, redirect_uris} = creds.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials({access_token:body.access_token});
    google.options({auth:oAuth2Client});
    const gmail = google.gmail({version: 'v1', oAuth2Client});
    await getGmailMessage(gmail,gmailList)
    //console.log(gmailList)
    res.send(gmailList);
  });
})



//return list item
 function getGmailMessage(gmail,gmailList){
   return new Promise((resolve,reject)=>{
    gmail.users.messages.list({
      userId: 'me',
    }, async (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const labels = res.data.messages;
      if (labels.length) {
        for(const label of labels){
         await getThreadList(gmail,gmailList,label)
          //console.log(`- ${label.threadId}`);
        };// end of ForEach
        //res.send(gmailList)
      } else {
        console.log('No labels found.');
      }
      resolve(gmailList)
    });// end of gmail.users.messages.list
   })
}

////get threads list
function getThreadList(gmail,gmailList,label){
  return new Promise((resolve,reject)=>{
    gmail.users.threads.get({
      'userId': 'me',
      'id': label.threadId
    },(err,res)=>{
      if (err) return console.log('The API returned an error: ' + err);
      var gmailInfo = res.data.messages[0].payload.headers.filter(value => {
        return value.name === "From" || value.name === "Date" ||  value.name === 'Subject'
      })
      gmailInfo = toObject(gmailInfo)
      gmailInfo.snippet = res.data.messages[0].snippet
      gmailList.push(gmailInfo)
      resolve(gmailList)
      //console.log(JSON.stringify(res.data.messages[0].payload))
    }) // end of  gmail.users.threads.get
  })
}

////////////END Gmail//////////////

/////////google calendar//////////





const port = process.env.PORT || 6000;

// listen to port when server is running
app.listen(port, () => console.log(`Server running on port ${port}`));



//   1//06fec0wj6rt6tCgYIARAAGAYSNwF-L9IrNx0_uxyiNvrL_DAn4P02nNDtYv2NOdV7XTzssgMr9FargAROZtdkeAFVio2nmTdjdPQ