$(document).ready(() => {
    dataTable = $("#dataTable").DataTable({
        "paging": false,
        "info": false,
        columns: [
            {title: "#"}, {title: "Filename"}, {title: "Size (mb)"}
        ]
    })
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
            dataTable.clear();
            data.forEach((datafile, index) => {
                dataTable.row.add([index+1, datafile.filename, datafile.size]).draw(false);
            })
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
}