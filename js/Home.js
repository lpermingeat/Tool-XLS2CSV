var arrSheetTraitement = [];
var nbOnglet=0;
var fileName = "";
var cptOnglet = 0 ;
var clasName = "";
var arrListeHeader = [];
var arrListeValeurs = [];
var boCreateHeader = true;
document.addEventListener('keypress', eventKeypress);
function valuesToGMT(dat){
	for(var i = 0; i < dat.length; i++){
			var datStr = new String(dat[i]) ;
			var d = new Date(dat[i]);
			var n = Math.abs((d.getTimezoneOffset())/60);
			var str=datStr.substr(0, 19);
			dat[i]=[str+"+0"+n+":00"];
	}
	return dat;
}
function eventKeypress(e) {
	if(e.code ==="KeyE"){
		createLinkCSV();
		console.log("Export mode ");
	}
}
function createListCriteriaInv(firstCel,colName,isMandatory){
	//=OR(firstCel="VRAI",firstCel="FAUX",ISBLANK(firstCel))
	var Mand ="FALSE";
	var crit = [];
	var separ = "";
	var cpt=0;
	crit[cpt]="";
	var j = 0;
	for(var i = 0; i < arrListeHeader.length; i++){
		if(arrListeHeader[i]===colName){
			// Colonne de valeur possible
			if(!(isMandatory === "True")){
				Mand ="ISBLANK("+firstCel+")";
			}
			//for(var j = 0; j < arrListeValeurs[j].length; j++){
			while (arrListeValeurs[j][i].length>0) {
				if(crit[cpt].length>400){
					crit[cpt] = "=IF(OR(" + crit[cpt] + "," +Mand+"),TRUE,FALSE)";
					console.log("==> Picklist2 Critère cpt:"+cpt+" = "+  crit[cpt]);
					separ = "";
					cpt++;
					crit[cpt]="";
				}
				if(arrListeValeurs[j][i].length>0){
					crit[cpt] = crit[cpt]+separ+firstCel + '="' + arrListeValeurs[j][i]+'"';
					separ = ",";
				}
				j++;
			}
			crit[cpt] = "=IF(OR(" + crit[cpt] + "," +Mand+"),TRUE,FALSE)";
			console.log("==> Picklist2 Critère cpt:"+cpt+" = "+  crit[cpt]);
		}
	}

	/*for(var i = 0; i < arrListeValeurs.data[0].length; i++){
		console.log("Col name "+i+" : " + arrListeValeurs.data[0][i]);
	}*/
	return crit;
}
function createListCriteria(firstCel,colName,isMandatory){
	//=OR(AND(firstCel<>"VRAI",firstCel<>"FAUX"),ISBLANK(firstCel))
	var Mand ="FALSE";
	var crit = "";
	var separ = firstCel+'<>'+'"",';
	if(isMandatory === "True"){
		Mand ="ISBLANK("+firstCel+")";
	}
	for(var i = 0; i < arrListeHeader.length; i++){
		if(arrListeHeader[i]===colName){
			for(var j = 0; j < arrListeValeurs[i].length; j++){
				if(arrListeValeurs[j][i].length>0){
					crit = crit+separ+firstCel + '<>"' + arrListeValeurs[j][i]+'"';
					separ = ",";
				}
			}
		}
	}
	crit = "=IF(OR(AND(" + crit + ")," +Mand+"),TRUE,FALSE)";
	console.log("Picklist Critère = "+  crit);
	/*for(var i = 0; i < arrListeValeurs.data[0].length; i++){
		console.log("Col name "+i+" : " + arrListeValeurs.data[0][i]);
	}*/
	return crit;
}
function saveCSVData(nom,arrData){
	var colLength = arrData.data[0].length;
}
function createLinkCSV(){
	var sheetName ="";
	var headerTable;
	var table;
	var bodyTable;
	Excel.run(function (context){
		var sheet = context.workbook.worksheets.getActiveWorksheet();
		sheet.onChanged.add(handleChange);
		sheet.load("name");
		return context.sync().then(function () {
			sheetName=sheet.name;
			table = sheet.tables.getItem(sheet.name);
			headerTable = table.getHeaderRowRange().load("values");
			bodyTable = table.getDataBodyRange().load("text");
			
			//console.log(`The active worksheet is "${sheet.name}"`);
			return context.sync(table);
		}).then(function () {
			//var head = headerTable.values[0];
			var jsonFile =JSON.parse(localStorage.getItem("JsonFile"));
			var ongl = jsonFile.Onglets.find(Onglets => {return Onglets.Titre == sheetName});
			var head = getTraductionHeader(headerTable.values[0],ongl);
			ArrayCSV = {fields: head,data: bodyTable.text,};
			downloadCSV(sheetName,sheetName,ArrayCSV);
		});
	}).catch(errorHandlerFunction)
}
function downloadCSV(dbName,name,array)
{
    var csv = Papa.unparse(array,{
		quotes: true, //or array of booleans
		quoteChar: '"',
		escapeChar: ' ',
		delimiter: ",",
		header: true,
		newline: "\r\n",
		skipEmptyLines: false, //or 'greedy',
		columns: null //or array of strings
	});

    var csvData = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    var csvURL =  null;
    if (navigator.msSaveBlob)
    {
        csvURL = navigator.msSaveBlob(csvData, 'download.csv');
    }
    else
    {
        csvURL = window.URL.createObjectURL(csvData);
    }
	var div = document.getElementById('CSVlink');
	var btn = document.createElement('a');
	btn.href = csvURL;
    btn.setAttribute('download', dbName+'.csv');
	btn.setAttribute('target', '_blank');
	var txt = document.createTextNode(name);
    btn.appendChild(txt);
    div.appendChild(btn);
	div.appendChild(document.createElement('br'));
}

