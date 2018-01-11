$(document).ready(() => {
    visdiv = $("#vis > div")[0];
    populateJobs();
    
    $(window).resize(() => {
        if ($(visdiv).hasClass("js-plotly-plot")) Plotly.Plots.resize(visdiv);
    });
})


function populateJobs() {
    $.ajax({
        method: "GET",
        url: "jobs/status",
        success: (data, status, req) => {
            data.forEach((job) => {
                $("#jobs").append(
                    $("<div class='card mb-3 w-100'>")
                        .append(
                            $("<div class='card-body'>")
                                .append(
                                    $("<div class='float-left'>")
                                        .html(job.created_at + '<br>' + job.tool)
                                    )
                                .append(
                                    $("<button class='btn btn-link float-right'>")
                                        .append($("<i class='fa fa-plus'>"))
                                        .click(() => {
                                            visualize(job, true);
                                        })
                                )
                                .append(
                                    $("<button class='btn btn-light float-right'>")
                                        .append($("<i class='fa fa-eye'>"))
                                        .click(() => {
                                            visualize(job);
                                        })
                                )
                        )
                )
            })
        }
    })
}

function visualize(job, append) {
    $.ajax({
        method: "GET",
        url: `job/${job.created_at}/result/download`,
        success: (data, status, req) => {
            let result = data;

            if (!append) Plotly.purge(visdiv);
            
            switch (job.tool) {
                case "bloom_filter": (() => {
                    let tsv = Plotly.d3.tsv.parse(result);

                    let plotvals = {
                        x: [],
                        y: []
                    }

                    tsv.forEach((datum) => {
                        plotvals.y.push(datum['BFBits']);
                    })

                    Plotly.plot(visdiv, [{
                        y: plotvals.y,
                        mode: 'markers',
                        type: 'scatter'
                    }], {
                        yaxis: {
                            type: "log",
                            autorange: true
                        }
                    })
                })(); break;
                case "mmseqs2": (() => {
                    let tsv = Plotly.d3.tsv.parse(result);

                    let plotvals = {
                        x: [],
                        y: []
                    }

                    tsv.forEach((datum) => {
                        plotvals.y.push(datum['bitScore']);
                    })

                    Plotly.plot(visdiv, [{
                        y: plotvals.y,
                        mode: 'markers',
                        type: 'scatter'
                    }], {
                        yaxis: {
                            type: "log",
                            autorange: true
                        }
                    })
                })(); break;
            }
        }
    })
}