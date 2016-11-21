var mapData;
var candidateData;
var yearData;
// var mapping;

function drawMap(world)
{
    var width = 1100,
        height = 350,
        centered;

	// var projection = d3.geoEquirectangular().scale(160).translate([450, 200]);
	var projection = d3.geoMercator().scale(120).translate([450, 220]);

	var map = d3.select("#map");
	
	var path = d3.geoPath().projection(projection);
	
	var countries = topojson.feature(world, world.objects.countries).features;
	var lands = topojson.feature(world, world.objects.land).features;
	var graticule = d3.geoGraticule();

    d3.select("#selector").attr("onchange", "selectionChange()");

    map.append("rect")
        .attr("class", "background")
        .attr("width", 1100)
        .attr("height", 350)
        .on("click", clicked);

	map.selectAll(".countries")
		.data(countries)
		.enter()
		.append("path")
		.classed("countries", true)
		.attr("d", path)
		.attr("id", function(d)
		{
			return d.id;
        })
        .on("click", clicked);

    var usa = [200.2752559979278, 94.78255166210089];
    var canada = [246.27472463014664, 25.250675373398686];
    var russia = [654.8952792374205, 39.984858220915804];

    function clicked(d) {
        var x, y, k;

        if (d && centered !== d) {
            var centroid = path.centroid(d);
            if (centroid[0] == usa[0] && centroid[1] == usa[1]) {
                centroid[0] = 250.0;
                centroid[1] = 140.0;
            }
            else if (centroid[0] == canada[0] && centroid[1] == canada[1]) {
                centroid[0] = 250.0;
                centroid[1] = 90.0;
            }
            else if (centroid[0] == russia[0] && centroid[1] == russia[1]) {
                centroid[0] = 550.0;
                centroid[1] = 60.0;
            }
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
            var selectValue = document.getElementById("selector");
            selectValue.value = "All";
        }

        map.selectAll("path")
            .classed("active", centered && function (d) {
                    return d === centered;
                });

        map.transition()
            .duration(1000)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
        // .style("stroke-width", 1.5 / k + "px");
    }
}

function selectionChange() {
    var map = d3.select("#map");
    var selection = document.getElementById("selector").value;
    var x, y, k;
    var centroid = [];
    var width = 1100,
        height = 350;

    if (selection == "Africa") {
        centroid[0] = 500.0;
        centroid[1] = 210.0;
        k = 1.8;
    }
    else if (selection == "Americas") {
        centroid[0] = 300.0;
        centroid[1] = 210.0;
        k = 1.5;
    }
    else if (selection == "Asia") {
        centroid[0] = 660.0;
        centroid[1] = 170.0;
        k = 2;
    }
    else if (selection == "Europe") {
        centroid[0] = 490.0;
        centroid[1] = 90.0;
        k = 2;
    }
    else if (selection == "Oceania") {
        centroid[0] = 730;
        centroid[1] = 275;
        k = 3;
    }
    else {
        centroid[0] = width / 2;
        centroid[1] = height / 2;
        k = 1;
    }

    x = centroid[0];
    y = centroid[1];

    // centered = d;

    // x = width / 2;
    // y = height / 2;
    // k = 1;
    // centered = null;


    map.selectAll("path")
        .classed("active", false);

    map.transition()
        .duration(1000)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
    // .style("stroke-width", 1.5 / k + "px");
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
	
	var tip = d3.tip()
        .attr("class", "map-tooltip")
		.direction('se')
        .offset([0,0])
        .html(function(d) {
            return "<b>" + d.City + "</b> has applies <b>" + d.count_of_host + "</b> times to host the Summer Games.<br/><br/> Click to see how many times " + d.City + " successfully hosted the Games.";
        });

	map.call(tip);

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
		})
		.on("mouseover", tip.show)
        .on("mouseout", tip.hide);
		
}

