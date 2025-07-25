"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DraggableElement from "./DraggableElement";
import { Plus, Minus, RotateCcw, Grid, Eye, Box } from "lucide-react";

interface CanvasElement {
  id: string;
  type: "image" | "text" | "shape" | "path";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isLocked: boolean;
  path?: Array<{x: number, y: number}>;
}

interface DesignCanvasProps {
  selectedTemplate: {
    id: number;
    name: string;
    preview: string;
    category: string;
  };
  selectedTool: string;
  onElementSelect?: (elementId: string | null) => void;
  onCanvasExport?: (canvasDataUrl: string) => void;
}

export default function DesignCanvas({
  selectedTemplate,
  selectedTool,
  onElementSelect,
  onCanvasExport,
}: DesignCanvasProps) {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [projectName, setProjectName] = useState("未命名项目");
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentDrawing, setCurrentDrawing] = useState<CanvasElement | null>(null);
  const [penPath, setPenPath] = useState<Array<{x: number, y: number}>>([]);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 添加新元素到画布
  const addElement = useCallback((type: "image" | "text" | "shape", content: string = "", x?: number, y?: number, width?: number, height?: number) => {
    const newElement: CanvasElement = {
      id: `element-${Date.now()}`,
      type,
      content: content || (type === "text" ? "双击编辑文字" : type === "shape" ? "形状" : "图片"),
      x: x ?? 100,
      y: y ?? 100,
      width: width ?? (type === "text" ? 120 : 100),
      height: height ?? (type === "text" ? 40 : 100),
      rotation: 0,
      isLocked: false,
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  }, []);

  // 处理画布鼠标按下
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (zoom / 100);
      const y = (e.clientY - rect.top) / (zoom / 100);

      if (selectedTool === "select") {
        // 取消选择
        setSelectedElementId(null);
        onElementSelect?.(null);
      } else if (selectedTool === "pen") {
        // 钢笔工具 - 开始或继续路径
        if (!isDrawingPath) {
          // 开始新路径
          setIsDrawingPath(true);
          setPenPath([{ x, y }]);
        } else {
          // 添加新的点到路径
          setPenPath(prev => [...prev, { x, y }]);
        }
      } else if (selectedTool === "text") {
        // 文字工具直接添加
        addElement("text", "双击编辑文字", x, y, 120, 40);
      } else if (selectedTool === "rectangle" || selectedTool === "circle" || selectedTool === "triangle") {
        // 开始绘制形状
        setIsDrawing(true);
        setDrawStart({ x, y });
        
        const newElement: CanvasElement = {
          id: `element-${Date.now()}`,
          type: "shape",
          content: selectedTool,
          x,
          y,
          width: 0,
          height: 0,
          rotation: 0,
          isLocked: false,
        };
        
        setCurrentDrawing(newElement);
      }
    }
  }, [selectedTool, zoom, addElement, onElementSelect]);

  // 处理画布鼠标移动
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDrawing && currentDrawing && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / (zoom / 100);
      const currentY = (e.clientY - rect.top) / (zoom / 100);
      
      const width = Math.abs(currentX - drawStart.x);
      const height = Math.abs(currentY - drawStart.y);
      const x = Math.min(drawStart.x, currentX);
      const y = Math.min(drawStart.y, currentY);
      
      setCurrentDrawing(prev => prev ? {
        ...prev,
        x,
        y,
        width: Math.max(width, 10), // 最小尺寸
        height: Math.max(height, 10)
      } : null);
    }
  }, [isDrawing, currentDrawing, drawStart, zoom]);

  // 处理画布鼠标抬起
  const handleCanvasMouseUp = useCallback(() => {
    if (isDrawing && currentDrawing) {
      // 只有当形状有一定大小时才添加到画布
      if (currentDrawing.width > 10 && currentDrawing.height > 10) {
        setElements(prev => [...prev, currentDrawing]);
        setSelectedElementId(currentDrawing.id);
        onElementSelect?.(currentDrawing.id);
      }
      
      setIsDrawing(false);
      setCurrentDrawing(null);
    }
  }, [isDrawing, currentDrawing, onElementSelect]);

  // 元素操作处理函数
  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElementId(elementId);
    onElementSelect?.(elementId);
  }, [onElementSelect]);

  const handleElementMove = useCallback((elementId: string, x: number, y: number) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, x, y } : el
    ));
  }, []);

  const handleElementResize = useCallback((elementId: string, width: number, height: number) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, width, height } : el
    ));
  }, []);

  const handleElementRotate = useCallback((elementId: string, rotation: number) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, rotation } : el
    ));
  }, []);

  const handleElementDelete = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
      onElementSelect?.(null);
    }
  }, [selectedElementId, onElementSelect]);

  const handleElementLock = useCallback((elementId: string, locked: boolean) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, isLocked: locked } : el
    ));
  }, []);

  const handleElementContentChange = useCallback((elementId: string, newContent: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, content: newContent } : el
    ));
  }, []);

  // 缩放控制
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  // 项目名称编辑处理
  const handleProjectNameDoubleClick = () => {
    setIsEditingProjectName(true);
    setEditingProjectName(projectName);
  };

  const handleProjectNameSave = () => {
    if (editingProjectName.trim()) {
      setProjectName(editingProjectName.trim());
    }
    setIsEditingProjectName(false);
  };

  const handleProjectNameCancel = () => {
    setIsEditingProjectName(false);
    setEditingProjectName(projectName);
  };

  const handleProjectNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleProjectNameSave();
    } else if (e.key === 'Escape') {
      handleProjectNameCancel();
    }
  };

  // 导出画布内容为图片
  const exportCanvasAsImage = useCallback(() => {
    if (!canvasRef.current) return;

    // 创建一个临时canvas来渲染画布内容
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = 750;
    canvas.height = 550;

    // 填充白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制所有元素
    elements.forEach(element => {
      ctx.save();
      
      // 应用变换
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.translate(-element.width / 2, -element.height / 2);

      if (element.type === 'text') {
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(element.content, element.width / 2, element.height / 2);
      } else if (element.type === 'shape') {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(0, 0, element.width, element.height);
      }
      
      ctx.restore();
    });

    // 导出为base64
    const dataUrl = canvas.toDataURL('image/png');
    onCanvasExport?.(dataUrl);
    
    return dataUrl;
  }, [elements, onCanvasExport]);

  // 添加全局鼠标事件监听
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDrawing && currentDrawing && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / (zoom / 100);
        const currentY = (e.clientY - rect.top) / (zoom / 100);
        
        const width = Math.abs(currentX - drawStart.x);
        const height = Math.abs(currentY - drawStart.y);
        const x = Math.min(drawStart.x, currentX);
        const y = Math.min(drawStart.y, currentY);
        
        setCurrentDrawing(prev => prev ? {
          ...prev,
          x,
          y,
          width: Math.max(width, 10),
          height: Math.max(height, 10)
        } : null);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDrawing && currentDrawing) {
        if (currentDrawing.width > 10 && currentDrawing.height > 10) {
          setElements(prev => [...prev, currentDrawing]);
          setSelectedElementId(currentDrawing.id);
          onElementSelect?.(currentDrawing.id);
        }
        
        setIsDrawing(false);
        setCurrentDrawing(null);
      }
    };

    if (isDrawing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDrawing, currentDrawing, drawStart, zoom, onElementSelect]);

  // 处理钢笔工具的键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTool === "pen" && isDrawingPath) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          // 完成路径绘制
          finishPenPath();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, isDrawingPath, penPath]);

  // 完成钢笔路径绘制
  const finishPenPath = useCallback(() => {
    if (penPath.length > 1) {
      // 计算路径的边界框
      const minX = Math.min(...penPath.map(p => p.x));
      const minY = Math.min(...penPath.map(p => p.y));
      const maxX = Math.max(...penPath.map(p => p.x));
      const maxY = Math.max(...penPath.map(p => p.y));
      
      const newPathElement: CanvasElement = {
        id: `element-${Date.now()}`,
        type: "path",
        content: "路径",
        x: minX,
        y: minY,
        width: maxX - minX + 20,
        height: maxY - minY + 20,
        rotation: 0,
        isLocked: false,
        path: penPath,
      };
      
      setElements(prev => [...prev, newPathElement]);
      setSelectedElementId(newPathElement.id);
      onElementSelect?.(newPathElement.id);
    }
    
    setIsDrawingPath(false);
    setPenPath([]);
  }, [penPath, onElementSelect]);

  // 处理双击完成路径
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (selectedTool === "pen" && isDrawingPath) {
      e.stopPropagation();
      finishPenPath();
    }
  }, [selectedTool, isDrawingPath, finishPenPath]);

  return (
    <div className="flex-1 flex flex-col">
      {/* 画布工具栏 */}
      <div className="h-14 border-b border-gray-200/50 bg-white/90 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
            <Box className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">当前模板:</span>
            <span className="text-sm font-semibold text-blue-600">{selectedTemplate.name}</span>
          </div>
        </div>
        
        {/* 中间：项目名称 */}
        <div className="flex-1 flex items-center justify-center">
          {isEditingProjectName ? (
            <input
              type="text"
              value={editingProjectName}
              onChange={(e) => setEditingProjectName(e.target.value)}
              onBlur={handleProjectNameSave}
              onKeyDown={handleProjectNameKeyDown}
              className="text-lg font-semibold text-gray-800 bg-transparent border-b-2 border-blue-500 focus:outline-none text-center min-w-[200px]"
              autoFocus
            />
          ) : (
            <div
              className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-blue-50"
              onDoubleClick={handleProjectNameDoubleClick}
              title="双击编辑项目名称"
            >
              {projectName}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={`transition-all duration-200 ${
              showGrid 
                ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600' 
                : 'hover:bg-blue-50 border-blue-200'
            }`}
          >
            <Grid className="w-4 h-4 mr-2" />
            网格
          </Button>
          <Button
            variant={showGuides ? "default" : "outline"}
            size="sm"
            onClick={() => setShowGuides(!showGuides)}
            className={`transition-all duration-200 ${
              showGuides 
                ? 'bg-green-500 text-white shadow-md hover:bg-green-600' 
                : 'hover:bg-green-50 border-green-200'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            辅助线
          </Button>
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg bg-white shadow-sm">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="hover:bg-gray-50">
              <Minus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomReset} className="hover:bg-gray-50">
              <span className="text-sm min-w-[50px] font-medium">{zoom}%</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="hover:bg-gray-50">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 画布区域 */}
      <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="flex items-center justify-center min-h-full">
          <Card className="bg-white shadow-xl border-0 overflow-hidden">
            <div
              ref={canvasRef}
              className={`relative bg-gradient-to-br from-white to-gray-50 rounded-lg overflow-hidden ${
                showGrid ? "design-canvas" : ""
              }`}
              style={{
                width: `${750 * (zoom / 100)}px`,
                height: `${550 * (zoom / 100)}px`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "center",
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onDoubleClick={handleCanvasDoubleClick}
            >
              {/* 模板轮廓 */}
              <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-lg pointer-events-none">
              </div>

              {/* 辅助线 */}
              {showGuides && (
                <>
                  <div className="absolute top-0 left-1/2 w-px h-full bg-blue-300 opacity-50 pointer-events-none" />
                  <div className="absolute left-0 top-1/2 w-full h-px bg-blue-300 opacity-50 pointer-events-none" />
                </>
              )}

              {/* 渲染所有元素 */}
              {elements.map((element) => (
                <DraggableElement
                  key={element.id}
                  id={element.id}
                  type={element.type}
                  content={element.content}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  rotation={element.rotation}
                  isSelected={selectedElementId === element.id}
                  isLocked={element.isLocked}
                  onSelect={handleElementSelect}
                  onMove={handleElementMove}
                  onResize={handleElementResize}
                  onRotate={handleElementRotate}
                  onDelete={handleElementDelete}
                  onLock={handleElementLock}
                  onContentChange={handleElementContentChange}
                  path={element.path}
                />
              ))}

              {/* 渲染正在绘制的形状 */}
              {currentDrawing && (
                <div
                  className="absolute border-2 border-dashed border-blue-500 bg-blue-100 opacity-50 pointer-events-none"
                  style={{
                    left: currentDrawing.x,
                    top: currentDrawing.y,
                    width: currentDrawing.width,
                    height: currentDrawing.height,
                  }}
                />
              )}

              {/* 渲染正在绘制的钢笔路径 */}
              {isDrawingPath && penPath.length > 0 && (
                <svg 
                  className="absolute inset-0 pointer-events-none" 
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* 已绘制的路径 */}
                  {penPath.length > 1 && (
                    <path
                      d={penPath.reduce((acc, point, index) => {
                        if (index === 0) {
                          return `M ${point.x} ${point.y}`;
                        } else {
                          return `${acc} L ${point.x} ${point.y}`;
                        }
                      }, '')}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="5,5"
                    />
                  )}
                  
                  {/* 渲染锚点 */}
                  {penPath.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 