function login() {
    let valid = true;
    
    $("form").serializeArray().forEach((input) => {
        if (!input.value) return valid = false;
    })

    if (!valid) return unauthorized();

    $.ajax({
        method: "POST",
        url: "/login",
        data: $("form").serialize(),
        success: () => {
            window.location.reload();
        },
        error: () => {
            unauthorized();
        }
    })
}

function unauthorized() {
    $("form input[type!='submit']").val('');
    $(".card").effect("shake", { distance: 10, times: 2 });
    $("form input:first-child").focus();
}