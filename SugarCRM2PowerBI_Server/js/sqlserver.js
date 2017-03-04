var Connection = require("tedious").Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

exports.sql = function () {

    var SQLString = '';
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

    this.doQuery = function () {
        console.log('>>Executing query:\n');
        console.log(SQLString);
        console.log('\n>>End of query');
        request = new Request(SQLString, function (err) {
            if (err) {
                console.log(err);
            }
        });
//        var result = "";
//        request.on('row', function (columns) {
//            columns.forEach(function (column) {
//                if (column.value === null) {
//                    console.log('NULL');
//                } else {
//                    result += column.value + " ";
//                }
//            });
//            console.log(result);
//            result = "";
//        });
//
        request.on('done', function (rowCount, more) {
            console.log(rowCount + ' rows returned');
        });
        connection.execSql(request);
    };

    //createTableFieldSQL assumes that tSchema is a single table schema in well-formed modules schema JSON
    var createTableFieldSQL = function (tSchema) {
        var tempSQLString = '';
        var tName;
        for (var key in tSchema.modules) {
            tName = key;
            break;
        };
        if (tSchema) {
            tempSQLString = ' (';
            var prefix = '';
            var fields = tSchema.modules[tName].fields;
            for (var fieldkey in fields) {
                if (fields[fieldkey].name) {
                    tempSQLString += prefix + fields[fieldkey].name + ' ' + getType(fields[fieldkey]) + ' ';
                    prefix = ', (';
                };
                tempSQLString += ')'
            };
        } else {
            console.log('>>ERROR: no tables schema provided. No SQL created.');
        };
        return tempSQLString;
    };

    //tSchema is the schema for the Sugar table
    //tData is the data for the Sugar table
    this.populateTable = function (tSchema, tData) {
        //todo: generate sql to populate a table
        var tName;
        for (var key in tSchema.modules) {
            tName = key;
            break;
        };
        console.log('>>populating table ' + tName + ' with ' + tData.length + ' records');
        var tempSQLString = 'CREATE TABLE ' + tName;
        if (tData.length > 0) {
            var fieldListString = createTableFieldSQL(tSchema);
            tempSQLString += fieldListString + '\nINSERT INTO ' + tName + fieldListString + ' VALUES ((';
            var recordValueSQL = '';
            var recordPrefix = '';
            for (var i = 0; i < tData.length; i++) {
                recordValueSQL = recordPrefix;
                recordPrefix = '),('
                var valuePrefix = '';
                for (var fieldkey in tSchema.modules[tName].fields) {
                    recordValueSQL += valuePrefix;
                    valuePrefix = ','
                    var eType = getType(tSchema.modules[tName].fields[fieldkey]);
                    switch (eType) {
                        case 'varchar':
                            recordValueSQL += '"' + tData[i][fieldkey] + '"';
                            break;
                        case 'varchar UNIQUE':
                            recordValueSQL += '"' + tData[i][fieldkey] + '"';
                            break;
                        case 'bit NOT NULL DEFAULT (0)':
                            if (tData[i][fieldkey] == 'True' || tData[i][fieldkey] == 'true') recordValueSQL += '1'; else recordValueSQL += '0';
                            break; 
                        default:
                            recordValueSQL += tData[i][fieldkey];
                            break;
                    };
                };
//                console.log(recordValueSQL);
                tempSQLString += recordValueSQL;
            };
            tempSQLString += '));'
        };
        SQLString = tempSQLString;
        console.log(tempSQLString);
    };

    function getType(field) {
        var typeString = '';
        switch (field.type) {
            case 'assigned_user_name':
                typeString = 'varchar';
                break;
            case 'bool':
                typeString = 'bit NOT NULL DEFAULT (0)';
                break;
            case 'datetime':
                typeString = 'datetime2';
                break;
            case 'email':
                typeString = 'varchar';
                break;
            case 'enum':
                typeString = 'varchar';
                break;
            case 'id':
                if (field.name == 'id') {
                    typeString = 'varchar UNIQUE';
                } else {
                    typeString = 'varchar';
                };
                break;
            case 'link':
                typeString = 'varchar';
                break;
            case 'name':
                typeString = 'varchar';
                break;
            case 'password':
                typeString = 'bit NOT NULL DEFAULT (0)';
                break;
            case 'phone':
                typeString = 'varchar';
                break;
            case 'relate':
                typeString = 'varchar';
                break;
            case 'tag':
                typeString = 'varchar';
                break;
            case 'team_list':
                typeString = 'varchar';
                break;
            case 'text':
                typeString = 'text';
                break;
            case 'url':
                typeString = 'varchar';
                break;
            case 'varchar':
                typeString = 'varchar';
                break;
            default:
//                console.log('>>NOTE field ' + field.name + ' has type ' + field.type + '. Defaulting to varchar');
                typeString = 'varchar'
        };
        return typeString;
    };


    this.genSchema = function (jSchema) {
        SQLString = '';
        if (jSchema) {
            //todo: make this create a schema SQL statement if there are more than one module in jSchema
            // process each table/module
            for (var tablekey in jSchema.modules) {
                console.log('>>Processing table ' + tablekey + ' schema def');
                SQLString += ' \n\nCREATE TABLE ' + tablekey + ' (';
                var prefix = '';
                var fields = jSchema.modules[tablekey].fields;
                for (var fieldkey in fields) {
                    if (fields[fieldkey].name) {
                        SQLString += prefix + fields[fieldkey].name + ' ' + getType(fields[fieldkey]) + ' ';
                        prefix = ', ';
                    };
                };
                SQLString += ')'
            };
        } else {
            console.log('>>ERROR: no tables selected. No SQL created.');
        };
        SQLString += ';'
        console.log('>>Done processing schema.');
//        return SQLString;
        console.log(SQLString);
    };
};