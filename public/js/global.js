function showModal(params, cb) {
    $("#modal").on("show.bs.modal", () => {
        $("#modal .modal-title").text(params.title);
        $("#modal .modal-body").text(params.body);
        $("#modal .btn-primary").text(params.btn_primary || "OK");
        if (!params.href) {
            $("#modal .btn-primary").attr("data-dismiss", "modal");
            $("#modal .btn-secondary").hide();
        } else {
            $("#modal a").attr("href", params.href);
            $("#modal .btn-secondary").text(params.btn_secondary || "Dismiss");
            $("#modal .btn-secondary").show();
        }
    })
    $("#modal").modal("show");

    $("#modal").on("hide.bs.modal", cb);
}