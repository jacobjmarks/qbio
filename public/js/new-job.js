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

let currDir = '';

function addToBrowser(route, text) {
    let icon = $("<td>").html(
        `<i class="fa fa-fw fa-${route.slice(-1) == '/' ? 'folder' : 'file-text'}">`
    )

    let dir = $("<td>").text(text)
        .click(() => {
            dataDirectory(route);
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
            $("#dataBrowser tbody").empty();
            addToBrowser('/', '/');
            data.forEach((file) => addToBrowser(dir + file, file));
        },
        error: (req, status, error) => {
            console.error(error);
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