// 文件上传/下载工具函数

/**
 * 下载JSON数据为文件
 * @param data 要下载的数据
 * @param filename 文件名（可选）
 */
export function downloadJson(data: any, filename: string = 'data.json'): void {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 清理URL对象
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download JSON:', error);
    throw new Error('Failed to download file');
  }
}

/**
 * 上传JSON文件
 * @param file 文件对象
 * @param onSuccess 成功回调
 * @param onError 错误回调
 */
export function uploadJson<T>(
  file: File,
  onSuccess: (data: T) => void,
  onError: (error: string) => void
): void {
  if (!file) {
    onError('No file selected');
    return;
  }

  const reader = new FileReader();
  
  reader.onload = () => {
    try {
      const result = reader.result as string;
      const data = JSON.parse(result) as T;
      onSuccess(data);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      onError(error instanceof Error ? error.message : 'Invalid JSON file');
    }
  };
  
  reader.onerror = () => {
    onError('Failed to read file');
  };
  
  reader.readAsText(file);
}

/**
 * 验证JSON文件格式
 * @param file 文件对象
 * @returns Promise<boolean> 是否为有效的JSON文件
 */
export function validateJsonFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      resolve(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        JSON.parse(reader.result as string);
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
}

// UUID生成功能已移至 ids.ts 文件中，避免重复
