import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 定义接口响应数据格式（根据实际后端规范调整）
interface ApiResponse<T = any> {
    code: number;         // 状态码（如 200 成功，500 错误）
    msg: string;      // 提示信息
    data: T;              // 业务数据
    [key: string]: any;   // 其他可能的字段
}

// 错误类型定义
const ErrorMsg = {
    NETWORK_ERROR: 'Network request exception, please check the network',
    TIMEOUT_ERROR: 'Request timed out',
    CONNECTION_REFUSED: 'Connection refused',
    ABORT_ERROR: 'Request has been cancelled',
    SERVER_ERROR: 'Server Error',
    UNKNOWN_ERROR: 'Unknown error',
}

// 创建 Axios 实例
const request: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // 从环境变量获取基础地址
    timeout: 10000, // 超时时间（10秒）
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
});

// 请求拦截器：添加 token、处理请求参数等
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {

        // 无需手动添加 token，cookies 会由浏览器自动携带
        // 若有其他请求头需要添加，可在此处处理
        return config;
    },
    (error: AxiosError) => {
        // 请求拦截错误处理
        console.error('Request interception error: ', error);
        return Promise.reject(error);
    }
);

// 响应拦截器：处理响应数据、统一错误提示等
request.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;

        // 1. 后端自定义状态码处理（根据实际业务调整）
        if (data.code >  0) {
            // 示例：401 未登录 → 跳转到登录页
            if (data.code >= 1200) {
                window.location.href = '/login'; // 或使用路由跳转
            }
            // 抛出业务错误（会被 catch 捕获）
            return Promise.reject(new Error(data.msg || 'Request failed'));
        }

        // 2. 成功响应：直接返回 data 中的业务数据（简化使用）
        return data.data;
    },
    (error: AxiosError) => {
        // 2. 网络/服务器错误处理
        let errorMessage = ErrorMsg.UNKNOWN_ERROR;

        // ECONNABORTED：请求超时（超过设置的 timeout 时间）。
        // ECONNREFUSED：连接被拒绝（服务器未启动、端口错误等）。
        // ENETUNREACH：网络不可达（设备未联网、DNS 解析失败等）。
        // EAI_AGAIN：DNS 查找失败（通常是网络不稳定或域名不存在）。

        if (error.code === 'ECONNABORTED') {
            errorMessage = ErrorMsg.TIMEOUT_ERROR;
        } else if(error.code === 'ECONNREFUSED') {
            errorMessage = ErrorMsg.CONNECTION_REFUSED;
        } else if(error.code === 'ENETUNREACH') {
            errorMessage = ErrorMsg.NETWORK_ERROR;
        } else if(error.code === 'ERR_BAD_RESPONSE') {
            errorMessage = ErrorMsg.SERVER_ERROR;
        } else if(error.code === 'ERR_CANCELED') {
            errorMessage = ErrorMsg.ABORT_ERROR;
        }
        // } else if (error.request) {
        //     errorMessage = ErrorMsg.NETWORK_ERROR; // 无响应（网络问题）
        // } else if (error.response) {
        //     // 服务器返回错误（如 500、404 等）
        //     errorMessage = `${ErrorMsg.SERVER_ERROR}（${error.response.status}）`
        // } else if (error.name === 'CanceledError') {
        //     errorMessage = ErrorMsg.ABORT_ERROR;
        // }

        console.error(errorMessage);
        // 可在此处添加全局错误提示（如 Message.error）
        console.error('Response error：', errorMessage);
        return Promise.reject(new Error(errorMessage));
    }
);

// 封装请求方法（支持泛型，指定返回数据类型）
const http = {
    // GET 请求
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return request.get<T, T>(url, config);
    },

    // POST 请求
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return request.post<T, T>(url, data, config);
    },

    // PUT 请求
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return request.put<T, T>(url, data, config);
    },

    // DELETE 请求
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return request.delete<T, T>(url, config);
    },

    // form表单上传文件
    UploadFile<T = any>(url: string, data: FormData, config?: AxiosRequestConfig): Promise<T> {
         return request.post<T, T>(url, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            ...config,
        });
    },

    // 取消请求（用于需要中断请求的场景，如切换页面时）
    cancelToken: axios.CancelToken,
    isCancel: axios.isCancel,
};

export default http;