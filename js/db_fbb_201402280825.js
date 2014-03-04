if(openDatabase){
        db = openDatabase('ftars_jb' , '1.0' , 'FTARS Jervis Bay' , 2 * 1024 * 1024);
};

function editFbb(x_fabcode) {
    $("#divSetupSpecies").hide();
    $("#divSpeciesGp").show();
    $("#divSpeciesGp #tbl_link_spegp").empty();
    
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM fabspe WHERE fabcode = ?', [x_fabcode],
                     function(tx, v_results) {
                         $("#divSpeciesGp #x_fabname").val(v_results.rows.item(0).fabname);
                     },
                     errorHandler);

        $("#divSpeciesGp #x_fbbspecies").val(x_fabcode);
        // Get the currently linked groups
        tx.executeSql('SELECT fbbgroupcode, fadname, fadabbr FROM fbbsgl, fadgrp '
                    + 'WHERE fbbspecies = ? '
                    + 'AND fbbgroupcode = fadcode', [x_fabcode],
                    function(tx, v_results) {
                        var v_rowcount = v_results.rows.length;
                        $("<tr><th>Group</th><th>Link?</th></tr>").appendTo("#divSpeciesGp #tbl_link_spegp");
                        for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            v_trdata = "<tr><td>" 
                                    + "<input type=hidden name=fbbgroupcode value='"+v_results.rows.item(v_count).fbbgroupcode 
                                    + "'/>"
                                    + v_results.rows.item(v_count).fadname 
                                    + " (" + v_results.rows.item(v_count).fadabbr + ")"
                                    + "</td>";
                            v_trdata += "<td>";
                            v_trdata += "<input type=checkbox data-role=flipswitch id='flip-checkbox-b'"+v_count+"' name='flip-checkbox-b' data-on-text='Yes' data-off-text='No' checked=''>";
                            v_trdata += "</td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#tbl_link_spegp").trigger("create");
                        }
                    },
                    errorHandler);
        tx.executeSql('SELECT fadcode, fadname, fadabbr FROM fadgrp WHERE fadcode NOT IN (SELECT fbbgroupcode FROM fbbsgl WHERE fbbspecies = ?)', [x_fabcode],
                    function(tx, v_results) {
                        var v_rowcount = v_results.rows.length;
                        for (v_count = 0; v_count < v_rowcount; v_count ++) {
                            v_trdata = "<tr><td>" 
                                    + "<input type=hidden name=fbbgroupcode value='"+v_results.rows.item(v_count).fadcode 
                                    + "'/>"
                                    + v_results.rows.item(v_count).fadname 
                                    + " (" + v_results.rows.item(v_count).fadabbr + ")"
                                    + "</td>";
                            v_trdata += "<td>";
                            v_trdata += "<input type=checkbox data-role=flipswitch id='flip-checkbox-a'"+v_count+"' name='flip-checkbox-a' data-on-text='Yes' data-off-text='No'>";
                            v_trdata += "</td>";
                            v_trdata += "</tr>";
                            $(v_trdata).appendTo("#tbl_link_spegp").trigger("create");
                        }
                    },
                    errorHandler);
    });
}

function getGpName(x_groupcode) {
    var v_groupname = '';
    db.transaction(function(tx_ggn) {
        tx_ggn.executeSql('SELECT * FROM fadgrp WHERE fadcode = ?', [x_groupcode],
          function(tx_ggn, v_results_ggn) {
              v_groupname = v_results_ggn.rows.item(0).fadname + " (" + v_results_ggn.rows.item(0).fadabbr + ")";
          }
        ,nullData);
    });
    return v_groupname;
}