function addSheetCSV(name,value){
	Excel.run(function (context) {
		var sheets = context.workbook.worksheets;
		var sheet = sheets.add(name);
		var rangeAddress = "A1:AG103";
		var range = sheet.getRange(rangeAddress);
		//range.getCell(0,0).getAbsoluteResizedRange(value[0].length-1, value.length-1);
		range.values = value.data;
		
		//expensesTable.name = name;

		/*for(var i = 1; i < value.length; i++) 
		{ 
			expensesTable.rows.add(null,[value[i]]);
		}*/
		/*expensesTable.columns.load("items/name");
		expensesTable.load("items/name");
		expensesTable.load("address");*/
		sheet.activate();
    return context.sync()
        .then(function () {
			//console.log(cell.address);
			//var expensesTable = sheet.tables.add(getExcelAddress((value[0].length-1)), true);
			//var expensesTable = sheet.tables.add("A1:"+cell.address, true);
			//expensesTable.getHeaderRowRange().values = [value[0]];
			//expensesTable.getDataBodyRange().values = value;
			document.getElementById("gif_patenter").style.display = "none";
			document.getElementById("lstEtape").innerHTML ="";
            console.log(`Added worksheet named "${sheet.name}" in position ${sheet.position}`);
			return context.sync();
        });
	}).catch(errorHandlerFunction)
}
function errorHandlerFunction(error){
	console.log("Error: " + error);
    if (error instanceof OfficeExtension.Error) {
        console.log("Debug info: " + JSON.stringify(error.debugInfo));
    }
	document.getElementById("gif_patenter").style.display = "none";
	document.getElementById("lstEtape").innerHTML = document.getElementById("lstEtape").innerHTML + "==> KO";
	//setStep();
	console.log("ERREUR ==> "+errHandlerFunction);
}
function getExcelAddress(intLength){
	var strAdr = "A1:";
	var lstLetter = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
	if(intLength < lstLetter.length){
		strAdr = strAdr + lstLetter[intLength] + "1";
	}else{
		var mod = Math.trunc(intLength/lstLetter.length);
		strAdr = strAdr + lstLetter[mod] + lstLetter[intLength-(mod*lstLetter.length)] + "1";
	}
	return strAdr;
}
function loadFile(){
	var config = buildConfig();
	$('#fileConvert').parse({
		config: config,
		before: function(file, inputElem)
		{
			console.log("    load file :", file.name);
			document.getElementById("gif_patenter").style.display = "block";
			fileName = file.name;
			// executed before parsing each file begins;
			// what you return here controls the flow
		},
		error: function(err, file, inputElem, reason)
		{
			document.getElementById("gif_patenter").style.display = "none";
			// executed if an error occurs while loading the file,
			// or if before callback aborted for some reason
		},
		complete: function()
		{
			// executed after all files are complete
		}
	});
}
function buildConfig()
{
	return {
		delimiter: ",",	// auto-detect
		newline: "",	// auto-detect
		quoteChar: '"',
		escapeChar: '"',
		header: false,
		transformHeader: undefined,
		dynamicTyping: false,
		preview: 0,
		encoding: "UTF8",
		worker: false,
		comments: false,
		step: undefined,
		complete: completeFn,
		error: undefined,
		download: false,
		downloadRequestHeaders: undefined,
		downloadRequestBody: undefined,
		skipEmptyLines: false,
		chunk: undefined,
		fastMode: undefined,
		beforeFirstChunk: undefined,
		withCredentials: undefined,
		transform: undefined,
		delimitersToGuess: [',', '\t', '|', ';', Papa.RECORD_SEP, Papa.UNIT_SEP]
	};
}
function completeFn(results)
{
	if (results && results.errors)
	{
		if (results.errors)
		{
			errorCount = results.errors.length;
			firstError = results.errors[0];
		}
		if (results.data && results.data.length > 0)
			rowCount = results.data.length;
	}
	if(fileName ===""){
	}else{
		addSheetCSV(fileName,results.data);
	}
	console.log("    Results:", results);
}

function init(){
      console.log("Start load json files ...");
	  document.getElementById("gif_patenter").style.display = "none";
      var data = getUrlSync("./json/00_list_type_import.json","json");
	  localStorage.setItem("Liste_Contrat",JSON.stringify(data));
      var Liste_Contrat= localStorage.getItem("Liste_Contrat");
      var Liste_Contrat =JSON.parse(Liste_Contrat);
      var ListeC = document.getElementById('ListeContrat');

	  // Chargement de la liste des fichiers JSON contenu dans 00_list_type_import.json
      for (var i = 0 ; i < Liste_Contrat.objects.length ; i++) {
        var Contrat = Liste_Contrat.objects[i].name;
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(Contrat) );
        opt.value = 'option value'; 
        ListeC.appendChild(opt); 
      }
      onChangeJSON();
}
///////////////////////////////
function onChangeJSON(){
    console.log("Load JSON file");
	var strDivId = "accordionId";
    IdL=document.getElementById("ListeContrat").options.selectedIndex
    var Lc= localStorage.getItem("Liste_Contrat");
    var Lc =JSON.parse(Lc);
    var JsonFile=Lc.objects[IdL].json
	var data = getUrlSync(JsonFile,"json");
	localStorage.setItem("JsonFile",JSON.stringify(data));
	clearTableOnglet(strDivId);
	addHtml(strDivId,"Description",data.Description);
	//data.Colonnes[j].Formule
	var arrayListOnglet = new Array();
    for (i=0; i<data.Onglets.length;i++){
		var c1=data.Onglets[i].Titre
		var strTxt = data.Onglets[i].Description + "<BR>"
		var txt ;
		if(!(data.Onglets[i].Colonnes===undefined)&&!(data.Onglets[i].visible==="false")){
			for (j=0; j<data.Onglets[i].Colonnes.length;j++){
				if(!(data.Onglets[i].Colonnes[j].Formule===undefined)){
					txt = data.Onglets[i].Colonnes[j].Formule;
				}else
				{	txt = data.Onglets[i].Colonnes[j].Aide;}
				strTxt = strTxt + "<li><b>" + data.Onglets[i].Colonnes[j].Nom +"</b> : " + txt +"</li>" ;
			}
		}
		addHtml(strDivId,c1,strTxt);
		arrayListOnglet.push(c1);
		//insertRowOnglet(c1);
		//var L1 = document.getElementById("Lbl" + i);
		//L1.textContent=c1;
    }
	localStorage.setItem("arrayListOnglet",JSON.stringify(arrayListOnglet));
	localStorage.setItem("arrayListOngletSelected",JSON.stringify(arrayListOnglet));
}

