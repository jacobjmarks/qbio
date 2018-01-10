$(document).ready(() => {
    populateJobs();
})

function populateJobs() {
    $.ajax({
        method: "GET",
        url: "jobs/status",
        success: (data, status, req) => {
            data.forEach((job) => {
                $("#jobs").append(
                    $("<div class='card mb-3 w-100 text-center'>")
                        .append(
                            $("<div class='card-body'>")
                                .html(job.created_at + '<br>' + job.tool)
                        )
                        .click(() => {
                            visualize(job);
                        })
                )
            })
        }
    })
}

function visualize(job) {
    $.ajax({
        method: "GET",
        url: `job/${job.created_at}/result/download`,
        success: (data, status, req) => {
            let result = data;

            let div = $("#vis div")[0];

            Plotly.purge(div);
            
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

                    Plotly.plot(div, [{
                        y: plotvals.y
                    }], { margin: { t: 0 } })
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

                    Plotly.plot(div, [{
                        y: plotvals.y
                    }], { margin: { t: 0 } })
                })(); break;
            }
        }
    })
}