$(document).ready(() => {
    dataDirectory();
    getUploadedData();

    $.ajax({
        method: "POST",
        url: "/getSessionData/selectedData",
        success: (data, status, req) => {
            selectedData = data;
            updateSelectedData();
        }
    })
    
    $("#uploadform").submit((e) => {
        e.preventDefault();
    
        let fileInput = $("#uploadform :input")[0];
    
        if (fileInput.files.length == 0) return $(fileInput).effect("highlight", {color:'rgba(255,0,0,0.5)'}, 1000);;
    
        let maxFilesize = 1.5e+9;
        if (fileInput.files[0].size > maxFilesize) return $("#filesizeNotif").effect("highlight", {color:'rgba(255,0,0,0.5)'}, 1000);
    
        $("#uploadform button").attr("disabled", true);
    
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
                getUploadedData();
            },
            error: (req, status, error) => {
                console.error(req.responseText);
            },
            complete: () => {
                $("#uploadform button").attr("disabled", false);
            }
        })
    })
})

function updateBreadcrumbs(breadcrumbs) {
    $("#serverData #breadcrumbs").empty();
    breadcrumbs.forEach((crumb, index) => {
        $("#serverData #breadcrumbs").append(
            $("<crumb>")
                .text(crumb == '/' ? "root" : crumb.match(/([^\/]*)\/$/).pop())
                .click(() => {
                    if (breadcrumbs[breadcrumbs.length -1] != crumb) {
                        dataDirectory(crumb);
                    }
                })
        );
        $("#serverData #breadcrumbs").append('/');
    })
}

function dataDirectory(dir, e) {
    $.ajax({
        method: "POST",
        url: `/directory/${encodeURIComponent(dir)}`,
        success: (data, status, req) => {
            updateBreadcrumbs(data.breadcrumbs);
            $("#serverData tbody").empty();
            data.files.forEach((file) => {
                let path = data.dir + file.name;
                
                let row =
                    $("<tr>")
                        .append(
                            // File/Folder Icon
                            $("<td>").html(`<i class="fa fa-fw fa-${path.slice(-1) == '/' ? 'folder' : 'file-text'}">`)
                        )
                        .append(
                            // Filename
                            $("<td class='col'>").text(file.name)
                        )
                        .append(
                            // Filesize
                            $("<td class='filesize'>").text(file.size)
                        )
                        .click(() => {
                            if (path.slice(-1) == '/') {
                                dataDirectory(path, row);
                            } else {
                                selectedData.push({
                                    name: file.name,
                                    size: file.size,
                                    path: path
                                });
                                updateSelectedData(true);
                            }
                        })

                $("#serverData tbody").append(row)
            });
        },
        error: (req, status, error) => {
            $(e).effect("highlight", {color:'rgba(255,0,0,0.5)'}, 1000);
        }
    })
}

function getUploadedData() {
    $.ajax({
        method: "POST",
        url: "/getUploadedData",
        success: (data, status, req) => {
            if (!data) return;
            $("#uploadedData tbody").empty();
            data.forEach((file) => {
                $("#uploadedData tbody").append(
                    $("<tr>")
                        .append(
                            // File Icon
                            $("<td>").html("<i class='fa fa-fw fa-file-text'>")
                        )
                        .append(
                            // Filename
                            $("<td class='col'>").text(file.name)
                        )
                        .append(
                            // Filesize
                            $("<td class='filesize'>").text(file.size)
                        )
                        .click(() => {
                            selectedData.push({
                                name: file.name,
                                size: file.size,
                                path: file.name,
                                uploaded: true
                            });
                            updateSelectedData(true);
                        })
                )
            });
        },
        error: (req, status, error) => {
            console.error(req.responseText);
        }
    })
}

let selectedData = [];

