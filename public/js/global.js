function showModal(params, cb) {
    $("#modal").modal("hide");
    $("#modal").on("show.bs.modal", () => {
        $("#modal .modal-title").text(params.title);
        $("#modal .modal-body").text(params.body);
        $("#modal .btn-primary").text(params.btn_primary || "OK");
        $("#modal .btn-primary").click(params.confirm);
        if (params.btn_secondary) {
            $("#modal .btn-secondary").show();
            $("#modal .btn-secondary").text(params.btn_secondary);
        } else {
            $("#modal .btn-secondary").hide();
        }
    })
    $("#modal").modal("show");

    $("#modal").on("hide.bs.modal", cb);
}