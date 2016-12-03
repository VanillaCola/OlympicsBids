var mapData;
var candidateData;
var yearData;
var summaryData;

// A function to draw the world map using d3 projection
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

    // need to adjust the centroids for USA, Russia and Canada to show their candidate cities
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
    }
	
}

// A function for handling the selection in the continent selector. The centroids for the continents are manually set.
function selectionChange() {
    var map = d3.select("#map");
    var selection = document.getElementById("selector").value;
    var x, y, k;
    var centroid = [];
    var width = 1100,
        height = 350;

    if (selection == "Africa") {
        centroid[0] = 550.0;
        centroid[1] = 210.0;
        k = 1.8;
    }
    else if (selection == "Americas") {
        centroid[0] = 300.0;
        centroid[1] = 210.0;
        k = 1.5;
    }
    else if (selection == "Asia") {
        centroid[0] = 700.0;
        centroid[1] = 170.0;
        k = 2;
    }
    else if (selection == "Europe") {
        centroid[0] = 550.0;
        centroid[1] = 110.0;
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

    map.selectAll("path")
        .classed("active", false);

    map.transition()
        .duration(1000)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
}

// a function to clear up the world map drawings.
function clearMap()
{
	var map = d3.select("#map");
	
	map.selectAll("rect").remove();
}

// a function to update the world map
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

    var projection = d3.geoMercator().scale(120).translate([450, 220]);
	
	map.selectAll("rect")
		.data(mapData)
		.enter()
		.append("rect")
		.attr("id", function(d)
		{
			var id = d.City;
			if (id == "St. Louis") {
			    id = "St Louis";
            }
			id = id.replace(/ /g,"_");
			return "m"+id;
		})
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
			return  1.2* d.count_of_host+10;
		})
		.attr("height", function(d)
		{
			return 1.2* d.count_of_host+10;
		})
		.on("mouseover", function(d)
		{
			d3.select(this)
			.style("stroke", "#000000")
			.style("stroke-width", "2");
			
			tip.show(d);
		})
        .on("mouseout", function(d)
		{
			d3.select(this)
			.style("stroke", "#ffffff")
			.style("stroke-width", "1");

			tip.hide(d);
		})
		.on("click", function(d){
			var summary = d3.select("#summary");
			var hist = [];
			var host = 0;
			var total = 0;
			var continent = "";
			var rate = 0;
			if(d.Continents == "Asia")
				continent = "Asia_td";
			else if(d.Continents == "Americas")
				continent = "Americas_td";
			else if(d.Continents == "Africa")
				continent = "Africa_td";
			else if(d.Continents == "Oceania")
				continent = "Oceania_td";
			else if(d.Continents == "Europe")
				continent = "Europe_td";
			
            summaryData.forEach(function (city) {
                if (city.City == d.City) {
					total = total + 1;
					if(city["Host?"] == "Yes")
					{
						host = host + 1;
					}
					hist.push({"Year": city.Year, "Host": city["Host?"]});
                }
            });
			
			rate = host/total * 100;
			
			rate = rate.toFixed(2);
			
			var table = '<table id="summary_table">';
			table += '<td class="'+continent+'">' + d.City + ' Hosted ' + host + ' Games: </td>';
			
			hist.forEach(function(d)
			{
				if(d.Host == "Yes")	
					table += '<td class="' + continent + '">' + d.Year + '<br>' + '&#x2714' + '</td>';
				else
					table += '<td class="' + continent + '">' + d.Year + '<br>' + '&#x2718' + '</td>';
			});
			
			table += '<td class="' + continent + '">' + "Success Rate" + '<br>' + rate + '%</td>';
			
			table += '</table>';
			
			summary.style("visibility", "visible")
					.html(table);
		});	
}