function updateSelectedData(updateSession) {
    if (updateSession) {
        $.ajax({
            method: "POST",
            url:"/updateSessionData",
            contentType: "application/json",
            data: JSON.stringify({
                selectedData: selectedData
            })
        })
    }

    $("#selectedData table tbody").empty();

    if (selectedData.length == 0) {
        $(".noDataNotif").show();
        $(".dataSelection").hide();
    } else {
        $(".noDataNotif").hide();
        $(".dataSelection").show();
    }

    selectedData.forEach((file) => {
        $("#selectedData table tbody").append(
            $("<tr>")
                .append(
                    // File/Folder Icon
                    $("<td>").html("<i class='fa fa-fw fa-file-text'>")
                )
                .append(
                    // Filename
                    $("<td class='col'>").text(file.name)
                )
                .append(
                    // Filesize
                    $("<td class='filesize'>").text(file.size)
                )
                .append(
                    // Delete button
                    $("<td>").append(
                        $("<i class='fa fa-times'>").click(() => {
                            selectedData.splice(selectedData.indexOf(file), 1);
                            updateSelectedData(true);
                        })
                    )
                )
        )
    })
        
    updateToolData();
}

function updateToolData() {
    $(".dataSelection").toArray().forEach((input) => {
        if ($(input).find("table")) {
            $(input).find("tbody").empty();
            selectedData.forEach((file) => {
                $(input).find("tbody").append(
                    $("<tr>")
                        .append(
                            // File Icon
                            $("<td>").html("<i class='fa fa-fw fa-file-text'>")
                        )
                        .append(
                            // Filename
                            $("<td class='col'>").text(file.name)
                        )
                        .append(
                            // Filesize
                            $("<td class='filesize'>").text(file.size)
                        )
                        .append(
                            // Checkbox
                            $("<td>").html("<input type='checkbox' checked>")
                        )
                        .data("path", file.path)
                        .data("uploaded", file.uploaded ? true : false)
                )
            })
        }
        
        if ($(input).find("select")) {
            $(input).find("select").empty();
            selectedData.forEach((file) => {
                $(input).find("select")
                    .append(
                        $("<option>")
                            .text(`${file.name} (${file.size})`)
                            .attr("value", file.path)
                            .data("uploaded", file.uploaded ? true : false)
                    )
            })
        }
    })
}

function runTool(tool_func) {
    if (selectedData.length == 0) {
        return $(`#${tool_func} .noDataNotif`).effect("highlight", {color:'rgba(255,0,0,0.5)'}, 1000);
    }

    let valid = true;

    // Check file selection
    let files = {};
    $(`#${tool_func} .dataSelection`).toArray().forEach((input) => {
        let these_files = [];

        switch ($(input).data("type")) {
            case "table":
                $(input).find("tbody").children("tr").toArray().forEach((row) => {
                    if ($(row).find("input[type='checkbox']").is(":checked")) {
                        these_files.push({
                            path: $(row).data("path"),
                            uploaded: $(row).data("uploaded")
                        });
                    }
                })
                if (these_files.length == 0) {
                    // No files checked
                    $(input).effect("highlight", {color:'rgba(255,0,0,0.5)'}, 1000);
                    return valid = false;
                }
                break;
            case "select":
                these_files.push({
                    path: $(input).find(":selected").val(),
                    uploaded: $(input).find(":selected").data("uploaded")
                });
                break;
        }
        files[`${$(input).data("name")}`] = these_files;
    })

    if (!valid) return;

    // Check form parameter data
    let form_data = $(`#${tool_func} form`).serializeArray();
    let settings = {};
    form_data.forEach((param) => {
        let setting = $(`#${tool_func} .setting[name^='${param.name}']`);

        let val = param.value || setting.data('default');
        if (!val && setting.attr("required")) {
            setting.effect("highlight", {color:'rgba(255,0,0,0.5)'}, 1000);
            return valid = false;
        }

        settings[`${param.name}`] = val;
    })

    if (!valid) return;

    // Run tool
    $(`#${tool_func} button:last-child`).attr("disabled", true);
    $.ajax({
        method: "GET",
        url: "/run",
        data: {
            "tool": tool_func,
            "files": files,
            "settings": JSON.stringify(settings)
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