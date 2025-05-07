$(document).ready(function () {
    setInterval(function () {
        //KeepSessionAlive();
    }, 60000);
});
function KeepSessionAlive() {
    try {        
        $.ajax({
            url: baseURL + "Setting/KeepSessionAlive",
            type: "POST",
            dataType: "json",
            data: "",
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
                console.log("error-ConLog", data);
                HideLoader();
            }
        });

    } catch (e) {
        alert(e.Message);
        console.log("catch-ConLog", e);
        HideLoader();
    }
}
function ConLog(ex) {
    var data = {
        Stack: ex.stack,
        Error: '',
        Message: ex.message
    }
    try {
        $.ajax({
            url: baseURL + "Login/ConLog",
            type: "POST",
            dataType: "json",
            data: data,
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
                console.log("error-ConLog", data);
                HideLoader();
            }
        });

    } catch (e) {
        console.log("catch-ConLog", e);
        HideLoader();
    }
}

function HideLoader() {
    $('#divloader').hide();
}

function ShowLoader() {
    $('#divloader').show();
}

function ShowLoaderPreparingForPublish() {
    $('#preploader').show();
}
function HideLoaderPreparingForPublish() {
    $('#preploader').hide();
}
function ShowLoaderTransferFile() {
    $('#transloader').show();
}

function HideLoaderTransferFile() {
    $('#transloader').hide();
}
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode

    if (evt.ctrlKey === true && (evt.which === 118 || evt.which === 86)) {
        evt.preventDefault();
    }

    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;

    return true;
}
function returnblank(evt) {
    if (evt.which === 8 || evt.which === 46) {
        evt.preventDefault();
    }

    evt.preventDefault();
}


function isNumberKeyDecimal(txt, evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    if (evt.ctrlKey === true && (evt.which === 118 || evt.which === 86)) {
        evt.preventDefault();
    }

    if (charCode === 46) {
        if (txt.value.indexOf('.') === -1) {
            return true;
        } else {
            return false;
        }
    } else {
        if (charCode > 31 &&
            (charCode < 48 || charCode > 57))
            return false;
    }
    return true;
    //var charCode = (evt.which) ? evt.which : event.keyCode;
    //if (charCode != 46 && charCode > 31
    //  && (charCode < 48 || charCode > 57))
    //    return false;

    //return true; 
}

function OnlyIntegerValue(e) {
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
        return false;
    }
}

function onFocusInNum(id) {
    var txtValue = document.getElementById(id).value;
    if (txtValue == '0.00') {
        document.getElementById(id).value = '';
    }
    else if (txtValue == '0') {
        document.getElementById(id).value = '';
    }
    else if (txtValue == '0.0') {
        document.getElementById(id).value = '';
    }
    else if (txtValue == '0.0000') {
        document.getElementById(id).value = '';
    }
}

function onFocusOutNum(id) {
    var txtValue = document.getElementById(id).value;
    if (txtValue == '') {
        document.getElementById(id).value = '0.00';
    }
    else if (txtValue == ' ') {
        document.getElementById(id).value = '0.00';
    }
}

function onFocusOutInt(id) {
    var txtValue = document.getElementById(id).value;
    if (txtValue == '') {
        document.getElementById(id).value = '0';
    }
    else if (txtValue == ' ') {
        document.getElementById(id).value = '0';
    }
}

