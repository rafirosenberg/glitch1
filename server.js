var express = require('express');
var cors = require('cors');
var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');
var bodyParser = require('body-parser');
var Client = require('node-rest-client').Client;
var client = new Client();


var fs = require('fs');
var path = require('path');
var moment = require('moment');

process.env.TZ = 'America/New_York'

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded



// your manifest must have appropriate CORS headers, you could also use '*'
app.use(cors({ origin: '*' }));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
//Generate doc test
app.post('/getdoc', function(req, res) {

    var docData = {
        date: moment().format('MMMM D, YYYY'),
        carrier : req.body.carrier,
        claim: req.body.claim,
        insured: req.body.insuredName,
        address: req.body.lossAddress,
        policy_number: req.body.policyNumber,
        date_of_loss: moment(req.body.dateOfLoss).format('M/D/YYYY'),
        loss_cause: req.body.causeOfLoss,
    }
    switch (req.body.doc) {
        case "1":
            var templateDirectory = 'templates/letter_of_representation_template.docx';
            var fileName = "LR #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "2":
            var templateDirectory = 'templates/reinspection_request_template.docx';
            var fileName = "RR #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "3":
            var templateDirectory = 'templates/request_reports_n_estimates.docx';
            var fileName = "RR&E #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "4":
            var templateDirectory = 'templates/certified_policy_request.docx';
            var fileName = "CPR #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "5":
            var templateDirectory = 'templates/submission_of_POL_not_incl_WMServ.docx';
            var fileName = "SOPOLniWMServ #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "6":
            var templateDirectory = 'templates/entire_amount_of_POL.docx';
            var fileName = "EAOPOL #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "7":
            var templateDirectory = 'templates/7_days_notice_collections.docx';
            var fileName = "7DN C #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "8":
            var templateDirectory = 'templates/appraisal.docx';
            var fileName = "A #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "9":
            var templateDirectory = 'templates/approved_umpire_list.docx';
            var fileName = "AUL #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "10":
            var templateDirectory = 'templates/no_correspondence_no_inspection.docx';
            var fileName = "NCNI #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "11":
            var templateDirectory = 'templates/no_correspondence.docx';
            var fileName = "NC #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "12":
            var templateDirectory = 'templates/recoverable_depreciation.docx';
            var fileName = "RC #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "13":
            var templateDirectory = 'templates/right_to_repair.docx';
            var fileName = "RTR #" + docData.claim + " " + docData.insured + ".docx"
            break;
        case "14":
            var templateDirectory = 'templates/supplement_payment_request.docx';
            var fileName = "SPR #" + docData.claim + " " + docData.insured + ".docx"
            break;
    }

    var content = fs.readFileSync(path.resolve(__dirname, templateDirectory), 'binary');
    var zip = new JSZip(content);
    //console.log(req);
    var doc = new Docxtemplater();
    doc.loadZip(zip);
    doc.setData(docData);
    try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render()
    } catch (error) {
        var e = {
            message: error.message,
            name: error.name,
            stack: error.stack,
            properties: error.properties,
        }
        console.log(JSON.stringify({ error: e }));
        // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
        throw error;
    }

    var buf = doc.getZip()
        .generate({ type: 'nodebuffer' });
    //fs.writeFileSync(path.resolve(__dirname, 'public/output.docx'), buf);
    //Generate the comment on the card
    var args = {
        data: {
            text: "Generated " + fileName,
            key: req.body.trelloAppKey,
            token: req.body.trelloAppToken
        },
        headers: { "Content-Type": "application/json" }
    };
    client.post("https://api.trello.com/1/cards/" + req.body.cardId + "/actions/comments", args, function(data, response) {
        console.log(response);
    });
    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.end(buf);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});



//always at the bottom
app.get("*", function(request, response) {
    response.sendFile(__dirname + '/views/index.html');
});