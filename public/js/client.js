/* global TrelloPowerUp */
var apiKey = "4687a605450d997c6a66283a184b63d0";

function showAuthIframe(t) {
   return t.popup({
        title: 'Authorize to continue',
        url: './auth.html',
        args: { "apiKey": "4687a605450d997c6a66283a184b63d0" }
   });
}


// function emailAdjuster() {}


function emailAdjuster(t) {
    var context = t.getContext();
    var boardFields = {};
    t.board('customFields').then(function(board) {
        board.customFields.forEach(function(fields) {
            boardFields[fields.id] = {
                "id": fields.id,
                "name": fields.name
            };
        });
    });
  console.log(t.card('email'));
    return t.card('customFieldItems')
        .then(function(card) {
            var values = {
                "insuredName": "",
                "lossAddress": "",
                "carrier": "",
                "claim": "",
                "adjusterEmail": ""
            };
            for (var key in boardFields) {
                card.customFieldItems.forEach(function(field) {

                    if (field.idCustomField == boardFields[key].id) {
                        //var value = "";
                        if (field.value != undefined && field.value[Object.keys(field.value)[0]] != undefined) {
                            var value = field.value[Object.keys(field.value)[0]];
                        }
                        switch (boardFields[key].name) {
                            case "Insured Name":
                                values.insuredName = encodeURIComponent(value);
                                break;
                            case "Loss Address":
                                values.lossAddress = encodeURIComponent(value);
                                break;
                            case "Carrier":
                                values.carrier = encodeURIComponent(value);
                                break;
                            case "Claim Number":
                                values.claim = encodeURIComponent(value);
                                break;
                            case "Inside Adjuster Email":
                                values.adjusterEmail = encodeURIComponent(value);
                                break;
                            default:
                                break;
                        }
                    }
                });

            };
      // return t.card('customFieldItems')
            return window.location.href = "mailto:"+values.adjusterEmail+
              "?"+
              // "cc="+values.cardEmail+
              // "&"+
              "subject=Claim Number: "+values.claim+
              " Insured: "+values.insuredName
      ;

        })
}



function showForm(t) {
    var context = t.getContext();
    var boardFields = {};
    t.board('customFields').then(function(board) {
        board.customFields.forEach(function(fields) {
            boardFields[fields.id] = {
                "id": fields.id,
                "name": fields.name
            };
        });
    });
    return t.card('customFieldItems')
        .then(function(card) {
            var values = {
                "insuredName": "",
                "lossAddress": "",
                "carrier": "",
                "claim": "",
                "commission": ""
            };
            for (var key in boardFields) {
                card.customFieldItems.forEach(function(field) {

                    if (field.idCustomField == boardFields[key].id) {
                        //var value = "";
                        if (field.value != undefined && field.value[Object.keys(field.value)[0]] != undefined) {
                            var value = field.value[Object.keys(field.value)[0]];
                        }
                        switch (boardFields[key].name) {
                            case "Insured Name":
                                values.insuredName = encodeURIComponent(value);
                                break;
                            case "Loss Address":
                                values.lossAddress = encodeURIComponent(value);
                                break;
                            case "Carrier":
                                values.carrier = encodeURIComponent(value);
                                break;
                            case "Claim Number":
                                values.claim = encodeURIComponent(value);
                                break;
                            case "commission percentage":
                                values.commission = encodeURIComponent(value);
                            default:
                                break;
                        }
                    }
                });

            };
            //console.log(JSON.stringify(card, null, 2));
            return t.modal({
                url: "form.html",
                title: "Input New Check Received From Insurer",
                fullscreen: false,
                args: {
                    "cardid": context.card,
                    "insured": values.insuredName, //insured name
                    "address": values.lossAddress, //loss address
                    "carrier": values.carrier, //insurance company
                    "claim": values.claim, //claim number
                    "pa": "", //not setup yet
                    "commission": values.commission, //commission percentage
                }
            });

        })
}

function showDocGenerator(t) {
    return t.popup({
        url: "docsgen.html",
        title: "Choose doc to generate",
        height: 290
    });
}

var Promise = TrelloPowerUp.Promise;

var BLACK_ROCKET_ICON = 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421';

TrelloPowerUp.initialize({
    'card-buttons': function(t, options) {
        return t.getRestApi()
            .isAuthorized()
            .then(function(isAuthorized) {
                if (isAuthorized) {
                    return [{
                            icon: BLACK_ROCKET_ICON,
                            text: 'New Check',
                            callback: showForm
                        },
                        {
                            icon: BLACK_ROCKET_ICON,
                            text: 'Generate Doc',
                            callback: showDocGenerator
                        }
                        ,{
                            icon: BLACK_ROCKET_ICON,
                            text: 'Email Adjuster',
                            callback: emailAdjuster
                        }
                    ];
                } else {
                    return [{
                            icon: BLACK_ROCKET_ICON,
                            text: 'New Check',
                            callback: showForm
                        },
                        {
                            icon: BLACK_ROCKET_ICON,
                            text: 'Generate Doc',
                            callback: showAuthIframe
                        }
                    ];
                }
            });
    },
    'authorization-status': function(t, options){
      t.getRestApi()
        .getToken()
        .then(function(token){
          if(token){
            return { authorized: true };
          }
          return { authorized: false };
        });
    },
}, {
    appKey: '4687a605450d997c6a66283a184b63d0',
    appName: 'Family Adjusting Power Up'
});