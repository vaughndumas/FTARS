/////
///Save Data Function
/////
function saveData(){
    //Our text field data
    var txtName = $('#txtName').val();
    var intAge = $('#intAge').val();
    var txtColour = $('#txtColour').val();
    
    //Check databases are supported
    if(openDatabase){
        //Open a database transaction
        db.transaction(function(tx){
            //Execute an SQL statement to create the table "tblDemo" 
            //only if it doesn't already exist                
            tx.executeSql('CREATE TABLE IF NOT EXISTS tblDemo ('
                           + 'personId INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,'
                           + 'personName VARCHAR(255),'
                           + 'personAge INTEGER,'
                           + 'personColour VARCHAR(255)'
                           + ');',[],nullData,errorHandler);
        });
        
        //Open a new transaction
        db.transaction(function(tx){
            //Exexute an INSERT with the name, age and favourite colour, 
            //we set values outside the SQL string for added security and 
            //to prevent SQL injections, the values are represented with "?"
            tx.executeSql('INSERT INTO tblDemo ('
                           + 'personName, personAge, personColour)'
                           + 'VALUES (?, ?, ?);'
                           ,[txtName,intAge,txtColour],nullData,errorHandler);
        });
    }
}

/////
///Get Data Function
/////
function getData(){
    //Create an empty results string
    var strResults = '';
    
    //Open a new transaction
    db.transaction(function(tx){
        //Select a wildcard from the database
        tx.executeSql('SELECT * FROM tblDemo'
                       ,[]
                       //Callback function with transaction and 
                       //results objects
                       ,function(tx, results){
                            //Count the results rows
                            var rowsCount = results.rows.length;  
                            //Loop the rows
                            for (var i = 0; i < rowsCount; i++){
                                //Build a results string, notice the 
                                //column names are called
                                strResults += '<p>Your Name is<b> '
                                              + results.rows.item(i).personName
                                              + '</b> Your ID is<b> '
                                              + results.rows.item(i).personId
                                              + '</b> Your age is<b> '
                                              + results.rows.item(i).personAge
                                              + '</b> Your favourite colour is<b> '
                                              + results.rows.item(i).personColour
                                              + '</b></p>';
                            }
                            //Fill the results DIV 
                            $('.results').html(strResults);
                        }
                       ,errorHandler);
    });
}

/////
///Error Handler
/////
function errorHandler(transaction, error) {
    //Log the error
    console.log('Error: ' + error.message + ' (Code ' + error.code + ')');
}

/////
///Null Data
/////
function nullData(){
    //Can be used for callbacks etc
}
/////
///Document Ready 
/////
$(document).ready(function(){
    //Bind events to the buttons to fire off the functions                       
    $('#btnSave').bind('click' , saveData);
    $('#btnGet').bind('click' , getData);
    
    //Open the database 
    if(openDatabase){
        db = openDatabase('Database Name' , '1.0' , 'Database Description' , 2 * 1024 * 1024);
    }
    //Alert the user to upgrade their browser
    else {
        alert('Databases not supported. Please get a proper browser');
    }
    
});
