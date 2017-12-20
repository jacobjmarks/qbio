$(document).ready(() => {
    jobTable = $("#jobTable").DataTable({
        "paging": false,
        "info": false,
        columns: [
            {title: "#"},
            {title: "Created At"},
            {title: "Tool"},
            {title: "Datafile/s", render: {
                "_": (files) => {
                    return null;
                }
            }},
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

    updateJobs();
})

function updateJobs() {
    $.ajax({
        method: "POST",
        url: "/jobStatus",
        success: (data, status, req) => {
            jobTable.clear();
            let autorefresh = false;
            data.forEach((job, index) => {
                jobTable.row.add([
                    index+1,
                    new Date(job.created_at).toLocaleString(),
                    job.tool,
                    job.files,
                    job.finished_at && new Date(job.finished_at).toLocaleString(),
                    job.finished_at && { error: job.error, created_at: job.created_at }
                ]).draw(false);

                let row = $("#jobTable tbody > tr:last-child");
                row.on("click", () => {
                    window.location.href = `/job/${job.created_at}`;
                })

                if (!job.finished_at && !autorefresh) {
                    setTimeout(updateJobs, 5000);
                    autorefresh = true;
                }
            })
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
}