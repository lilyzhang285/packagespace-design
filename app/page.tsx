"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import DesignCanvas from "@/components/DesignCanvas";
import AIImageGenerator from "@/components/AIImageGenerator";
import ThreeDPreview from "@/components/ThreeDPreview";
import {
  MousePointer,
  Edit,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
  Download,
  Upload,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Sparkles,
  Box,
  Maximize,
  Search,
  Grid,
  Circle,
  Triangle,
  Image as ImageIcon,
  Palette,
  Settings,
  Zap,
  Star,
  Play,
  Save,
  FolderOpen,
  Share2,
  Bell,
  User,
  HelpCircle
} from "lucide-react";

// 模拟数据
const templates = [
  { id: 1, name: "抽屉盒", preview: "/api/placeholder/120/120", category: "盒型", description: "经典抽屉式包装盒" },
  { id: 2, name: "天地盖", preview: "/api/placeholder/120/120", category: "盒型", description: "上下盖分离式包装" },
  { id: 3, name: "翻盖盒", preview: "/api/placeholder/120/120", category: "盒型", description: "翻盖式包装盒" },
  { id: 4, name: "手提袋", preview: "/api/placeholder/120/120", category: "袋型", description: "便携手提包装袋" },
  { id: 5, name: "信封袋", preview: "/api/placeholder/120/120", category: "袋型", description: "信封式包装袋" },
  { id: 6, name: "立体盒", preview: "/api/placeholder/120/120", category: "盒型", description: "立体展示包装盒" },
  { id: 7, name: "折叠盒", preview: "/api/placeholder/120/120", category: "盒型", description: "可折叠式包装盒" },
  { id: 8, name: "六角盒", preview: "/api/placeholder/120/120", category: "盒型", description: "六边形包装盒" },
  { id: 9, name: "三角盒", preview: "/api/placeholder/120/120", category: "盒型", description: "三角形包装盒" },
  { id: 10, name: "长条盒", preview: "/api/placeholder/120/120", category: "盒型", description: "细长条形包装盒" },
  { id: 11, name: "圆筒盒", preview: "/api/placeholder/120/120", category: "筒型", description: "圆柱形包装筒" },
  { id: 12, name: "展示盒", preview: "/api/placeholder/120/120", category: "盒型", description: "透明展示包装盒" },
];



