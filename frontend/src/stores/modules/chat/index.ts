import { ref } from 'vue';
import { defineStore } from 'pinia';

export interface SydneyConfig {
  baseUrl: string;
  label: string;
  isUsable?: boolean;
  delay?: number;
  isCus?: boolean;
}

export interface CheckSydneyConfigResult {
  isUsable: boolean;
  errorMsg?: string;
  delay?: number;
}

export const useChatStore = defineStore(
  'chat-store',
  () => {
    const chatHubPath = '/sydney/ChatHub';

    const isShowChatServiceSelectModal = ref(false);
    const selectedSydneyBaseUrl = ref('');
    const sydneyConfigs = ref<SydneyConfig[]>([
      {
        baseUrl: 'https://sydney.bing.com',
        label: 'Bing 官方',
      },
      {
        baseUrl: 'https://sydney.b1ng.chat',
        label: 'Bing 1',
      },
      {
        baseUrl: 'https://az.b1ng.chat',
        label: 'Bing 2',
      },
      {
        baseUrl: 'https://go-proxy-bingai.glitch.me',
        label: 'Bing 3',
      },
      {
        baseUrl: 'https://b1ng.zeabur.app',
        label: 'Bing 4',
      },
      {
        baseUrl: 'https://tkgrg2-8080.csb.app',
        label: 'Bing 5',
      },
      {
        baseUrl: 'https://go-proxy-bingai-cfpg.pages.dev',
        label: 'Bing 6',
      },
      {
        baseUrl: 'https://sokwith-nbing.hf.space',
        label: 'Bing 7',
      },
      {
        baseUrl: 'https://vercel.nbing.eu.org',
        label: 'Bing 8',
      },
      {
        baseUrl: location.origin,
        label: '本站',
      },
      {
        baseUrl: '',
        label: '自定义',
        isCus: true,
      },
    ]);
    const sydneyCheckTimeoutMS = 3000;

    const checkSydneyConfig = async (config: SydneyConfig): Promise<CheckSydneyConfigResult> => {
      if (!config.baseUrl) {
        return {
          isUsable: false,
          errorMsg: '链接不可为空',
        };
      }
      try {
        const startTime = Date.now();
        const ws = new WebSocket(config.baseUrl.replace('http', 'ws') + chatHubPath);
        const wsTimer = setTimeout(() => {
          ws.close();
        }, sydneyCheckTimeoutMS);
        await new Promise((resolve, reject) => {
          ws.onopen = () => {
            clearTimeout(wsTimer);
            resolve(ws.close());
          };
          ws.onerror = () => {
            clearTimeout(wsTimer);
            reject(new Error(`聊天服务器 ${config.baseUrl} 连接失败`));
          };
          ws.onclose = () => reject(new Error(`聊天服务器 ${config.baseUrl} 连接超时`));
        });
        return {
          isUsable: true,
          delay: Date.now() - startTime,
        };
      } catch (error) {
        return {
          isUsable: false,
          errorMsg: error instanceof Error ? error.message : '',
        };
      }
    };

    const checkAllSydneyConfig = async () => {
      const checkAllConfigPromises = sydneyConfigs.value
        .filter((x) => x.baseUrl)
        .map(async (config) => {
          const checkResult = await checkSydneyConfig(config);
          config.isUsable = checkResult.isUsable;
          config.delay = checkResult.delay;
        });
      await Promise.all(checkAllConfigPromises);
    };

    return {
      isShowChatServiceSelectModal,
      sydneyConfigs,
      selectedSydneyBaseUrl,
      checkSydneyConfig,
      checkAllSydneyConfig,
    };
  },
  {
    persist: {
      key: 'chat-store',
      storage: localStorage,
      paths: ['selectedSydneyBaseUrl', 'sydneyConfigs'],
    },
  }
);
