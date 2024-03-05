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
        y: 830.995,
      },
      {
        x: 1,
        y: 658.175,
      },
      {
        x: 2,
        y: 944.754,
      },
      {
        x: 3,
        y: -332.94,
      },
      {
        x: 4,
        y: 390.631,
      },
    ],
  },
]

const Diagram01 = () => (
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

export default Diagram01
