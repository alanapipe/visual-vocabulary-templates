import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let yAxisAlign = 'right';
    let slopeMarkers = false;
    const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let annotate = false; // eslint-disable-line
    let interpolation = d3.curveLinear;
    const colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
        .domain(seriesNames);


    function chart(parent) {
        const lineData = d3.line()
            .defined(d => d)
            .curve(interpolation)
            .x(d => xScale(d.date))
            .y(d => yScale(d.value));

        parent.selectAll('.lines')
            .data(d => d.lineData)
            .enter()
            .append('g')
            .attr('id', d => (d.length ? `${parent.data()[0].name.toLowerCase()}__${d[0].name}` : undefined))
            .attr('class', 'lines')
            .append('path')
            .attr('stroke', d => (d.length ? colourScale(d[0].name) : 'black'))
            .attr('d', d => lineData(d));

        if (slopeMarkers) {
            parent.selectAll('.markers')
                .data((d) => {
                    if (slopeMarkers) {
                        return d.lineData;
                    }

                    return undefined;
                })
                .enter()
                .append('g')
                .classed('markers', true);

            // add start circles
            parent.selectAll('.markers')
                .append('circle')
                .attr('id', d => `date: ${d[0].date} value: ${d[0].value}`)
                .attr('cx', d => xScale(d[0].date))
                .attr('cy', d => yScale(d[0].value))
                .attr('r', rem * 0.25)
                .attr('fill', d => colourScale(d[0].name));

            // add end circles
            parent.selectAll('.markers')
                .append('circle')
                .attr('id', d => `date: ${d[d.length - 1].date} value: ${d[d.length - 1].value}`)
                .attr('cx', d => xScale(d[d.length - 1].date))
                .attr('cy', d => yScale(d[d.length - 1].value))
                .attr('r', rem * 0.25)
                .attr('fill', d => colourScale(d[d.length - 1].name));
        }

        // add titles for each chart
        parent.append('text')
            .attr('class', 'chart-label')
            .attr('dy', -5)
            .text(d => d.name.toUpperCase());
    }

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };
    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };
    chart.seriesNames = (d) => {
        seriesNames = d;
        return chart;
    };
    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };
    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };
    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };
    chart.annotate = (d) => {
        annotate = d;
        return chart;
    };
    chart.slopeMarkers = (d) => {
        slopeMarkers = d;
        return chart;
    };
    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };
    chart.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}

export function drawHighlights() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let invertScale = false; // eslint-disable-line

    function highlights(parent) {
        const highlights = parent.append('rect') // eslint-disable-line
            .attr('class', 'highlights')
            .attr('x', d => xScale(d.begin))
            .attr('width', d => xScale(d.end) - xScale(d.begin))
            .attr('y', () => yScale.range()[1])
            .attr('height', () => yScale.range()[0])
            .attr('fill', '#fff1e0');
    }

    highlights.yScale = (d) => {
        yScale = d;
        return highlights;
    };
    highlights.xScale = (d) => {
        xScale = d;
        return highlights;
    };
    highlights.yRange = (d) => {
        yScale.range(d);
        return highlights;
    };
    highlights.xRange = (d) => {
        xScale.range(d);
        return highlights;
    };
    highlights.invertScale = (d) => {
        invertScale = d;
        return highlights;
    };

    return highlights;
}

export function drawAnnotations() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();

    function annotations(parent) {
        parent.append('line')
            .attr('class', 'annotation')
            .attr('x1', d => xScale(d.date))
            .attr('x2', d => xScale(d.date))
            .attr('y1', yScale.range()[0])
            .attr('y2', yScale.range()[1] - 5);

        parent.append('text')
            .attr('class', 'annotation')
            .attr('text-anchor', 'middle')
            .attr('x', d => xScale(d.date))
            .attr('y', yScale.range()[1] - (rem / 2))
            .text(d => d.annotate);
    }

    annotations.yScale = (d) => {
        yScale = d;
        return annotations;
    };
    annotations.xScale = (d) => {
        xScale = d;
        return annotations;
    };
    annotations.yRange = (d) => {
        yScale.range(d);
        return annotations;
    };
    annotations.xRange = (d) => {
        xScale.range(d);
        return annotations;
    };
    annotations.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return annotations;
    };
    return annotations;
}
