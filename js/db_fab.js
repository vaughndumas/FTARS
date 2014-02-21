if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

function insFab() {
    var x_fababbr = $("#frmAddSpecies #x_fababbr").val();
    var x_fabname = $("#frmAddSpecies #x_fabname").val();
    var x_fabdefault = $("input[name=x_fabdefault]:checked", "#frmAddSpecies").val();
    
    if (x_fabdefault === 'Y') {
        db.transaction(function(tx) {
           tx.executeSql('UPDATE fabspe SET fabdefault = ? WHERE fabdefault = ?', ["N", "Y"], nullData, errorHandler) ;
        });
    }
    
    db.transaction(function(tx){
               tx.executeSql('INSERT INTO fabspe (fababbr, fabname, fabdefault)'
                           + ' VALUES (?,?,?)', [x_fababbr, x_fabname, x_fabdefault],nullData, errorHandler); 
            }); 
}

function getFab() {
    $("#divSetupSpecies #tbl_species_list").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fabspe ORDER BY fabdefault desc, fababbr asc',
                     [],
                     function(tx, v_results) {
                         var v_rowcount = v_results.rows.length; 
                         for (v_count = 0; v_count < v_rowcount; v_count ++) {
                             v_trdata = "<tr><td>" + v_results.rows.item(v_count).fababbr + "</td>";
                             if (v_results.rows.item(v_count).fabdefault === 'Y')
                                 v_trdata += "<td><span style='background: #00FF00'>&nbsp;</span>" + v_results.rows.item(v_count).fabname + "</td>";
                             else
                                 v_trdata += "<td>" + v_results.rows.item(v_count).fabname + "</td>";
                             v_trdata += "<td><input class='btn-uni-grad btn-small' type=\"button\" value=\"Edit\"/></td>";
                             v_trdata += "</tr>";
                             $(v_trdata).appendTo("#divSetupSpecies #tbl_species_list");
                         }
                     }, 
                     errorHandler) ;
    });
}

