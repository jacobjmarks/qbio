$(document).ready(() => {
    dataTable = $("#dataTable").DataTable({
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

function runTool(tool_func) {
    if (!selectedDataFile) {
        return alert("No datafile selected.");
    }

    let valid = true;

    let form_data = $(`#${tool_func} form`).serializeArray();
    let settings = {};
    form_data.forEach((param) => {
        let control = $(`#${tool_func} .form-control[name^='${param.name}']`);

        let val = param.value || control.data('default');
        if (!val && control.attr("required")) {
            control.effect("highlight", {color:'rgba(255,0,0,0.5)'}, 1000);
            return valid = false;
        }

        settings[`${param.name}`] = val;
    })

    if (!valid) return;

    $(`#${tool_func} button:last-child`).attr("disabled", true);
    $.ajax({
        method: "GET",
        url: "/run",
        data: {
            "tool": tool_func,
            "file": selectedDataFile,
            "settings": settings
        },
        success: (data, status, req) => {
            let job_id = data;
            showModal({
                title: `Job ${job_id}`,
                body: "Your job has been created successfully and is currently processing.",
                btn_primary: "View Job",
                btn_secondary: "Dismiss",
                confirm: () => {
                    window.location.href = `/job/${job_id}`
                }
            });
        },
        error: (req, status, error) => {
            alert(req.responseText);
        },
        complete: () => {
            $(`#${tool_func} button:last-child`).attr("disabled", false);
        }
    })
}