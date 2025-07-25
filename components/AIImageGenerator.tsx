"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Zap, 
  Image as ImageIcon, 
  Download, 
  Heart, 
  MoreVertical,
  Wand2
} from "lucide-react";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  isLiked: boolean;
}

interface AIImageGeneratorProps {
  onImageSelect?: (imageUrl: string) => void;
}

export default function AIImageGenerator({ onImageSelect }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const promptSuggestions = [
    "一个现代简约的咖啡包装设计，使用棕色和金色配色",
    "清新的茶叶包装图案，绿色主题，带有茶叶元素",
    "高端化妆品包装设计，优雅的紫色和银色搭配",
    "儿童玩具包装插画，彩色卡通风格",
    "有机食品包装设计，自然绿色主题",
    "电子产品包装图案，科技感蓝色调"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // 模拟AI生成图像
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newImages: GeneratedImage[] = Array.from({ length: 4 }, (_, index) => ({
      id: `img-${Date.now()}-${index}`,
      url: `/api/placeholder/200/200?text=AI生成图${index + 1}`,
      prompt: prompt,
      timestamp: new Date(),
      isLiked: false,
    }));
    
    setGeneratedImages(prev => [...newImages, ...prev]);
    setIsGenerating(false);
  };

  const handleImageClick = (image: GeneratedImage) => {
    onImageSelect?.(image.url);
    // 这里可以添加视觉反馈，比如显示已添加到画布的提示
  };

  const handleLike = (imageId: string) => {
    setGeneratedImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, isLiked: !img.isLiked } : img
    ));
  };

  const handleUseSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-3 p-6 pb-4 flex-shrink-0">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">AI 生成素材</h2>
          <p className="text-xs text-gray-500">智能创建设计元素</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <div className="space-y-4 h-full flex flex-col">
        {/* 描述输入 */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border border-green-100 flex-1">
          <label className="text-sm font-semibold mb-4 block text-gray-700 flex items-center">
            <Wand2 className="w-4 h-4 mr-2" />
            描述你想要的图像
          </label>
          <Textarea
            placeholder="例如：一个现代简约的咖啡包装设计，使用棕色和金色配色..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[140px] resize-none border-green-200 focus:border-green-400 focus:ring-green-200 bg-white/80 backdrop-blur-sm text-sm"
          />
        </div>

        {/* 快速建议 */}
        <div className="flex-shrink-0">
          <label className="text-xs font-medium mb-2 block text-gray-600">快速建议</label>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {promptSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="text-xs p-1.5 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors text-gray-600 leading-tight"
                onClick={() => handleUseSuggestion(suggestion)}
              >
                <Wand2 className="w-2.5 h-2.5 inline mr-1" />
                {suggestion}
              </div>
            ))}
          </div>
        </div>
        
        {/* 生成按钮 */}
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 text-white font-semibold py-3"
        >
          {isGenerating ? (
            <>
              <Zap className="w-5 h-5 mr-2 animate-spin" />
              AI 生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              生成图像
            </>
          )}
        </Button>

        <Separator />

          {/* 生成的图像 */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">生成的图像</h3>
              <span className="text-xs text-muted-foreground">
                {generatedImages.length} 张图片
              </span>
            </div>
            
            {generatedImages.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无生成的图像</p>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto h-full">
                <div className="image-grid">
                  {generatedImages.map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 group border-2 border-transparent hover:border-blue-400/50 flex-shrink-0"
                      onClick={() => handleImageClick(image)}
                    >
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    
                    {/* 悬停工具栏 */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(image.id);
                          }}
                          className="p-1 h-6 w-6 bg-white/80 backdrop-blur-sm"
                        >
                          <Heart className={`w-3 h-3 ${image.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // 下载逻辑
                          }}
                          className="p-1 h-6 w-6 bg-white/80 backdrop-blur-sm"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                      {/* 选中状态指示 */}
                      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 