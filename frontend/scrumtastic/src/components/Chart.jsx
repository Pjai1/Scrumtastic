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
        ['Date', 'Storypoints (Max)', 'Storypoints (Day)'],
        [8, 12, 5],
        [4, 5.5, 10],
        [11, 14, 12],
        [4, 5, 6],
        [3, 3.5, 8],
        [6.5, 7, 9],
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