function addHtml(strDivId,strTitre,strText){
	var html = document.getElementById(strDivId);
	var start = "<a style=\"height:35px;width:100%;text-align: left;\" class=\"btn btn-primary\" data-toggle=\"collapse\" href=\"#multiCollapse"+strTitre+"\" role=\"button\" aria-expanded=\"true\" aria-controls=\"multiCollapse"+strTitre+"\">";
	var milde = "</a><div class=\"collapse multi-collapse\" id=\"multiCollapse"+strTitre+"\"><div class=\"card card-body\">";
	var end = "</div></div>";
	var addRow = start+strTitre+milde+strText+end;
	html.innerHTML = html.innerHTML+addRow;
}
function insertRowOnglet(title){
	var Table = document.getElementById("listeOnglet");
	var addRow = "<tr><th scope=\"row\"><input onchange=\"onChangeCheked(this);\" class=\"form-check-input\" type=\"checkbox\" value=\""+title+"\" checked=\"true\" id=\"idCheck"+title+"\"></th><td><label id=\"Lb"+title+"\">"+title+"</label></td></tr>";
	Table.innerHTML = Table.innerHTML+addRow;
}
function clearTableOnglet(strID){
	var html = document.getElementById(strID);
	html.innerHTML = "";
}
function onChangeCheked(checkbox){
	var arrayListOnglet = JSON.parse(localStorage.getItem("arrayListOngletSelected"));
	if(checkbox.checked){
		arrayListOnglet.push(checkbox.value);
	}else{
		arrayListOnglet.splice(arrayListOnglet.indexOf(checkbox.value), 1);
	}
	localStorage.setItem("arrayListOngletSelected",JSON.stringify(arrayListOnglet));
}
/////////////////////////////

function getExcelColonneStr(strHeader,strAide,strValue,cptRow) {
	var tableau = [];
	var tHeader = [];
	var tAide = [];
	var tValue = [];
	tHeader.push(strHeader);
	tAide.push(strAide);
	tValue.push(strValue);
	tableau.push(tHeader);
	tableau.push(tAide);
	for(var k = 1; k < cptRow; k++){
		tableau.push(tValue);
	}
    return tableau;
}
function getExcelColonneFormuleStr(strValue,cptRow) {
	var tableau = [];
	var tValue = [];
	tValue.push(strValue);
	for(var k = 0; k < cptRow; k++){
		tableau.push(tValue);
	}
	//console.log("tableauFormule = " + tableau);
	return tableau;
}
 function getUrlSync(url,format){
    var jqxhr = $.ajax({
        type: "GET",
        url: url,
        dataType: format,
        cache: false,
        async: false
    });

    // 'async' has to be 'false' for this to work
	
    var response = '';
	if(format==="json"){
		response = jqxhr.responseJSON;
	}else{
		response = jqxhr.responseText;
	}
    return response;
} 
function setStep(){
	var step = arrSheetTraitement.length;
	var okko = "";
	if(!boCreateHeader){step = (nbOnglet-step)+nbOnglet}else{step=nbOnglet-step}
	
	if(!(document.getElementById("gif_patenter").style.display=== 'block')){
		if(step = (nbOnglet*2)){
			okko = " ==> OK";
		}else{
			okko = " <==> KO";
		}
	}
	document.getElementById("lstEtape").innerHTML = "Etape "+step+" / "+(nbOnglet*2) + okko;
}
function loadValue(){
	cptOnglet = 1 ;
	boCreateHeader = true;
	document.getElementById("CSVlink").innerHTML = "";
	document.getElementById("gif_patenter").style.display = "block";
	arrSheetTraitement = JSON.parse(localStorage.getItem("arrayListOngletSelected"));
	nbOnglet = arrSheetTraitement.length;
	setStep();
	verifFile(arrSheetTraitement.shift());
}
/** 
 * @description
 * @param
 * @return
 */
function fusionRefFile(){
	var myFile = document.getElementById("file");
	var reader = new FileReader();

	reader.onload = (event) => {
		Excel.run((context) => {
			// strip off the metadata before the base64-encoded string
			var startIndex = reader.result.toString().indexOf("base64,");
			var workbookContents = reader.result.toString().substr(startIndex + 7);

			var sheets = context.workbook.worksheets;
			sheets.addFromBase64(
				workbookContents,
				null, // get all the worksheets
				Excel.WorksheetPositionType.after, // insert them after the worksheet specified by the next parameter
				sheets.getActiveWorksheet() // insert them after the active worksheet
			);
			return context.sync();
		});
	};

	// read in the file as a data URL so we can parse the base64-encoded string
	reader.readAsDataURL(myFile.files[0]);
}
function handleChange(event)
{
	if(!(document.getElementById("gif_patenter").style.display=== 'block')){
		document.getElementById("CSVlink").innerHTML = "";
		document.getElementById("lstEtape").innerHTML ="";
	}
    /*return Excel.run(function(context){
        return context.sync()
            .then(function() {
                console.log("Change type of event: " + event.changeType);
                console.log("Address of event: " + event.address);
                console.log("Source of event: " + event.source);
            });
    }).catch(errorHandlerFunction);*/
}
/** 
 * @description
 * @param
 * @return
 */
