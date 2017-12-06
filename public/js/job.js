$(document).ready(() => {
    let created_at = $("#created_at");
    let finished_at = $("#finished_at");
    created_at.html(new Date(created_at.data('timestamp')).toLocaleString());
    finished_at.html(new Date(finished_at.data('timestamp')).toLocaleString());
})

function deleteJob(id) {
    $("#btnDelete").attr("disabled", true);
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
        },
        complete: () => {
            $("#btnDelete").attr("disabled", false);
        }
    })
}