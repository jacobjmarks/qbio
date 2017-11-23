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
            data.forEach((filename, index) => {
                $("#dataTableBody").append(
                    $("<tr/>")
                        .append(
                            $("<th/>")
                            .text(index + 1)
                        )
                        .append(
                            $("<td/>")
                            .text(filename)
                        )
                );
            })
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
}