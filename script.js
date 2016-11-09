var mapData;
var candidateData;
var yearData;
// var mapping;

function drawMap(world)
{
	// var projection = d3.geoEquirectangular().scale(160).translate([450, 200]);
	var projection = d3.geoMercator().scale(120).translate([450, 220]);

	var map = d3.select("#map");
	
	var path = d3.geoPath().projection(projection);
	
	var countries = topojson.feature(world, world.objects.countries).features;
	var lands = topojson.feature(world, world.objects.land).features;
	var graticule = d3.geoGraticule();
		
	map.selectAll(".countries")
		.data(countries)
		.enter()
		.append("path")
		.classed("countries", true)
		.attr("d", path)
		.attr("id", function(d)
		{
			return d.id;
		});

}

function clearMap()
{
	var map = d3.select("#map");
	
	map.selectAll("rect").remove();
}

function updateMap(selection)
{
	clearMap();
	
	var map = d3.select("#map");
	
	// var projection = d3.geoEquirectangular().scale(160).translate([450, 200]);
    var projection = d3.geoMercator().scale(120).translate([450, 220]);
	
	map.selectAll("rect")
		.data(mapData)
		.enter()
		.append("rect")
		.attr("class", function(d)
		{
			return d.Continents;
		})
		.attr("x", function(d)
		{
			var pos = projection(d.pos);
			return pos[0] - (d.count_of_host+10)/2;
		})
		.attr("y", function(d)
		{
			var pos = projection(d.pos);
			return pos[1] - (d.count_of_host+10)/2;
		})
		.attr("width", function(d)
		{
			return 10 + d.count_of_host;
		})
		.attr("height", function(d)
		{
			return 10 + d.count_of_host;
		});
		
}

function drawChart() {
    var height = 400;
    var width = 1200;
    var padding = 40;

    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([25,75])
        .html(function(d) {
            // console.log(d);
            return "<span>" + d.city + "</span>";
        });

    d3.select("#barChartSvg")
        .attr("height", height)
        .attr("width", width);

    var xAxisScale = d3.scaleLinear()
        .domain([1892, 2024])
        .range([0, width-padding]);

    var yAxisScale = d3.scaleLinear()
        .domain([0, 20])
        .range([height-padding, 0]);

    var yAxis = d3.axisLeft();
    yAxis.scale(yAxisScale)
        .tickValues(d3.range(0, 20, 5));

    var xAxis = d3.axisBottom();
    xAxis.scale(xAxisScale)
        .tickValues(d3.range(1896, 2024, 4))
        .tickFormat(d3.format("d"));

    d3.select("#yAxis")
        .attr("transform", "translate("+padding+",0)")
        .call(yAxis);

    d3.select("#xAxis")
        .attr("transform", "translate("+padding+","+(height-padding)+")")
        .call(xAxis);


    // console.log(mapping);
    for (var index = 1896; index <= 2020; index += 4) {
        var year = yearData[index.toString()];

        // console.log(year);
        d3.select("#barChart")
            .append("g")
            .attr("id", "year"+index)
            .call(tip);

        d3.select("#year"+index)
            .selectAll("rect")
            .data(year.candidate)
            .enter()
            .append("rect")
            .attr("x", xAxisScale(index+3)+6)
            .attr("y", function(d,i) {
                if (year.host) {
                    return height - padding - yAxisScale(19) * (i + 2);
                }
                else {
                    return height - padding - yAxisScale(19) * (i + 1)
                }
            })
            .attr("width", 18)
            .attr("height", yAxisScale(19))
            .attr("class", function(d) {
                return d.continent;
            })
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);

        if (year.host) {
            d3.select("#year" + index)
                // .selectAll("rect")
                .data([year.host])
                // .enter()
                .append("rect")
                .attr("x", xAxisScale(index + 3))
                .attr("y", height - padding - yAxisScale(19))
                .attr("width", 30)
                .attr("height", yAxisScale(19))
                .classed(year.host.continent, true)
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide);
        }
    }

}

function drawChartCall() {
    d3.csv("data/Candidate_Cities_data.csv", function (error, csv) {
        if (error) throw error;

        var mapping = {};
        mapData.forEach(function (d) {
            mapping[d.City] = d.Continents;
        });

        var list = {};
        csv.forEach(function (d) {
            if (!(d.Year in list)) {
                list[d.Year] = {};
                list[d.Year].candidate = [];
                list[d.Year].candidate.push({city:d.City, continent:mapping[d.City]});
            }
            else {
                list[d.Year].candidate.push({city:d.City, continent:mapping[d.City]});
            }

            if (d["Host?"] == "Yes") {
                list[d.Year].host = {city:d.City, continent:mapping[d.City]};
                list[d.Year].candidate.pop();
            }
        });

        for (var key in list) {
            list[key].candidate.sort(function(a,b) {
                if(a.continent > b.continent)
                    return -1;
                if (a.continent == b.continent)
                    return 0;
                else
                    return 1;
            });
        }

        candidateData = csv;
        yearData = list;

        drawChart();
    });
}

d3.json("data/world-50m.json", function(error, world)
{
	if(error) throw error;

	drawMap(world);

    d3.csv("data/Map_candidate_cities_data.csv", function(error, csv)
    {
        if (error) throw error;

        csv.forEach(function(d)
        {
            d.pos = [+d.Longitude, +d.Latitude];
            d.count_of_host = +d["Count of Host"];
            // mapping[d.City] = d.Continents;
        });

        // console.log(mapping);
        mapData = csv;
        updateMap("all");

        drawChartCall();
    });
});





// d3.csv("data/Map_candidate_cities_data.csv", function(error, csv)
// {
//     if (error) throw error;
//
// 	csv.forEach(function(d)
// 	{
// 		d.pos = [+d.Longitude, +d.Latitude];
// 		d.count_of_host = +d["Count of Host"];
// 	});
//
// 	mapData = csv;
// 	updateMap("all");
// });

