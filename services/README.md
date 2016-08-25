TSDR Services
==============

The services are written in Node.js. They expose APIs for the consumption of the mobile app and persist data in a MySQL db. 

## Installation
* Download the repo and navigate to services folder
* Use db.sql script to setup 'tsdr_mobile' mysql schema. 
* Edit db/dbAdapter.js to set schema details - 
```
   {
        host     : <db_host>,
        user     : <db_user>,
        password : <db_password>,
        database : "tsdr_mobile"
    }
```
* Execute the command ```node db/dbInit.js``` to populate tables
* Execute ```node app.js```
* You can access the app at http://host_name:3001/