function verifFile(sheetName){
	console.log("Start verifFile : " + sheetName);
	var arrayListOnglet = JSON.parse(localStorage.getItem("arrayListOnglet"));
	Excel.run(function (context) {
		var arrayListOnglet = JSON.parse(localStorage.getItem("arrayListOngletSelected"));
		var sheets = context.workbook.worksheets;
		var sheet;
		var table;
		var tables = context.workbook.tables;
		var headerTable;
		var bodyTable;
		var columnsList =[];
		var columnsListData =[];
		var headerRange;
		var systemDecimalSeparator ;
		var valueTabCount;
		var onglet;
		var csvFile;
		var GMTList=[];
		var jsonFile =JSON.parse(localStorage.getItem("JsonFile"));

		sheets.load("items/name");
		context.workbook.load("name");
		context.application.cultureInfo.numberFormat.load("numberDecimalSeparator");
		context.application.suspendScreenUpdatingUntilNextSync();
		return context.sync()
			//***** Vérification de l'existance des onglets
			.then( function () {
				console.log("Vérification de l'existance des onglets");
				clasName = context.workbook.name;
				clasName = clasName.substring(0, clasName.indexOf("."));
				systemDecimalSeparator = context.application.cultureInfo.numberFormat.numberDecimalSeparator;
				if(boCreateHeader){
					for (i = 0 ; i < arrayListOnglet.length ; i++){ 
						var C1 = true;//document.getElementById("idCheck" + arrayListOnglet[i]).checked
						var L1 = arrayListOnglet[i];
						if (C1 ==true){
							var Find= false;
							for (var j in sheets.items) {
								AddSheet=sheets.items[j].name;
								if (AddSheet === L1 ){Find=true};
									sheets.items[j].activate();
								}
							if (Find==false){ 
								console.log(L1 + " créé");
								var varSheet = sheets.add(L1);
								varSheet.load("name, position");
							}
						}
					}
				}
				sheets.load("items/name");
				tables.load("items/name");
				return context.sync();
			})
			//***** Création des tableaux
			.then(function () {
					console.log("Création des tableaux");
					var tablesName =[];
					for(var i = 0; i < tables.items.length; i++) 
					{ 
						tablesName.push(tables.items[i].name);
					}
					sheets.items.forEach( function (varSheet) {
						if(varSheet.name==sheetName){
							sheet=varSheet;
						}
					});
					sheet.activate();
					onglet = jsonFile.Onglets.find(Onglets => {return Onglets.Titre == sheet.name});
					sheet.onChanged.add(handleChange);
					if(!(tablesName.indexOf(sheet.name)>-1)){
						table = sheet.tables.add(sheet.getUsedRange(), true);
						table.name = sheet.name;
					}else{
						table = sheet.tables.getItem(sheet.name);
					}
				headerTable = table.getHeaderRowRange().load("values");
				//bodyTable = table.getDataBodyRange().load("values");
				bodyTable = table.getDataBodyRange().load("rowCount");
				sheets = context.workbook.worksheets;
				sheets.load("items/name");
				table.columns.load("items/name");
				return context.sync();
			})
			//***** Création des entête de colonne
			.then(function (){
				console.log("Création des entête de colonne");
				var jsonFile =JSON.parse(localStorage.getItem("JsonFile"));
				//localStorage.setItem(sheetName+"_tableHeader",JSON.stringify(headerTable.values));
				//localStorage.setItem(sheetName+"_tableValue",JSON.stringify(bodyTable.values));
				var headerTabCount = headerTable.values[0].length;
				//valueTabCount = bodyTable.values.length;
				valueTabCount = bodyTable.rowCount;
				console.log("headerTabCount = "+headerTabCount);
				console.log("valueTabCount = "+valueTabCount);
				onglet = jsonFile.Onglets.find(Onglets => {return Onglets.Titre == sheet.name})
				var tableau = [];
				var colLength ;
				var colHeader="";
				var colAide = "";
				var colVal = "";
				var colForm;
				var keys;
				var jsondat;
				
				// Cas du chargement d'un fichier CSV
				if(!(onglet.URLCSVData===undefined)){
					var csvString = getUrlSync(onglet.URLCSVData,"text");
					csvFile = Papa.parse(csvString, buildConfig());
					if(onglet.Titre==="ListeValeurs"){
						arrListeValeurs = csvFile.data;
						arrListeHeader = csvFile.data[0];
					}
					colLength = csvFile.data[0].length;
					keys = csvFile.data[0];
					csvFile.data.shift();
					colAide = "";
					colVal = "";
					//table.getHeaderRowRange().values = results.data[0];
					//table.getDataBodyRange().values = results.data[1];
				}else if(onglet.URLJSONData===undefined){
						colLength = onglet.Colonnes.length;
				}else{
					jsondata = getUrlSync(onglet.URLJSONData,"json");
					keys = Object.keys(jsondata.Data[0]);
					colLength =keys.length;
				}
				
					for(var j = 0; j < colLength; j++){
						
						//*****	Chargement des valeurs
						if(onglet.URLJSONData===undefined && onglet.URLCSVData===undefined){
							colHeader = onglet.Colonnes[j].Nom;
							colAide = "";//onglet.Colonnes[j].Aide;
							if(!(onglet.Colonnes[j].Value===undefined)){
								colVal = onglet.Colonnes[j].Value;
								colAide = colVal;
							}							
						}else if (!(onglet.URLJSONData===undefined)||!(onglet.URLCSVData===undefined)) {
							colHeader = keys[j];
							colAide = "";
							colVal = "";
						}
						
						//*****	Chargement ou création de la Colonne
						var col;
						if(!(headerTable.values[0].indexOf(colHeader)>-1)){
							col = table.columns.add(null,getExcelColonneStr(colHeader,colAide,colVal,valueTabCount));
						}else{
							col = table.columns.getItem(colHeader);
						}
						if(!(onglet.Colonnes===undefined) && !(onglet.Colonnes[j].Formule===undefined)){
							//BUG : Si le nombre de ligne dépasse 2500 (1000 = marge) : Met l'onglet en rouge pour signalement qu'il faut remplir les formules
							if(valueTabCount<1000){
								col.getDataBodyRange().formulasLocal = getExcelColonneFormuleStr(onglet.Colonnes[j].Formule,valueTabCount);
							}else{sheet.tabColor = "#FF0000";}
						}
						if(!(onglet.Colonnes===undefined) && !(onglet.Colonnes[j].Format===undefined)){
							col.getDataBodyRange().numberFormat = [[onglet.Colonnes[j].Format]];
						}
						tableau = [];
					}
					
					//***** Suppression de la colonne "Colonne1" créé par défaut si l'onglet était vide // ATTENTION: Si Excel est dans une autre langue cela ne fonctionne plus 
					if(valueTabCount==1 && table.columns.items[0].name=="Colonne1"){
						var column = table.columns.items[0];
						column.delete();
					}
				//table.getDataBodyRange().numberFormat = [["@"]];
				sheets.load("items/name");
				tables.load("items/name");
				table.columns.load("items/name");
				table.load("address");
				//headerRange = table.getHeaderRowRange().load("values");
				return context.sync();
			})
			.then(function (){
				console.log("Mise en forme");
				//*****	Chargement du CSV
					columnsList = [];
					columnsListData = [];
					if(!(csvFile===undefined)&&boCreateHeader){
						table.getDataBodyRange().numberFormat = [["@"]];
						table.rows.add(null,csvFile.data);
					}
					if(onglet.URLCSVData===undefined && !(onglet.Colonnes===undefined)){
						for(var i = 0; i < onglet.Colonnes.length; i++){
							if(onglet.Colonnes[i].Validation==="Datetime2GMT"){
								var colHeader = onglet.Colonnes[i].Nom;
								var col = table.columns.getItem(colHeader);
								var cptInd = 0;
								for(var j = 0; j < headerTable.values[0].length; j++){
									if(headerTable.values[0][j]===colHeader){
										columnsListData[j] = col.getDataBodyRange().load("text");
										console.log("Colonne Datetime2GMT = " + colHeader);
									}
								}
							}
						}
					}
					for(var j = 0; j < table.columns.items.length; j++){
						columnsList[j] = table.columns.items[j].getDataBodyRange().getCell(0.0).load("address");
					}
				headerRange = table.getHeaderRowRange().load("values");
				return context.sync();
			})			
			.then(function (){
				//*****	Controle des données
				console.log("Parcour des colonnes");
				if(!boCreateHeader){
					console.log("Ajout des controles de formats");
					var headerValues = headerRange.values;
					//var jsonFile =JSON.parse(localStorage.getItem("JsonFile"));
					//onglet = jsonFile.Onglets.find(Onglets => {return Onglets.Titre == sheet.name})
					if(onglet.URLCSVData===undefined){
						var colLength = onglet.Colonnes.length;
						console.log("Colonne Adresse" + columnsList[1].address);
						//***** Chargement de la mise en forme conditionnelle
						// A FAIRE
						// => Text(40)
						// => Picklist
						// => Number(0,0) & Currency(0,0)
						// => Lookup(table,table)
						// => Date
						// => Datetime
						// => Ckeckbox
						// => Phone
						// => Url
						// => Address
						
						//***** Test si Mandatory
						// ==> A FAIRE
						var conditionalFormat=[];
						var cellFormat=[];
						var cpt = 0;
						for(var j = 0; j < colLength; j++){
							var colHeader = onglet.Colonnes[j].Nom;
							var col = table.columns.getItem(colHeader);
							if(!(onglet.Colonnes===undefined) && !(onglet.Colonnes[j].Validation===undefined) && !(col===undefined)){
								var val = getFirtWord(onglet.Colonnes[j].Validation);
								var Par = getParameter(onglet.Colonnes[j].Validation);
								var Mand = "False";
								if(!(onglet.Colonnes[j].Mandatory===undefined)){Mand = onglet.Colonnes[j].Mandatory ;}
								var critMand = "False";
								var addrFirtCell = getAddressFirtCell(columnsList,headerValues[0],colHeader);
								if(val==="Date"){val = "Datetime";}
								//else if(val==="Checkbox"){val = "Picklist"; Mand = "True"; Par[0]="Vrai_Faux";}
								switch (val) {
								  case 'Text':
									if(Mand === "True"){critMand = 'LEN('+addrFirtCell+')<1';}
									conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = '=IF(OR(LEN('+addrFirtCell+')>'+Par+','+critMand+'),True)';
									conditionalFormat[j].custom.format.fill.color = "red";
									break;
								  case 'Number':
									if(Mand === "True"){critMand = 'LEN('+addrFirtCell+')<1';}
									conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = '=IF(IFERROR(SEARCH(",",'+addrFirtCell+')<0,TRUE),OR(LEN('+addrFirtCell+')>'+Par[0]+','+critMand+',IF(LEN('+addrFirtCell+')>0,NOT(ISNUMBER('+addrFirtCell+')),FALSE)),OR((LEN(RIGHT('+addrFirtCell+',LEN('+addrFirtCell+')-SEARCH(",",'+addrFirtCell+'))))>'+Par[1]+',(LEN(LEFT('+addrFirtCell+',SEARCH(",",'+addrFirtCell+')-1)))>'+Par[0]+','+critMand+',IF(LEN('+addrFirtCell+')>0,NOT(ISNUMBER('+addrFirtCell+')),FALSE)))';
									conditionalFormat[j].custom.format.fill.color = "red";
									break;
								  case 'Picklist':
									/*if(Mand === "True"){critMand = 'ISTEXT('+addrFirtCell+')';}else{critMand = "FALSE";};
									var listCrit = createListCriteria(onglet.Colonnes[j].List);*/
									var crit = createListCriteria(addrFirtCell,Par[0],Mand);
									
									conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = crit;
									conditionalFormat[j].custom.format.fill.color = "red";
									
									// EXEMPLE POUR FAIRE UNE LISTE DE SELECTION... PROBLEME DE SAUVEGARDE !!
									/*var listVal = onglet.Colonnes[j].List;
									conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = '=IFERROR(MATCH('+addrFirtCell+',{'+getListDoubleQuote(listVal)+'},0),TRUE)';
									console.log("FORMULE= "+ 'IFERROR(MATCH('+addrFirtCell+',{'+getListDoubleQuote(listVal)+'},0),TRUE)');
									conditionalFormat[j].custom.format.fill.color = "red";
									
									cellFormat[j] = col.getDataBodyRange();
									cellFormat[j].dataValidation.rule = {list: {inCellDropDown: true,source: listVal}};*/
									break;
								  case 'Picklist2':
									/*if(Mand === "True"){critMand = 'ISTEXT('+addrFirtCell+')';}else{critMand = "FALSE";};
									var listCrit = createListCriteria(onglet.Colonnes[j].List);*/
									var crit = createListCriteriaInv(addrFirtCell,Par[0],Mand);
									var obj = [];
									for(var k = 0; k < crit.length; k++){
										col.getDataBodyRange().format.fill.color = "red";
										obj[k] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
										obj[k].custom.rule.formula = crit[k];
										obj[k].custom.format.fill.color = "white";
									}
									break;
								  case 'Lookup':
									/*if(Mand === "True"){critMand = 'LEN('+addrFirtCell+')<1';}*/
									/*conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = '=IF(ISNA(VLOOKUP('+addrFirtCell+','+Par[0]+'[ID_Externe],1)),TRUE,IF(EXACT(VLOOKUP('+addrFirtCell+','+Par[0]+'[ID_Externe],1),'+addrFirtCell+'),FALSE,TRUE))';
									conditionalFormat[j].custom.format.fill.color = "red";*/
									break;
								  case 'VERIF':
									if(Mand === "True"){critMand = addrFirtCell+'=0';}else{critMand = "FALSE";};
									conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = '=IF(OR(NOT('+addrFirtCell+'),'+critMand+'),TRUE)';
									conditionalFormat[j].custom.format.fill.color = "red";
									break;
								  case 'Formule':
									if(Mand === "True"){critMand = 'LEN('+addrFirtCell+')<1';}
									conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = '=IF(OR('+Par+','+critMand+'),TRUE)';
									conditionalFormat[j].custom.format.fill.color = "red";
									break;
								  case 'Datetime':
									// Salesforce Date format : YYYY-MM-DDThh:mm:ssZ ==> https://help.salesforce.com/articleView?id=000325035&language=en_US&type=1&mode=1
									conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = '=TEXT('+addrFirtCell+',"YYYY-MM-DDThh:mm:ssZ")='+addrFirtCell;
									conditionalFormat[j].custom.format.fill.color = "red";
									
									cellFormat[j] = col.getDataBodyRange();
									cellFormat[j].numberFormat = getExcelColonneFormuleStr("YYYY-MM-DDThh:mm:ssZ",valueTabCount);
									cellFormat[j].format.autofitColumns();
									break;
								  case 'Datetime2GMT':
									GMTList[cpt]=j;
									var lst = valuesToGMT(columnsListData[j].text);
									console.log("Colonne Values =====> "+lst);
									table.columns.items[j].getDataBodyRange().values = lst;
									cpt++;
									break;
								  case 'Checkbox':
									//=OR(AND(firstCel<>"VRAI",firstCel<>"FAUX"),ISBLANK(firstCel))
									conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = '=IF(OR('+addrFirtCell+'=0,'+addrFirtCell+'=1),FALSE,TRUE)';
									conditionalFormat[j].custom.format.fill.color = "red";
									break;
								  case 'Phone':
									break;
								  case 'Email':
									conditionalFormat[j] = col.getDataBodyRange().conditionalFormats.add(Excel.ConditionalFormatType.custom);
									conditionalFormat[j].custom.rule.formula = '=NOT(AND(NOT(ISERROR(FIND("@",'+addrFirtCell+'))),NOT(ISERROR(FIND(".",'+addrFirtCell+'))),ISERROR(FIND(" ",'+addrFirtCell+'))))';
									conditionalFormat[j].custom.format.fill.color = "red";
									break;
								  case 'Address':
									break;
								  default:
								}
								//conditionalFormat.custom.format.fill.color = "red";
							}
						}
					}
				}
				headerTable = table.getHeaderRowRange().load("values");
				if(valueTabCount<1000){
					bodyTable = table.getDataBodyRange().load("text");
				}
				if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
					sheet.getUsedRange().format.autofitColumns();
					sheet.getUsedRange().format.autofitRows();
				}
				return context.sync();
//			}).then(function () {
//			if(valueTabCount<1000){
//				for(var i = 0; i < GMTList.length; i++){
//					var intCol= GMTList[i];
//					console.log("GMTList NB COL =====> "+intCol);
//					console.log("bodyTable.text.length =====> "+bodyTable.text.length);
//					for(var j = 0; j < bodyTable.text.length; j++){
//						var dat = bodyTable.text[j][intCol];
//						dat = valuesToGMT(dat);
//						console.log("DATE =====> "+dat);
//						bodyTable.text[j][intCol]=dat;
//						//table.getDataBodyRange().text[j][intCol]=dat;
//					}
//				}
//				bodyTable = table.getDataBodyRange().load("text");
//			}
//			return context.sync(table);
			}).then(function () {
				if(onglet.URLCSVData===undefined && !boCreateHeader && valueTabCount<1000){
					var head = getTraductionHeader(headerTable.values[0],onglet);
					ArrayCSV = {fields: head,data: bodyTable.text,};
					downloadCSV(clasName+"_"+cptOnglet+"_"+onglet.ApiDBName,sheetName,ArrayCSV);
					cptOnglet = cptOnglet +1;
				}
				if(arrSheetTraitement.length>0){
					verifFile(arrSheetTraitement.shift());
				}else{
					if(boCreateHeader){
						boCreateHeader=false;
						arrSheetTraitement = JSON.parse(localStorage.getItem("arrayListOngletSelected"));
						verifFile(arrSheetTraitement.shift());
					}else{
						document.getElementById("gif_patenter").style.display = "none";
						document.getElementById("lstEtape").innerHTML ="";
					}
				}
				setStep();
			});
	}).catch(errorHandlerFunction);
}
function getTraductionHeader(arrHead,ongl){
	for(var j = 0; j < ongl.Colonnes.length; j++){
		
		var index = arrHead.indexOf(ongl.Colonnes[j].Nom);
		if (index !== -1) {
			arrHead[index] = ongl.Colonnes[j].ApiName;
		}
	}
	return arrHead;
}
function getListDoubleQuote(list){
		list.split('"').join('');
		var arrList = list.split(",");
		list="";
		for(var j = 0; j < arrList.length; j++){
			if(j>0){list = list+',"'+arrList[j]+'"'}else{list = '"'+arrList[j]+'"'}
		}
		return list;
}
function getAddressFirtCell(arr,headerArr,values){
	for(var j = 0; j < headerArr.length; j++){
		if(headerArr[j]===values){
			var addr = arr[j].address;
			addr = addr.substring(addr.indexOf("!")+1,addr.length);
			//console.log("This cell = "+ addr);
			return addr;
		}
	}
}
function getFirtWord(param){
	if(param.indexOf("(")>-1){
		param = param.substring(0, param.indexOf("("));
	}
	return param.split(' ').join('');
}
function getParameter(param){
	var param = param.substring((param.indexOf("(")+1),param.indexOf(")"));
	return param.split(",");
}
/** 
 * @description
 * @param
 * @return
 */
