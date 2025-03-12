<template>
  <div ref="gojsDiv" style="width: 100%; height: 800px"></div>
</template>

<script>
import * as go from 'gojs';

export default {
  mounted() {
    this.initGoJS();
  },
  methods: {
    initGoJS() {
      const $ = go.GraphObject.make;

      const myDiagram = $(go.Diagram, this.$refs.gojsDiv, {
        'undoManager.isEnabled': true,
        layout: $(go.LayeredDigraphLayout, {
          direction: 90,
          layerSpacing: 50,
          columnSpacing: 70,
          setsPortSpots: false,
        }),
      });

      // 辅助函数：创建带标题的节点模板
      function createNodeTemplate(category, title, color) {
        return $(
          go.Node,
          'Auto',
          {
            isShadowed: true,
            shadowBlur: 5,
            shadowOffset: new go.Point(3, 3),
            shadowColor: '#999',
            toolTip: $(
              'ToolTip',
              $(go.TextBlock, { margin: 4 }, new go.Binding('text', 'key'))
            ),
          },
          new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
            go.Point.stringify
          ),
          $(go.Shape, 'RoundedRectangle', {
            fill: color,
            stroke: 'gray',
            strokeWidth: 2,
            width: 180,
            height: 60,
          }),
          $(
            go.Panel,
            'Vertical',
            $(
              go.TextBlock,
              {
                margin: new go.Margin(5, 5, 0, 5),
                font: 'bold 10pt sans-serif',
                wrap: go.TextBlock.WrapFit,
                width: 160
              },
              title
            ),
            $(
              go.TextBlock,
              { margin: 5, wrap: go.TextBlock.WrapFit, width: 160 , alignment: go.Spot.Center },
              new go.Binding('text', 'text')
            )
          )
        );
      }

      // 条件节点模板
      function createConditionalNodeTemplate() {
        return $(
          go.Node,
          'Auto',
          {
            isShadowed: true,
            shadowBlur: 5,
            shadowOffset: new go.Point(3, 3),
            shadowColor: '#999',
            toolTip: $(
              'ToolTip',
              $(go.TextBlock, { margin: 4 }, new go.Binding('text', 'key'))
            ),
          },
          new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
            go.Point.stringify
          ),
          $(go.Shape, 'Diamond', {
            fill: 'lightyellow',
            stroke: 'gray',
            strokeWidth: 2,
            width: 80,
            height: 80,
          }),
          $(
              go.TextBlock,
              { margin: 5, wrap: go.TextBlock.WrapFit, width: 160 , alignment: go.Spot.Center },
              new go.Binding('text', 'text')
            )
        );
      }

      // 定义节点模板
      myDiagram.nodeTemplateMap.add(
        'Client',
        createNodeTemplate('Client', '客户端', '#A7E8A7')
      );
      myDiagram.nodeTemplateMap.add(
        'Server',
        createNodeTemplate('Server', '服务器', '#FFB8A7')
      );
      myDiagram.nodeTemplateMap.add(
        'Step',
        createNodeTemplate('Step', '', 'lightblue')
      );
      myDiagram.nodeTemplateMap.add('Conditional', createConditionalNodeTemplate());

      // 定义连线模板
      myDiagram.linkTemplate = $(
        go.Link,
        { routing: go.Link.AvoidsNodes, corner: 10, curve: go.Link.JumpOver }, // JumpOver
        $(go.Shape, { stroke: 'gray', strokeWidth: 2 }),
        $(go.Shape, { toArrow: 'Standard', stroke: 'gray', fill: 'gray' }),
        $(go.TextBlock,                     // 连线标签
          {
            segmentOffset: new go.Point(0, -10),
            segmentOrientation: go.Link.OrientUpright,
          },
          new go.Binding("text", "text"))
      );

      // 创建模型数据
      const model = new go.GraphLinksModel();
      model.nodeDataArray = [
        // 客户端
        { key: 'A', text: '初始化', category: 'Step', loc: '0 0' },
        {
          key: 'B',
          text: '获取或创建 Socket.IO 连接',
          category: 'Step',
          loc: '0 100',
        },
        {
          key: 'C',
          text: '连接到默认命名空间 (可选)',
          category: 'Step',
          loc: '0 200',
        },
        {
          key: 'D',
          text: '连接到所需命名空间',
          category: 'Step',
          loc: '0 300',
        },
        {
          key: 'E',
          text: '监听 connect、connect_error、disconnect 事件',
          category: 'Step',
          loc: '0 400',
        },
        { key: 'F', text: '提供 auth 数据', category: 'Step', loc: '0 500' },
        {
          key: 'G',
          text: '发送 LLM 请求 / 函数调用',
          category: 'Step',
          loc: '0 600',
        },
        {
          key: 'H',
          text: '监听 streamed_data / message 事件',
          category: 'Step',
          loc: '0 700',
        },
        {
          key: 'I',
          text: '监听 MSG_TYPE.ERROR 事件',
          category: 'Step',
          loc: '0 800',
        },
        {
          key: 'J',
          text: '关闭连接 (可选)',
          category: 'Step',
          loc: '0 900',
        },

        // 服务器 (简化)
        {
          key: 'S1',
          text: '接收连接请求',
          category: 'Server',
          loc: '250 400',
        },
        {
          key: 'S2',
          text: '验证 auth 数据',
          category: 'Server',
          loc: '250 500',
        },
        {
          key: 'S3',
          text: '处理请求',
          category: 'Server',
          loc: '250 650',
        },
        {
          key: 'S4',
          text: '发送响应',
          category: 'Server',
          loc: '250 750',
        },
      ];

        model.linkDataArray = [
            { from: 'A', to: 'B' },
            { from: 'B', to: 'C' },
            { from: 'C', to: 'D' },
            { from: 'D', to: 'E' },
            { from: 'E', to: 'F' },
            { from: 'F', to: 'S1', text: '连接请求' },
            { from: 'S1', to: 'S2' },
            { from: 'S2', to: 'G', text: '验证通过' },
            { from: 'G', to: 'S3' },
            { from: 'S3', to: 'S4' },
            { from: 'S4', to: 'H' },
            { from: 'H', to: 'I' },
            { from: 'I', to: 'J' },
        ];


      myDiagram.model = model;
    },
  },
};
</script>