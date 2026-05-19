# Quy tắc code — Smile Project

## Mục lục
1. [Cấu trúc thư mục](#1-cấu-trúc-thư-mục)
2. [Gọi API](#2-gọi-api)
3. [Đa ngôn ngữ (i18n)](#3-đa-ngôn-ngữ-i18n)
4. [UI Components — shadcn/ui](#4-ui-components--shadcnui)
5. [CSS — Tailwind](#5-css--tailwind)
6. [State Management](#6-state-management)
7. [TypeScript](#7-typescript)
8. [Đặt tên](#8-đặt-tên)

---

## 1. Cấu trúc thư mục

```
src/
├── app/[locale]/          # Pages (Next.js App Router)
├── components/            # UI components dùng lại
│   └── layout/            # Header, Sidebar, Footer...
├── hooks/                 # Custom hooks (useXxx)
│   └── auth/
├── services/              # Gọi API theo domain
│   └── auth/
├── store/                 # Redux store + slices
│   └── slices/
├── libs/                  # Thư viện tiện ích (apiClient, Auth)
├── i18n/                  # Cấu hình next-intl
├── messages/              # File ngôn ngữ
│   ├── vi/
│   └── en/
├── types/                 # TypeScript types dùng chung
└── test-utils/            # Helper cho Jest
```

---

## 2. Gọi API

### 2.1 Định nghĩa service

Mỗi domain có 1 file service trong `src/services/<domain>/`. Chỉ gọi `apiClient` tại đây, **không gọi axios/fetch trực tiếp trong component**.

```typescript
// ✅ Đúng — src/services/product/productService.ts
import apiClient, { ApiResponse } from '@/libs/apiClient'

export interface Product { id: string; name: string; price: number }

export const productService = {
  getAll: (): Promise<ApiResponse<Product[]>> =>
    apiClient.get('/api/products'),

  getById: (id: string): Promise<ApiResponse<Product>> =>
    apiClient.get(`/api/products/${id}`),

  create: (data: Omit<Product, 'id'>): Promise<ApiResponse<Product>> =>
    apiClient.post('/api/products', data),

  update: (id: string, data: Partial<Product>): Promise<ApiResponse<Product>> =>
    apiClient.put(`/api/products/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/api/products/${id}`),
}
```

```typescript
// ❌ Sai — gọi axios trực tiếp trong component
import axios from 'axios'
const res = await axios.get('http://...')
```

### 2.2 Dùng hook trong component

Dùng `useApiQuery` / `useApiMutation` từ `@/hooks/useCallApi` hoặc viết hook riêng trong `src/hooks/<domain>/`.

```typescript
// ✅ GET data — dùng useApiQuery
import { useApiQuery } from '@/hooks/useCallApi'
import { productService } from '@/services/product/productService'

function ProductList() {
  const { data, isLoading, isError } = useApiQuery(
    ['products'],
    '/api/products'
  )
  // ...
}
```

```typescript
// ✅ POST/PUT/DELETE — dùng useApiMutation
import { useApiMutation } from '@/hooks/useCallApi'
import { productService } from '@/services/product/productService'

function CreateProduct() {
  const { mutate, isPending } = useApiMutation(productService.create, {
    onSuccess: () => { /* xử lý thành công */ },
  })
  // ...
}
```

### 2.3 Các tuỳ chọn của apiClient

| Option | Mô tả |
|---|---|
| `skipAuth: true` | Không đính kèm token (dùng cho login, register) |
| `skipAuthRedirect: true` | Không redirect về `/login` khi nhận 401 (dùng cho logout) |

```typescript
// Endpoint công khai — không cần token
apiClient.post('/api/auth/login', data, { skipAuth: true })

// Endpoint có thể nhận 401 mà không cần redirect (logout)
apiClient.post('/api/auth/logout', payload, { skipAuthRedirect: true })
```

### 2.4 Xử lý lỗi

`apiClient` throw `ApiError` — bắt trong `onError` của mutation hoặc try/catch.

```typescript
import { ApiError } from '@/libs/apiClient'

const { mutate } = useApiMutation(productService.create, {
  onError: (error: ApiError) => {
    console.error(error.message, error.status)
  },
})
```

---

## 3. Đa ngôn ngữ (i18n)

**Quy tắc bắt buộc: Mọi text hiển thị cho người dùng phải đi qua `useTranslations`. Không hardcode chuỗi tiếng Việt hay tiếng Anh trong JSX.**

### 3.1 Thêm key mới

Mỗi khi thêm text mới, cập nhật **cả 2 file** cùng lúc:

```
src/messages/vi/<domain>.json   ← tiếng Việt
src/messages/en/<domain>.json   ← tiếng Anh
```

Cấu trúc JSON: group theo tên component/page ở cấp đầu.

```json
// vi/product.json
{
  "Product": {
    "title": "Danh sách sản phẩm",
    "createBtn": "Thêm sản phẩm",
    "deleteConfirm": "Bạn có chắc muốn xoá?",
    "empty": "Chưa có sản phẩm nào"
  }
}
```

```json
// en/product.json
{
  "Product": {
    "title": "Product List",
    "createBtn": "Add Product",
    "deleteConfirm": "Are you sure you want to delete?",
    "empty": "No products yet"
  }
}
```

### 3.2 Dùng trong component

```typescript
// ✅ Đúng
import { useTranslations } from 'next-intl'

export default function ProductPage() {
  const t = useTranslations('Product')
  return <h1>{t('title')}</h1>
}
```

```typescript
// ❌ Sai — hardcode text
return <h1>Danh sách sản phẩm</h1>
return <h1>Product List</h1>
```

### 3.3 Text động (có biến)

```json
// vi/product.json
{ "Product": { "count": "Có {count} sản phẩm" } }
```

```typescript
t('count', { count: 12 }) // → "Có 12 sản phẩm"
```

### 3.4 Link và navigation

Dùng `Link`, `useRouter` từ `@/i18n/navigation` — không dùng từ `next/navigation` trực tiếp (để tự động giữ locale).

```typescript
// ✅ Đúng
import { Link, useRouter } from '@/i18n/navigation'

// ❌ Sai
import { useRouter } from 'next/navigation'
```

---

## 4. UI Components — shadcn/ui

**Quy tắc: Ưu tiên dùng shadcn/ui trước khi tự viết component.**

### 4.1 Thứ tự ưu tiên

```
1. shadcn/ui component   → có sẵn, dùng ngay
2. Tự build từ shadcn    → extend/compose từ primitive của shadcn
3. Tự viết hoàn toàn     → chỉ khi shadcn không có và không phù hợp
```

### 4.2 Cài component mới

```bash
npx shadcn@latest add <component>
# Ví dụ:
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add table
```

Component được cài vào `src/components/ui/` — **không sửa trực tiếp** các file trong `ui/`, thay vào đó wrap lại ở `src/components/`.

### 4.3 Cách dùng đúng

```tsx
// ✅ Dùng shadcn Button thay vì tự viết <button>
import { Button } from '@/components/ui/button'

<Button variant="destructive" onClick={logout} disabled={isPending}>
  {t('logout')}
</Button>

// ✅ Dùng shadcn Dialog thay vì tự dựng modal
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// ✅ Dùng shadcn DropdownMenu thay vì tự dựng dropdown
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
```

```tsx
// ❌ Sai — tự viết button khi shadcn đã có
<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
  Đăng xuất
</button>
```

### 4.4 Danh sách component thường dùng

| Nhu cầu | shadcn component |
|---|---|
| Nút bấm | `Button` |
| Input / Form | `Input`, `Form`, `Label` |
| Modal | `Dialog` |
| Dropdown menu | `DropdownMenu` |
| Thông báo toast | `Sonner` / `Toast` |
| Bảng dữ liệu | `Table` |
| Select | `Select` |
| Checkbox / Radio | `Checkbox`, `RadioGroup` |
| Avatar | `Avatar` |
| Badge | `Badge` |
| Card | `Card` |
| Skeleton loading | `Skeleton` |

---

## 5. CSS — Tailwind

**Quy tắc: Chỉ dùng Tailwind utility classes. Không viết CSS/SCSS inline hoặc tạo class riêng nếu Tailwind đã có.**

### 4.1 Cách đúng

```tsx
// ✅ Tailwind classes
<div className="flex items-center gap-4 px-6 py-3 bg-white rounded-lg shadow-sm">
  <span className="text-sm font-medium text-gray-700">Label</span>
</div>
```

### 4.2 Không làm

```tsx
// ❌ Inline style
<div style={{ display: 'flex', padding: '12px 24px', backgroundColor: '#fff' }}>

// ❌ Tạo class CSS riêng khi Tailwind đã có
// globals.scss
.my-card { display: flex; padding: 12px; }
```

### 4.3 Class điều kiện — dùng `cn()`

```typescript
import { cn } from '@/lib/utils'

// ✅ Đúng
<button className={cn(
  'px-4 py-2 rounded-lg font-medium transition-colors',
  isPrimary ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700',
  disabled && 'opacity-50 cursor-not-allowed'
)}>

// ❌ Sai — nối chuỗi thủ công
<button className={`px-4 py-2 ${isPrimary ? 'bg-indigo-600' : 'bg-gray-100'}`}>
```

### 4.4 Khi nào dùng SCSS

Chỉ dùng `globals.scss` cho:
- CSS reset / base styles toàn app
- Animation phức tạp không có trong Tailwind
- Third-party library override

---

## 6. State Management

| Loại state | Dùng gì |
|---|---|
| Server data (API) | React Query (`useApiQuery`, `useApiMutation`) |
| Auth state | Redux (`authSlice`) |
| UI state local | `useState` / `useReducer` |
| UI state chia sẻ nhiều component | Redux slice mới |

```typescript
// ✅ Auth state — đọc từ Redux
import { useAppSelector } from '@/store'
const user = useAppSelector((state) => state.auth.user)
const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

// ✅ Server data — React Query
const { data } = useApiQuery(['products'], '/api/products')
```

---

## 7. TypeScript

- **Không dùng `any`** — dùng `unknown` nếu chưa biết kiểu, rồi narrow dần.
- Định nghĩa interface/type cho mọi request/response API trong file service tương ứng.
- Export interface từ service để tái dùng ở nơi khác.

```typescript
// ✅ Đúng
export interface CreateProductRequest { name: string; price: number }
export interface Product extends CreateProductRequest { id: string }

// ❌ Sai
const create = (data: any) => apiClient.post('/api/products', data)
```

---

## 8. Đặt tên

| Thứ | Quy tắc | Ví dụ |
|---|---|---|
| Component | PascalCase | `ProductCard`, `UserAvatar` |
| Hook | camelCase bắt đầu `use` | `useProducts`, `useCreateOrder` |
| Service object | camelCase + `Service` | `productService`, `orderService` |
| File component | PascalCase `.tsx` | `ProductCard.tsx` |
| File hook | camelCase `.ts` | `useProducts.ts` |
| File service | camelCase `.ts` | `productService.ts` |
| Redux slice | camelCase + `Slice` | `authSlice`, `cartSlice` |
| Interface | PascalCase | `LoginRequest`, `ProductResponse` |
| i18n key | camelCase | `createBtn`, `deleteConfirm` |
