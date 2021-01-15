$("#run").click(run);

function run() {
  Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (asyncResult) => {
    if (asyncResult.status === Office.AsyncResultStatus.Failed) {
      console.error(asyncResult.error.message);
    } else {
      console.log(`The selected data is "${asyncResult.value}".`);
    }
  });
}

var opt = document.createElement("option");
opt.value = "3";
opt.text = "Option: Value 3";

sel.add(opt, sel.options[1]);

dd=document.getElementById("m_excelWebRenderer_ewaCtl_m_agaveTaskPaneHeader").style

function inFrameFind(x){ return $("#Ifr_popin").contents().find(x)};

$("ewa-ptp-title").contents

inFrameFind('#openFormio')

//L'exemple suivant montre comment utiliser Excel.run. L'instruction catch intercepte et enregistre les erreurs qui se produisent dans Excel.run.
Excel.run(function (context) {
  // You can use the Excel JavaScript API here in the batch function
  // to execute actions on the Excel object model.
  console.log('Your code goes here.');
}).catch(function (error) {
  console.log('error: ' + error);
  if (error instanceof OfficeExtension.Error) {
      console.log('Debug info: ' + JSON.stringify(error.debugInfo));
  }
});

////////////////////////

          // ShName =Sh.name;
//   for (i = 0 ; i < NbLigne ;i++){
//            var Lc=i+1;
//           DelCom(ShName,Lc);
//           //var comment1= sheet.getRange(Range).comments;
//           //comment1.delete(); 
//          //console.log(comment1);
//   //var comment = context.workbook.comments.getItemAt(i)
//   //var comment = context.workbook.comments.getRange(Range);
//           // comment.content ="no comment";
//          // var comm=comment.content;
//           // if (comm !== ""){
//           //   console.log(i);
//           //   DelCom(ShName,Lc); 
//           // }
//        //  comment.delete();
//       //console.log(i);
//           //  DelCom(ShName,Lc); 
//           //var rangeV = context.workbook.worksheets.getActiveWorksheet().getCell(i,0).load("address");
//           //var rangeV2 = context.workbook.worksheets.getActiveWorksheet().getRange("A1:A20").delete()
//           //console.log(rangeV);         

//  }
