if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

function editGp(x_fadcode) {
    $("#divListGp").hide();
    $("#divEditGp").show();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fadgrp WHERE fadcode = ?', [x_fadcode],
                     function(tx, v_results) {
                         $("#divEditGp #x_fadcode").val(v_results.rows.item(0).fadcode);
                         $("#divEditGp #x_fadabbr").val(v_results.rows.item(0).fadabbr);
                         $("#divEditGp #x_fadname").val(v_results.rows.item(0).fadname);
                     },
                     errorHandler);
    });
}

function insFad() {
    var x_fadabbr = $("#frmAddGp #x_fadabbr").val();
    var x_fadname = $("#frmAddGp #x_fadname").val();
    
    db.transaction(function(tx){
               tx.executeSql('INSERT INTO fadgrp (fadabbr, fadname)'
                           + ' VALUES (?,?)', [x_fadabbr, x_fadname],nullData, errorHandler); 
            }); 
}

function updFad() {
    var v_fadcode = $("#frmEditGp #x_fadcode").val();
    var v_fadabbr = $("#frmEditGp #x_fadabbr").val();
    var v_fadname = $("#frmEditGp #x_fadname").val();

    db.transaction(function(tx) {
       tx.executeSql('UPDATE fadgrp SET fadabbr = ?, fadname = ? WHERE fadcode = ?',
                     [v_fadabbr, v_fadname, v_fadcode], nullData, errorHandler); 
    });

}

function getFad() {
    $("#divListGp #tbl_gp_list").empty();
    db.transaction(function(tx) {
       tx.executeSql('SELECT * FROM fadgrp ORDER BY fadabbr',
                     [],
                     function(tx, v_results) {
                         var v_rowcount = v_results.rows.length; 
                         for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            if (v_count == 0) {
                               v_trdata = "<tr><th>Abbr</th><th>Name</th><th>&nbsp;</th></tr>";
                               $(v_trdata).appendTo("#divListGp #tbl_gp_list");
                            }
                            v_trdata = "<tr><td>" + v_results.rows.item(v_count).fadabbr + "</td>";
                            v_trdata += "<td>" + v_results.rows.item(v_count).fadname + "</td>";
                            v_trdata += "<td><input class='btn-uni-grad btn-small' type=\"button\" value=\"Edit\" onClick=\"editGp("+v_results.rows.item(v_count).fadcode+");\"/>";
                            v_trdata += "&nbsp;<input class='btn-uni-grad btn-small' type=\"button\" value=\"Attributes\" onClick=\"editGpAttr("+v_results.rows.item(v_count).fadcode+");\"/></td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#divListGp #tbl_gp_list");
                         }
                     }, 
                     errorHandler) ;
    });
}

