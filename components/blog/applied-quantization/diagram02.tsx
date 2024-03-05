'use client'
import React from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import theme from '../default-theme.json'

const data = [
  {
    id: 'Weight 0',
    data: [
      {
        x: 0,
        y: '112',
      },
      {
        x: 1,
        y: '88',
      },
      {
        x: 2,
        y: '127',
      },
      {
        x: 3,
        y: '-45',
      },
      {
        x: 4,
        y: '53',
      },
    ],
  },
]
const Diagram02 = () => (
  <ResponsiveHeatMap
    data={data}
    theme={theme}
    valueFormat=">-.3~f"
    axisTop={null}
    axisLeft={null}
    colors={{
      type: 'sequential',
      scheme: 'blues',
      minValue: -127,
      maxValue: 127,
    }}
    emptyColor="#555555"
    borderRadius={0}
    borderWidth={5}
    borderColor={{ theme: 'background' }}
    hoverTarget={'cell'}
    legends={[]}
    forceSquare
  />
)

export default Diagram02
