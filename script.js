experience_chart = dc.barChart('#test');
pace_chart = dc.barChart('#test2');
communication_chart = dc.barChart('#test3');

d3.csv('calculated_metrics.csv', function(data) {

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var communication_dim = ndx.dimension(function (d) {
        return Math.round(+d.communication);
    });
    var experience_dim = ndx.dimension(function (d) {
        return Math.round(+d.experience);
    });
    var interaction_dim = ndx.dimension(function(d) {
        return Math.round(+d.interaction_complexity);
    });
    var pace_dim = ndx.dimension(function (d) {
        return Math.round(+d.pace_of_work);
    });

    var communication_group = communication_dim.group().reduceCount();
    var pace_group = pace_dim.group().reduceCount();
    var experience_group = experience_dim.group().reduceCount();

    experience_chart
        .width(600)
        .height(200)
        .dimension(experience_dim)
        .group(experience_group)

        .x(d3.scale.linear().domain([-5,5]))
        // .yAxisLabel("This is the Y Axis!")

        .on('renderlet', function(chart) {
            chart.selectAll('rect').on("click", function(d) {
                console.log("click!", d);
            });
        })

        .elasticX(true)
        .elasticY(true)
        .centerBar(true)
        .turnOnControls(true);

    pace_chart
        .width(600)
        .height(200)
        .dimension(pace_dim)
        .group(pace_group)

        .x(d3.scale.linear().domain([-5,5]))

        .on('renderlet', function(chart) {
            chart.selectAll('rect').on("click", function(d) {
                console.log("click!", d);
            });
        })

        .elasticX(true)
        .elasticY(true)
        .centerBar(true)
        .turnOnControls(true);

    communication_chart
        .width(600)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .gap(1)

        .dimension(communication_dim)
        .group(communication_group)

        .title(function(){return 'test';})

        .on('renderlet', function(chart) {
            chart.selectAll('rect').on("click", function(d) {
                console.log("click!", d);
            });
        })

        .x(d3.scale.linear().domain([-5,5]))
        .elasticX(true)
        .elasticY(true)
        .centerBar(true)
        .turnOnControls(true);

    dc.renderAll();
});
