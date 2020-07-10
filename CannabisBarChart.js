
var margin = {top: 10, right: 40, bottom: 250, left: 100},
    width = 760 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var canvas = d3.select("svg");
var xScale = d3.scaleBand().range([0, width]).padding(0.1);

//The scale linear function is straightforward, it uses a basic linear model for the input values. It it most common for line grpahs. The domain is also the gdp values, and the range is how min and max valus for this scale. Since we are using this scale to create the y-axis, it makes sense to set the values to be in between 0 and the height of the graphic space.
var yScale = d3.scaleLinear().range([height, 0]);

// Define X and Y AXIS
// Define tick marks on the y-axis as shown on the output with an interval of 5 and $ sign
//alighns the x axis to the bottom of the graphic and aligns the yaxis to the left of the graphic, with respect to their scales.
var xAxis = d3.axisBottom(xScale);

var yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".0%"));



// data.csv contains the country name(key) and its GDP(value)
// d.key and d.value are very important commands

function rowConverter(data) {
    return {
        key : data.test_strain,
        value : +data.test_thc_avg
    }
}

d3.csv("wa-strains.csv",rowConverter).then(function(data){
    console.log(data);
    var extent = [[-200, -200], [width+20, height+margin.top]];
    

    
    var zoom = d3.zoom()
        .scaleExtent([1, 50])
        .translateExtent(extent)
        .on("zoom", zoomed);
    // Return X and Y SCALES (domain). See Chapter 7:Scales (Scott M.) 
    xScale.domain(data.map(function(d){ return d.key; }));
    yScale.domain([0,d3.max(data, function(d) {return d.value/100; })]).nice();
    //var clip = DOM.uid("clip");
  svg.append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);
    
    var tooltip = d3.select("body")
        .append("div")	
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Creating rectangular bars to represent the data. 
    // Add comments to explain the code below
    //we first select all of our svg rect objects which are our bars.
    //we then assign their data field to our current read data, so each bar objects data is mapped to our read in data
    //there is then a short animation at the beginning when the bar comes from the top left and drops into place, the .transition.duration() determines how long it takes for the current bar to drop into place.
    //the delay() function determines how long it takes for the next bar to begin the animation
    //the 'x' attribute is the x position of the start of the bar from the left. As mentioned earlier, calling xScale will return the position of a bar within the specificed range.
    //the 'y' attribute is the y position of the start of the bar from the top. The yScale returns a linear height value as a function of the gdp value.
    //the width attribute is the width of the bar, as said before, the bandwidth() function is the width of the current bar which was already determiend by the scaleBand function.
    //the height is a function of the graphic space height and the height value given by the yscale.
    var lastRect = null;
    var currRect = null;
    var barRect = svg.selectAll(".barRect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return xScale(d.key);
        })
        .attr("y", function(d) {
            return yScale(d.value/100);
        })
        .attr("clip-path", "url(#clip)")
        .attr("width", xScale.bandwidth())
        //add transition
        //.transition().duration(1000)
        .attr("height", function(d) {
			 return height - yScale(d.value/100);
        })
        // create increasing to decreasing shade of blue as shown on the output
        //the attribute "fill" can be assigned a color. 
        //Using an anonymous function as the second parameter I can return rgb values 
        // for the bars where the higher the value, the darker the blue color.
        .attr("fill", function (d) {
            
            return "hsl(150,50%,60%)";//"hsl(152,80%,80%)";//"rgb(0,"+(255 - 5*d.value )+",0)";
        })
        .on("click", function(d){
            //console.log(this);
            currRect = d3.select(this);
            if(lastRect!=null){
                lastRect.attr("stroke", "#FFF")
                    .attr("stroke-width", 0)
            }
            //console.log(p);
            currRect.attr("stroke", "hsl(152,80%,40%)")
                .attr("stroke-width", 3);
            lastRect = currRect;
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html("<div style='text-align:center;'>"+d.key+"</div>"+
                        "<br>"+"THC%: "+d.value+
                        "<br>"+"[Other Information Here]")
                .style("left", xScale(d.key)+xScale.bandwidth()+"px")
                .style("top", (yScale(d.value/100))+"px");
        });
    // Label the data values(d.value)
    //We now select the text components of the svg objects
    //we then read our data, and add a new text node which will be for our labels
    //i then match the animation so the values come in with the bars as well
    //the x attribute in this case is the x position of the start of our text. If we set this to our xScale(d.key), the text will be aligned with the bar width.
    //similairly the y attribute will let us align the text with the bar height so the top of the text is right above each bar. I then added a value of 15, going down, so the text sits right on the inside of the bar instead of the outside.
    //Then i set the text to white to make it look like the sample output.
    //Lastly, i defined what the actual text will be, which i set to the gdp values.
