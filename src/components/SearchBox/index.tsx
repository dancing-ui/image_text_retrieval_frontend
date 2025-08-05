import React, { useState, useEffect } from 'react';
import { AutoComplete, Button, App, Typography } from 'antd';
import styles from './index.module.css';
import { fetchImagesAllModels } from '../../service/api'
import type { ImageResult } from '../../types'

const { Text } = Typography;

const MODLES = ["cfine", "ours"]

const validateImageResult = (item: any): item is ImageResult => {
  return (
    typeof item === 'object' &&
    item !== null &&
    (typeof item.id === 'number') &&
    typeof item.score === 'number' &&
    typeof item.pic === 'string'
  );
};

const transformAndValidateData = (data: any): ImageResult[] => {
  if (!data || !Array.isArray(data.query_imgs)) {
    throw new Error('响应数据格式错误：缺少 query_imgs 数组');
  }

  if (!data.gallery_size || typeof data.gallery_size !== 'number') {
    throw new Error('响应数据格式错误：缺少或格式不正确的 gallery_size');
  }

  const results: ImageResult[] = [];
  
  for (const item of data.query_imgs) {
    if (validateImageResult(item)) {
      // 确保 id 是字符串类型
      results.push({
        id: item.id,
        score: item.score,
        pic: item.pic
      });
    } else {
      console.warn('跳过格式不正确的数据项:', item);
    }
  }
  return results;
};


interface SearchBoxProps {
  onSearchResults: (result: Map<string, ImageResult[]>) => void
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearchResults }) => {
  const { message } = App.useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyOptions, setHistoryOptions] = useState<string[]>([]);
  const [gallerySize, setGallerySize] = useState(0);

  const handleSearch = async () => {
    if(!query.trim()) {
      message.warning('请先输入行人特征描述')
      return
    }
    saveToHistory(query.trim())
    setLoading(true)
    try {
      console.log('正在搜索查询: ', query)
      let response = await fetchImagesAllModels(query.trim(), MODLES)
      let results = new Map<string, ImageResult[]>();
      response.results.forEach((value, key) => {
        try {
          let filteredValue = transformAndValidateData(value);
          if (filteredValue.length) {
            results.set(key, filteredValue);
          }
        } catch (error) {
          console.error(`转换和验证 ${key} 数据失败:`, error);
        }
      });
      if (results.size === 0) {
        message.error('没有找到相关结果，请尝试其他关键词');
        return;
      }
      setGallerySize(response.gallerySize);
      onSearchResults(results)
      console.log('搜索查询结果: ', results)
      message.success('检索成功');
    } catch (error) {
      console.error('搜索查询失败:', error);
      message.error('搜索查询失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const options = historyOptions.map(item => ({
    value: item,
    label: item
  }));

  const saveToHistory = (searchQuery: string) => {
    const newHistory = [searchQuery, ...historyOptions.filter(item => item !== searchQuery)].slice(0, 5);
    setHistoryOptions(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setHistoryOptions(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <div className={styles.searchBox}>
        <AutoComplete
          value={query}
          onChange={setQuery}
          onSelect={setQuery}
          options={options}
          placeholder="请输入文本进行图文检索或下拉选择历史输入"
          className={styles.input}
          size="large"
          filterOption={(inputValue, option) =>
            option!.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
          }
        />
        <Button 
          type="primary" 
          onClick={handleSearch} 
          loading={loading}
          className={styles.button}
          size="large"
        >
          搜索
        </Button>
        
        {gallerySize > 0 ? 
        <div className={styles.gallerySizeContainer}>
          <Text type="secondary">
            图库大小： {gallerySize}
          </Text>
        </div> 
        : 
        null
        }
    </div>
  );
};

export default SearchBox;