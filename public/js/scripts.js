$(document).ready(() => {
    dataTable = $("#dataTable").DataTable({
        "paging": false,
        "info": false,
        columns: [
            {title: "#"}, {title: "Filename"}, {title: "Size (mb)"}
        ]
    })

    selectedDataFile = null;

    $("#dataTable tbody").on("click", "tr", (e) => {
        if ($(e.target).hasClass("dataTables_empty")) return;
        let row = e.target.parentElement;
        let data = dataTable.row(row).data();

        if ($(row).hasClass("table-primary")) {
            $(row).removeClass("table-primary");
            selectedDataFile = null;
        } else {
            dataTable.$("tr.table-primary").removeClass("table-primary");
            $(row).addClass("table-primary");
            selectedDataFile = data[1];
        }
    })

    populateDataTable();
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
            formdata.append("file", fileInput.files[0]);
            return formdata;
        })(),
        success: (data, status, req) => {
            populateDataTable();
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
    return false;
})

function populateDataTable() {
    $.ajax({
        method: "POST",
        url: "/getAvailableData",
        success: (data, status, req) => {
            dataTable.clear();
            if (!data) return;
            data.forEach((datafile, index) => {
                dataTable.row.add([index+1, datafile.filename, datafile.size]).draw(false);
            })
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
}

function runTool(toolname) {
    if (!selectedDataFile) {
        return alert("No datafile selected.");
    }

    $.ajax({
        method: "GET",
        url: "/run",
        data: {
            "tool": toolname,
            "file": selectedDataFile
        },
        success: (data, status, req) => {
            $("#results").html(data);
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
}