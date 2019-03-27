var gcm = require('gcm-server');
var ted = require('tedious').Connection;

// configure connection to mssql express server
var tedConfig = {
	server: "<MSSQL-INSTANCE>",
	authentication: {
		type: "default",
		options: {
			userName: "faststats_service",
			password: "fa5t5tat5!"
		}		
	},
	options: {
		database: "<DATABASE>",
		encrypt: true		
	}
};
var tedConn = new ted(tedConfig);


// set the new server and the entry points before any app.listen.
var GcmServer = new gcm.Server({
  port: 8443
});

GcmServer.setNewTokenEntryPoint('/gcm/token/new');

GcmServer.onNewToken(function(params, save){
  // ... params validation and filtering
  save({token: params.token, name: params.name}); // save into db (async).
  
  var tedRequest = require('tedious').Request;
  tedInsert = new tedRequest("INSERT INTO [dbo].[firebase_token] ([token],[name],[comment]) VALUES ('"+params.token+"', '"+params.name+"', '')", function(err, rowCount) {
    console.log(rowCount + ' rows');
  });
  tedConn.execSql(tedInsert);

// TODO [ ] ensure CORS is allowed
  
});

GcmServer.start();
