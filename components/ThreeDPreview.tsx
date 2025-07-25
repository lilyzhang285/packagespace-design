"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Box, 
  Download,
  RotateCcw,
  Settings,
  Maximize,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import * as THREE from 'three';

interface ThreeDPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  canvasContent?: string; // 设计画布内容的base64图片
}

export default function ThreeDPreview({ 
  isOpen, 
  onClose, 
  templateName, 
  canvasContent 
}: ThreeDPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const boxRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 鼠标交互状态
  const mouseRef = useRef({
    isDown: false,
    button: 0, // 0: 左键, 2: 右键
    lastX: 0,
    lastY: 0
  });

  // 相机控制状态
  const cameraControlRef = useRef({
    rotation: { x: 0.2, y: 0.3 }, // 初始角度更好看
    position: { x: 0, y: 0, z: 0 },
    zoom: 1,
    target: { x: 0, y: 0, z: 0 } // 注视点
  });

  // 平滑动画状态
  const smoothControlRef = useRef({
    rotation: { x: 0.2, y: 0.3 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1
  });

  // 初始化Three.js场景
  const initThreeJS = () => {
    if (!mountRef.current) return;

    try {
      // 清理之前的资源
      if (rendererRef.current) {
        if (mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }

      // 创建场景
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      sceneRef.current = scene;

      // 创建相机
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;

      // 创建渲染器
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
      });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // 添加到DOM
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      // 创建包装盒
      createPackagingBox();

      // 添加光照
      setupLighting();

      // 设置鼠标事件
      setupMouseEvents();

      // 初始化平滑状态
      smoothControlRef.current = {
        rotation: { x: 0.2, y: 0.3 },
        target: { x: 0, y: 0, z: 0 },
        zoom: 1
      };

      // 开始渲染循环
      animate();

      setIsLoading(false);
    } catch (err) {
      console.error('Three.js初始化失败:', err);
      setError('3D预览初始化失败');
      setIsLoading(false);
    }
  };

  // 创建包装盒模型
  const createPackagingBox = () => {
    if (!sceneRef.current) return;

    // 根据模板类型创建不同的包装盒
    let boxObject: THREE.Object3D;
    
    switch (templateName) {
      case '抽屉盒':
        boxObject = createDrawerBoxGeometry();
        break;
      case '天地盖':
        boxObject = createLidBoxGeometry();
        break;
      case '翻盖盒':
        boxObject = createFlipBoxGeometry();
        break;
      default:
        // 默认创建简单的立方体
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const materials = createBoxMaterials();
        boxObject = new THREE.Mesh(geometry, materials);
    }

    boxObject.castShadow = true;
    boxObject.receiveShadow = true;
    boxRef.current = boxObject as THREE.Mesh;

    sceneRef.current.add(boxObject);
  };

  // 创建抽屉盒几何体
  const createDrawerBoxGeometry = () => {
    const group = new THREE.Group();
    
    // 主体盒子
    const mainBox = new THREE.BoxGeometry(2, 1.5, 2);
    const mainMesh = new THREE.Mesh(mainBox, new THREE.MeshLambertMaterial({ color: 0xffffff }));
    mainMesh.position.set(0, 0, 0);
    group.add(mainMesh);

    // 抽屉部分
    const drawer = new THREE.BoxGeometry(1.8, 0.3, 1.8);
    const drawerMesh = new THREE.Mesh(drawer, new THREE.MeshLambertMaterial({ color: 0xf0f0f0 }));
    drawerMesh.position.set(0, 0.6, 0.3);
    group.add(drawerMesh);

    return group;
  };

  // 创建天地盖几何体
  const createLidBoxGeometry = () => {
    const group = new THREE.Group();
    
    // 底盒
    const bottomBox = new THREE.BoxGeometry(2, 1, 2);
    const bottomMesh = new THREE.Mesh(bottomBox, new THREE.MeshLambertMaterial({ color: 0xffffff }));
    bottomMesh.position.set(0, -0.3, 0);
    group.add(bottomMesh);

    // 顶盖
    const topBox = new THREE.BoxGeometry(2.1, 0.6, 2.1);
    const topMesh = new THREE.Mesh(topBox, new THREE.MeshLambertMaterial({ color: 0xf8f8f8 }));
    topMesh.position.set(0, 0.5, 0);
    group.add(topMesh);

    return group;
  };

  // 创建翻盖盒几何体
  const createFlipBoxGeometry = () => {
    const group = new THREE.Group();
    
    // 主体
    const mainBox = new THREE.BoxGeometry(2, 1.5, 2);
    const mainMesh = new THREE.Mesh(mainBox, new THREE.MeshLambertMaterial({ color: 0xffffff }));
    mainMesh.position.set(0, 0, 0);
    group.add(mainMesh);

    // 翻盖
    const lid = new THREE.BoxGeometry(2, 0.1, 1);
    const lidMesh = new THREE.Mesh(lid, new THREE.MeshLambertMaterial({ color: 0xf0f0f0 }));
    lidMesh.position.set(0, 0.8, -0.5);
    lidMesh.rotation.x = -Math.PI / 6; // 稍微打开的角度
    group.add(lidMesh);

    return group;
  };

  // 创建盒子材质
  const createBoxMaterials = () => {
    const materials = [];
    
    // 如果有画布内容，创建贴图
    if (canvasContent) {
      const texture = new THREE.TextureLoader().load(canvasContent);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      for (let i = 0; i < 6; i++) {
        materials.push(new THREE.MeshLambertMaterial({ 
          map: texture,
          transparent: true
        }));
      }
    } else {
      // 默认材质
      const colors = [0xffffff, 0xf8f8f8, 0xf0f0f0, 0xe8e8e8, 0xf5f5f5, 0xfafafa];
      colors.forEach(color => {
        materials.push(new THREE.MeshLambertMaterial({ color }));
      });
    }
    
    return materials;
  };

  // 设置光照
  const setupLighting = () => {
    if (!sceneRef.current) return;

    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    sceneRef.current.add(ambientLight);

    // 主光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    sceneRef.current.add(directionalLight);

    // 补充光源
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 0, 2);
    sceneRef.current.add(fillLight);
  };

  // 设置鼠标事件
  const setupMouseEvents = () => {
    if (!rendererRef.current?.domElement) return;

    const canvas = rendererRef.current.domElement;

    // 设置canvas样式，提高交互体验
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'none'; // 防止触摸滚动

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp); // 鼠标离开时也释放
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  };

  // 鼠标按下事件
  const handleMouseDown = (event: MouseEvent) => {
    mouseRef.current.isDown = true;
    mouseRef.current.button = event.button;
    mouseRef.current.lastX = event.clientX;
    mouseRef.current.lastY = event.clientY;

    // 更新鼠标样式
    const canvas = event.target as HTMLCanvasElement;
    if (canvas) {
      canvas.style.cursor = event.button === 0 ? 'grabbing' : 'move';
    }
  };

  // 鼠标移动事件
  const handleMouseMove = (event: MouseEvent) => {
    if (!mouseRef.current.isDown) return;

    const deltaX = event.clientX - mouseRef.current.lastX;
    const deltaY = event.clientY - mouseRef.current.lastY;

    // 调整灵敏度，让操作更精准
    const rotationSpeed = 0.008;
    const panSpeed = 0.002;

    if (mouseRef.current.button === 0) {
      // 左键：旋转
      cameraControlRef.current.rotation.y += deltaX * rotationSpeed;
      cameraControlRef.current.rotation.x += deltaY * rotationSpeed;
      
      // 限制垂直旋转角度，避免翻转
      cameraControlRef.current.rotation.x = Math.max(
        -Math.PI / 2 + 0.1, 
        Math.min(Math.PI / 2 - 0.1, cameraControlRef.current.rotation.x)
      );
    } else if (mouseRef.current.button === 2) {
      // 右键：平移
      const distance = 5 / cameraControlRef.current.zoom;
      cameraControlRef.current.target.x -= deltaX * panSpeed * distance;
      cameraControlRef.current.target.y += deltaY * panSpeed * distance;
    }

    mouseRef.current.lastX = event.clientX;
    mouseRef.current.lastY = event.clientY;
  };

  // 鼠标释放事件
  const handleMouseUp = (event?: MouseEvent) => {
    mouseRef.current.isDown = false;
    
    // 恢复鼠标样式
    const canvas = event?.target as HTMLCanvasElement;
    if (canvas) {
      canvas.style.cursor = 'grab';
    }
  };

  // 滚轮事件
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    
    // 更细腻的缩放控制
    const zoomSpeed = 0.05;
    const delta = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
    
    cameraControlRef.current.zoom *= delta;
    cameraControlRef.current.zoom = Math.max(0.2, Math.min(3, cameraControlRef.current.zoom));
    
    updateCamera();
  };

  // 更新相机位置
  const updateCamera = () => {
    if (!cameraRef.current) return;

    const { rotation, target, zoom } = cameraControlRef.current;
    
    // 计算相机位置 - 使用球坐标系
    const distance = 5 / zoom;
    const x = target.x + distance * Math.sin(rotation.y) * Math.cos(rotation.x);
    const y = target.y + distance * Math.sin(rotation.x);
    const z = target.z + distance * Math.cos(rotation.y) * Math.cos(rotation.x);
    
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target.x, target.y, target.z);
  };

  // 使用平滑值更新相机位置
  const updateCameraWithSmooth = () => {
    if (!cameraRef.current) return;

    const { rotation, target, zoom } = smoothControlRef.current;
    
    // 计算相机位置 - 使用球坐标系
    const distance = 5 / zoom;
    const x = target.x + distance * Math.sin(rotation.y) * Math.cos(rotation.x);
    const y = target.y + distance * Math.sin(rotation.x);
    const z = target.z + distance * Math.cos(rotation.y) * Math.cos(rotation.x);
    
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target.x, target.y, target.z);
  };

  // 动画循环
  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
      return;
    }

    // 检查组件是否仍然打开
    if (!isOpen) {
      return;
    }

    animationRef.current = requestAnimationFrame(animate);
    
    try {
      // 平滑插值 - 阻尼效果
      const dampingFactor = 0.1;
      const current = cameraControlRef.current;
      const smooth = smoothControlRef.current;

      // 平滑旋转
      smooth.rotation.x += (current.rotation.x - smooth.rotation.x) * dampingFactor;
      smooth.rotation.y += (current.rotation.y - smooth.rotation.y) * dampingFactor;

      // 平滑目标点
      smooth.target.x += (current.target.x - smooth.target.x) * dampingFactor;
      smooth.target.y += (current.target.y - smooth.target.y) * dampingFactor;
      smooth.target.z += (current.target.z - smooth.target.z) * dampingFactor;

      // 平滑缩放
      smooth.zoom += (current.zoom - smooth.zoom) * dampingFactor;

      // 使用平滑后的值更新相机
      updateCameraWithSmooth();
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    } catch (error) {
      console.error('渲染错误:', error);
      // 停止动画循环
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  };

  // 重置视图
  const resetView = () => {
    const initialState = {
      rotation: { x: 0.2, y: 0.3 },
      position: { x: 0, y: 0, z: 0 },
      zoom: 1,
      target: { x: 0, y: 0, z: 0 }
    };
    
    cameraControlRef.current = { ...initialState };
    smoothControlRef.current = {
      rotation: { x: 0.2, y: 0.3 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 1
    };
  };

  // 导出3D模型
  const handleExport = () => {
    if (!rendererRef.current) return;
    
    const canvas = rendererRef.current.domElement;
    const link = document.createElement('a');
    link.download = `${templateName}_3D预览.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // 组件挂载时初始化
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      
      // 延迟初始化，确保DOM已渲染
      const timeoutId = setTimeout(() => {
        initThreeJS();
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      // 当组件关闭时清理资源
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (rendererRef.current) {
        // 检查DOM元素是否存在且是mountRef的子节点
        if (mountRef.current && mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      // 清理场景资源
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }
      if (boxRef.current) {
        boxRef.current = null;
      }
    }
  }, [isOpen]);

  // 当画布内容变化时更新贴图
  useEffect(() => {
    if (canvasContent && boxRef.current) {
      const texture = new THREE.TextureLoader().load(canvasContent);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      if (Array.isArray(boxRef.current.material)) {
        boxRef.current.material.forEach((material: any) => {
          material.map = texture;
          material.needsUpdate = true;
        });
      } else {
        (boxRef.current.material as any).map = texture;
        (boxRef.current.material as any).needsUpdate = true;
      }
    }
  }, [canvasContent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-7xl h-5/6 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Box className="w-5 h-5" />
            <span>3D 预览 - {templateName}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex">
          {/* 3D视图区域 */}
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在加载3D模型...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <p className="text-red-600 mb-2">{error}</p>
                  <Button onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    initThreeJS();
                  }}>
                    重试
                  </Button>
                </div>
              </div>
            )}
            
            <div 
              ref={mountRef} 
              className="w-full h-full rounded-lg overflow-hidden"
              style={{ minHeight: '400px' }}
            />
            
            {/* 操作提示 */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
              <p>左键拖动：旋转 | 右键拖动：平移 | 滚轮：缩放</p>
            </div>
          </div>
          
          {/* 控制面板 */}
          <div className="w-64 border-l border-gray-200 p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-4 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                视图控制
              </h3>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  onClick={resetView}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置视图
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    cameraControlRef.current.zoom *= 1.2;
                    updateCamera();
                  }}
                  className="w-full"
                >
                  <ZoomIn className="w-4 h-4 mr-2" />
                  放大
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    cameraControlRef.current.zoom *= 0.8;
                    updateCamera();
                  }}
                  className="w-full"
                >
                  <ZoomOut className="w-4 h-4 mr-2" />
                  缩小
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">模型信息</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>模板：{templateName}</p>
                <p>贴图：{canvasContent ? '已应用' : '未应用'}</p>
                <p>材质：PBR材质</p>
                <p>光照：环境光 + 定向光</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 