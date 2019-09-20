/**
 * ```
 * 李鸿章 <poodll@163.com>
 * 9/5/2019, 7:41:10 PM
 * ```
 * doc comment for the file goes here
 */

/** Happy Coding */
import React, { useState, useRef, useContext, useEffect } from 'react';

import { Collapse } from 'antd';
import withPath from '_base/withPath';
import { context } from '_base/Context';
import DrawBase from '_view/DrawBase';
import DrawScale from '_view/DrawScale';
import DrawNode from '_view/DrawNode';
import DrawGrid from '_view/DrawGridBox';
import DrawMenu from '_view/DrawMenu';
import DrawSize from '_view/DrawSize';
import { Flow, Type } from '_type/struct';
import useMnode from './useMnode';
import useScale from './useScale';
import useFocus from './useFocus';
import { getData } from './fetch';
import './style.scss';

export default withPath('/x000/draw', {}, {})(
  ({ history, match: { params } }) => {
    const { username } = useContext(context);
    const [data, setData] = useState<Omit<DrawProps, 'author'> | null>({
      width: 1800,
      height: 2400,
      title: 'Windoors',
      flow: Flow.L2R,
      position: '01',
    });
    if (data) {
      return <Draw author={username} {...data} />;
    }
    return (
      <div className="draw-init">
        <DrawBase onSubmit={data => setData(data)} />
      </div>
    );
  }
);

export interface DrawProps {
  width: number;
  height: number;
  title: string;
  author: string;
  flow: Flow;
  position: string;
}
function Draw(props: DrawProps) {
  const canvas = useRef<HTMLDivElement>(null);
  const {
    setMainNodeData,
    setMainNode,
    resizeNode,
    newNodeId,
    mainNode,
  } = useMnode(props);
  useEffect(() => {
    console.log(mainNode);
  }, [mainNode]);
  const { focusNode, innerNode, setFocusNode } = useFocus(mainNode);
  const {
    setMinScale,
    setMaxScale,
    setScale,
    minScale,
    maxScale,
    offset,
    scale,
  } = useScale(mainNode, canvas);
  const focusKey = focusNode.length && focusNode[0].id;
  const innerKey = innerNode.length && innerNode[0].id;
  return (
    <div className="draw-main">
      <div className="draw-canvas" ref={canvas} tabIndex={0}>
        <DrawNode
          onClick={setFocusNode}
          focusId={focusKey}
          offset={offset}
          scale={scale}
          mainNode={mainNode}
        />
      </div>
      <div className="draw-object">
        <DrawScale
          setMinScale={setMinScale}
          setMaxScale={setMaxScale}
          setScale={setScale}
          minScale={minScale}
          maxScale={maxScale}
          scale={scale}
        />
        <DrawMenu
          setMainNode={setMainNode}
          newNodeId={newNodeId}
          focusNode={focusNode}
        />
        <DrawGrid
          key={innerKey}
          setMainNode={setMainNode}
          focusNode={focusNode}
          innerNode={innerNode}
          newNodeId={newNodeId}
          squared={9}
        />
        <Collapse defaultActiveKey={['2']}>
          <Collapse.Panel header="框体设置" key="1">
            <DrawBase
              {...mainNode}
              size="small"
              key={focusKey}
              onSubmit={data => setMainNodeData(data)}
              position={mainNode.children
                .map(({ type }) => Number(type === Type.LOCK))
                .join('')}
            />
          </Collapse.Panel>
          {focusNode[1] &&
            [Type.AREA, Type.FLEX, Type.GRID].includes(focusNode[0].type) && (
              <Collapse.Panel header="尺寸设置" key="2">
                <DrawSize
                  key={focusKey}
                  focusNode={focusNode as any}
                  onSubmit={(node, data) => {
                    resizeNode(node, data);
                  }}
                />
              </Collapse.Panel>
            )}
          <Collapse.Panel header="出料清单" key="3">
            出料清单
          </Collapse.Panel>
        </Collapse>
        {/* 保存·打印 */}
      </div>
    </div>
  );
}
