const projectName = 'scatter-plot';

const createScatterplotGraph = dataset => {
  // Set margin, width and height of svg
  const margin = {
    top: 40,
    right: 60,
    bottom: 60,
    left: 60
  };
  const width = 800;
  const height = 450;
  const colors = {
    shamrock: '#03ac13',
    crimson: '#b90e0a'
  };

  // Initialize the color, x and y scales
  const xScale = d3.scaleLinear(
    [d3.min(dataset, d => d.Year) - 1, d3.max(dataset, d => d.Year) + 1],
    [0, width - margin.left - margin.right]
  );
  const yScale = d3.scaleTime(
    d3.extent(dataset, d => d.Time),
    [0, height - margin.top - margin.bottom]
  );
  const colorScale = d3.scaleOrdinal(
    [false, true],
    [colors.shamrock, colors.crimson]
  );

  // Set time format for both axes
  const xTickFormat = d3.format('d');
  const yTickFormat = d3.timeFormat('%M:%S');

  // Initialize the x and y axes
  const xAxis = d3.axisBottom(xScale).tickFormat(xTickFormat);
  const yAxis = d3.axisLeft(yScale).tickFormat(yTickFormat);

  // Create the SVG element
  const svg = d3
    .select('#scatterplot-graph-container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Create the tooltip
  const tooltip = d3
    .select('#scatterplot-graph-container')
    .append('div')
    .attr('id', 'tooltip')
    .style('opacity', 0);

  // Add the axes and their labels
  svg
    .append('text')
    .attr('id', 'x-axis-label')
    .attr('x', width - margin.right + 30)
    .attr('y', height - margin.bottom + 4)
    .attr('fill', '#fff')
    .attr('font-size', '0.8rem')
    .attr('text-anchor', 'middle')
    .text('Year');
  svg
    .append('text')
    .attr('id', 'y-axis-label')
    .attr('x', margin.left)
    .attr('y', margin.top - 16)
    .attr('fill', '#fff')
    .attr('font-size', '0.8rem')
    .attr('text-anchor', 'middle')
    .text('Time (in minutes)');
  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(${margin.left}, ${height - margin.bottom})`)
    .call(xAxis);
  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(yAxis);

  // Create legend
  const legend = svg
    .append('g')
    .attr('id', 'legend')
    .attr(
      'transform',
      `translate(${(width - margin.left - margin.right) / 2}, ${height - 28})`
    )
    .selectAll('#legend')
    .data(colorScale.domain())
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d ? -105 : 105}, 0)`);
  legend
    .append('rect')
    .style('width', 16)
    .style('height', 16)
    .style('stroke', '#fff')
    .style('fill', colorScale);
  legend
    .append('text')
    .style('fill', '#fff')
    .attr('font-size', '0.7rem')
    .attr('transform', `translate(24, 12)`)
    .text(d =>
      d ? 'Riders with doping allegations' : 'No doping allegations'
    );

  // Create the bars, then add class and tooltips
  svg
    .selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.Year) + margin.left)
    .attr('cy', d => yScale(d.Time) + margin.top)
    .attr('r', 6)
    .attr('class', 'dot')
    .attr('data-xvalue', d => d.Year)
    .attr('data-yvalue', d => d.Time.toISOString())
    .style('stroke', '#fff')
    .style('fill', d => colorScale(Boolean(d.Doping)))
    .on('mouseover', (_, d) => {
      const post2012 = d.Year >= 2012;

      tooltip
        .style('opacity', 1)
        .style(
          'top',
          `${post2012 ? window.event.pageY : window.event.pageY - 5}px`
        )
        .style(
          'left',
          `${post2012 ? window.event.pageX - 5 : window.event.pageX}px`
        )
        .style('width', 'max-content')
        .style(
          'transform',
          post2012 ? 'translate(-100%, -50%)' : 'translate(-50%, -100%)'
        )
        .attr('class', post2012 ? 'tooltip-left' : 'tooltip-top')
        .attr('data-year', d.Year).html(`
          <dl>
            <dt>Name:</dt> <dd>${d.Name}</dd>
            <br />
            <dt>Country:</dt> <dd>${d.Nationality}</dd>
            <br />
            <dt>Year:</dt> <dd>${d.Year}</dd>
            <br />
            <dt>Time:</dt> <dd>${yTickFormat(d.Time)}</dd>
          </dl>
          ${d.Doping && `<p style="margin-top: 0.5rem;">${d.Doping}</>`}
        `);
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });
};

const fetchData = async () => {
  try {
    const dataset = await d3.json(
      'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
    );
    const parsedData = await dataset.map(d => {
      const [minutes, seconds] = d.Time.split(':');

      return {
        ...d,
        Time: new Date(1970, 0, 1, 0, minutes, seconds)
      };
    });
    createScatterplotGraph(parsedData);
  } catch (error) {
    console.error({ error });
  }
};

fetchData();
