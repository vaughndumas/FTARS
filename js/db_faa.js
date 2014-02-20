/////
///Get Data Function
/////
function getFaa() {
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM faaftp',
                     [],
                     function(tx, v_results) {
                         v_item = document.getElementById("x_faasdate");
                         v_item.textContent = v_results.rows.item(0).faasdate;
                         v_item = document.getElementById("x_faaedate");
                         v_item.textContent = v_results.rows.item(0).faaedate;
                         v_item = document.getElementById("x_faadesc");
                         v_item.textContent = v_results.rows.item(0).faadesc;
                         v_item = document.getElementById("x_faaarea");
                         v_item.textContent = v_results.rows.item(0).faaarea;
                     },
                     errorHandler);
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
