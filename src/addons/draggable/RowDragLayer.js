import React, { Component, PropTypes } from 'react';
import { DragLayer } from 'react-dnd';
import Selectors from '../data/Selectors';

const layerStyles = {
  cursor: '-webkit-grabbing',
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};

function getItemStyles(props) {
  const { currentOffset } = props;
  if (!currentOffset) {
    return {
      display: 'none'
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform: transform,
    WebkitTransform: transform
  };
}

class CustomDragLayer extends Component {

  isDraggedRowSelected(selectedRows) {
    let {item, rowSelection} = this.props;
    if (selectedRows && selectedRows.length > 0) {
      let key = rowSelection.selectBy.keys.rowKey;
      return selectedRows.filter(r => r[key] === item.data[key]).length > 0;
    }
    return false;
  }

  getRows() {
    let rows = [];
    let {rowsCount, rowGetter} = this.props;
    for (let j = 0; j < rowsCount; j++) {
      rows.push(rowGetter(j));
    }
    return rows;
  }

  getDraggedRows() {
    let draggedRows;
    let {rowSelection} = this.props;
    if (rowSelection && rowSelection.selectBy.keys) {
      let rows = this.getRows();
      let {rowKey, values} = rowSelection.selectBy.keys;
      let selectedRows = Selectors.getSelectedRowsByKey({rowKey: rowKey, selectedKeys: values, rows: rows});
      draggedRows = this.isDraggedRowSelected(selectedRows) ? selectedRows : [this.props.item.data];
    } else {
      draggedRows = [this.props.item.data];
    }
    return draggedRows;
  }

  renderDraggedRows() {
    return this.getDraggedRows().map((r, i) => {
      return <tr key={`dragged-row-${i}`}>{this.renderDraggedCells(r, i) }</tr>;
    });
  }

  renderDraggedCells(item, rowIdx) {
    let cells = [];
    if (item != null) {
      for (let c in item) {
        if (item.hasOwnProperty(c)) {
          cells.push(<td key={`dragged-cell-${rowIdx}-${c}`} className="react-grid-Cell" style={{padding: '5px'}}>{item[c]}</td>);
        }
      }
    }
    return cells;
  }

  render() {
    const { isDragging} = this.props;
    if (!isDragging) {
      return null;
    }
    let draggedRows = this.renderDraggedRows();
    return (
      <div style={layerStyles} className="rdg-dragging">
        <div style={getItemStyles(this.props) } className="rdg-dragging">
          <table><tbody>{draggedRows}</tbody></table>
        </div>
      </div>
    );
  }
}

CustomDragLayer.propTypes = {
  item: PropTypes.object,
  itemType: PropTypes.string,
  currentOffset: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  isDragging: PropTypes.bool.isRequired,
  rowGetter: PropTypes.func.isRequired,
  rowsCount: PropTypes.number.isRequired,
  rowSelection: PropTypes.object
};

function collect(monitor) {
  return {
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  };
}

export default DragLayer(collect)(CustomDragLayer);