function drawChart() {
    var height = 400;
    var width = 1200;
    var padding = 40;

    var yearAxis = []

    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([25,75])
        .html(function(d) {
            var country = "";
            candidateData.forEach(function (city) {
                if (city.City == d.city) {
                    country = city.Country;
                }
            })
            return "<span>" + d.city + "</span></br><span>" + country + "</span>";
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

    var inteval = xAxisScale(4) - xAxisScale(0);
    for (var index = 1896; index <= 2020; index += 4) {
        yearAxis.push({index: index, x1: xAxisScale(index) + padding});

        var year = yearData[index.toString()];

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

    var brush = d3.brushX().extent([[padding, height * 0.9],
        [width, height * 0.95]]).on("end", brushed);

    d3.select("#barChartSvg").append("g").attr("class", "brush").call(brush);

    function brushed() {
        var brushedYear = [];
        var selection = d3.event.selection;

        if (selection != null) {
            for (var i = 0; i < yearAxis.length; i++) {
                if (selection[0] < yearAxis[i].x1 && selection[1] > yearAxis[i].x1) {
                    brushedYear.push(yearAxis[i].index);
                }
            }
            // console.log(brushedYear);
            d3.select("#brushDisplay")
                .attr("width", width)
                .attr("height", height / 5);

            d3.select("#brushDisplay")
                .selectAll("text")
                .remove();

            d3.select("#brushDisplay")
                .select("#brushText")
                .append("text")
                .attr("x", padding)
                .attr("y", 10)
                .attr("class", "text")
                .text(function () {
                    var returnText = "Years Selected: ";
                    brushedYear.forEach(function (d) {
                        returnText += d + " ,";
                    })
                    return returnText.substring(0, returnText.length - 1);
                });

            var continentArr = {Asia: 0, Africa: 0, Americas: 0, Oceania: 0, Europe: 0};
            for (var year = 0; year < brushedYear.length; year++) {
                var singleYear = yearData[brushedYear[year]];
                if (singleYear.host) {
                    continentArr[singleYear.host.continent] = parseInt(continentArr[singleYear.host.continent]) + 1;
                }
                singleYear.candidate.forEach(function (d) {
                    continentArr[d.continent] = parseInt(continentArr[d.continent]) + 1;
                });
            }

            var arr = [];
            for (var c in continentArr) {
                arr.push([c, parseInt(continentArr[c])]);
            }

            var sum = 0;
            for (var c in continentArr) {
                sum += parseInt(continentArr[c]);
            }
            var unit = width / sum;

            var tip = d3.tip()
                .attr("class", "d3-tip")
                .offset([0, 0])
                .html(function (d) {
                    var returnValue = "";
                    arr.forEach(function (c) {
                        if (c[1] != 0) {
                            if (c[0] == d[0]) {
                                returnValue += "<span class='" + c[0] + "' style='border: 1px solid rgb(127, 127, 127);'>Cities from "
                                    + c[0] + " : " + c[1] + "</span><span> <=</span></br>";
                            }
                            else {
                                returnValue += "<span class='" + c[0] + "'>Cities from " + c[0] + " : " + c[1] + "</span></br>";
                            }

                        }
                    })
                    return returnValue;
                });

            d3.select("#brushFigure").call(tip);

            var dataBinding = d3.select("#brushFigure")
                .selectAll("rect")
                .data(arr)
                .enter()
                .append("rect");

            var dataBindingCombined = d3.select("#brushFigure")
                .selectAll("rect")
                .data(arr)
                .merge(dataBinding);

            dataBindingCombined
                .attr("y", 40)
                .attr("x", function (d, i) {
                    var temp = 0;
                    for (var index = 0; index < i; index++) {
                        temp += arr[index][1];
                    }
                    return temp * unit + padding;
                })
                .attr("class", function (d, i) {
                    return arr[i][0];
                })
                .attr("height", 40)
                .attr("width", 0)
                .style("fill-opacity", 0)
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide)
                .transition()
                .duration(500)
                .attr("width", function (d, i) {
                    return unit * arr[i][1];
                })
                .style("fill-opacity", 1);
        }
        else {
            d3.select("#brushText").selectAll("text").remove();
            d3.select("#brushFigure").selectAll("rect").remove();
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
                list[d.Year].candidate.push({city:d.City, country: d.Country, continent:mapping[d.City]});
            }
            else {
                list[d.Year].candidate.push({city:d.City, country: d.Country, continent:mapping[d.City]});
            }

            if (d["Host?"] == "Yes") {
                list[d.Year].host = {city:d.City, country: d.Country, continent:mapping[d.City]};
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