function Start(){
  console.log("Start");

  var Nbli = Nblx();
  var Colj = Coly();

  setTimeout(function(){ 
    
    Nbli=localStorage.getItem("Nbli");
    Colj=localStorage.getItem("Colj");
    console.log(" Test Nbl : " + Nbli);
    console.log(" Test Nbc : " + Colj);
    
  //  Nbli = 22;
    Colj= 5;

      // for (Colj=0; Colj < 3; Colj++){
          Clear(Nbli,Colj);
          Verif(Nbli,Colj);
      // }  
      console.log("This is the end"); 
  }, 1000);
 
}

/** 
 * @description Effacement des cellules coloriées
 * @param
 * @return
 */
function Clear(Nbli,Colj){
    console.log("Start Clear");
    var RangeT = RangeTrait(Nbli,Colj);

    Excel.run(function (context) {

      console.log("Clear : " + RangeT);
        var Range2 = context.workbook.worksheets.getActiveWorksheet().getRange(RangeT).load("values,address"); 
        var sheet = context.workbook.worksheets.getActiveWorksheet();
        // context.workbook.comments.getItemByCell("Data!A2").delete();
        //Range.comments.delete();
        return context.sync().then(function () { 
          console.log(RangeT);
          Range2.format.fill.color= "#FFFFFF" //"white";
          console.log("Clear fini"); 
        }); 
     })//.catch(function (error) { 
       // console.log(error); 
     //});
}

