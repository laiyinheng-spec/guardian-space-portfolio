import ReactECharts from 'echarts-for-react';
import { graphic, type EChartsOption } from 'echarts';
import { sourceComposition } from '../../data/page2Data';
import { readChartTokens } from './chartTokens';

export function SourceCompositionBars() {
  const token = readChartTokens();
  const reversedBars = [...sourceComposition.bars].reverse();

  const option: EChartsOption = {
    animationDuration: token.animationDuration,
    animationEasing: 'cubicOut',
    grid: {
      left: token.gridLeft,
      right: token.gridRight,
      top: token.gridTop,
      bottom: token.gridBottom,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
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
      type: 'value',
      max: 40,
      splitLine: { show: false },
      axisLabel: {
        color: token.muted,
        fontFamily: token.fontMono,
        fontSize: token.labelSize,
        formatter: '{value}%',
      },
    },
    yAxis: {
      type: 'category',
      data: reversedBars.map((bar) => bar.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: token.muted,
        fontFamily: token.fontBody,
        fontSize: token.labelSize,
      },
    },
    series: [
      {
        type: 'bar',
        data: reversedBars.map((bar) => bar.value),
        barWidth: token.barWidth,
        itemStyle: {
          borderRadius: token.barWidth,
          color: new graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: token.accent },
            { offset: 1, color: token.important },
          ]),
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: token.accentDeep,
          fontFamily: token.fontMono,
          fontSize: token.labelSize,
        },
      },
    ],
  };

  return <ReactECharts className="echart echart--bars" option={option} notMerge lazyUpdate />;
}
