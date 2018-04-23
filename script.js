average_wage_display = dc.numberDisplay('#average_wage');
num_employed_display = dc.numberDisplay('#num_employed');
num_jobs_display1 = dc.dataCount('#num_jobs1');
num_jobs_display2 = dc.dataCount('#num_jobs2');
wage_chart = dc.barChart('#wage_chart');
category_chart = dc.pieChart('#category_chart');
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
    var category_dim = ndx.dimension(function(d) {
        return d.category_name.replace(' Occupations', '');
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
    var category_group = category_dim.group().reduceSum(function(d) {return d.num_employed;});
    var experience_group = experience_dim.group().reduceSum(function(d) {return d.num_employed;});
    var uncertainty_group = uncertainty_dim.group().reduceSum(function(d) {return d.num_employed;});
    var pace_variety_group = pace_variety_dim.group().reduceCount();
    var communication_group = communication_type_dim.group().reduceCount();
    var physicality_group = physicality_danger_dim.group().reduceCount();

    average_wage_display
        .group(total_wage)
        .valueAccessor(function(p) {return p / num_employed_display.value();})
        .html({
            some: 'Average selected annual wage: <strong>$%number</strong>',
            all: 'All occupations selected. Please click on the graph to apply filters.'
        });

    num_employed_display
        .group(num_employed)
        .valueAccessor(function(p) {return p;})
        .html({
            some: '<strong>%number jobs</strong> selected',
            all: 'All occupations selected. Please click on the graph to apply filters.'
        });

    num_jobs_display1
        .dimension(ndx)
        .group(ndx.groupAll())
        .html({
            some: '<strong>%filter-count occupations</strong> selected out of <strong>%total-count</strong> records | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });
    num_jobs_display2
        .dimension(ndx)
        .group(ndx.groupAll())
        .html({
            some: '<strong>%filter-count occupations</strong> selected out of <strong>%total-count</strong> records | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });

    var short_currency = d3.format('$.1s');
    wage_chart
        .width(800)
        .height(400)
        .margins({top: 10, right: 50, bottom: 30, left: 60})

        .dimension(wage_dim)
        .group(wage_group)
        .filterPrinter(function (d) {
            return short_currency(d[0][0]) + " to " + short_currency(d[0][1]);
        })

        .x(d3.scale.linear().domain([20000, 210000]))
        .xUnits(function() {return 19;})
        .elasticY(true)
        .yAxisPadding('5%')
        .yAxisLabel('# Employed')
        .renderHorizontalGridLines(true)

        .label(function(d) {
            if (d.y < 10) {return '';}
            return d3.format('.1s')(d.y);
        })
        .controlsUseVisibility(true);
    wage_chart.xAxis().tickFormat(d3.format('$,'));

    category_chart
        .width(400)
        .height(400)
        .title(function(d) { return d.key + ": " + d3.format(',.3s')(d.value); })

        .dimension(category_dim)
        .group(category_group)

        .innerRadius(75)
        .externalRadiusPadding(25)
        .slicesCap(15)
        .controlsUseVisibility(true);

    experience_chart
        .width(600)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 60})

        .dimension(experience_dim)
        .group(experience_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .xAxisLabel('Experience Index')
        .yAxisPadding('5%')
        .yAxisLabel('# Employed')
        .renderHorizontalGridLines(true)

        .controlsUseVisibility(true);
    experience_chart.xAxis().tickSize(0);

    uncertainty_chart
        .width(600)
        .height(200)
        .margins({top: 10, right: 50, bottom: 30, left: 60})

        .dimension(uncertainty_dim)
        .group(uncertainty_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .xAxisLabel('Uncertainty Index')
        .yAxisPadding('5%')
        .yAxisLabel('# Employed')
        .renderHorizontalGridLines(true)

        .controlsUseVisibility(true);
    uncertainty_chart.xAxis().tickSize(0);

    pace_chart
        .width(400)
        .height(300)

        .dimension(pace_variety_dim)
        .group(pace_variety_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(.5)
        .yAxisPadding(.5)
        .xAxisLabel('Pace of Work Index')
        .yAxisLabel('Variety of Work Index')
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)

        .symbolSize(8)
        .nonemptyOpacity(.4)
        .excludedSize(3)
        .controlsUseVisibility(true);
    pace_chart.xAxis().tickSize(0);
    pace_chart.yAxis().tickSize(0);

    communication_chart
        .width(400)
        .height(300)

        .dimension(communication_type_dim)
        .group(communication_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(.5)
        .yAxisPadding(.5)
        .xAxisLabel('Communication Frequency Index')
        .yAxisLabel('Interaction Complexity Index')
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)

        .symbolSize(8)
        .nonemptyOpacity(.4)
        .excludedSize(3)
        .controlsUseVisibility(true);
    communication_chart.xAxis().tickSize(0);
    communication_chart.yAxis().tickSize(0);

    physicality_chart
        .width(400)
        .height(300)

        .dimension(physicality_danger_dim)
        .group(physicality_group)

        .x(d3.scale.linear())
        .elasticX(true)
        .elasticY(true)
        .xAxisPadding(.5)
        .yAxisPadding(.5)
        .xAxisLabel('Physicality Index')
        .yAxisLabel('Danger Index')
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)

        .symbolSize(8)
        .nonemptyOpacity(.4)
        .excludedSize(3)
        .controlsUseVisibility(true);
    physicality_chart.xAxis().tickSize(0);
    physicality_chart.yAxis().tickSize(0);

    var number_formatter = d3.format(',f');
    var currency_formatter = d3.format('$,.2f');
    jobs_table
        .dimension(ndx.dimension(function(d) { return d; }))
        .group(function(d) { return d.category_name; })
        .order(d3.ascending)
        .sortBy(function(d) {
            return d.occupation_name;
        })
        .size(400)
        .columns([
            {
                label: 'Occupation',
                format: function(d) {
                    return d.occupation_name;
                }
            },
            {
                label: 'Number Employed',
                format: function(d) {
                    return number_formatter(d.num_employed);
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