/** 
 * @description Convertion ligne colonne en Adresse Range
 * @param
 * @return
 */
function RangeTrait(NbLigne,NumCol){
  var TextCol = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","R","S","T","U","V","W","X","Y","Z"];
  var Colonne = TextCol[NumCol];
  var RangeT = Colonne + "1:" + Colonne + NbLigne;
  return RangeT;
}

/** 
 * @description Click sur le bouton vérifier
 * @param
 * @return
 */
function Verif(Nbli,Colj){
  Excel.run(function (context) {
    console.log("Start vérif");

    var NbError = 0;
    var RangeT = RangeTrait(Nbli,Colj);
    var _range = context.workbook.worksheets.getActiveWorksheet().getRange(RangeT).load("values,address");

      return context.sync().then(function () { 

        GetJson(Colj);
        console.log("Nom Colo : " + Name_Colonne);
        var rangeH = context.workbook.worksheets.getActiveWorksheet().getCell(0,Colj); 
        var Colo_ex =_range.values[0][0];
        console.log("Colo Ex : " + Colo_ex);
         if (Name_Colonne !== Colo_ex){
          rangeH.format.fill.color = 'yellow';
         }

          for (var i=1; i<Nbli;i++){
            var Cellv=_range.values[i][0];
            var CellC = ("Prénom" + ":" + Cellv);
            var range = context.workbook.worksheets.getActiveWorksheet().getCell(i,Colj);
            //var Result =validate.validators.datetime(Cellv, {datetime: true});  
              var Result = validate.single(Cellv, Constraints);
            if (typeof Result !== 'undefined'){
                  //  console.log("Erreur ligne :" + ( i+ 1)); 
                     range.format.fill.color = 'red';
                     NbError ++; 
                     // var comments = context.workbook.comments;
                     // comments.add(range, "Erreur 99");
                    var Error1 = Result[0];
                   // console.log(Error1);
              }
          } 
        console.log("Vérif Terminé : " + NbError + " Erreurs" + " - Colonne : " + Colj);
        //MsgBox(); 
      }); 
   })//.catch(function (error) { 
     // console.log(error); 
   //});
  } 

