import axios from 'axios';

// const API_BASE_URL = 'http://127.0.0.1:9527/api/v1';
const API_BASE_URL = 'http://127.0.0.1:4523/m1/6893955-6609657-default/api/v1'

const API_OK_STATUS = 1;

export const fetchImages = async (query: string, model: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/images_text_retrieval`, {
      search: query,
      model: model,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
    );
    if (response.status !== 200) {
      throw new Error(`请求失败，状态码: ${response.status}`);
    }
    console.log('响应数据:', response.data);
    if (response.data.status !== API_OK_STATUS) {
      throw new Error(`API错误，状态码: ${response.data.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('无法进行图文检索:', error);
    throw error;
  }
};

export const fetchImagesAllModels = async (query: string, models: string[]) => {
  try {
    const results = new Map();
    let gallerySize = 0
    
    const promises = models.map(async (model) => {
      try {
        const response = await fetchImages(query, model);
        return { model, data: response };
      } catch (error) {
        console.error(`模型 ${model} 搜索失败:`, error);
        return { model, data: null };
      }
    });

    const responses = await Promise.all(promises);
    
    responses.forEach(({ model, data }) => {
      if (data) {
        results.set(model, data);
        gallerySize = Math.max(gallerySize, data.gallery_size);
      }
    });

    return {
      results: results,
      gallerySize: gallerySize
    }
  } catch (error) {
    console.error('批量搜索失败:', error);
    throw error;
  }
};