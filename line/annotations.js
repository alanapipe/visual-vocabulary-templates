import d3 from 'd3';
import { select } from "d3-selection"

export function draw() {
    let lineWidth = 100
	let plotDim = [100,100];
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleLinear();
    let sizeScale = d3.scaleSqrt();
    let intersect = false
    let seriesNames  = []; // eslint-disable-line
    let rem = 16;
    let formatDecimal = d3.format(".2f")
    let frameName = ''

    const colourScale = d3.scaleOrdinal();


    function label(parent) {
        
        let radius;

    	const textLabel = parent.append('g')
            .on('mouseover', pointer)
            .attr('id', 'labelHolder')

        textLabel.append('text')
        	.attr('class', 'highlighted-label')
        	.attr('x',d => xScale(d.targetX))
        	.attr('y',d => yScale(d.targetY))
            .attr('dy',0)
        	.text((d) => {
                if (intersect) {
                    radius = sizeScale(d.radius);
                }
        		else {radius = d.radius};
        		return d.title + ' '+ d.note
        	})
        	.call(wrap,lineWidth,d => xScale(d.targetX),"highlighted-label")
            .call(getOffset)

        var path = textLabel.append('path')
            .attr('stroke', '#000000')
            .attr('stroke-width', 1)

        path.attr("d", function(d) {
        var dx = d.targetX - d.sourceX,
        dy = d.targetY - d.sourceY,
        dr = 150;
        return "M" + d.sourceX + "," + d.sourceY + "A" + dr + "," + dr + " 0 0,1 " + xScale(d.targetX) + "," + yScale(d.targetY);
        });

        // textLabel.append('line')
        //     .attr('x1', d => getSource(d,)[0])
        //     .attr('y1', d => getSource(d,)[1])
        //     .attr('x2', d => xScale(d.targetX))
        //     .attr('y2', d => yScale(d.targetY))
        //     .attr('stroke', '#000000')
        //     .attr('stroke-width', 1)

       textLabel
            .call(d3.drag()
                .subject(function() { 
                    const textEl = d3.select(this).select('text');
                    return {x: textEl.attr('x'), y: textEl.attr('y')};
                })
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        function pointer(d) {
            this.style.cursor = 'pointer';
        }

        function dragstarted(d) {
            d3.select(this).raise().classed('active', true);
        }

        function dragged(d) {
            d3.select(this).selectAll('tspan').attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
            d3.select(this).selectAll('text').attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
        }

        function dragended(d) {
            d3.select(this).classed('active', false);
        }

        function getOffset(label) {
            label.each(function(d) {
                //console.log('offset', d)
                let labelText = d3.select(this)
                let labDim = labelDimansions(labelText)
                let posX = xScale(d.targetX);
                let posY = yScale(d.targetY);
                //console.log(posX)
                let yOffset = 0;
                let xOffset = 0;
                if (posX > plotDim[0]/2) {
                    xOffset = (0-(labDim[0] - radius + (rem)))
                }
                if (posX < plotDim[0]/2) {
                    xOffset = radius + (rem);
                }
                if (posY > (plotDim[1]/2)) {
                    yOffset = (0 - (labDim[1] + radius + rem ))
                }
                if (posY < (plotDim[1]/2)) {
                    yOffset = radius + rem 
                }
                d.sourceX = xScale(d.targetX) + xOffset
                d.sourceY = yScale(d.targetY) + yOffset
                labelText.attr('transform', `translate(${xOffset},${yOffset})`);
            }) 
        }
        function getSource(d, el) {
            //console.log('sourceObj',d, el)
                let labelText = d3.select(d)
                //console.log('labelText',labelText)
                //let labDim = labelDimansions(el)
                let posX = (d.sourceX);
                let posY = (d.sourceY)-rem/2;
                //console.log('pos',posX,posY)

                let yOffset = 0;
                let xOffset = 0;
                // if (posX > plotDim[0]/2) {
                //     xOffset = (0-(labDim[0] + radius + (rem)))
                // }
                // if (posX < plotDim[0]/2) {
                //     xOffset = radius + (rem);
                // }
                // if (posY > (plotDim[1]/2)) {
                //     yOffset = (0 - (radius + rem + (labDim[1])))
                // }
                // if (posY < (plotDim[1]/2)) {
                //     yOffset = radius + rem 
                // }
                return [posX, posY]
        }

        function labelDimansions (label) {
            let labelWidth = label.node().getBBox().width;
            let labelHeight = label.node().getBBox().height;
            return ([labelWidth,labelHeight])
        }

    	//wrap text function adapted from Mike Bostock
		function wrap(text, width,x, media) {
		    text.each(function() {
		        var text = d3.select(this),
		        words = text.text().split(/\s+/).reverse(),
		        word,
		        line = [],
		        lineNumber = 0,
		        lineHeight = 1.0,
		        y = text.attr("y"),
		        dy = parseFloat(text.attr("dy")),
		        tspan = text.text(null).append("tspan").attr("class", media).attr("x", x).attr("y", y).attr("dy", dy + "em");
		        while (word = words.pop()) {
		            line.push(word);
		            tspan.text(line.join(" "));
		            if (tspan.node().getComputedTextLength() > width) {
		                tspan.text(line.join(" "));
		                line = [word];
		                tspan = text.append("tspan").attr("class", media).attr("x", x).attr("y", y).attr("dy",++lineNumber * lineHeight + dy + "em").text(word);
		            }
		        }
		    });
		}

    }

    label.frameName = (d) => {
        frameName = d;
        return label;
    };
    label.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return label;
    };
    label.sizeScale = (d) => {
        if (!d) return sizeScale;
        sizeScale = d;
        intersect = true
        return label;
    };
    label.lineWidth = (d) => {
        if (!d) return lineWidth;
        lineWidth = d;
        return label;
    };
    label.plotDim = (d) => {
        if (!d) return window.plotDim;
        plotDim = d;
        return label;
    };
    label.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return label;
    };
    label.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return label;
    };

    return label;
}