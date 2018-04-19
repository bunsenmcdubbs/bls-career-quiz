experience_chart = dc.barChart('#experience_chart');
pace_chart = dc.barChart('#pace_chart');
communication_chart = dc.scatterPlot('#communication_chart');
physicality_chart = dc.barChart('#physicality_chart');
jobs_table = dc.dataTable('#data_table');

d3.csv('calculated_metrics.csv', function(data) {

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var communication_type_dim = ndx.dimension(function (d) {
        return [+d.communication, +d.interaction_complexity];
    });
    var experience_dim = ndx.dimension(function (d) {
        return Math.round(+d.experience);
    });
    var pace_dim = ndx.dimension(function (d) {
        return Math.round(+d.pace_of_work);
    });
    var physicality_dim = ndx.dimension(function (d) {
        return Math.round(+d.physicality);
    });

    var communication_group = communication_type_dim.group().reduceCount();
    var pace_group = pace_dim.group().reduceCount();
    var experience_group = experience_dim.group().reduceCount();
    var physicality_group = physicality_dim.group().reduceCount();

    experience_chart
        .width(600)
        .height(100)
        .dimension(experience_dim)
        .group(experience_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)

        .controlsUseVisibility(true);

    pace_chart
        .width(600)
        .height(100)

        .dimension(pace_dim)
        .group(pace_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)

        .controlsUseVisibility(true);

    communication_chart
        .width(400)
        .height(400)

        .dimension(communication_type_dim)
        .group(communication_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .xAxisLabel('Communication Frequency')
        .yAxisLabel('Interaction Complexity')

        .excludedOpacity(0.5)

        .controlsUseVisibility(true);

    physicality_chart
        .width(600)
        .height(100)

        .dimension(physicality_dim)
        .group(physicality_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)

        .controlsUseVisibility(true);

    jobs_table
        .dimension(physicality_dim)
        .group(function(d) { return ""; })
        .size(50)
        .columns([
            {
                label: 'Occupation',
                format: function(d) {
                    return d.occupation_text;
                }
            }
        ]);

    dc.renderAll();
});
