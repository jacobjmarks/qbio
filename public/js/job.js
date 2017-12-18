$(document).ready(() => {
    let created_at = $("#created_at");
    let finished_at = $("#finished_at");
    created_at.html(new Date(created_at.data('timestamp')).toLocaleString());
    if (finished_at.data('timestamp')) {
        finished_at.html(new Date(finished_at.data('timestamp')).toLocaleString());
    } else {
        finished_at.html("PENDING");
        $("#btnDelete").attr("disabled", true);
    }

    getLog();
    if (!job.meta.finished_at) {
        setTimeout(update, 5000);
    } else {
        getResult();
    }
})

function update() {
    $.ajax({
        method: "POST",
        url: `/job/${job.meta.created_at}`,
        success: (data, status, req) => {
            job = data;

            if (!job.meta.finished_at) {
                setTimeout(update, 5000);
            } else {
                getResult();
            }
        },
        error: (req, status, error) => {
            console.error(error.message);
        }
    })
}

function deleteJob(id) {
    showModal({
        title: "Delete Job",
        body: "Are you sure you want to delete this job?",
        btn_primary: "Yes",
        btn_secondary: "Cancel",
        confirm: () => {
            $("#btnDelete").attr("disabled", true);
            $("#modal .btn-primary").attr("disabled", true);
            $.ajax({
                method: "POST",
                url: `/deleteJob/${id}`,
                success: () => {
                    showModal({
                        title: "Success",
                        body: "Job successfully deleted."
                    }, () => window.location.href = "/jobs")
                },
                error: () => {
                    showModal({
                        title: "Error",
                        body: "Error deleting job."
                    })
                    $("#btnDelete").attr("disabled", false);
                },
                complete: () => {
                    $("#modal .btn-primary").attr("disabled", false);
                }
            })
        }
    })
}

function getLog() {
    $.ajax({
        method: "GET",
        url: `/job/${job.meta.created_at}/log`,
        success: (data, status, req) => {
            $("#nav-log").html(data);

            if (!job.meta.finished_at) setTimeout(getLog, 1000);

            $("#nav-log")[0].scrollTop = $("#nav-log")[0].scrollHeight;
        },
        error: (req, status, error) => {
            $("#nav-log").html("Error Loading Log");
        }
    })
}

function getResult() {
    $.ajax({
        method: "GET",
        url: `/job/${job.meta.created_at}/result`,
        success: (data, status, req) => {
            $("#nav-result").html(data);
        },
        error: (req, status, error) => {
            $("#nav-result").html("Error Loading Result");
        }
    })
}

function getChart(id) {
    $.ajax({
        method: "POST",
        url: `/getChart/${id}`,
        success: (data, status, req) => {
            let iframe = $("#chart-frame")[0];
            iframe.onload = () => {
                $("#nav-chart").find(".fa-spinner").hide();
            };
            let doc = iframe.document;
            doc = iframe.contentDocument || doc;
            doc = iframe.contentWindow && iframe.contentWindow.document || doc;
            
            doc.open();
            doc.write(data);
            doc.close();
        },
        error: (req, status, error) => {
            $("#nav-chart").html("Error Loading Chart");
        }
    })
}