function ConfirmShow(yesFunction, noFunction, message, msgType) {
    try {

        //msgType = error, success, warning
        var msgHtml = '';
        if (msgType.toLowerCase() == 'error') {
            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle error-msg mb-10"><label class="alert-icons-label error-sm-bg"><i class="fa fa-times-circle error-fa-color"></i></label>' + message + '</div>';
        }
        else if (msgType.toLowerCase() == 'success') {
            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle sucess-msg mb-10"><label class="alert-icons-label  success-sm-bg"><i class="fa fa-check-circle success-fa-color"></i></label>' + message + '</div>';
        }
        else if (msgType.toLowerCase() == 'warning') {
            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle warning-msg mb-10"><label class="alert-icons-label  warning-sm-bg"><i class="fa fa-exclamation-triangle warning-fa-color"></i></label>' + message + '</div>';
        }
        else {
            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle info-msg mb-10"><label class="alert-icons-label  info-sm-bg"><i class="fa fa-info-circle info-fa-color"></i></label>' + message + '</div>';
        }

        var dvButtonHtml = '';
        dvButtonHtml = dvButtonHtml + '<button class="btn btn-cancel min-w-80px" onclick="' + noFunction + '; CloseMessage();">No</button>';
        dvButtonHtml = dvButtonHtml + '<button class="btn btn-save ok_button min-w-80px" onclick="' + yesFunction + '; CloseMessage();">Yes</button>';

        $('#pMessageShow').html('');
        $('#pMessageShow').html(msgHtml);

        $('#dvButtonShowok').html('');
        $('#dvButtonShow').html('');
        $('#dvButtonShow').html(dvButtonHtml);

        $('#popUpAlerts').show();
        HideLoader();
    }
    catch (e) {
        console.log(e);
    }
}

//function MessageShowTost(message, msgType) {
//    try {
//        //msgType = error, success, warning
//        var msgHtml = '';
//        if (msgType.toLowerCase() == 'error') {
//            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle error-msg mb-10"><label class="alert-icons-label error-sm-bg"><i class="fa fa-times-circle error-fa-color"></i></label>' + message + '</div>';
//        }
//        else if (msgType.toLowerCase() == 'success') {
//            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle sucess-msg mb-10"><label class="alert-icons-label success-sm-bg"><i class="fa fa-check-circle success-fa-color"></i></label>' + message + '</div>';
//        }
//        else if (msgType.toLowerCase() == 'warning') {
//            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle warning-msg mb-10"><label class="alert-icons-label warning-sm-bg"><i class="fa fa-exclamation-triangle warning-fa-color"></i></label>' + message + '</div>';
//        }
//        else {
//            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle info-msg mb-10"><label class="alert-icons-label info-sm-bg"><i class="fa fa-info-circle info-fa-color"></i></label>' + message + '</div>';
//        }        

//        $('#pMessageShowTost').html('');
//        $('#pMessageShowTost').html(msgHtml);
//        let toastEl = new bootstrap.Toast($("#popUpAlertsTost")[0]);
//        toastEl.show();
//        HideLoader();
//    }
//    catch (e) {
//        console.log(e);
//    }
//}
function MessageShow(clickfunction, message, msgType) {
    try {
        //msgType = error, success, warning
        var msgHtml = '';
        if (msgType.toLowerCase() == 'error') {
            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle d-flex flex-column align-items-center"><div class="alert-icons-label error-sm-bg"><i class="fa fa-times-circle error-fa-color icon-size"></i></div><div class="error-msg msg-styles">' + message + '</div></div>';
        }
        else if (msgType.toLowerCase() == 'success') {
            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle d-flex flex-column align-items-center"><div class="alert-icons-label success-sm-bg"><i class="fa fa-check-circle success-fa-color icon-size"></i></div><div class="sucess-msg msg-styles">' + message + '</div></div>';
        }
        else if (msgType.toLowerCase() == 'warning') {
            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle d-flex flex-column align-items-center"><div class="alert-icons-label warning-sm-bg"><i class="fa fa-exclamation-triangle warning-fa-color icon-size"></i></div><div class="warning-msg msg-styles">' + message + '</div></div>';
        }
        else {
            msgHtml = msgHtml + '<div class="padding-control-withmsgdivstyle d-flex flex-column align-items-center"><div class="alert-icons-label info-sm-bg"><i class="fa fa-info-circle info-fa-color icon-size"></i></div><div class="info-msg msg-styles">' + message + '</div></div>';
        }

        var dvButtonHtml = '';
        dvButtonHtml = dvButtonHtml + '<button class="btn btn-save min-w-80px min-widthauto" onclick="' + clickfunction + '; CloseMessage();">Ok</button>';

        $('#pMessageShow').html('');
        $('#pMessageShow').html(msgHtml);

        $('#dvButtonShow').html('');
        $('#dvButtonShowok').html('');
        $('#dvButtonShowok').html(dvButtonHtml);

        $('#popUpAlerts').show();
        let toastEl = new bootstrap.Toast($("#popUpAlerts")[0]);
        toastEl.show();
        HideLoader();
    }
    catch (e) {
        console.log(e);
    }
}

function CloseMessage() {
    try {
       // $(".fullpage-message-div").hide();

        $('#popUpAlerts').hide();
    }
    catch (e) {
        console.log(e);
    }
}