var Connection = require("tedious").Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

exports.sql = function () {

    var schemaSQL = '';
    var connected = false;
    var connection;
    var config = {
        userName: "DASHADMIN",
        password: "uNNM875@E@iT",
        server: 'dashboard-data.database.windows.net',
        options: { encrypt: true, database: 'DASHBOARD_DATA' }
    };


    this.setUserName = function (uname) {
        if (uname) {
            config.userName = uname;
            console.log('>>SQLUserName set to "' + config.userName + '"');
        } else console.log(">>ERROR: no sql username provided");
    };

    this.setPassword = function (pword) {
        if (pword) {
            config.password = pword;
            console.log('>>SQLPassword set to "' + config.password + '"');
        } else console.log(">>ERROR: no sql username provided");
    };

    this.connect = function () {
        if (config.userName && config.password) {
            if (connected) console.log(">>WARN: SQL DB connection requested, but already connected."); else {
                console.log(">>attempting connection using following configuration:");
                console.log("\t" + JSON.stringify(config));
                connection = new Connection(config);
                connection.on('connect', function (err) {
                    if (err) {
                        console.log(">>Error connecting: " + err);
                        connected = false;
                    } else {
                        console.log(">>Connected to " + config.options.database);
                        connected = true;
                    };
                });
            }
        } else console.log(">>ERROR: connection not attempted - no username or password provided");
    };

    this.testQuery = function () {
        request = new Request("SELECT c.CustomerID, c.CompanyName,COUNT(soh.SalesOrderID) AS OrderCount FROM SalesLT.Customer AS c LEFT OUTER JOIN SalesLT.SalesOrderHeader AS soh ON c.CustomerID = soh.CustomerID GROUP BY c.CustomerID, c.CompanyName ORDER BY OrderCount DESC;", function (err) {
            if (err) {
                console.log(err);
            }
        });
        var result = "";
        request.on('row', function (columns) {
            columns.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    result += column.value + " ";
                }
            });
            console.log(result);
            result = "";
        });

        request.on('done', function (rowCount, more) {
            console.log(rowCount + ' rows returned');
        });
        connection.execSql(request);
    };

    this.genSchema = function (jSchema) {

        function getType(field) {
            var typeString = '';
            switch (field.type) {
                case 'assigned_user_name':
                    typeString = 'varchar FOREIGN KEY Users ';
                    break;
                case 'bool':
                    typeString = 'bit NOT NULL DEFAULT (0) ';
                    break;
                case 'datetime':
                    typeString = 'datetime2 ';
                    break;
                case 'email':
                    typeString = 'varchar ';
                    break;
                case 'enum':
                    typeString = 'varchar ';
                    break;
                case 'id':
                    typeString = 'varchar UNIQUE ';
                    break;
                case 'link':
                    typeString = 'varchar FOREIGN KEY ' + field.relationship + ' ';
                    break;
                case 'name':
                    typeString = 'varchar ';
                    break;
                case 'phone':
                    typeString = 'varchar ';
                    break;
                case 'relate':
                    typeString = 'varchar ';
                    break;
                case 'tag':
                    typeString = 'varchar ';
                    break;
                case 'team_list':
                    typeString = 'varchar ';
                    break;
                case 'text':
                    typeString = 'text ';
                    break;
                case 'url':
                    typeString = 'varchar ';
                    break;
                case 'varchar':
                    typeString = 'varchar ';
                    break;
                default:
                    console.log('>>NOTE field ' + field.name + ' has type ' + field.type + '. Defaulting to varchar');
                    typeString = 'varchar '      
            };
            return typeString;
        };

        schemaSQL = 'CREATE SCHEMA SugarSchema';

        // process each table/module
        for (var tablekey in jSchema.modules) {
            console.log('>>Processing table ' + tablekey + ' schema def');
            schemaSQL += ' \n\nCREATE TABLE ' + tablekey + ' (';
            var prefix = '';
            var fields = jSchema.modules.Accounts.fields
            for (var fieldkey in fields) {
                if (fields[fieldkey].name) {
                    schemaSQL += prefix + fields[fieldkey].name + ' ' + getType(fields[fieldkey]);
                    prefix = ', ';
                };
            };
            schemaSQL += ')'
        };
        schemaSQL += ';'
        console.log('>>Done processing schema.');
//        console.log(schemaSQL);
    };
};