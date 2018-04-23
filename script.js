average_wage_display = dc.numberDisplay('#average_wage');
num_employed_display = dc.numberDisplay('#num_employed');
num_jobs_display = dc.dataCount('#num_jobs');
wage_chart = dc.barChart('#wage_chart');
experience_chart = dc.barChart('#experience_chart');
uncertainty_chart = dc.barChart('#uncertainty_chart');
pace_chart = dc.scatterPlot('#pace_chart');
communication_chart = dc.scatterPlot('#communication_chart');
physicality_chart = dc.scatterPlot('#physicality_chart');
jobs_table = dc.dataTable('#data_table');

d3.csv('job-data.csv', function(data) {

    data.forEach(function(d) {
        d.num_employed = +d.num_employed;
        d.mean_annual_wage = +d.mean_annual_wage;

        d.communication = +d.communication;
        d.interaction_complexity = +d.interaction_complexity;
        d.experience = +d.experience;
        d.uncertain_decisions = +d.uncertain_decisions;
        d.pace_of_work = +d.pace_of_work;
        d.variety = +d.variety;
        d.physicality = +d.physicality;
        d.danger = +d.danger;
    });

    var ndx = crossfilter(data);

    var wage_dim = ndx.dimension(function(d) {
        return Math.floor(d.mean_annual_wage / 10000) * 10000;
    });
    var occupation_code_dim = ndx.dimension(function (d) {
        return d.occupation_code;
    });
    var communication_type_dim = ndx.dimension(function (d) {
        return [d.communication, d.interaction_complexity];
    });
    var experience_dim = ndx.dimension(function (d) {
        return Math.round(d.experience * 2);
    });
    var uncertainty_dim = ndx.dimension(function (d) {
        return Math.round(d.uncertain_decisions * 5);
    });
    var pace_variety_dim = ndx.dimension(function (d) {
        return [d.pace_of_work, d.variety];
    });
    var physicality_danger_dim = ndx.dimension(function (d) {
        return [d.physicality, d.danger];
    });

    var total_wage = ndx.groupAll().reduceSum(function (d) {return d.mean_annual_wage * d.num_employed;});
    var num_employed = ndx.groupAll().reduceSum(function(d) {return d.num_employed;});
    var wage_group = wage_dim.group().reduceSum(function(d) {return d.num_employed;});
    var communication_group = communication_type_dim.group().reduceCount();
    var experience_group = experience_dim.group().reduceSum(function(d) {return d.num_employed;});
    var uncertainty_group = uncertainty_dim.group().reduceSum(function(d) {return d.num_employed;});
    var pace_variety_group = pace_variety_dim.group().reduceSum(function(d) {return d.num_employed;});
    var physicality_group = physicality_danger_dim.group().reduceCount();

    num_employed_display
        .group(num_employed)
        .valueAccessor(function(p) {return p;})
        .html({
            some: '<strong>%number jobs</strong> selected',
            all: 'All occupations selected. Please click on the graph to apply filters.'
        });

    average_wage_display
        .group(total_wage)
        .valueAccessor(function(p) {return p / num_employed_display.value();})
        .html({
            some: 'Average annual wage: <strong>$%number</strong>',
            all: 'All occupations selected. Please click on the graph to apply filters.'
        });

    num_jobs_display
        .dimension(ndx)
        .group(ndx.groupAll())
        .html({
            some: '<strong>%filter-count occupations</strong> selected out of <strong>%total-count</strong> records | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });

    wage_chart
        .width(600)
        .height(150)
        .margins({top: 10, right: 50, bottom: 30, left: 60})

        .dimension(wage_dim)
        .group(wage_group)

        .x(d3.scale.linear())
        // .xUnits(function() {return wage_group.all().length + 1;})
        .xUnits(function() {return 20;})
        .elasticX(true)
        .elasticY(true)
        .yAxisLabel('# Employed')

        .controlsUseVisibility(true);

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
                label: 'Average Annual Wage',
                format: function(d) {
                    return currency_formatter(d.mean_annual_wage);
                }
            },
        ]);

    dc.renderAll();
});
