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
        y: '833.169',
      },
      {
        x: 1,
        y: '654.633',
      },
      {
        x: 2,
        y: '944.754',
      },
      {
        x: 3,
        y: '-334.755',
      },
      {
        x: 4,
        y: '394.268',
      },
    ],
  },
]

const Diagram03 = () => (
  <ResponsiveHeatMap
    data={data}
    theme={theme}
    valueFormat=">-.3f"
    axisTop={null}
    axisLeft={null}
    colors={{
      type: 'sequential',
      scheme: 'reds',
      minValue: -500,
      maxValue: 1000,
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

export default Diagram03