//    svg.selectAll(".labeltext")
//        .data(data)
//        .enter()
//        .append("text")
//        .attr("class", "label")
//        .attr("x", function(d){
//            return xScale(d.key);
//        })
//        .attr("y", function(d) {
//            return yScale(d.value)+15;
//        })
//        .attr("fill", "#8F8")
//        .text(function(d) { return +d.value ;});
    
    // Draw xAxis and position the label at -60 degrees as shown on the output
    //the g refers to all the labels.
    //the transform, translate sets the labels to the bottom of the graphic space, right below the x axis.
    //then we grab the data from the xAxis axis object from earlier.
    //We then look at the text components of this object.
    //we change the relative positions with dx and dy.
    //we also make the text to be fixed at the bottom of the page with text-anchor, end.
    //lastly we can perform a rotation on the text so it matches the sample output.
    var gx = svg.append("g")
        .attr("class", "xAxis")
        .attr("clip-path", "url(#clip)")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("dx", "-.8em")
        .attr("dy", ".25em")
        .style("text-anchor", "end")
        .attr("font-size", "1px")
        .attr("transform", "rotate(-60)");
        
    
    // Draw yAxis and position the label
    //Mostly the same as what we did in the x-axis label part.
    //however, we call .ticks() to format our y axis ticks so the y axis tick values are multiples of 5 and they all begin with '$'
    var gy = svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        //.call(yAxis.ticks(5, "%"))
        .selectAll("text")
        .attr("dx", "-.8em")
        .attr("dy", ".25em")
        .style("text-anchor", "end")
        .attr("font-size", "10px");
    //here we add a new text component to the graphic.
    //we set the text to the text in the sample output
    //then we rotate it so it is sideways.
    //then we set it to be right before the left margin and in between the top and bottom margins. 
    svg.append("text")
        //.attr("class", "y title")
        .text("THC %")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2)
        .attr("x", 0 - (height/2))
        .attr("dx", "-.8em")
        .attr("dy", ".25em")
    
    canvas.call(zoom);
    var lastK = 0;
    function zoomed(){
        //console.log(d3.event.transform);
        var k = d3.event.transform.k;
        //lastK = k;
        if(lastK == k) {
            //console.log("here")//do nothing
        }
        else{
        gx.attr("font-size", function(){
            if(k>15) return 15;
            else return k;
        });
        }
        lastK = k;
        xScale.range([0,width].map(function(d){
            //console.log(d);
            return d3.event.transform.applyX(d-120);
        }));
        barRect.attr("x", function(d){return xScale(d.key);}).attr("width", xScale.bandwidth());
//        if(currRect!=null) tooltip.style("left", xScale(currRect.data()[0].key)+xScale.bandwidth()+"px");
        //console.log(currRect.attr("x") + " width: "+width + "scaleBandwidth: "+xScale.bandwidth());
        if(currRect!=null){
            if(notVisible(currRect)) tooltip.style("opacity", 0);
            else{
                tooltip.transition().duration(1000).style("opacity", 0.9);
                tooltip.style("left", xScale(currRect.data()[0].key)+xScale.bandwidth()+"px");
            }
        }
        //console.log(currRect.data()[0].key);
        svg.selectAll(".xAxis").call(xAxis);
        //gy.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));

    }
    
    function notVisible(Bar){
        if((Bar.attr("x") < (-1 * xScale.bandwidth())) || (Bar.attr("x") > width)){
            return true;
        }
        else {
            return false;
        }
    }
        
});
