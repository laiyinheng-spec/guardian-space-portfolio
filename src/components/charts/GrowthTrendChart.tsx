import ReactECharts from 'echarts-for-react';
import { graphic, type EChartsOption } from 'echarts';
import { growthTrend } from '../../data/page2Data';
import { readChartTokens } from './chartTokens';

export function GrowthTrendChart() {
  const token = readChartTokens();

  const option: EChartsOption = {
    animationDuration: token.animationDuration,
    animationEasing: 'cubicOut',
    grid: {
      left: token.gridLeft,
      right: token.gridRight,
      top: token.gridTop,
      bottom: token.gridBottom,
    },
    tooltip: {
      trigger: 'axis',
      borderColor: token.line,
      borderWidth: token.tooltipBorderWidth,
      backgroundColor: token.surface,
      padding: [token.tooltipPaddingY, token.tooltipPaddingX],
      textStyle: {
        color: token.text,
        fontFamily: token.fontBody,
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: growthTrend.points.map((point) => point.year),
      axisLine: { lineStyle: { color: token.line } },
      axisTick: { show: false },
      axisLabel: {
        color: token.muted,
        fontFamily: token.fontMono,
        fontSize: token.labelSize,
      },
    },
    yAxis: {
      type: 'value',
      name: growthTrend.yLabel,
      nameTextStyle: {
        color: token.muted,
        fontFamily: token.fontMono,
        fontSize: token.labelSize,
      },
      splitLine: { lineStyle: { color: token.line } },
      axisLabel: {
        color: token.muted,
        fontFamily: token.fontMono,
        fontSize: token.labelSize,
      },
    },
    series: [
      {
        name: growthTrend.title,
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: token.symbolSize,
        data: growthTrend.points.map((point) => point.value),
        lineStyle: {
          color: token.important,
          width: token.lineWidth,
        },
        itemStyle: {
          color: token.surface,
          borderColor: token.important,
          borderWidth: 2,
        },
        areaStyle: {
          color: new graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: token.chartFillStart },
            { offset: 1, color: token.chartFillEnd },
          ]),
        },
        emphasis: {
          focus: 'series',
        },
      },
    ],
  };

  return <ReactECharts className="echart echart--growth" option={option} notMerge lazyUpdate />;
}
