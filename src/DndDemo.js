import React, { useState, useCallback, useRef } from "react";
import { Table } from "antd";
import { DndProvider, useDrag, useDrop, createDndContext } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from "immutability-helper";

const RNDContext = createDndContext(HTML5Backend);

const type = "DragableBodyRow";

const DragableBodyRow = (param) => {
  const { index, id, moveRow, className, style, ...restProps } = param;
  const ref = React.useRef();
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex, id: dragId } = monitor.getItem() || {};
      // console.log(monitor.getItem());
      // if (dragIndex === index) {
      //   return {};
      // }
      // console.log('dragId === id', dragId, id)
      if (dragId === id) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName:
          dragIndex < index ? " drop-over-downward" : " drop-over-upward",
      };
    },
    drop: (item) => {
      moveRow(item.index, index, item.id, id);
    },
  });

  const [, drag] = useDrag({
    item: { type, index, id },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });
  drop(drag(ref));
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ""}`}
      style={{ cursor: "move", ...style }}
      {...restProps}
    />
  );
};

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "id",
    dataIndex: "id",
    key: "id",
  },
];

const DragSortingTable = () => {
  const [data, setData] = useState([
    {
      id: "id-1",
      name: "John Brown",
      age: 32,
      address: "New York No. 1 Lake Park",
      level: 1,
    },
    {
      id: "id-2",
      name: "Jim Green",
      age: 42,
      address: "London No. 1 Lake Park",
      level: 1,
    },
    {
      id: "id-3",
      name: "Joe Black",
      age: 32,
      address: "Sidney No. 1 Lake Park",
      level: 1,
      children: [
        {
          id: "id-3-1",
          pId: "id-3",
          name: "Joe Black 22",
          age: 42,
          address: "New York No. 2 Lake Park",
          level: 2,
        },
      ],
    },
  ]);

  const generateMap = (data) => {
    let dataMap = {};
    data.forEach((item) => {
      dataMap[item.id] = item;
      if (item.children && item.children.length > 0) {
        item.children.forEach((cItem) => {
          dataMap[cItem.id] = cItem;
        });
      }
    });
    return dataMap;
  };
  const components = {
    body: {
      row: DragableBodyRow,
    },
  };
  const moveRow = useCallback(
    (dragIndex, hoverIndex, dragId, hoverId) => {
      console.log('data', data)
      let tempData = data;
      const dataMap = generateMap(tempData);
      const dragRow = dataMap[dragId];
      console.log("dragRow", dragRow);
      const hoverRow = dataMap[hoverId];
      if (dragRow.pId) {
        const dragPRow = dataMap[dragRow.pId];
        // 删除
        dragPRow.children.splice(dragIndex, 1);
        dragRow.pId = dragPRow.pId; // 重置pId
      } else {
        // 删除
        tempData.splice(dragIndex, 1);
      }

      if (hoverRow.children) {
        // 添加
        dragRow.pId = hoverRow.id; // 添加父级别
        hoverRow.children.splice(hoverIndex, 0, dragRow);
      } else if(hoverRow.pId) {
        const hoverPRow = dataMap[hoverRow.pId];
        dragRow.pId = hoverRow.pId; // 添加父级别
        hoverPRow.children.splice(hoverIndex, 0, dragRow);
      }
      else{
        // 添加
        tempData.splice(hoverIndex, 0, dragRow);
      }

      setData(Array.from(tempData));
      // $splice: [
      //   [dragIndex, 1],
      //   [hoverIndex, 0, dragRow],
      // ],
      // setData(newData);
    },
    [data]
  );

  const manager = useRef(RNDContext);

  return (
    <DndProvider manager={manager.current.dragDropManager}>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        components={components}
        onRow={(record, index) => ({
          index,
          id: record.id,
          moveRow,
        })}
      />
    </DndProvider>
  );
};

export default DragSortingTable;