function updSpeGp() {
    // Get the primary key from the table
    var v_fbbspecies = $("#divSpeciesGp #x_fbbspecies").val();
    var v_groupcode = '';
    var v_tmpgroup = '';
    var v_insert_arr = {};
    var v_specimens = {};
    db.transaction(function(tx) {
       // Remove existing values for this species
       tx.executeSql('DELETE FROM fbbsgl WHERE fbbspecies = ?', [v_fbbspecies], nullData, errorHandler);
       // before inserting new ones.
       $("#divSpeciesGp #tbl_link_spegp tr").each(function(v_count_tr) {
          v_groupcode = '';
          $(this).children("td").each(function() {
            // Second TD is a div
            $(this).children("input").each(function() {
               v_groupcode = $(this).attr("value"); 
            });
            $(this).children("div .ui-flipswitch-active").each(function() {
                tx.executeSql('INSERT INTO fbbsgl (fbbspecies, fbbgroupcode) '
                            + ' VALUES (?, ?)', [v_fbbspecies, v_groupcode], nullData, errorHandler);
                v_tmpgroup = v_groupcode;
                var v_fbcheader = '';

                tx.executeSql('SELECT * FROM fadgrp WHERE fadcode = ?', [v_groupcode],
                  function(tx, v_results) {
                    v_fbcheader = v_results.rows.item(0).fadname + " (" 
                                + v_results.rows.item(0).fadabbr + ")";
                    v_fbcheader = v_results.rows.item(0).fadabbr;
                  }  ,nullData);

                /* 
                 * Add the attributes linked to this group to the field attribute values table.
                 * Only add those attributes that DO NOT exist
                 * Once finished, check if there is a dispans = 'D'.  If not then add one with the group name
                 * 
                 */
                tx.executeSql('SELECT fbaattrcode, facname, facabbr '
                            + 'FROM   fbagpa, facatr '
                            + 'WHERE  fbagroupcode = ? '
                            + 'AND    fbaattrcode = faccode '
                            + 'AND    fbaattrcode NOT IN '
                            + '   (SELECT fbcattrcode '
                            + '    FROM   fbcsfa, faespm '
                            + '    WHERE  fbcspecimencode = faecode '
                            + '    AND    faespecies = ?)',
                            [v_groupcode, v_fbbspecies],
                            function(tx, v_results) {
                                var v_rowcount = v_results.rows.length;
                                for (v_count = 0; v_count < v_rowcount; v_count ++) {
                                    var v_fbaattrcode_ins = v_results.rows.item(v_count).fbaattrcode;
                                    var v_facname_ins = v_results.rows.item(v_count).facname;
                                    
                                    // Select every specimen linked to this species
                                    tx.executeSql('SELECT * FROM faespm WHERE faespecies = ?', [v_fbbspecies],
                                      function(tx, v_results2) {
                                        var v_rowcount2 = v_results2.rows.length;
                                        for (v_count2 = 0; v_count2 < v_rowcount2; v_count2++) {
                                            
                                                var v_faecode_ins = v_results2.rows.item(v_count2).faecode;
                                                if (v_count2 === 0) {
                                                    // Check for dispans header, create if necessary;
                                                    var v_dispans = 'D';
                                                    tx.executeSql('SELECT count(*) as fbc_count FROM fbcsfa WHERE fbcspecimencode = ? and fbcdispans = ?', 
                                                                  [v_faecode_ins, v_dispans], 
                                                                  // Success function
                                                                  function(tx, v_results3) {
                                                                      var v_count = v_results3.rows.item(0).fbc_count;
console.log("first count = " + v_results3.rows.item(0).fbc_count);
                                                                      if (v_count === 0) {
                                                                        tx.executeSql('INSERT INTO fbcsfa (fbcheader, fbcspecimencode, fbcattrcode, fbcattrtitle, fbcdispans, fbcans) '
                                                                                    + 'VALUES (?, ?,NULL,?,?,NULL)',
                                                                                     [v_fbcheader, v_faecode_ins,
                                                                                      v_facname_ins,
                                                                                      v_dispans], errorHandler_fbb2);
                                                                        console.log('created D record');
                                                                        tx.executeSql('SELECT count(*) as fbc_count FROM fbcsfa WHERE fbcspecimencode = ? and fbcdispans = ?', 
                                                                            [v_faecode_ins, v_dispans], 
                                                                            function(tx, v_results8) {
                                                                                console.log("rows in table: ", v_results8.rows.item(0).fbc_count);
                                                                            }, 
                                                                            function(tx, v_results8) {
                                                                              console.log("Error checking table fbcsfa");   
                                                                            }
                                                                         );

                                                                      } else {
console.log('about to get D record');
                                                                          tx.executeSql('SELECT fbcheader FROM fbcsfa WHERE fbcspecimencode = ? and fbcdispans = ?', 
                                                                                        [v_faecode_ins, v_dispans], 
                                                                                        function(tx, v_results5) {
                                                                                            v_fbcheader = v_results5.rows.item(0).fbcheader;
                                                                                        }, errorHandler);
                                                                      }
                                                                  });
                                                }

//console.log(v_fbcheader + ":" + v_faecode_ins + ":" + v_fbaattrcode_ins + ":" + v_facname_ins);
if (1===0) {
    
tx.executeSql('INSERT INTO fbcsfa (fbcheader, fbcspecimencode, fbcattrcode, fbcattrtitle, fbcdispans, fbcans) '
+ 'VALUES (?,?,?,?,?,NULL)',
[v_fbcheader, v_faecode_ins,v_fbaattrcode_ins, v_facname_ins,
"A"], errorHandler_fbb2);
alert('pause');
}
                                        };
                                      }, errorHandler_fbb);
                                }
                            },
                            errorHandler);
            });
          });
       });
    });

}

function errorHandler_fbb(transaction, error) {
    var v_errmsg = 'FBB Error: ' + transaction['sqlStatement'];
//    v_errmsg += ' Code ';
//    v_errmsg += error.code;
    console.log(v_errmsg);
}

function errorHandler_fbb2(transaction, error) {
    var v_errmsg = 'FBB2 Error: ' + error.message;
//    v_errmsg += ' Code ';
//    v_errmsg += error.code;
    console.log(v_errmsg);
}