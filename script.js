
var mapData;


function drawMap(world)
{
	var projection = d3.geoEquirectangular().scale(160).translate([450, 200]);
	
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
	
	var projection = d3.geoEquirectangular().scale(160).translate([450, 200]);
	
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


d3.json("data/world-50m.json", function(error, world)
{
	if(error) throw error;
	drawMap(world);
});

d3.csv("data/Map_candidate_cities_data.csv", function(error, csv)
{
	csv.forEach(function(d)
	{
		d.pos = [+d.Longitude, +d.Latitude];
		d.count_of_host = +d["Count of Host"];
	});
	
	mapData = csv;
	updateMap("all");
});

