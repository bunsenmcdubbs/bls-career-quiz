experience_chart = dc.barChart('#experience_chart');
uncertainty_chart = dc.barChart('#uncertainty_chart');
pace_chart = dc.scatterPlot('#pace_chart');
communication_chart = dc.scatterPlot('#communication_chart');
physicality_chart = dc.scatterPlot('#physicality_chart');
jobs_table = dc.dataTable('#data_table');

d3.csv('calculated_metrics.csv', function(data) {

    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    var occupation_code_dim = ndx.dimension(function (d) {
        return d.occupation_code;
    });
    var communication_type_dim = ndx.dimension(function (d) {
        return [+d.communication, +d.interaction_complexity];
    });
    var experience_dim = ndx.dimension(function (d) {
        return Math.round(+d.experience * 2);
    });
    var uncertainty_dim = ndx.dimension(function (d) {
        return Math.round(+d.uncertain_decisions * 5);
    });
    var pace_variety_dim = ndx.dimension(function (d) {
        return [+d.pace_of_work, +d.variety];
    });
    var physicality_danger_dim = ndx.dimension(function (d) {
        return [+d.physicality, +d.danger];
    });

    var communication_group = communication_type_dim.group().reduceCount();
    var experience_group = experience_dim.group().reduceCount();
    var uncertainty_group = uncertainty_dim.group().reduceCount();
    var pace_group = pace_variety_dim.group().reduceCount();
    var physicality_group = physicality_danger_dim.group().reduceCount();

    experience_chart
        .width(600)
        .height(150)

        .dimension(experience_dim)
        .group(experience_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .yAxisPadding(.5)
        .yAxisLabel('# Occupations')

        .controlsUseVisibility(true);

    uncertainty_chart
        .width(600)
        .height(150)

        .dimension(uncertainty_dim)
        .group(uncertainty_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .yAxisPadding(.5)
        .yAxisLabel('# Occupations')

        .controlsUseVisibility(true);

    pace_chart
        .width(400)
        .height(400)

        .dimension(pace_variety_dim)
        .group(pace_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(.5)
        .yAxisPadding(.5)
        .xAxisLabel('Pace of Work')
        .yAxisLabel('Variety')

        .controlsUseVisibility(true);

    communication_chart
        .width(400)
        .height(400)

        .dimension(communication_type_dim)
        .group(communication_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(.5)
        .yAxisPadding(.5)
        .xAxisLabel('Communication Frequency')
        .yAxisLabel('Interaction Complexity')

        .controlsUseVisibility(true);

    physicality_chart
        .width(400)
        .height(400)

        .dimension(physicality_danger_dim)
        .group(physicality_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(.5)
        .yAxisPadding(.5)
        .xAxisLabel('Physicality')
        .yAxisLabel('Danger')

        .controlsUseVisibility(true);

    jobs_table
        .dimension(occupation_code_dim)
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
