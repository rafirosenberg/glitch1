var t = window.TrelloPowerUp.iframe({
    appName: 'Family Adjusting Power Up',
    appKey: '4687a605450d997c6a66283a184b63d0'
});
var Promise = window.TrelloPowerUp.Promise;
Object.size = function(obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function getCardValues(t) {
    return new Promise(function(resolve) {
        var context = t.getContext();
        var boardFields = {};
        t.board('all').then(function(board) {
            board.customFields.forEach(function(fields) {
                boardFields[fields.id] = {
                    "id": fields.id,
                    "name": fields.name,
                };
                if (fields.options) {
                    boardFields[fields.id].options = fields.options;
                }
            });
        });
        t.card('all')
            .then(function(card) {
                var values = {};
                for (var key in boardFields) {
                    card.customFieldItems.forEach(function(field) {

                        if (field.idCustomField == boardFields[key].id) {
                            //var value = "";
                            if (field.value != undefined && field.value[Object.keys(field.value)[0]] != undefined) {
                                var value = field.value[Object.keys(field.value)[0]];
                            } else if (field.idValue) {
                                for (var _key in boardFields[key].options) {
                                    var option = boardFields[key].options[_key];
                                    if (field.idValue == option.id) {
                                        value = option.value.text;
                                    }
                                }
                            }
                            switch (boardFields[key].name) {
                                case "Claim Number":
                                    values.claim = value;
                                    break;
                                case "Policy Number":
                                    values.policyNumber = value;
                                    break;
                                case "Carrier":
                                    values.carrier = value;
                                    break;
                                case "Insured Name":
                                    values.insuredName = value;
                                    break;
                                case "Insured Phone":
                                    values.insuredPhone = value;
                                    break;
                                case "Primary Email":
                                    values.primaryEmail = value;
                                    break;
                                case "Date Of Loss":
                                    values.dateOfLoss = value;
                                    break;
                                case "Cause Of Loss (Peril)":
                                    values.causeOfLoss = value;
                                    break;
                                case "Loss Address":
                                    values.lossAddress = value;
                                    break;
                                case "commission percentage":
                                    values.commission = value;
                                    break;
                                default:
                                    break;
                            }
                        }
                    });

                };
                resolve(values);
            })
    })
}

$(document).ready(function() {
    $('select').select2({
        placeholder: 'Select a document template',
        width: 'resolve'
    });
    t.getRestApi()
        .getToken()
        .then(function(token) {
            if (!token) {
                t.alert({
                    message: "You need to authorize the application in order to update card with comments."
                })
            }
            getCardValues(t).then(function(values) {
                //TODO Make a better validation function.
                if (false /*Object.size(values) < 9*/ ) {
                    $('#content').empty();
                    $('#content').append('<p>Fill the necessary custom fields to use this feature.</p>');
                    $('#content').append('<button id="close">Ok</button>');
                    $('#close').click(function() {
                        t.closePopup()
                    });

                } else {
                    for (var key in values) {
                        $('form').append("<input name='" + key + "' value='" + values[key] + "' type='hidden'/>");
                    }
                    var context = t.getContext();
                    $('form').append('<input name="trelloAppKey" value="4687a605450d997c6a66283a184b63d0" type="hidden"/>');
                    $('form').append("<input name='trelloAppToken' value='" + token + "' type='hidden'/>");
                    $('form').append("<input name='cardId' value='" + context.card + "' type='hidden'/>");
                    $('button').prop('disabled', false);
                }

            });
        });

});