export default function PackageSpace() {
  const [selectedTool, setSelectedTool] = useState("select");
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [canvasContent, setCanvasContent] = useState<string | undefined>(undefined);

  const tools = [
    { id: "select", icon: MousePointer, label: "选择" },
    { id: "pen", icon: Edit, label: "钢笔" },
    { id: "rectangle", icon: Square, label: "矩形" },
    { id: "circle", icon: Circle, label: "圆形" },
    { id: "triangle", icon: Triangle, label: "三角形" },
    { id: "text", icon: Type, label: "文字" },
    { id: "image", icon: ImageIcon, label: "图片" },
  ];

  const alignTools = [
    { id: "align-left", icon: AlignLeft, label: "左对齐" },
    { id: "align-center", icon: AlignCenter, label: "居中对齐" },
    { id: "align-right", icon: AlignRight, label: "右对齐" },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm flex-shrink-0 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* 左侧品牌 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg flex items-center justify-center">
                  <Box className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Package Space
                </h1>
                <p className="text-xs text-gray-500">智能包装设计平台</p>
              </div>
            </div>
          </div>

          {/* 中间导航 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-sm font-medium">
              <FolderOpen className="w-4 h-4 mr-2" />
              项目
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              <Box className="w-4 h-4 mr-2" />
              模板库
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI 工具
            </Button>
            <Button variant="ghost" className="text-sm font-medium">
              <HelpCircle className="w-4 h-4 mr-2" />
              帮助
            </Button>
          </nav>

          {/* 右侧操作 */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 欢迎横幅 */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 px-6 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">欢迎使用 Package Space</h2>
                <p className="text-sm opacity-90">开始创建您的专业包装设计，体验AI驱动的设计工作流</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Play className="w-4 h-4 mr-2" />
                观看教程
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowWelcome(false)}
                className="text-white hover:bg-white/20"
          >
                ×
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 主要内容区域 */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* 左侧：AI生图组件 */}
        <div className="bg-white/90 backdrop-blur-sm border-r border-gray-200/50 shadow-sm flex flex-col" style={{ width: '350px' }}>
          <AIImageGenerator
            onImageSelect={(imageUrl) => {
              console.log("选择图像:", imageUrl);
            }}
          />
        </div>

        {/* 中间：设计画布 */}
        <div className="flex-1 flex flex-col min-w-0">
          <DesignCanvas
            selectedTemplate={selectedTemplate}
            selectedTool={selectedTool}
            onElementSelect={(elementId: string | null) => {
              console.log("选中元素:", elementId);
            }}
            onCanvasExport={(dataUrl: string) => {
              setCanvasContent(dataUrl);
            }}
          />
        </div>

        {/* 右侧：工具面板 */}
        <div className="w-[330px] bg-white/90 backdrop-blur-sm border-l border-gray-200/50 shadow-sm flex flex-col">
          <Tabs defaultValue="templates" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-2 mt-5 mb-6 bg-gray-100 rounded-xl p-1 gap-0.5 h-12">
              <TabsTrigger value="templates" className="text-sm font-medium text-gray-600 data-[state=active]:text-white data-[state=active]:bg-blue-500 data-[state=active]:shadow-md hover:bg-gray-200 transition-all duration-200 rounded-lg flex items-center justify-center">模板</TabsTrigger>
              <TabsTrigger value="layers" className="text-sm font-medium text-gray-600 data-[state=active]:text-white data-[state=active]:bg-blue-500 data-[state=active]:shadow-md hover:bg-gray-200 transition-all duration-200 rounded-lg flex items-center justify-center">图层</TabsTrigger>
              <TabsTrigger value="editor" className="text-sm font-medium text-gray-600 data-[state=active]:text-white data-[state=active]:bg-blue-500 data-[state=active]:shadow-md hover:bg-gray-200 transition-all duration-200 rounded-lg flex items-center justify-center">编辑</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 px-4 pb-4">
              <TabsContent value="templates" className="h-full mt-0">
                <div className="space-y-4 h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">刀版模板</h3>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[800px] p-1">
                    {templates.map((template) => (
                      <div key={template.id} className="aspect-square">
                        <Card
                          className={`h-full cursor-pointer transition-all duration-200 hover:shadow-lg rounded-lg overflow-hidden ${
                            selectedTemplate.id === template.id 
                              ? 'ring-2 ring-blue-500' 
                              : ''
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <CardContent className="p-0 h-full overflow-hidden">
                            <div className="h-full flex flex-col">
                              {/* 上半部分：预览区域 */}
                              <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <Box className="w-8 h-8 text-gray-400" />
                              </div>
                              {/* 下半部分：标题区域 */}
                              <div className="h-12 bg-gradient-to-t from-gray-900 via-gray-700 to-gray-500/80 flex items-end justify-center pb-2">
                                <h4 className="text-xs font-medium text-center text-white drop-shadow-sm">{template.name}</h4>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>


                </div>
              </TabsContent>
              

              <TabsContent value="layers" className="h-full mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">图层管理</h3>
                  <div className="space-y-2">
                    {["背景层", "图像层", "文字层", "装饰层"].map((layer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Layers className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-800">{layer}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <Lock className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="editor" className="h-full mt-0">
                <div className="space-y-4 h-full overflow-y-auto px-4 pb-4 pt-2">
                  <h3 className="font-semibold text-gray-800">编辑工具</h3>
                  
                  {/* 替换图片 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      替换图片
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Upload className="w-3 h-3 mr-1" />
                        手动放图
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI消除
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Edit className="w-3 h-3 mr-1" />
                        像皮擦
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* 字体选择 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Type className="w-4 h-4 mr-2" />
                      字体设置
                    </h4>
                    <div className="space-y-2">
                      <select className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-white">
                        <option>思源黑体</option>
                        <option>微软雅黑</option>
                        <option>宋体</option>
                        <option>楷体</option>
                      </select>
                      <div className="flex space-x-2">
                        <input type="number" placeholder="字号" className="flex-1 p-2 text-xs border border-gray-200 rounded-lg" defaultValue="12" />
                        <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                          <strong>B</strong>
                        </Button>
                        <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                          <em>I</em>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 位置 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">位置</h4>
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="flex items-center space-x-1">
                        <Triangle className="w-3 h-3" />
                        <span className="text-xs">0</span>
                      </div>
                      <span className="text-xs text-center">°</span>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" className="w-6 h-6 p-0 text-xs">
                          <AlignLeft className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="w-6 h-6 p-0 text-xs">
                          <AlignCenter className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 外观 */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">外观</h4>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 items-center text-xs">
                        <span>W</span>
                        <Input className="h-7 text-xs" defaultValue="384" />
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center text-xs">
                        <span>H</span>
                        <Input className="h-7 text-xs" defaultValue="678" />
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 items-center text-xs">
                        <div className="flex items-center space-x-1">
                          <Square className="w-3 h-3" />
                          <Input className="h-7 text-xs flex-1" defaultValue="100" />
                        </div>
                        <span>%</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 描边 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">描边</h4>
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                    </div>
                  </div>

                  <Separator />

                  {/* 阴影 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">阴影</h4>
                      <div className="w-4 h-4 bg-black rounded-full"></div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          
        </div>
      </div>

      {/* 底部工具栏 */}
      <div className="h-16 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 shadow-lg flex-shrink-0">
        <div className="h-full px-6 flex items-center justify-center">
          <div className="flex items-center space-x-6">
            {/* 基础工具 */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-2">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTool(tool.id)}
                  className={`transition-all duration-200 ${
                    selectedTool === tool.id 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'hover:bg-white hover:shadow-sm'
                  }`}
                  title={tool.label}
                >
                  <tool.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* 对齐工具 */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-2">
              {alignTools.map((tool) => (
                <Button
                  key={tool.id}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-white hover:shadow-sm transition-all duration-200"
                  title={tool.label}
                >
                  <tool.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* 操作工具 */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-2">
              <Button variant="ghost" size="sm" className="hover:bg-white hover:shadow-sm" title="撤销">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-white hover:shadow-sm" title="重做">
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-white hover:shadow-sm" title="复制">
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-red-50 hover:text-red-600" title="删除">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* 颜色工具 */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-2">
              <Button variant="ghost" size="sm" className="hover:bg-white hover:shadow-sm" title="颜色">
                <Palette className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* 3D预览按钮 */}
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              onClick={() => setShow3DPreview(true)}
            >
              <Box className="w-4 h-4 mr-2" />
              3D 预览
            </Button>
          </div>
        </div>
      </div>

      {/* 3D预览组件 */}
      <ThreeDPreview
        isOpen={show3DPreview}
        onClose={() => setShow3DPreview(false)}
        templateName={selectedTemplate.name}
        canvasContent={canvasContent}
      />
    </div>
  );
}
