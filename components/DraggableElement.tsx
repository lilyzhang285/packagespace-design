"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, Copy, Lock, Unlock } from "lucide-react";

interface DraggableElementProps {
  id: string;
  type: "image" | "text" | "shape" | "path";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onDelete: (id: string) => void;
  onLock: (id: string, locked: boolean) => void;
  onContentChange?: (id: string, content: string) => void;
  path?: Array<{x: number, y: number}>;
}

export default function DraggableElement({
  id,
  type,
  content,
  x,
  y,
  width,
  height,
  rotation,
  isSelected,
  isLocked,
  onSelect,
  onMove,
  onResize,
  onRotate,
  onDelete,
  onLock,
  onContentChange,
  path,
}: DraggableElementProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState(content);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    onSelect(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x, y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isLocked) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    onMove(id, elementStart.x + deltaX, elementStart.y + deltaY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, elementStart]);

  const getShapeStyle = (shapeType: string) => {
    switch (shapeType) {
      case "rectangle":
        return "bg-blue-500 border-2 border-blue-600";
      case "circle":
        return "bg-green-500 border-2 border-green-600 rounded-full";
      case "triangle":
        return "bg-red-500 triangle-clip-path";
      default:
        return "bg-gray-500 border-2 border-gray-600";
    }
  };

  const renderContent = () => {
    switch (type) {
      case "image":
        return (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm">图片</span>
          </div>
        );
      case "text":
        if (isEditing) {
          return (
            <div className="w-full h-full flex items-center justify-center p-2">
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => {
                  setIsEditing(false);
                  onContentChange?.(id, editingText);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false);
                    onContentChange?.(id, editingText);
                  }
                }}
                className="w-full h-full text-sm font-medium bg-transparent border-none outline-none text-center"
                autoFocus
              />
            </div>
          );
        } else {
          return (
            <div 
              className="w-full h-full flex items-center justify-center p-2 cursor-text"
              onDoubleClick={() => {
                if (!isLocked) {
                  setIsEditing(true);
                  setEditingText(content);
                }
              }}
            >
              <span className="text-sm font-medium">{content}</span>
            </div>
          );
        }
      case "shape":
        if (content === "triangle") {
          return (
            <div className="w-full h-full flex items-center justify-center">
              <div 
                className="w-0 h-0"
                style={{
                  borderLeft: '25px solid transparent',
                  borderRight: '25px solid transparent',
                  borderBottom: '43px solid #ef4444'
                }}
              />
            </div>
          );
        } else {
          const shapeStyle = getShapeStyle(content);
          return (
            <div className={`w-full h-full ${shapeStyle}`}>
            </div>
          );
        }
      case "path":
        if (path && path.length > 1) {
          // 创建SVG路径
          const pathData = path.reduce((acc, point, index) => {
            if (index === 0) {
              return `M ${point.x - x} ${point.y - y}`;
            } else {
              return `${acc} L ${point.x - x} ${point.y - y}`;
            }
          }, '');
          
          return (
            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
              <path
                d={pathData}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* 渲染锚点 */}
              {isSelected && path.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x - x}
                  cy={point.y - y}
                  r="3"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="1"
                  className="cursor-pointer"
                />
              ))}
            </svg>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move transition-all ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${isLocked ? "cursor-not-allowed opacity-75" : ""}`}
      style={{
        left: x,
        top: y,
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        zIndex: isSelected ? 1000 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 主要内容 */}
      <div className="w-full h-full relative">
        {renderContent()}
        
        {/* 选中状态的控制点 */}
        {isSelected && !isLocked && (
          <>
            {/* 调整大小的控制点 */}
            <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary rounded-full cursor-se-resize" />
            <div className="absolute -left-1 -bottom-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize" />
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize" />
            <div className="absolute -left-1 -top-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize" />
            
            {/* 旋转控制点 */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full cursor-pointer" />
            
            {/* 工具栏 */}
            <div className="absolute -top-12 left-0 flex items-center space-x-1 bg-white border rounded-md shadow-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLock(id, !isLocked)}
                className="p-1 h-6 w-6"
              >
                {isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRotate(id, rotation + 90)}
                className="p-1 h-6 w-6"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // 复制逻辑
                  console.log("复制元素:", id);
                }}
                className="p-1 h-6 w-6"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 