/** 
 * @description 
 * @param
 * @return
 */ 
 function ErrorV(i) {console.log("Erreur ligne :" + ( i+ 1));
                                //  NbError ++;                           
                                //  range.format.fill.color = 'red';
 }              

/** 
 * @description 
 * @param
 * @return
 */
function Ecriture_Range() {
	console.log("Start method : Ecriture_Range");
    Excel.run(function (context) {
        var sheetName = 'Data';
        var rangeAddress = 'A1:A2000';
        var worksheet = context.workbook.worksheets.getItem(sheetName);
    
        var range = worksheet.getRange(rangeAddress);
        range.numberFormat = 'm/d/yyyy';
        range.values = '3/11/2015';
        range.load('text');
    
        return context.sync()
          .then(function () {
            console.log(range.text);
        });
    }).catch(function (error) {
        console.log('Error: ' + error);
        if (error instanceof OfficeExtension.Error) {
          console.log('Debug info: ' + JSON.stringify(error.debugInfo));
        }
    });
} 

/** 
 * @description 
 * @param
 * @return
 */
function Affiche_le_Range_Sélectionné() {
    Excel.run(function (context) {
        var selectedRange = context.workbook.getSelectedRange();
        selectedRange.load('address');
        return context.sync()
          .then(function () {
            console.log('The selected range is: ' + selectedRange.address);
        });
    }).catch(function (error) {
        console.log('error: ' + error);
        if (error instanceof OfficeExtension.Error) {
            console.log('Debug info: ' + JSON.stringify(error.debugInfo));
        }
    });
} 
//////////////////////////////////
// Ouvrir une fenetre dialogue HTML
function MsgBox() {
    console.log("Hello");
    // document.write('Hello World!');
    Office.context.ui.displayDialogAsync('https://localhost/Test/Exemple1_validate.html', {height: 30, width: 20,  displayInIframe: true});
    // app.showNotification ("titre", "Hello");
    }    


function NewSheet(){
	Excel.run(function (context) {
		var arrayListOnglet = JSON.parse(localStorage.getItem("arrayListOngletSelected"));
		var sheets = context.workbook.worksheets;
		sheets.load("items/name");
		return context.sync()
			.then( function () {
				for (i = 0 ; i < arrayListOnglet.length ; i++){ 
					var C1 = document.getElementById("idCheck" + arrayListOnglet[i]).checked
					//var L1 = document.getElementById("Lbl" + arrayListOnglet[i]);
					//var L1 = L1.textContent;
					var L1 = arrayListOnglet[i];
					if (C1 ==true){
						var Find= false;
						for (var j in sheets.items) {
							AddSheet=sheets.items[j].name;
							if (AddSheet === L1 ){Find=true};                     
							}
						if (Find==false){ 
							console.log(L1 + " créé");
							var sheet = sheets.add(L1);
							sheet.load("name, position");
						}
					}
				}
			//    console.log(`Added worksheet named "${sheet.name}" in position ${sheet.position}`);
			});
	})//.catch(errorHandlerFunction);
}

///////////////////////////////////////////////
function Nblx(){
  Excel.run(function (context) {
    var sheet = context.workbook.worksheets.getActiveWorksheet();
    var range = sheet.getUsedRange();
    range.load("rowCount");
    return context.sync()
        .then(function () {
          var Nbli = range.rowCount;
          localStorage.setItem("Nbli",Nbli);
        });
  })//.catch(errorHandlerFunction);
}
//////////////////////////////////////////////
function Coly(){
  Excel.run(function (context) {
    var sheet = context.workbook.worksheets.getActiveWorksheet();
    var range = sheet.getUsedRange();
    range.load("columnCount");
    return context.sync()
        .then(function () {
          var Colj = range.columnCount;
        //  console.log("Col count : " + Colj);
          localStorage.setItem("Colj",Colj)
        });
  })//.catch(errorHandlerFunction);
}

//////////////////////////////////////////////////////
//Selection Range
function SelectRange (Range){
  Excel.run(function (context) {
    var sheet = context.workbook.worksheets.getActiveWorksheet();
    sheet.getRange(Range).select();
    return context.sync()
    //Range
        .then(function () {
        });
  })
}

////////////////////////////////////////////
// Insertion Fichier
function InsertFile(){
  SelectRange("A1");

  setTimeout(function(){ 
    var ImportF = [["Hello","coucou"],["Hello1","coucou1"]];
    console.log(ImportF);  
    Office.context.document.setSelectedDataAsync(ImportF,
                function (asyncResult) {
                    var error = asyncResult.error;
                    if (asyncResult.status === "failed") {
                    }
                    else {
                        console.log("ok");
                    }
                });
      },1000);     
        }


