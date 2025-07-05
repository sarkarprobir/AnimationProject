let publishDownloadcondition = '';


async function GetDesignBoardByIdForDownloadNew(condition) {
    publishDownloadcondition = condition;
    var id = $('#hdnDesignBoardId').val(); // get GUID value
    if (id !== '') {
        try {
            var data = {
                DesignBoardId: id
            };

            ShowLoader();
            showDownloadPanel();
            //ShowLoader();
            // Await the ajax call which returns a promise (jQuery 3+)
            const result = await $.ajax({
                url: baseURL + "Canvas/GetDesignBoardDetailsById",
                type: "POST",
                dataType: "json",
                data: data
            });

            if (result && Array.isArray(result.designBoardDetailsList) && result.designBoardDetailsList.length > 0) {
                // Create the jsonArray from the designBoardDetailsList items.
                // Each item.jsonFile is assumed to be a JSON string.
                jsonArray = result.designBoardDetailsList.map(item => {
                    let jsonObj;
                    try {
                        jsonObj = JSON.parse(item.jsonFile);
                    } catch (e) {
                        console.error("Error parsing jsonFile:", item.jsonFile, e);
                        jsonObj = {}; // fallback to an empty object if parsing fails
                    }
                    // Ensure default values for effect and direction
                    jsonObj.effect = item.effect || "delaylinear";
                    jsonObj.direction = item.direction || "left";
                    jsonObj.outEffect = item.outEffect || "delaylinear";
                    jsonObj.outDirection = item.outDirection || "left";
                    return jsonObj;
                });
                console.log("jsonArray:", jsonArray);
                loadJsonFileForDownload();
            }
            //HideLoader();
        } catch (e) {
            console.log("catch", e);
            HideLoader();
        }
    }
    else {
        //MessageShow('', 'Before Download Must Save Board', 'error');
        for (let i = 1; i <= 3; i++)
        {
            if (i == 1) {
                applyAnimationsForPublish($("#hdnInDirectiontSlide1").val(), $("#hdnInEffectSlide1").val(), $("#hdnDirectiontSlide1Out").val(), $("#hdnEffectSlide1Out").val(), '', 1);
            }
            //else if (i == 2) {
            //    applyAnimationsForPublish($("#hdnInDirectiontSlide2").val(), $("#hdnInEffectSlide2").val(), $("#hdnDirectiontSlide2Out").val(), $("#hdnEffectSlide2Out").val(), condition, loopCount);
            //}
            //else if (i == 3) {
            //    applyAnimationsForPublish($("#hdnInDirectiontSlide3").val(), $("#hdnInEffectSlide3").val(), $("#hdnDirectiontSlide3Out").val(), $("#hdnEffectSlide3Out").val(), condition, loopCount);
            //}
        }
      
    }
}