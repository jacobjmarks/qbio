$(document).ready(() => {
    populateDataList();
})

const fileInput = $("#uploadform :input")[0];

$("#uploadform").submit((e) => {
    e.preventDefault();
    $.ajax({
        method: "POST",
        url: "/uploadfile",
        contentType: false,
        processData: false,
        data: (() => {
            let formdata = new FormData();
            formdata.append('file', fileInput.files[0]);
            return formdata;
        })(),
        success: (data, status, req) => {
            populateDataList();
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
    return false;
})

function populateDataList() {
    $.ajax({
        method: "POST",
        url: "/getAvailableData",
        success: (data, status, req) => {
            $("#dataTableBody").empty();
            data.forEach((datafile, index) => {
                $("#dataTableBody").append(
                    $("<tr/>")
                        .append(
                            $("<th/>")
                            .attr("scope", "row")
                            .text(index + 1)
                        )
                        .append(
                            $("<td/>")
                            .text(datafile.filename)
                        )
                        .append(
                            $("<td/>")
                            .text(datafile.size)
                        )
                );
            })
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
}