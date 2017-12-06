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

    $(`#${tool_func} button:last-child`).attr("disabled", true);

    $.ajax({
        method: "GET",
        url: "/run",
        data: {
            "tool": tool_func,
            "file": selectedDataFile,
            "settings": (() => {
                let settings = $(`#${tool_func} form`).serializeArray();
                let obj = {};
                settings.forEach((s) => {
                    obj[`${s.name}`] = s.value || $(`#${tool_func} .form-control[name^='${s.name}']`).data('default');
                })
                return obj;
            })()
        },
        success: (data, status, req) => {
            $(`#${tool_func} button:last-child`).attr("disabled", false);
            showModal({
                title: `Job ${data}`,
                body: "Your job has been created successfully and is currently processing.",
                btn_primary: "View Jobs",
                btn_secondary: "Dismiss",
                confirm: () => {
                    window.location.href = "/jobs"
                }
            });
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
}