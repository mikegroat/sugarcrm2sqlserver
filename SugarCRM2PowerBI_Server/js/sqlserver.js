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

    // sets the username for SQL server
    this.setUserName = function (uname) {
        if (uname) {
            config.userName = uname;
            console.log('>>SQLUserName set to "' + config.userName + '"');
        } else console.log(">>ERROR: no sql username provided");
    };

    // sets the password for SQL server
    this.setPassword = function (pword) {
        if (pword) {
            config.password = pword;
            console.log('>>SQLPassword set to "' + config.password + '"');
        } else console.log(">>ERROR: no sql username provided");
    };

    // creates the connection to the SQL server
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

    // executes the current query string
    this.doQuery = function () {
        if (connection) {
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
        } else {
            console.log('>>WARN: no connection available to SQL Server.  Query not executed.');
        };
    };

    //createTableFieldSQL assumes that tSchema is a single table schema in well-formed modules schema JSON
    var createTableFieldSQL = function (tSchema, wantTypes) {
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
                    tempSQLString += prefix + fields[fieldkey].name;
                    if (wantTypes) tempSQLString += ' ' + getType(fields[fieldkey], true);
                    prefix = ', ';
                };
            };
            tempSQLString += ')';
        } else {
            console.log('>>ERROR: no tables schema provided. No SQL created.');
        };
        return tempSQLString;
    };

    // provides the current SQL query
    this.getQuery = function () {
        return SQLString;
    };

    // for debugging purposes, shows the field list of a table
    this.showFieldList = function (tSchema) {
        if (tSchema) {
            var tName;
            for (var key in tSchema.modules) {
                tName = key;
                break;
            };
            console.log('Field list for ' + tName + ':');

            var maxFieldLength = 0;
            var maxTypeLength = 0;
            var fields = tSchema.modules[tName].fields;
            var fieldNum = 1;
            for (var fieldkey in fields) {
                if (fields[fieldkey].name) {
                    maxFieldLength = Math.max(maxFieldLength, fields[fieldkey].name.length);
                    maxTypeLength = Math.max(maxTypeLength, fields[fieldkey].type.length);
                };
            };

            var padFieldName = function (fieldName, length, padchar) {
                var name = fieldName;
                for (var i = name.length; i < length; i++) {
                    name += padchar;
                };
                return name;
            };

            console.log('# \t ' + padFieldName('Field Name', maxFieldLength, ' ') + ' \t ' + padFieldName('Sugar Type', maxTypeLength, ' ') + ' \t SQL Type');
            for (var fieldkey in fields) {
                if (fields[fieldkey].name) {
                    console.log(fieldNum + ' \t ' + padFieldName(fields[fieldkey].name, maxFieldLength, ' ') + ' \t ' + padFieldName(fields[fieldkey].type, maxTypeLength, ' ') + ' \t ' + getType(fields[fieldkey], true));
                    fieldNum++;
                };
            };
        } else {
            console.log('>>ERROR: no tables schema provided. No SQL created.');
        };

    };

    // for debug purposes - sets the query string to whatever the user provides to test querys via the server
    this.setQuery = function (q) {
        if (q) {
            SQLString = q;
            console.log('SQL string set to: ' + SQLString);
        } else {
            console.log('WARN: query not provided... query string not set.');
        };
    };

    //tSchema is the schema for the Sugar table
    //tData is the data for the Sugar table
    this.populateTable = function (tSchema, tData, target) {
        //todo: generate sql to populate a table
        var tName;
        for (var key in tSchema.modules) {
            tName = key;
            break;
        };
        console.log('>>populating table ' + tName + ' with ' + tData.length + ' records');
        var tempSQLString = 'DROP TABLE ' + tName + ';\nCREATE TABLE ' + tName;
        if (tData.length > 0) {
            tempSQLString += createTableFieldSQL(tSchema, true) + '\nINSERT INTO ' + tName + createTableFieldSQL(tSchema, false) + ' VALUES (';
            var recordValueSQL = '';
            var recordPrefix = '';
            for (var i = 0; i < tData.length; i++) {
                console.log('\nProcesing record ' + i);
                recordValueSQL = recordPrefix;
                recordPrefix = ');\nINSERT INTO ' + tName + createTableFieldSQL(tSchema, false) + ' VALUES ('
                var valuePrefix = '';
                for (var fieldkey in tSchema.modules[tName].fields) {
                    var dataSQL = '';
                    if (tSchema.modules[tName].fields[fieldkey].name) {
                        recordValueSQL += valuePrefix;
                        valuePrefix = ',';
                        if (typeof(tData[i][fieldkey]) == 'undefined') {
                            console.log('>>WARN: field ' + tSchema.modules[tName].fields[fieldkey].name + ' of record ' + i + ' in table ' + tName + ' is UNDEFINED...  calling it "undefined"');
                            dataSQL = "'undefined'";
                        } else {
                            var eType = getType(tSchema.modules[tName].fields[fieldkey], false);
                            switch (eType) {
                                case 'bit NOT NULL DEFAULT (0)':
                                    if (tData[i][fieldkey] == 'True' || tData[i][fieldkey] == 'true') dataSQL = '1'; else dataSQL = '0';
                                    break;
                                default:
                                    if (tData[i][fieldkey].hasOwnProperty('length')) if (tData[i][fieldkey].length == 0) dataSQL = "'  '"; else dataSQL = "'" + String(tData[i][fieldkey]).replace("'", " ") + "'"; else dataSQL = "'null'";
                                    if (fieldkey == "team_name") dataSQL = "'team name'";
                                    break;
                            };
                        };
                        console.log(tSchema.modules[tName].fields[fieldkey].name + ' \t' + tSchema.modules[tName].fields[fieldkey].type + ' \t' + eType + ' \t' + dataSQL);
                        recordValueSQL += dataSQL;
                    };
                };
//                console.log(recordValueSQL);
                tempSQLString += recordValueSQL;
            };
            tempSQLString += ');'
        };
        SQLString = tempSQLString;
        tempSQLString = '\nMERGE ' + target + ' AS T \n\tUSING ' + tName + ' AS M \n\tON T.id = M.id \nWHEN MATCHED\nTHEN\n\tUPDATE SET ';
        var fieldPrefix = '';
        var fieldString = '';
        var valueString = '';
        var fieldStringPrefix = '';
        var valueStringPrefix = '';
        for (var fieldkey in tSchema.modules[tName].fields) {
            if (tSchema.modules[tName].fields[fieldkey].name) {
                tempSQLString += fieldPrefix;
                fieldPrefix = ',\n\t'
                fieldString += fieldStringPrefix;
                fieldStringPrefix = ', ';
                valueString += valueStringPrefix;
                valueStringPrefix = ', ';
                var fieldName = tSchema.modules[tName].fields[fieldkey].name;
                tempSQLString += 'T.' + fieldName + ' = M.' + fieldName;
                fieldString += fieldName;
                valueString += 'M.' + fieldName;
            };
        };
        tempSQLString += '\nWHEN NOT MATCHED\nTHEN\n\tINSERT (' + fieldString + ')\n\tVALUES ( ' + valueString + ');';
        console.log(tempSQLString);
        SQLString += tempSQLString;
    };

    function getType(field, wantlength) {
        var typeString = '';
        var lengthString = '';
        if (wantlength) lengthString = '(50)';
        switch (field.type) {
            case 'assigned_user_name':
                typeString = 'varchar' + lengthString;
                break;
            case 'bool':
                typeString = 'bit NOT NULL DEFAULT (0)';
                break;
            case 'datetime':
                typeString = 'datetimeoffset';
                break;
            case 'email':
                typeString = 'varchar' + lengthString;
                break;
            case 'enum':
                typeString = 'varchar' + lengthString;
                break;
            case 'fullname':
                typeString = 'varchar' + lengthString;
                break;
            case 'id':
                if (field.name == 'id') {
                    typeString = 'varchar' + lengthString + ' UNIQUE';
                } else {
                    typeString = 'varchar' + lengthString;
                };
                break;
            case 'image':
                typeString = 'varchar' + lengthString;
                break;
            case 'link':
                typeString = 'varchar' + lengthString;
                break;
            case 'name':
                typeString = 'varchar' + lengthString;
                break;
            case 'password':
                typeString = 'bit NOT NULL DEFAULT (0)';
                break;
            case 'phone':
                typeString = 'varchar' + lengthString;
                break;
            case 'relate':
                typeString = 'varchar' + lengthString;
                break;
            case 'tag':
                typeString = 'varchar' + lengthString;
                break;
            case 'team_list':
                typeString = 'varchar' + lengthString;
                break;
            case 'text':
                typeString = 'text';
                break;
            case 'url':
                typeString = 'varchar' + lengthString;
                break;
            case 'username':
                typeString = 'varchar' + lengthString;
                break;
            case 'varchar':
                typeString = 'varchar' + lengthString;
                break;
            default:
                console.log('>>NOTE field ' + field.name + ' has type ' + field.type + '. Defaulting to varchar');
                typeString = 'varchar' + lengthString;
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
                SQLString += ' \nDROP TABLE ' + tablekey + ';\nCREATE TABLE ' + tablekey + ' (';
                var prefix = '';
                var fields = jSchema.modules[tablekey].fields;
                for (var fieldkey in fields) {
                    if (fields[fieldkey].name) {
                        SQLString += prefix + fields[fieldkey].name + ' ' + getType(fields[fieldkey], true) + ' ';
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