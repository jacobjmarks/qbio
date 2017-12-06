function showModal(params, cb) {
    let modal = $("#modal");

    modal.off("hide.bs.modal");
    modal.find(".btn-primary").off("click");

    modal.find(".modal-title").text(params.title);
    modal.find(".modal-body").text(params.body);
    modal.find(".btn-primary").text(params.btn_primary || "OK");
    modal.find(".btn-primary").on("click", params.confirm);
    if (params.btn_secondary) {
        modal.find(".btn-secondary").show();
        modal.find(".btn-secondary").text(params.btn_secondary);
    } else {
        modal.find(".btn-secondary").hide();
    }

    modal.on("hide.bs.modal", cb);
    modal.modal("show");
}