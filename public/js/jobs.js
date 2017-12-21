$(document).ready(() => {
    updateJobs();
})

function updateJobs() {
    $.ajax({
        method: "POST",
        url: "/jobStatus",
        success: (data, status, req) => {
            let jobs = data;
            $("#jobTable tbody").empty();

            if (jobs.length == 0) {
                $("#noJobsNotif").show();
                $("#jobTable").hide();
            } else {
                $("#noJobsNotif").hide();
                $("#jobTable").show();
            }

            let autorefresh = false;
            jobs.forEach((job, index) => {
                $("#jobTable tbody").append(
                    $("<tr>")
                        .append(
                            // #
                            $("<td>").text(index+1)
                        )
                        .append(
                            // Created At
                            $("<td>").text(new Date(job.created_at).toLocaleString())
                        )
                        .append(
                            // Tool
                            $("<td>").text(job.tool)
                        )
                        .append(
                            // Datafile/s
                            $("<td>").text(job.files)
                        )
                        .append(
                            // Finished At
                            $("<td>").html(
                                job.finished_at && new Date(job.finished_at).toLocaleString() 
                                || "<div style='text-align:center'><i class='fa fa-spinner fa-spin'></i></div>")
                        )
                        .append(
                            // Result
                            $("<td>").html((() => {
                                const indicator = (colour) => {
                                    return `<i class='fa fa-fw fa-circle' style='color: ${colour}'></i>&nbsp;`;
                                };
                                if (!job.finished_at) return indicator("orange") + "Pending";
                                return job.error ? indicator("red") + "Error" : indicator("green") + "Success";
                            })())
                        )
                        .click(() => {
                            window.location.href = `/job/${job.created_at}`;
                        })
                )

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