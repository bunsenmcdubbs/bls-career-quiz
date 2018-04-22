num_jobs_display = dc.dataCount('#num_jobs');
num_employed_display = dc.numberDisplay('#num_employed');
experience_chart = dc.barChart('#experience_chart');
uncertainty_chart = dc.barChart('#uncertainty_chart');
pace_chart = dc.scatterPlot('#pace_chart');
communication_chart = dc.scatterPlot('#communication_chart');
physicality_chart = dc.scatterPlot('#physicality_chart');
jobs_table = dc.dataTable('#data_table');

d3.csv('job-data.csv', function(data) {

    var ndx = crossfilter(data);

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

    var num_employed = ndx.groupAll().reduceSum(function(d) {return +d.num_employed;});
    var communication_group = communication_type_dim.group().reduceCount();
    var experience_group = experience_dim.group().reduceSum(function(d) {return +d.num_employed;});
    var uncertainty_group = uncertainty_dim.group().reduceSum(function(d) {return +d.num_employed;});
    var pace_variety_group = pace_variety_dim.group().reduceSum(function(d) {return +d.num_employed;});
    var physicality_group = physicality_danger_dim.group().reduceCount();

    num_jobs_display
        .dimension(ndx)
        .group(ndx.groupAll())
        .html({
            some: '<strong>%filter-count occupations</strong> selected out of <strong>%total-count</strong> records | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });

    num_employed_display
        .group(num_employed)
        .valueAccessor(function(p) {return p;})
        .html({
            some: '<strong>%number jobs</strong> selected',
            all: 'All occupations selected. Please click on the graph to apply filters.'
        });

    experience_chart
        .width(600)
        .height(150)
        .margins({top: 10, right: 50, bottom: 30, left: 60})

        .dimension(experience_dim)
        .group(experience_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel('# Employed')

        .controlsUseVisibility(true);

    uncertainty_chart
        .width(600)
        .height(150)
        .margins({top: 10, right: 50, bottom: 30, left: 60})

        .dimension(uncertainty_dim)
        .group(uncertainty_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel('# Employed')

        .controlsUseVisibility(true);

    pace_chart
        .width(400)
        .height(400)

        .dimension(pace_variety_dim)
        .group(pace_variety_group)

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

    currency_formatter = d3.format('$,.2f');
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
            },
            {
                label: 'Number Employed',
                format: function(d) {
                    return Math.round(d.num_employed);
                }
            },
            {
                label: 'Median Annual Wage',
                format: function(d) {
                    return currency_formatter(+d.med_annual_wage);
                }
            },
        ]);

    dc.renderAll();
});
