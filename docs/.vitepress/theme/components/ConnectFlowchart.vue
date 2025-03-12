<template>
  <div ref="gojsDiv" style="width: 100%; height: 1200px"></div>
</template>

<script>
import * as go from "gojs";

export default {
  mounted() {
    this.initGoJS();
  },
  methods: {
    initGoJS() {
      const $ = go.GraphObject.make;

      const myDiagram = $(go.Diagram, this.$refs.gojsDiv, {
        "undoManager.isEnabled": true,
        layout: $(go.LayeredDigraphLayout, {
          direction: 90, // 设置为 90 度 (垂直方向)
          layerSpacing: 50, // 调整层间距
          columnSpacing: 100, // 调整列间距 (如果需要)
          setsPortSpots: false, //通常需要设置为false
        }),
      });

      // 辅助函数：创建带标题的节点模板
      function createNodeTemplate(category, title, color) {
        return $(
          go.Node,
          "Auto",
          {
            isShadowed: true,
            shadowBlur: 5,
            shadowOffset: new go.Point(3, 3),
            shadowColor: "#999",
            // 工具提示
            toolTip: $(
              "ToolTip",
              $(
                go.TextBlock,
                { margin: 4 },
                new go.Binding("text", "", (data) => {
                  return `${data.key}\n${data.text}`;
                })
              )
            ),
          },
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
            go.Point.stringify
          ),
          $(go.Shape, "RoundedRectangle", {
            fill: color,
            stroke: "gray",
            strokeWidth: 2,
            width: 160,
            height: 80,
          }),
          $(
            go.Panel,
            "Vertical",
            $(
              go.TextBlock,
              {
                margin: new go.Margin(5, 5, 0, 5),
                font: "bold 10pt sans-serif",
              },
              title
            ),
            $(
              go.TextBlock,
              { margin: 5, wrap: go.TextBlock.WrapFit, width: 120 },
              new go.Binding("text", "text")
            )
          )
        );
      }

      // 定义节点模板
      myDiagram.nodeTemplateMap.add(
        "Client",
        createNodeTemplate("Client", "客户端", "#A7E8A7")
      ); // 浅绿色
      myDiagram.nodeTemplateMap.add(
        "Server",
        createNodeTemplate("Server", "服务器", "#FFB8A7")
      ); // 浅红色
      myDiagram.nodeTemplateMap.add(
        "Step",
        createNodeTemplate("Step", "客户端执行", "lightblue")
      );
      myDiagram.nodeTemplateMap.add(
        "Conditional", // 条件节点
        $(
          go.Node,
          "Auto",
          {
            isShadowed: true,
            shadowBlur: 5,
            shadowOffset: new go.Point(3, 3),
            shadowColor: "#999",
            // 工具提示
            toolTip: $(
              "ToolTip",
              $(
                go.TextBlock,
                { margin: 4 },
                new go.Binding("text", "", (data) => {
                  return `${data.key}\n${data.text}`;
                })
              )
            ),
          },
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
            go.Point.stringify
          ),
          $(go.Shape, "Diamond", {
            // 菱形
            fill: "lightyellow",
            stroke: "gray",
            strokeWidth: 2,
            width: 160,
            height: 80,
          }),
          $(go.TextBlock, { margin: 4 }, new go.Binding("text", "text"))
        )
      );

      // 定义连线模板
      myDiagram.linkTemplate = $(
        go.Link,
        { routing: go.Link.AvoidsNodes, corner: 10, curve: go.Link.JumpGap }, // 避免节点、圆角、跳跃间隙
        $(go.Shape, { stroke: "gray", strokeWidth: 2 }),
        $(go.Shape, { toArrow: "Standard", stroke: "gray", fill: "gray" })
      );

      // 创建模型数据
      const model = new go.GraphLinksModel();
      model.nodeDataArray = [
        // 客户端节点
        { key: "A", text: "页面加载", category: "Client", loc: "0 0" },
        {
          key: "B",
          text: "检查是否记住登录",
          category: "Conditional",
          loc: "0 100",
        },
        {
          key: "C",
          text: "自动 connectToServer",
          category: "Step",
          loc: "150 200",
        },
        { key: "D", text: "显示连接界面", category: "Step", loc: "-150 200" },
        {
          key: "E",
          text: "用户输入服务器地址/端口",
          category: "Step",
          loc: "-150 300",
        },
        { key: "F", text: "点击连接按钮", category: "Step", loc: "-150 400" },
        {
          key: "G",
          text: "创建 tempMainSocket",
          category: "Step",
          loc: "150 500",
        },
        {
          key: "H",
          text: "发送 MSG_TYPE.IDENTIFY_SILLYTAVERN",
          category: "Step",
          loc: "150 600",
        },
        { key: "I", text: "接收响应", category: "Step", loc: "150 700" },
        {
          key: "J",
          text: "获取 sillyTavernMasterKey",
          category: "Step",
          loc: "150 800",
        },
        { key: "K", text: "创建 llmSocket", category: "Step", loc: "150 900" },
        { key: "L", text: "设置 authData", category: "Step", loc: "150 1000" },
        {
          key: "M",
          text: "llmSocket.connect()",
          category: "Step",
          loc: "150 1100",
        },
        { key: "N", text: "连接成功", category: "Step", loc: "150 1200" },
        {
          key: "O",
          text: "创建其他命名空间连接",
          category: "Step",
          loc: "150 1300",
        },
        { key: "P", text: "设置事件监听器", category: "Step", loc: "150 1400" },
        { key: "Q", text: "加载设置", category: "Step", loc: "150 1500" },
        { key: "R", text: "刷新 UI", category: "Step", loc: "150 1600" },

        // 服务器节点
        {
          key: "S",
          text: "验证 SillyTavern 客户端",
          category: "Server",
          loc: "400 600",
        },
        {
          key: "T",
          text: "返回 sillyTavernMasterKey",
          category: "Server",
          loc: "400 800",
        },
        { key: "U", text: "验证客户端", category: "Server", loc: "400 1100" },
        { key: "V", text: "接受连接", category: "Server", loc: "400 1200" },
      ];
      model.linkDataArray = [
        // 客户端流程
        { from: "A", to: "B" },
        { from: "B", to: "C", text: "是" },
        { from: "B", to: "D", text: "否" },
        { from: "D", to: "E" },
        { from: "E", to: "F" },
        { from: "F", to: "C" },
        { from: "C", to: "G" },
        { from: "G", to: "H" },
        { from: "H", to: "I" },
        { from: "I", to: "J" },
        { from: "J", to: "K" },
        { from: "K", to: "L" },
        { from: "L", to: "M" },
        { from: "M", to: "N" },
        { from: "N", to: "O" },
        { from: "O", to: "P" },
        { from: "P", to: "Q" },
        { from: "Q", to: "R" },

        // 服务器流程
        { from: "H", to: "S", dash: [6, 3] },
        { from: "S", to: "T", text: "成功", dash: [6, 3] },
        { from: "M", to: "U", dash: [6, 3] },
        { from: "U", to: "V", text: "成功", dash: [6, 3] },
      ];

      //设置虚线
      function SetDash(link, value) {
        link.path.strokeDashArray = value;
      }
      myDiagram.addDiagramListener("ObjectSingleClicked", function (e) {
        var part = e.subject.part;
        if (!(part instanceof go.Link)) return;
        SetDash(part, part.data.dash);
      });

      myDiagram.model = model;
    },
  },
};
</script>