////////////////////////////
function run1() {

    Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Failed) {
        console.error(asyncResult.error.message);
      } else {
        console.log(`The selected data is "${asyncResult.value}".`);
      }
    });
  }



///////////////////////////////////////////////////////  
//Effacement Commentaire
function DelCom(d,c){
     Excel.run(function (context) {
       var Comm = (d+ "!A" + c);
      //console.log(Comm)
       return context.sync();
       context.workbook.comments.getItemByCell(Comm).delete();
   
     });
}

//////////////////////////////////////////////////////////////////

  function Verif_File(){
    console.log("Vérifivcation");
    var fileUpload = document.getElementById("fileConvert");
    
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
            }
            reader.readAsText(fileUpload.files[0]);
        } else {
            console.log("This browser does not support HTML5.");
        }
    } else {
        console.log("Please upload a valid CSV file.");
    }
}

///////////////////////////////////////////////

function GetJson(Colj){
  var JsonFile= localStorage.getItem("JsonFile");
  var JJ =JSON.parse(JsonFile);
  return [Name_Colonne = JJ.Onglets[0].Colonnes[Colj].Nom,
         Constraints = JJ.Onglets[0].Colonnes[Colj].Constraints
        ]
}

///////////////////////////////////////
// Désactivé avec le validatejs (Pour test)
/* validate.extend(validate.validators.datetime, {
  // The value is guaranteed not to be null or undefined but otherwise it
  // could be anything.
  parse: function(value, options) {
    return +moment.utc(value);
  },
  // Input is a unix timestamp
  format: function(value, options) {
    var format = options.dateOnly ? "DD/MM/YYYY" : "DD/MM/YYYY hh:mm:ss";
    return moment.utc(value).format(format);
  }
});*/

/////////////////////////////
function VerifOng(){
  console.log("Vérif");

  Excel.run(function (context) {
    var sheetName1 = 'Contrat1';
    var rangeAddress = 'A1';
    var worksheet = context.workbook.worksheets.getItem(sheetName1);

    var range = worksheet.getRange(rangeAddress).value;
    return context.sync()
    console.log(range);
  })
}

///////////////////////////////////////////
function SelectSheet(Sheetname){
Excel.run(function (context) {
  var sheet = context.workbook.worksheets.getItem(Sheetname);
  sheet.activate();
  sheet.load("name");

  return context.sync()
      .then(function () {
          console.log(`The active worksheet is "${sheet.name}"`);
      });
})
}
////////////

function CompareCol(){

  console.log("RechercheV ...");
  ListeRech();
  setTimeout(function(){ 
  
  //Nbli=localStorage.getItem("Nbli");
  var Nbli = 55; //Nblx();
  var C = 0;
// SelectSheet("C1");
  Excel.run(function (context) {

    var RangeT = ("A1:A" + Nbli);
    var sheet = context.workbook.worksheets.getItem("C1");
    sheet.activate();
    sheet.load("name");

    var _range = context.workbook.worksheets.getActiveWorksheet().getRange(RangeT).load("values,address");
   
    var RangeC = localStorage.getItem("RangeC");
    RangeC=(RangeC.split(","));

  return context.sync()
      .then(function () {
        for (var i = 0 ; i<=Nbli ; i++ ) {
          var Cellv=_range.values[i][C];
          if (RangeC.indexOf(Cellv) == "-1"){
            console.log("Ligne : " + (i+1) + " Cellv : " + Cellv + " Trouvé : " +  (RangeC.indexOf(Cellv) +1));
            var range = context.workbook.worksheets.getActiveWorksheet().getCell((i+1),(C+1));
            range.format.fill.color = 'red';
          }
        }
      });
  })
  }, 1000);
}

////////////////////////////////////////
function ListeRech(){
  var Nbli = 59 //Nblx();
  var C = 0;
  Sheetname="C2";
  SelectSheet(Sheetname);
  setTimeout(function(){ 
  Excel.run(function (context) {
     var RangeT2 = ("A1:A" + Nbli);
     var worksheet = context.workbook.worksheets.getItem(Sheetname);
     var range2 = context.workbook.worksheets.getActiveWorksheet().getRange(RangeT2).load("values,address");
  return context.sync()
      .then(function () {
          var RangeC= range2.values;
        localStorage.setItem("RangeC",RangeC);
      });
  })
}, 1000);
}

////////////////////////////////////////
// Fonction RechercheV + coloration des cellules non trouvées
function RechV_old(Cellv,i){
  Excel.run(function (context) {
    var Range = context.workbook.worksheets.getItem("C2").getRange("A1:A2000");
    var unitSoldInNov = context.workbook.functions.vlookup(Cellv, Range, 1, false);
    unitSoldInNov.load('value');

    return context.sync()
        .then(function () {
          if (unitSoldInNov.value == null){
             console.log('Non Trouvé  Ligne : ' + i + '  ' + Cellv + '  ' + unitSoldInNov.value);            
             var CC = context.workbook.worksheets.getActiveWorksheet().getCell(i,0);
             CC.format.fill.color = 'red';
           }
        });
  })
}

///////////////////////////////////////////////
function Comp_WorkB(){
    Excel.run(function (context) {
     var Wb= (context.Workbook.Open.FileName="Excel2SF.xlsx", ReadOnly=True);
      var sheet =Wd.workbook.worksheets.getItem("C3");
    var range = sheet.getUsedRange();
    range.load("rowCount");
    return context.sync()
        .then(function () {
          var Nbli = range.rowCount;
         console.log("Ligne count : " + Nbli);
        });
  })
}
///////////////////////////////////////////////
function Add_Id(){
  console.log("Start vérif Id");
  Nbli=localStorage.getItem("Nbli");
  Colj=localStorage.getItem("Colj");

  Nbli="10";
  var RangeT = ("A1:B" + Nbli);

  console.log(" Test Nbl : " + Nbli);
  Excel.run(function (context) {
	  var _range = context.workbook.worksheets.getActiveWorksheet().getRange(RangeT).load("values,address");
	  
	  return context.sync().then(function () { 
		for (var i = 1 ; i<=Nbli ; i++ ) {
			var Cellv=_range.values[i][0];
		   // _range[i][1].values="ID_1";
			console.log(Cellv);
		};
	  });
  });
}
