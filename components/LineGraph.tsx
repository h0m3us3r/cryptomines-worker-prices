import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts/highstock'
import { useState, useRef, useEffect } from 'react'


if (typeof Highcharts === 'object') {
  HighchartsExporting(Highcharts)
}

type LineGraphProps = {
  mp: number
}

const LineGraph: React.FC<LineGraphProps> = (r: LineGraphProps) => {
  const [data, setData] = useState<Highcharts.Options>()
  useEffect(() => {
    fetch("http://localhost:3000/api/gethistory?mp=" + r.mp).then(response => response.json()).then(data => {
      let opts: any = {
        rangeSelector: {
          selected: 1
        },
        title: {
          text: 'Mine Power:' + r.mp
        },
        xAxis: {
          ordinal: false
        },
        series: [{
          data: data,
          tooltip: {
            valueDecimals: 2
          }
        }]
      }
      setData(opts)
    })
  }, [r.mp])

  return <><HighchartsReact
    highcharts={Highcharts}
    constructorType={'stockChart'}
    options={data}
  /></>
}

export default LineGraph