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


The United States Department of Commerce (DOC) GitHub project code is provided on an ‘as is’ basis and the user assumes responsibility for its use. DOC has relinquished control of the information and no longer has responsibility to protect the integrity, confidentiality, or availability of the information. Any claims against the Department of Commerce stemming from the use of its GitHub project will be governed by all applicable Federal law. Any reference to specific commercial products, processes, or services by service mark, trademark, manufacturer, or otherwise, does not constitute or imply their endorsement, recommendation or favoring by the Department of Commerce. The Department of Commerce seal and logo, or the seal and logo of a DOC bureau, shall not be used in any manner to imply endorsement of any commercial product or activity by DOC or the United States Government.
