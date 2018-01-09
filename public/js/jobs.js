$(document).ready(() => {
    updateJobs();
})

function updateJobs() {
    $.ajax({
        method: "GET",
        url: "/jobs/status",
        success: (data, status, req) => {
            let jobs = data;
            $("#jobTable tbody").empty();

            $("#loader").hide();
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
                            $("<td>").text((() => {
                                job.files = JSON.parse(job.files);
                                let files = [];
                                for (let file_group in job.files) {
                                    job.files[file_group].forEach((file) => {
                                        files.push(file);
                                    })
                                }
                                return files.join(', ');
                            })())
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
            console.error(req.responseText);
        }
    })
}