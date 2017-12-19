$(document).ready(() => {
    $("#created_at").html(new Date(job.created_at).toLocaleString());
    if (job.finished_at) {
        $("#finished_at").html(new Date(job.finished_at).toLocaleString());
    } else {
        $("#btnDelete").attr("disabled", true);
    }

    getLog();
    if (!job.finished_at) {
        setTimeout(update, 5000);
    } else {
        getResult();
    }

    requestedChart = false;
})

function update() {
    $.ajax({
        method: "POST",
        url: `/job/${job.created_at}`,
        success: (data, status, req) => {
            job = data;

            if (!job.finished_at) {
                setTimeout(update, 5000);
            } else {
                // Job Complete
                $("i.fa:first-child").css("color", job.error ? "red" : "green");
                $("#finished_at").html(new Date(job.finished_at).toLocaleString());
                $("#btnDelete").prop("disabled", false);
                if (job.error) {
                    $("#nav-result-tab").html("Error");
                    $("#nav-result").html(job.error);
                } else {
                    if (job.name == "Bloom Filter") $("#nav-chart-tab").css("display", "block");
                    getResult();
                }
            }
        },
        error: (req, status, error) => {
            console.error(error.message);
        }
    })
}

function deleteJob() {
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
                url: `/deleteJob/${job.created_at}`,
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
        url: `/job/${job.created_at}/log`,
        success: (data, status, req) => {
            data && $("#nav-log").html(data);

            if (!job.finished_at) setTimeout(getLog, 1000);

            $("#nav-log")[0].scrollTop = $("#nav-log")[0].scrollHeight;
        },
        error: (req, status, error) => {
            $("#nav-log").html("Error Loading Log");
        }
    })
}

function getResult() {
    if (job.error) return $("#nav-result").html(job.error);
    $.ajax({
        method: "GET",
        url: `/job/${job.created_at}/result`,
        success: (data, status, req) => {
            $("#nav-result").html(data);
        },
        error: (req, status, error) => {
            $("#nav-result").html("Error Loading Result");
        }
    })
}

function getChart() {
    if (requestedChart) return;
    requestedChart = true;

    $.ajax({
        method: "POST",
        url: `/getChart/${job.created_at}`,
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