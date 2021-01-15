/////////////////////////////////////
function Convert() {
    var fileUpload = document.getElementById("fileConvert");
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt|.json)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            reader.onload = function (e) {
                console.log("File load");
                console.log(e.target.result);
                var lines=e.target.result.split('\r');
                for(let i = 0; i<lines.length; i++){
                lines[i] = lines[i].replace(/\s/,'')//delete all blanks
                }
                var result = [];
                var headers=lines[0].split(";");

                for(var i=1;i<lines.length;i++){
                    var obj = {};
                    var currentline=lines[i].split(";");

                    for(var j=0;j<headers.length;j++){
                        obj[headers[j]] = currentline[j];

                    }

                    result.push(obj);
                }

                //return result; //JavaScript object
                //console.log("After JSON Conversion");
               console.log(result);

                console.log(JSON.stringify(result));
               // return JSON.stringify(result); //JSON
              
                
            }
            reader.readAsText(fileUpload.files[0]);
        } else {
            Console.log("This browser does not support HTML5.");
        }
    } else {
        console.log("Please upload a valid CSV file.");
    }
}


//////////////////////////////////////////////
function Convert1() {
            var fileUpload = document.getElementById("fileConvert");
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt|.json)$/;
            if (regex.test(fileUpload.value.toLowerCase())) {
                if (typeof (FileReader) != "undefined") {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        console.log("File load");
                        console.log(e.target.result);
                        var lines=e.target.result.split('\r');
                        for(let i = 0; i<lines.length; i++){
                        lines[i] = lines[i].replace(/\s/,'')//delete all blanks
                        }
                        var result = [];
                        var headers=lines[0].split(";");

                        for(var i=1;i<lines.length;i++){
                            var obj = {};
                            var currentline=lines[i].split(";");

                            for(var j=0;j<headers.length;j++){
                                obj[headers[j]] = currentline[j];
                                // console.log(i + " - " +  j + " - " + obj[headers[j]] );
 
                            }
                            //console.log(i + " - " +  2 + " - " + obj[headers[2]] );
                            var dd = (i + " - " +  2 + " - " + obj[headers[2]] );
                            var mm = obj[headers[2]];

                            var constraints = {
                                password: {
                                  presence: true,
                                  length: {
                                    minimum: 6,
                                    message: function() {console.log("hello")}
                                  }
                                }
                              };
                            console.log(dd);
                              validate({password: mm}, constraints);

                            result.push(obj);
                        }

                        //return result; //JavaScript object
                        //console.log("After JSON Conversion");
                       // console.log(result);

                        //console.log(JSON.stringify(result));
                       // return JSON.stringify(result); //JSON
                      
                        
                    }
                    reader.readAsText(fileUpload.files[0]);
                } else {
                    Console.log("This browser does not support HTML5.");
                }
            } else {
                console.log("Please upload a valid CSV file.");
            }
}

function Verif_File(){
    console.log("Vérifivcation");
    var fileUpload = document.getElementById("fileConvert");
    
   //var fileUpload.value="C:\\Users\\f.hamid\\Desktop\\Contrat Simple.json";

    //C:\Users\f.hamid\Desktop\Contrat Simple.json
    //console.log(fileUpload);
    //  if (document.getElementById("fileConvert").value =""){
    //      console.log ("KO");
    //  };
    
     var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt|.json)$/;
    if (regex.test(fileUpload.value.toLowerCase())) {
        if (typeof (FileReader) != "undefined") {
            var reader = new FileReader();
            reader.onload = function (e) {
                JsonFile=(e.target.result);
                console.log(JsonFile);

             let myNewJSON = JSON.parse(JsonFile);
            // Site=myNewJSON.Onglets[0]["Colonnes"][0].Nom
            var Contrat =[];
            for (i = 0 ; i < 3 ;i++){ 
             Contrat[i] = myNewJSON.Onglets[i]['Titre'];   
            }
            console.log(Contrat);

                //console.log(JSON.stringify(result));
               // return JSON.stringify(result); //JSON
              
                
            }
            reader.readAsText(fileUpload.files[0]);
        } else {
            alert("This browser does not support HTML5.");
        }
    } else {
        alert("Please upload a valid CSV file.");
    }
}
