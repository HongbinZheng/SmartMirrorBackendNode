The code is used for Smart-Mirror Project Backend, mainly handle all the google-api call, after you clone the code, you need to go to google api console, create a new project, and enable google calendar and gmail api and get the credential from google, create the file in root folder call `config.js`, and add `{
    "CLIENT_ID" : "YOUR OWN CLIENT ID",
    "CLIENT_SECRET":"YOU OWN CLIENT SECRET"
} `in to the file.  <br/><br/> After clone the code and create the `config.js`, run `npm install`, then run `node server.js`, your Smart-Mirror backend will run at localhost:6000.
  <br/><br/> Frontend of the Smart-Mirror(Mirror-version) will be at repo https://github.com/itjinshan/Smart-Mirror
  <br/><br/> Smart-Mirror phone app will be at https://github.com/HongbinZheng/SmartMirrorApp