// a fucntion to handle drawing the stach bar chart.
function drawChart() {
    var height = 400;
    var width = 1200;
    var padding = 40;

    var yearAxis = []

    var tip = d3.tip()
        .attr("class", "chart-tooltip")
        .offset([40,80])
        .html(function(d) {
            var country = "";
            candidateData.forEach(function (city) {
                if (city.City == d.city) {
                    country = city.Country;
                }
            })
            return d.city + "</br>" + country;
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
            .style("opacity", 1.0)
            .on("mouseover", function(d){
				d3.select(this)
                    .moveToFront()
				.style("stroke", "#000000")
				.style("stroke-width", "2");
			
				var id = d.city;
                if (id == "St. Louis") {
                    id = "St Louis"
                }
				id = id.replace(/ /g,"_");
				d3.select("#m"+id)
                    .moveToFront()
				.style("stroke", "#000000")
				.style("stroke-width", "2");
				tip.show(d);
			})
            .on("mouseout", function(d)
			{
				d3.select(this)
                    // .moveToBack()
				.style("stroke", "#ffffff")
				.style("stroke-width", "1");
				
				var id = d.city;
                if (id == "St. Louis") {
                    id = "St Louis";
                }
				id = id.replace(/ /g,"_");
				d3.select("#m"+id)
                    // .moveToBack()
				.style("stroke", "#ffffff")
				.style("stroke-width", "1");
				
				tip.hide(d);
			});

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
                .style("opacity", 1.0)
                .on("mouseover", function(d)
				{
					d3.select(this)
                        .moveToFront()
                        .style("stroke", "#000000")
                        .style("stroke-width", "2");

                    var id = d.city;
                    if (id == "St. Louis") {
                        id = "St Louis";
                    }
                   
                    id = id.replace(/ /g,"_");
                    
                    d3.select("#m"+id)
                        .moveToFront()
                        .style("stroke", "#000000")
                        .style("stroke-width", "2");

					tip.show(d);
				})
                .on("mouseout", function(d)
				{
					d3.select(this)
                        .style("stroke", "#ffffff")
                        .style("stroke-width", "1");

                    var id = d.city;
                    if (id == "St. Louis") {
                        id = "St Louis";
                    }
                    id = id.replace(/ /g,"_");
                    d3.select("#m"+id)
                    // .moveToBack()
                        .style("stroke", "#ffffff")
                        .style("stroke-width", "1");

					tip.hide(d)
				});
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

            var continentArr = {Asia: {num:0, city:[]}, Africa: {num:0, city:[]},
                Americas: {num:0, city:[]}, Oceania: {num:0, city:[]}, Europe: {num:0, city:[]}};
            for (var year = 0; year < brushedYear.length; year++) {
                var singleYear = yearData[brushedYear[year]];
                if (singleYear.host) {
                    continentArr[singleYear.host.continent].num = parseInt(continentArr[singleYear.host.continent].num) + 1;
                    continentArr[singleYear.host.continent].city.push(singleYear.host.city);
                }
                singleYear.candidate.forEach(function (d) {
                    continentArr[d.continent].num = parseInt(continentArr[d.continent].num) + 1;
                    continentArr[d.continent].city.push(d.city);
                });
            }

            var arr = [];
            for (var c in continentArr) {
                arr.push([c, parseInt(continentArr[c].num)]);
            }

            var sum = 0;
            for (var c in continentArr) {
                sum += parseInt(continentArr[c].num);
            }
            var unit = width / sum;

            var tip = d3.tip()
                .attr("class", "chart-tooltip")
                .offset([0, 0])
                .html(function (d) {
                    var returnValue = "";
                    arr.forEach(function (c) {
                        if (c[1] != 0) {
                            if (c[0] == d[0]) {
                                returnValue += "<span class='" + c[0] + "' style='border: 0px solid gray; padding: 0.5px;'>Cities from "
                                    + c[0] + " : " + c[1] + "</span><span> <<<</span></br>";
                            }
                            else {
                                returnValue += "<span class='" + c[0] + "'>Cities from " + c[0] + " : " + c[1] + "</span></br>";
                            }

                        }
                    })
                    return returnValue;
                });

            d3.select("#brushFigure").call(tip);

            var arr2 = [];
            for (var c in continentArr) {
                arr2.push([c, continentArr[c]]);
            }

            var dataBinding = d3.select("#brushFigure")
                .selectAll("rect")
                .data(arr2)
                .enter()
                .append("rect");

            var dataBindingCombined = d3.select("#brushFigure")
                .selectAll("rect")
                .data(arr2)
                .merge(dataBinding);

            dataBindingCombined
                .attr("y", 40)
                .attr("class", function (d) {
                    return d[0];
                })
                .attr("height", 40)
                // .attr("width", 0)
                .style("fill-opacity", 0.1)
                .on("mouseover", function(d) {
                    tip.show(d);

                    d[1].city.forEach(function (c) {
                        var id = c;
                        if (id == "St. Louis") {
                            id = "St Louis";
                        }
                        id = id.replace(/ /g, "_");
                        d3.select("#m" + id)
                            .moveToFront()
                            .style("stroke", "#000000")
                            .style("stroke-width", "2");
                    });
                })
                .on("mouseout", function(d) {
                    tip.hide();

                    d[1].city.forEach(function (c) {
                        var id = c;
                        if (id == "St. Louis") {
                            id = "St Louis";
                        }
                        id = id.replace(/ /g, "_");
                        d3.select("#m" + id)
                            .style("stroke", "#ffffff")
                            .style("stroke-width", "1");
                    });
                })
                .transition()
                .duration(500)
                .attr("x", function (d, i) {
                    var temp = 0;
                    for (var index = 0; index < i; index++) {
                        temp += arr2[index][1].num;
                    }
                    return temp * unit + padding;
                })
                .attr("width", function (d, i) {
                    return unit * arr2[i][1].num;
                })
                .style("fill-opacity", 0.8);
        }
        else {
            d3.select("#brushText").selectAll("text").remove();
            d3.select("#brushFigure").selectAll("rect").remove();
        }
    }

    // draw two text boxes to explain 1916/1940/1944 Olympic Games
    var circleCoords = [{x:xAxisScale(1916), y:yAxisScale(8)},
                        {x:xAxisScale(1940), y:yAxisScale(4)},
                        {x:xAxisScale(1944), y:yAxisScale(10)}];

    d3.select("#barChart")
        .selectAll("circle")
        .data(circleCoords)
        .enter()
        .append("circle")
        .attr("cx", function(d){
            return d.x + padding;
        })
        .attr("cy", function(d){
            return d.y;
        })
        .classed("infoCircle", true);

    var lineCoords = [{x:xAxisScale(1916), y1:yAxisScale(8), y2:yAxisScale(15)},
        {x:xAxisScale(1940), y1:yAxisScale(4), y2:yAxisScale(15)},
        {x:xAxisScale(1944), y1:yAxisScale(10), y2:yAxisScale(15)}];

    d3.select("#barChart")
        .selectAll("line")
        .data(lineCoords)
        .enter()
        .append("line")
        .attr("x1", function(d){
            return d.x + padding;
        })
        .attr("x2", function(d){
            return d.x + padding;
        })
        .attr("y1", function(d){
            return d.y1;
        })
        .attr("y2", function(d){
            return d.y2;
        })
        .classed("infoLine", true);

    var texts =
        [{x:xAxisScale(1916), y:yAxisScale(17), text:"Scheduled in Berlin, cancelled", dy:"0em", dx:"-65px"},
        {x:xAxisScale(1916), y:yAxisScale(17), text:"due to the outbreak of WWI1", dy:"1.2em", dx:"-65px"},
        {x:xAxisScale(1940), y:yAxisScale(17), text:"Scheduled in Tokyo (1940) and London (1944),", dy:"0em", dx:"-18px"},
        {x:xAxisScale(1940), y:yAxisScale(17), text:"cancelled due to WWII", dy:"1.2em", dx:"-18px"}];

    d3.select("#barChart")
        .selectAll("text")
        .data(texts)
        .enter()
        .append("text")
        .attr("x", function(d){
            return d.x;
        })
        .attr("y", function(d){
            return d.y;
        })
        .attr("dx", function(d){
            return d.dx;
        })
        .attr("dy", function(d){
            return d.dy;
        })
        .text(function(d){
            return d.text;
        });
}

// a function to handle the call for drawing the stach bar chart
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
	

    d3.csv("data/Candidate_Cities_data.csv", function(error, csv)
    {
        if (error) throw error;
		
		summaryData = csv.sort(function(a,b){return a.Year-b.Year});
    });
	

    d3.csv("data/Map_candidate_cities_data.csv", function(error, csv)
    {
        if (error) throw error;

        csv.forEach(function(d)
        {
            d.pos = [+d.Longitude, +d.Latitude];
            d.count_of_host = +d["Count of Host"];
            // mapping[d.City] = d.Continents;
        });

        mapData = csv;
        updateMap("all");

        drawChartCall();
    });

    // https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

});
