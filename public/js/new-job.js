// const fileInput = $("#uploadform :input")[0];

// $("#uploadform").submit((e) => {
//     e.preventDefault();
//     $.ajax({
//         method: "POST",
//         url: "/uploadfile",
//         contentType: false,
//         processData: false,
//         data: (() => {
//             let formdata = new FormData();
//             formdata.append("file", fileInput.files[0]);
//             return formdata;
//         })(),
//         success: (data, status, req) => {
//             populateDataTable();
//         },
//         error: (req, status, error) => {
//             alert(req.responseText);
//         }
//     })
//     return false;
// })

$(document).ready(() => {
    dataDirectory('/');
})

let breadcrumbs = [];

function updateBreadcrumbs() {
    $("#dataBrowser #breadcrumbs").empty();
    breadcrumbs.forEach((crumb, index) => {
        $("#dataBrowser #breadcrumbs").append(
            $("<crumb>")
                .text(crumb == '/' ? "root" : crumb.match(/([^\/]*)\/$/).pop())
                .click(() => {
                    if (breadcrumbs[breadcrumbs.length -1] != crumb) {
                        dataDirectory(crumb);
                    }
                })
        );
        $("#dataBrowser #breadcrumbs").append('/');
    })
}

function addToBrowser(route, text) {
    let icon = $("<td>").html(
        `<i class="fa fa-fw fa-${route.slice(-1) == '/' ? 'folder' : 'file-text'}">`
    )

    let dir = $("<td class='col'>")
        .text(text)
        .click(() => {
            if (route.slice(-1) == '/') {
                dataDirectory(route);
            } else {
                selectedData.push({
                    name: text,
                    route: route
                });
                updateSelectedData();
            }
        })

    let row = $("<tr>");
    row.append(icon);
    row.append(dir);

    $("#dataBrowser tbody").append(row);
}

function dataDirectory(dir) {
    $.ajax({
        method: "POST",
        url: `/directory/${encodeURIComponent(dir)}`,
        success: (data, status, req) => {
            if (breadcrumbs.indexOf(dir) == -1) {
                breadcrumbs.push(dir);
            } else {
                while(breadcrumbs[breadcrumbs.length -1] != dir) {
                    breadcrumbs.pop();
                }
            }
            updateBreadcrumbs();
            
            $("#dataBrowser tbody").empty();
            data.forEach((file) => addToBrowser(dir + file, file));
        },
        error: (req, status, error) => {
            console.error(error);
        }
    })
}

let selectedData = [];

function updateSelectedData() {
    $("#selectedData table tbody").empty();

    if (selectedData.length == 0) {
        $(".noDataNotif").show();
    } else {
        $(".noDataNotif").hide();
    }

    selectedData.forEach((file) => {
        let icon = $("<td>").html("<i class='fa fa-fw fa-file-text'>");
        let filename = $("<td class='col'>").text(file.name);
        let deselect = $("<td>").append(
            $("<i class='fa fa-times'>")
                .click(() => {
                    selectedData.splice(selectedData.indexOf(file), 1);
                    updateSelectedData();
                })
        )
    
        let row = $("<tr>");
        row.append(icon);
        row.append(filename);
        row.append(deselect);
    
        $("#selectedData table tbody").append(row);
    })
        
    updateToolData();
}

function updateToolData() {
    $("#tools .dataSelection tbody").empty();

    selectedData.forEach((file) => {
        let icon = $("<td>").html("<i class='fa fa-fw fa-file-text'>");
        let filename = $("<td class='col'>")
            .text(file.name)
        let checkbox = $("<td>").append(
            $("<input type='checkbox' checked>")
        )
    
        let row = $("<tr>")
            .data("path", file.route);;
        row.append(icon);
        row.append(filename);
        row.append(checkbox);
    
        $("#tools .dataSelection tbody").append(row);
    })
}

function runTool(tool_func) {
    if (selectedData.length == 0) {
        return $(`${tool_func} .noDataNotif`).effect("highlight", {color:'rgba(255,0,0,0.5)'}, 1000);
    }

    let files = {};
    $(`#${tool_func} .dataSelection tbody`).toArray().forEach((table) => {
        let these_files = [];
        $(table).children("tr").toArray().forEach((row) => {
            these_files.push($(row).data("path"));
        })
        files[`${$(table).data("name")}`] = these_files;
    })

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
            "files": files,
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