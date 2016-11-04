


function drawMap(world)
{
	projection = d3.geoEquirectangular().scale(150).translate([450, 200]);
	
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


d3.json("data/world-50m.json", function(error, world)
{
	if(error) throw error;
	drawMap(world);
});
