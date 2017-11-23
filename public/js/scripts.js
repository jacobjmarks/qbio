const fileInput = $("#uploadform :input")[0];

$("#uploadform").submit((e) => {
    e.preventDefault();
    $.ajax({
        method: "POST",
        url: "/uploadfile",
        contentType: false,
        processData: false,
        data: (() => {
            let formdata = new FormData();
            formdata.append('file', fileInput.files[0]);
            return formdata;
        })(),
        success: (data, status, req) => {
            
        },
        error: (req, status, error) => {
            alert(req.responseText);
        }
    })
    return false;
})