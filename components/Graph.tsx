import type { NextComponentType } from 'next'
import React, { useEffect, RefObject, LegacyRef } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'

if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
  HighchartsMore(Highcharts)
}

type Price = {
  count: number
  min: number
  q25: number
  q50: number
  q75: number
  max: number
  mean: number
  std: number
}

type Point = {
  x: number
  high: number
  q3: number
  median: number
  q1: number
  low: number
  count: number
}

type GraphProps = {
  prices: Record<number, Price>
}

let options: Highcharts.Options = {
  title: {
    text: 'Worker Prices'
  },
  chart: {
    type: 'boxplot',
    zoomType: 'x'
  },
  xAxis: {
    title: {
      text: 'Mine Power'
    }
  },
  yAxis: {
    title: {
      text: '$ETL'
    }
  },
  legend: {
    enabled: false
  },
  plotOptions: {
    series: {
      animation: false
    }
  },
  series: [{
    name: 'Worker Prices',
    type: 'boxplot',
    color: 'rgba(0, 0, 0, 0.7)',
    fillColor: 'rgba(199, 192, 227, 0.7)'
  }],
  tooltip: {
    formatter(tooltip) {
      let point = this.point as unknown as Point
      return '<em>Mine Power: ' + point.x + '</em><br/>' +
        'Maximum: ' + point.high + '<br/>' +
        'Upper quartile: ' + point.q3 + '<br/>' +
        '<strong>Median: ' + point.median + '</strong><br/>' +
        'Lower quartile: ' + point.q1 + '<br/>' +
        'Minimum: ' + point.low + '<br/>' +
        'Count: ' + point.count + '<br/>'
    }
  },
}

const Graph: React.FC<GraphProps> = (r: GraphProps) => {
  let data = []
  for (let level in r.prices) {
    let p = r.prices[level]
    data.push({ x: parseInt(level), low: p.min, q1: p.q25, median: p.q50, q3: p.q75, high: p.max, count: p.count })
  }
  // @ts-ignore
  options.series[0].data = data

  return <><HighchartsReact
    highcharts={Highcharts}
    options={options}
  /></>
}

export default Graph