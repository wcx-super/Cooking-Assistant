# 前端 API 调用使用示例

## 概述

前端统一使用 `ApiResponse` 格式处理后端响应:

```typescript
interface ApiResponse<T> {
  code: number    // 业务状态码 (0=成功, >1000=业务错误)
  msg: string     // 提示信息
  data: T | null  // 业务数据
}
```

## 使用示例

### 1. 基础请求方法

```typescript
import { httpGet, httpPost, httpPut, httpDelete } from '@/utils/request'
import { ApiResponse } from '@/utils/request'

// GET 请求
const response = await httpGet<User>('/users/123')

// POST 请求
const response = await httpPost<User>('/users', { name: 'John' })

// PUT 请求
const response = await httpPut<User>('/users/123', { name: 'Jane' })

// DELETE 请求
const response = await httpDelete('/users/123')
```

### 2. 处理单个对象响应

```typescript
import { extractData } from '@/utils/response'

// 方式1: 直接判断
async function getUser(userId: string) {
  const response = await httpGet<User>(`/users/${userId}`)
  
  if (response?.code === 0 && response.data) {
    return response.data
  }
  
  throw new Error(response?.msg || '获取用户失败')
}

// 方式2: 使用辅助函数
async function getUser(userId: string) {
  const response = await httpGet<User>(`/users/${userId}`)
  return extractData(response, null)
}
```

### 3. 处理列表响应

```typescript
import { extractList } from '@/utils/response'

// 方式1: 直接判断
async function getUsers() {
  const response = await httpGet<User[]>('/users')
  
  if (response?.code === 0 && response.data) {
    return response.data
  }
  
  return []
}

// 方式2: 使用辅助函数 (推荐)
async function getUsers() {
  const response = await httpGet<User[]>('/users')
  return extractList(response)  // 失败时自动返回 []
}
```

### 4. 错误处理

```typescript
import { ErrorCode } from '@/utils/errorCodes'

async function deleteUser(userId: string) {
  try {
    const response = await httpDelete(`/users/${userId}`)
    
    if (response?.code === 0) {
      console.log('删除成功')
      return true
    }
    
    // 处理特定错误码
    if (response?.code === ErrorCode.PERMISSION_DENIED) {
      alert('无权删除该用户')
    } else {
      alert(response?.msg || '删除失败')
    }
    
    return false
  } catch (error) {
    console.error('请求失败:', error)
    return false
  }
}
```

### 5. 使用 safeRequest 安全请求

```typescript
import { safeRequest } from '@/utils/response'

async function loadUserData(userId: string) {
  const response = await safeRequest(
    () => httpGet<User>(`/users/${userId}`),
    (error) => {
      console.error('加载用户数据失败:', error)
      // 可以在这里显示 toast 提示
    }
  )
  
  return extractData(response, null)
}
```

### 6. 完整的 Service 示例

```typescript
// services/user.ts
import { httpGet, httpPost, httpPut, httpDelete, ApiResponse } from '@/utils/request'
import { extractData, extractList } from '@/utils/response'

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

/**
 * 获取用户列表
 */
export async function getUserList(): Promise<User[]> {
  const response = await httpGet<User[]>('/users')
  return extractList(response)
}

/**
 * 获取用户详情
 */
export async function getUserById(userId: string): Promise<User | null> {
  const response = await httpGet<User>(`/users/${userId}`)
  return extractData(response, null)
}

/**
 * 创建用户
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await httpPost<User>('/users', data)
  
  if (response?.code === 0 && response.data) {
    return response.data
  }
  
  throw new Error(response?.msg || '创建用户失败')
}

/**
 * 更新用户
 */
export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<User> {
  const response = await httpPut<User>(`/users/${userId}`, data)
  
  if (response?.code === 0 && response.data) {
    return response.data
  }
  
  throw new Error(response?.msg || '更新用户失败')
}

/**
 * 删除用户
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const response = await httpDelete(`/users/${userId}`)
    return response?.code === 0
  } catch (error) {
    console.error('删除用户失败:', error)
    return false
  }
}
```

### 7. React 组件中使用

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getUserList, User } from '@/services/user'

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserList()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error}</div>

  return (
    <div>
      <h1>用户列表</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 8. 批量请求

```typescript
import { batchRequest } from '@/utils/response'

async function loadMultipleResources() {
  const [usersRes, postsRes, commentsRes] = await batchRequest([
    () => httpGet<User[]>('/users'),
    () => httpGet<Post[]>('/posts'),
    () => httpGet<Comment[]>('/comments'),
  ])
  
  return {
    users: extractList(usersRes),
    posts: extractList(postsRes),
    comments: extractList(commentsRes),
  }
}
```

## 错误码处理

```typescript
import { ErrorCode, isAuthError, isBusinessError } from '@/utils/errorCodes'

async function handleRequest() {
  const response = await httpPost('/some-api', data)
  
  if (!response) {
    console.error('请求失败')
    return
  }
  
  // 检查是否为认证错误
  if (isAuthError(response.code)) {
    // 自动跳转登录页 (已在拦截器中处理)
    return
  }
  
  // 检查是否为业务错误
  if (isBusinessError(response.code)) {
    alert(response.msg)
    return
  }
  
  // 成功处理
  console.log('成功:', response.data)
}
```

## 最佳实践

1. **统一使用辅助函数**
   ```typescript
   // ✅ 推荐
   const users = extractList(response)
   
   // ❌ 不推荐
   const users = response?.data || []
   ```

2. **Service 层处理错误**
   ```typescript
   // ✅ 推荐 - 在 service 层抛出错误
   export async function getUser(id: string): Promise<User> {
     const response = await httpGet<User>(`/users/${id}`)
     if (response?.code === 0 && response.data) {
       return response.data
     }
     throw new Error(response?.msg || '获取失败')
   }
   
   // ❌ 不推荐 - 返回 response 让组件处理
   export async function getUser(id: string) {
     return await httpGet<User>(`/users/${id}`)
   }
   ```

3. **使用 TypeScript 类型**
   ```typescript
   // ✅ 推荐
   const response = await httpGet<User[]>('/users')
   
   // ❌ 不推荐
   const response = await httpGet('/users')
   ```

4. **合理使用 try-catch**
   ```typescript
   // ✅ 推荐 - 在需要的地方捕获
   try {
     await createUser(data)
     router.push('/users')
   } catch (error) {
     alert('创建失败')
   }
   ```
