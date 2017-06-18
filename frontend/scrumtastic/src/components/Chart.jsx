import React, { Component } from 'react';
import { Chart } from 'react-google-charts';

class SprintChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        title: 'Burndown Chart Sprint {1}',
        hAxis: { title: 'Date', minValue: 0, maxValue: 15 },
        vAxis: { title: 'Storypoints', minValue: 0, maxValue: 15 },
        legend: 'none',
      },
      data: [
        ['Date', 'Storypoints'],
        [8, 12],
        [4, 5.5],
        [11, 14],
        [4, 5],
        [3, 3.5],
        [6.5, 7],
      ],
    };
  }
  render() {
    return (
      <Chart
        chartType="LineChart"
        data={this.state.data}
        options={this.state.options}
        graph_id="LineChart"
        width="100%"
        height="400px"
        legend_toggle
      />
    );
  }
}
export default SprintChart;