function sortTable(tblName, n) {

    $('#' + tblName + ' th i').removeClass('fas fa-arrow-up').addClass('fas fa-arrow-down').removeAttr('style');
    var table,
        rows,
        switching,
        i,
        x,
        y,
        shouldSwitch,
        dir,
        switchcount = 0;
    table = document.getElementById(tblName);
    switching = true;
    //Set the sorting direction to ascending:
    dir = "asc";
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        rows = table.getElementsByTagName("TR");
        /*Loop through all table rows (except the
        first, which contains table headers):*/
        for (i = 1; i < rows.length - 1; i++) { //Change i=0 if you have the header th a separate table.
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /*check if the two rows should switch place,
            based on the direction, asc or desc:*/
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    $('#' + tblName + '').find('th').eq(n).find('i').addClass('fas fa-arrow-up').css('color', 'blue');
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    $('#' + tblName + '').find('th').eq(n).find('i').addClass('fas fa-arrow-down').css('color', 'blue');
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /*If a switch has been marked, make the switch
            and mark that a switch has been done:*/
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            //Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /*If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again.*/
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

function removeRequired(Element) {
    if ($('#' + Element + '').val() != '' || $('#' + Element + '').val() != null) {
        //$('#Spn' + Element + '').html('');
        $('#' + Element + '').next('span').hide();
    }
}

function ConvertToAmPmFormat(time) {
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    //alert(time.length);

    if (time.length > 1) { // If time format correct

        time = time.slice(1);  // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
    }

    return (time[0] + ' ' + time[1] + ' ' + time[2] + ' ' + time[5]); // return adjusted time or original string
}

function SetTimeWithAmPm(time) {
    $('#txtFromTime').find('input').val(ConvertToAmPmFormat(time));
}
function SetTimeWithAmPm1(time) {
    $('#txtToTime').find('input').val(ConvertToAmPmFormat(time));
}
function formatAMPM() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function CheckTimeAndSetVal(timestr) {
    var retVal = '';
    if (checkValidTime(trimAllSpace(timestr)) == true) {
        if (trimAllSpace(timestr).toLowerCase().includes("am")) {

            var timesec = timestr.toLowerCase().split('am')[0];
            var ampm = timestr.toLowerCase().split('am')[1];

            var hr = timesec.split(':')[0];
            var mn = timesec.split(':')[1];

            if (hr < 10) {
                hr = '0' + parseInt(hr);
            }
            else {
                hr = hr;
            }
            if (mn < 10) {
                mn = '0' + parseInt(mn);
            }
            else {
                mn = mn;
            }

            timestr = hr + ':' + mn;
            retVal = trimAllSpace(timestr);
            //SetTimeWithAmPm(trimAllSpace(timestr));
        }
        else if (trimAllSpace(timestr).toLowerCase().includes("pm")) {

            var timesec = timestr.toLowerCase().split('pm')[0];
            var ampm = timestr.toLowerCase().split('pm')[1];

            var hr = timesec.split(':')[0];
            var mn = timesec.split(':')[1];
            if (hr < 10) {
                //hr = '0' + parseInt(hr);
                hr = parseInt(hr) + parseInt(12);
            }
            else {
                hr = hr;
            }
            if (mn < 10) {
                mn = '0' + parseInt(mn);
            }
            else {
                mn = mn;
            }
            timestr = hr + ':' + mn;
            //SetTimeWithAmPm(trimAllSpace(timestr));
            retVal = trimAllSpace(timestr);
        }
        else {

            var hr = timestr.split(':')[0];
            var mn = timestr.split(':')[1];
            if (hr < 10) {
                hr = '0' + parseInt(hr);
            }
            else {
                hr = hr;
            }
            if (mn < 10) {
                mn = '0' + parseInt(mn);
            }
            else {
                mn = mn;
            }
            timestr = hr + ':' + mn;
            //SetTimeWithAmPm(trimAllSpace(timestr));
            retVal = trimAllSpace(trimAllSpace(timestr));
        }
    }
    else {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        if (hours < 10) {
            hours = '0' + hours;
        }
        else {
            hours = hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        else {
            minutes = minutes;
        }
        timestr = hours + ":" + minutes;
        //SetTimeWithAmPm(hours + ":" + minutes);
        retVal = trimAllSpace(trimAllSpace(timestr));
    }
    return retVal;
}

function trimAllSpace(str) {
    var str1 = '';
    var i = 0;
    while (i != str.length) {
        if (str.charAt(i) != ' ')
            str1 = str1 + str.charAt(i); i++;
    }
    return str1;
}

function checkValidTime(field) {
    var errorMsg = "";
    field = field.toLowerCase();
    var hr = field.split(':')[0];
    var min = field.split(':')[1];
    if (min < 10) {
        min = '0' + parseInt(min);
    }
    else {
        min = min;
    }
    field = hr + ':' + min;
    // regular expression to match required time format
    re = /^(\d{1,2}):(\d{2})(:00)?([ap]m)?$/;

    if (field != '') {
        if (regs = field.match(re)) {
            if (regs[4]) {
                // 12-hour time format with am/pm
                if (regs[1] < 1 || regs[1] > 12) {
                    errorMsg = "Invalid value for hours: " + regs[1];
                }
            } else {
                // 24-hour time format
                if (regs[1] > 23) {
                    errorMsg = "Invalid value for hours: " + regs[1];
                }
            }
            if (!errorMsg && regs[2] > 59) {

                errorMsg = "Invalid value for minutes: " + regs[2];
            }
        } else {

            errorMsg = "Invalid time format: " + field;
        }
    }

    if (errorMsg != "") {
        //alert(errorMsg);
        return false;
    }
    else {
        return true;
    }
}