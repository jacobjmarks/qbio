$(document).ready(() => {
    dataTable = $("#dataTable").DataTable({
        columns: [
            {title: "#"}, {title: "Filename"}, {title: "Size (mb)"}
        ]
    })

    jobTable = $("#jobTable").DataTable({
        "paging": false,
        "info": false,
        columns: [
            {title: "#"},
            {title: "Created At"},
            {title: "Tool"},
            {title: "Datafile"},
            {title: "Finshed At", render: {
                "_": (data) => {
                    return data ? data : "<div style='text-align:center'><i class='fa fa-spinner fa-spin'></i></div>";
                }
            }},
            {title: "Result", render: {
                "_": (data) => {
                    const indicator = (colour) => {
                        return `<i class='fa fa-fw fa-circle' style='color: ${colour}'></i>&nbsp;`;
                    };
                    if (!data) return indicator("orange") + "Pending";
                    return data.error ? indicator("red") + "Error" : indicator("green") + "Success";
                }
            }}
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
    updateJobs();
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
                settings.forEach((s) => {
                    s.value |= $(`#${tool_func} .form-control[name^='${s.name}']`).data('default');
                })
                return settings;
            })()
        },
        success: (data, status, req) => {
            $(`#${tool_func} button:last-child`).attr("disabled", false);
            showModal({
                title: `Job ${data}`,
                body: "Your job has been created successfully and is currently processing.",
                btn_primary: "View Jobs",
                href: "/jobs"
            });
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
}

function updateJobs() {
    $.ajax({
        method: "POST",
        url: "/jobStatus",
        success: (data, status, req) => {
            jobTable.clear();
            data.forEach((job, index) => {
                jobTable.row.add([
                    index+1,
                    new Date(job.created_at).toLocaleString(),
                    job.tool,
                    job.file,
                    job.finished_at && new Date(job.finished_at).toLocaleString(),
                    job.finished_at && { error: job.error, created_at: job.created_at }
                ]).draw(false);

                let row = $("#jobTable tbody > tr:last-child");
                row.on("click", () => {
                    window.location.href = `/job/${job.created_at}`;
                })

                if (!job.finished_at) setTimeout(updateJobs, 5000);
            })
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
}

function showModal(params) {
    $("#modal").on("show.bs.modal", () => {
        $("#modal .modal-title").text(params.title);
        $("#modal .modal-body").text(params.body);
        $("#modal .btn-primary").text(params.btn_primary || "OK");
        if (!params.href) {
            $("#modal .btn-primary").attr("data-dismiss", "modal");
            $("#modal .btn-secondary").hide();
        } else {
            $("#modal a").attr("href", params.href);
            $("#modal .btn-secondary").text(params.btn_secondary || "Dismiss");
            $("#modal .btn-secondary").show();
        }
    })
    $("#modal").modal("show");
}