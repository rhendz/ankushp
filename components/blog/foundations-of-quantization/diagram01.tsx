'use client'
import * as React from 'react'
const Diagram01 = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 100.16 36.791"
    {...props}
  >
    <defs>
      <marker
        id="b"
        markerHeight={1}
        markerWidth={1}
        orient="auto-start-reverse"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-stroke"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth=".5pt"
          d="M2.885 0-1.44 2.5v-5z"
        />
      </marker>
      <marker
        id="a"
        markerHeight={1}
        markerWidth={1}
        orient="auto-start-reverse"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-stroke"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth=".5pt"
          d="M2.885 0-1.44 2.5v-5z"
        />
      </marker>
      <marker
        id="d"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-stroke"
          fillRule="evenodd"
          d="M2.5 0a2.5 2.5 0 0 1-5 0c0-1.38 1.15-2.5 2.5-2.5A2.5 2.5 0 0 1 2.5 0z"
        />
      </marker>
      <marker
        id="c"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-stroke"
          fillRule="evenodd"
          d="M2.5 0a2.5 2.5 0 0 1-5 0c0-1.38 1.15-2.5 2.5-2.5A2.5 2.5 0 0 1 2.5 0z"
        />
      </marker>
      <marker
        id="f"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-stroke"
          fillRule="evenodd"
          d="M2.5 0a2.5 2.5 0 0 1-5 0c0-1.38 1.15-2.5 2.5-2.5A2.5 2.5 0 0 1 2.5 0z"
        />
      </marker>
      <marker
        id="e"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-stroke"
          fillRule="evenodd"
          d="M2.5 0a2.5 2.5 0 0 1-5 0c0-1.38 1.15-2.5 2.5-2.5A2.5 2.5 0 0 1 2.5 0z"
        />
      </marker>
      <marker
        id="h"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={0.9}
          d="M2.25 0a2.25 2.25 0 0 1-4.5 0c0-1.242 1.035-2.25 2.25-2.25A2.25 2.25 0 0 1 2.25 0z"
        />
      </marker>
      <marker
        id="g"
        markerHeight={1}
        markerWidth={1}
        orient="auto-start-reverse"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={1}
          d="M2.885 0-1.44 2.5v-5z"
        />
      </marker>
      <marker
        id="j"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={0.9}
          d="M2.25 0a2.25 2.25 0 0 1-4.5 0c0-1.242 1.035-2.25 2.25-2.25A2.25 2.25 0 0 1 2.25 0z"
        />
      </marker>
      <marker
        id="i"
        markerHeight={1}
        markerWidth={1}
        orient="auto-start-reverse"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={1}
          d="M2.885 0-1.44 2.5v-5z"
        />
      </marker>
      <marker
        id="l"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={0.9}
          d="M2.25 0a2.25 2.25 0 0 1-4.5 0c0-1.242 1.035-2.25 2.25-2.25A2.25 2.25 0 0 1 2.25 0z"
        />
      </marker>
      <marker
        id="k"
        markerHeight={1}
        markerWidth={1}
        orient="auto-start-reverse"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={1}
          d="M2.885 0-1.44 2.5v-5z"
        />
      </marker>
      <marker
        id="n"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={0.9}
          d="M2.25 0a2.25 2.25 0 0 1-4.5 0c0-1.242 1.035-2.25 2.25-2.25A2.25 2.25 0 0 1 2.25 0z"
        />
      </marker>
      <marker
        id="m"
        markerHeight={1}
        markerWidth={1}
        orient="auto-start-reverse"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={1}
          d="M2.885 0-1.44 2.5v-5z"
        />
      </marker>
      <marker
        id="p"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={0.9}
          d="M2.25 0a2.25 2.25 0 0 1-4.5 0c0-1.242 1.035-2.25 2.25-2.25A2.25 2.25 0 0 1 2.25 0z"
        />
      </marker>
      <marker
        id="o"
        markerHeight={1}
        markerWidth={1}
        orient="auto-start-reverse"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={1}
          d="M2.885 0-1.44 2.5v-5z"
        />
      </marker>
      <marker
        id="r"
        markerHeight={1}
        markerWidth={1}
        orient="auto"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={0.9}
          d="M2.25 0a2.25 2.25 0 0 1-4.5 0c0-1.242 1.035-2.25 2.25-2.25A2.25 2.25 0 0 1 2.25 0z"
        />
      </marker>
      <marker
        id="q"
        markerHeight={1}
        markerWidth={1}
        orient="auto-start-reverse"
        overflow="visible"
        preserveAspectRatio="xMidYMid"
        viewBox="0 0 1 1"
      >
        <path
          fill="context-fill"
          fillRule="evenodd"
          stroke="context-stroke"
          strokeWidth={1}
          d="M2.885 0-1.44 2.5v-5z"
        />
      </marker>
    </defs>
    <g strokeWidth={0.202}>
      <g fill="none">
        <path
          stroke="rgb(var(--color-secondary)/0.8)"
          strokeDasharray="0.808195, 0.808195"
          markerEnd="url(#a)"
          markerStart="url(#b)"
          d="M154.65 100.5h69.566"
          transform="translate(-199.077 -127.585) scale(1.3095)"
        />
        <path
          stroke="#4ac683"
          markerEnd="url(#c)"
          markerStart="url(#d)"
          d="M154.57 122.66h70.114"
          transform="translate(-199.077 -127.585) scale(1.3095)"
        />
        <path
          stroke="#4ac683"
          markerEnd="url(#e)"
          markerStart="url(#f)"
          d="M170.03 100.5h38.808"
          transform="translate(-199.077 -127.585) scale(1.3095)"
        />
      </g>
      <path
        fill="#ff7f2a"
        stroke="rgb(var(--color-secondary)/0.8)"
        markerEnd="url(#g)"
        markerStart="url(#h)"
        d="M189.43 100.51v21.274"
        transform="translate(-199.077 -127.585) scale(1.3095)"
      />
      <path
        fill="#ff7f2a"
        stroke="rgb(var(--color-secondary)/0.8)"
        strokeOpacity={0.941}
        markerEnd="url(#g)"
        markerStart="url(#h)"
        d="m178.74 100.51-5.918 21.305"
        transform="translate(-199.077 -127.585) scale(1.3095)"
      />
      <g fill="#4ac683" stroke="rgb(var(--color-secondary)/0.8)" strokeOpacity={0.941}>
        <path
          markerEnd="url(#i)"
          markerStart="url(#j)"
          d="m194.14 100.5 2.373 21.278"
          transform="translate(-199.077 -127.585) scale(1.3095)"
        />
        <path
          markerEnd="url(#k)"
          markerStart="url(#l)"
          d="m208.84 100.5 15.134 21.138"
          transform="translate(-199.077 -127.585) scale(1.3095)"
        />
        <path
          markerEnd="url(#m)"
          markerStart="url(#n)"
          d="m221.41 100.5 2.886 20.978"
          transform="translate(-199.077 -127.585) scale(1.3095)"
        />
        <path
          markerEnd="url(#o)"
          markerStart="url(#p)"
          d="m169.87 100.5-14.726 21.02"
          transform="translate(-199.077 -127.585) scale(1.3095)"
        />
        <path
          markerEnd="url(#q)"
          markerStart="url(#r)"
          d="m157.76 100.5-2.958 20.898"
          transform="translate(-199.077 -127.585) scale(1.3095)"
        />
      </g>
      <g
        strokeOpacity={0.941}
        fontFamily="'Cambria Math'"
        fill="rgb(var(--color-secondary)/0.8)"
        fontSize={2.829}
      >
        <text
          xmlSpace="preserve"
          x={226.672}
          y={123.225}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={226} y={122}>
            {'Q'}
          </tspan>
        </text>
        <text
          xmlSpace="preserve"
          x={222.66}
          y={125.513}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={222.66} y={125.513}>
            {'127'}
          </tspan>
        </text>
        <text
          xmlSpace="preserve"
          x={188.476}
          y={125.504}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={188.476} y={125.504}>
            {'0'}
          </tspan>
        </text>
        <text
          xmlSpace="preserve"
          x={226.721}
          y={101.133}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={226.721} y={101.133}>
            {'r'}
          </tspan>
        </text>
        <text
          xmlSpace="preserve"
          x={167.075}
          y={99.407}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={167.075} y={99.407}>
            {'\u03B1 = -0.5 '}
          </tspan>
        </text>
        <text
          xmlSpace="preserve"
          x={205.939}
          y={99.436}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={205.939} y={99.436}>
            {'\xDF = 1.5'}
          </tspan>
        </text>
        <text
          xmlSpace="preserve"
          x={177.94}
          y={99.407}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={177.94} y={99.407}>
            {'0'}
          </tspan>
        </text>
        <text
          xmlSpace="preserve"
          x={188}
          y={99.407}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={188} y={99.407}>
            {'SZ'}
          </tspan>
        </text>
        <text
          xmlSpace="preserve"
          x={151.876}
          y={125.504}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={151.876} y={125.504}>
            {'-128'}
          </tspan>
        </text>
        <text
          xmlSpace="preserve"
          x={171.387}
          y={125.52}
          style={{
            lineHeight: 0,
          }}
          transform="translate(-199.077 -127.585) scale(1.3095)"
        >
          <tspan x={171.387} y={125.52}>
            {'-Z'}
          </tspan>
        </text>
      </g>
    </g>
  </svg>
)
export default Diagram01
