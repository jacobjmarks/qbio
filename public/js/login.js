$(document).ready((e) => {
    $("form").submit((e) => {
        e.preventDefault();

        $.ajax({
            method: "POST",
            url: "/login",
            contentType: "application/x-www-form-urlencoded",
            data: $("form").serialize(),
            success: (data, status, req) => {
                window.location.reload();
            },
            error: () => {
                unauthorized();
            }
        })
    })
})

function unauthorized() {
    $("form input[type!='submit']").val('');
    $(".card").effect("shake", { distance: 10, times: 2 });
    $("form input:first-child").focus();
}