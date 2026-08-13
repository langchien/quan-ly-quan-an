# Ghi chú Cấu hình `cursor-pointer` cho Shadcn UI Components

Tài liệu này ghi nhớ danh sách các UI Components từ Shadcn UI cần bổ sung class `cursor-pointer` để tối ưu trải nghiệm người dùng (UX) khi thao tác trên giao diện Desktop.

---

## 📌 Lý do Shadcn UI mặc định không có `cursor-pointer`

1. **Chuẩn UX gốc của W3C & Trình duyệt**: Mặc định thẻ `<button>` và các phần tử điều hướng action sử dụng con trỏ `cursor: default` (mũi tên). Con trỏ `cursor: pointer` (bàn tay) về mặt lý thuyết được sinh ra dành riêng cho thẻ liên kết `<a>` (Hyperlink).
2. **Tuy nhiên trong thực tế Web App**: Người dùng có thói quen kỳ vọng con trỏ bàn tay `cursor-pointer` xuất hiện trên mọi phần tử có thể nhấp (Clickable).
3. **Lưu ý cú pháp Tailwind CSS**: Sử dụng class **`cursor-pointer`** _(tránh nhầm lẫn viết thành `pointer-cursor` - đây là class không hợp lệ trong Tailwind)_.

---

## 📋 Danh sách Components & Vị trí cần bổ sung `cursor-pointer`

Khi khởi tạo mới hoặc cài thêm component từ `shadcn CLI`, hãy kiểm tra và bổ sung `cursor-pointer` tại các vị trí sau:

### 1. Button (`button.tsx`)

Thêm `cursor-pointer` vào `buttonVariants`:

```tsx
const buttonVariants = cva(
  "group/button cursor-pointer inline-flex shrink-0 items-center justify-center ...",
  ...
)
```

### 2. Checkbox (`checkbox.tsx`)

Thêm `cursor-pointer` vào `CheckboxPrimitive.Root`:

```tsx
<CheckboxPrimitive.Root
  className={cn(
    'peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center ...',
    className
  )}
/>
```

### 3. Switch (`switch.tsx`)

Thêm `cursor-pointer` vào `SwitchPrimitive.Root`:

```tsx
<SwitchPrimitive.Root
  className={cn(
    'peer group/switch relative inline-flex shrink-0 cursor-pointer items-center ...',
    className
  )}
/>
```

### 4. Tabs (`tabs.tsx`)

Thêm `cursor-pointer` vào `TabsTrigger`:

```tsx
<TabsPrimitive.Tab
  data-slot='tabs-trigger'
  className={cn(
    'relative inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center ...',
    className
  )}
/>
```

### 5. Toggle & Toggle Group (`toggle.tsx`, `toggle-group.tsx`)

Thêm `cursor-pointer` vào `toggleVariants` trong `toggle.tsx`:

```tsx
const toggleVariants = cva(
  "group/toggle inline-flex cursor-pointer items-center justify-center ...",
  ...
)
```

### 6. Select (`select.tsx`)

- Thêm `cursor-pointer` cho `SelectTrigger`:

```tsx
<SelectPrimitive.Trigger
  className={cn('flex w-fit cursor-pointer items-center justify-between ...', className)}
/>
```

- Thay `cursor-default` thành `cursor-pointer` cho `SelectItem`:

```tsx
<SelectPrimitive.Item
  className={cn('relative flex w-full cursor-pointer items-center ...', className)}
/>
```

### 7. Dropdown Menu (`dropdown-menu.tsx`)

Thay `cursor-default` thành `cursor-pointer` ở các sub-component:

- `DropdownMenuItem`
- `DropdownMenuSubTrigger`
- `DropdownMenuCheckboxItem`
- `DropdownMenuRadioItem`

### 8. Label (`label.tsx`)

Thêm `cursor-pointer` cho `Label` (đặc biệt hữu ích khi bấm vào label để check box / input):

```tsx
<label className={cn('flex cursor-pointer items-center gap-2 text-sm ...', className)} />
```

### 9. Breadcrumb (`breadcrumb.tsx`)

Thêm `cursor-pointer` cho `BreadcrumbLink`:

```tsx
function BreadcrumbLink({ className, render, ...props }: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(
      {
        className: cn('cursor-pointer transition-colors hover:text-foreground', className),
      },
      props
    ),
    ...
  })
}
```

### 10. Collapsible (`collapsible.tsx`)

Thêm `cursor-pointer disabled:cursor-not-allowed` cho `CollapsibleTrigger`:

```tsx
function CollapsibleTrigger({ className, ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot='collapsible-trigger'
      className={cn('cursor-pointer disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}
```

---

## ⚡ Các Component giữ nguyên Cursor mặc định

- **Input / Textarea**: Dùng `cursor-text` (mặc định trình duyệt).
- **Card / Badge / Avatar / Table / Separator**: Dùng `cursor-default`. Chỉ bổ sung `cursor-pointer` trực tiếp bằng `className="cursor-pointer"` ở nơi sử dụng nếu có gắn sự kiện `onClick`.

---

## 🛡️ Quy tắc chống giật giao diện (Layout Shift) cho Form FieldError

### 1. Vấn đề

Mặc định khi dùng component `<FieldError>` hiển thị lỗi validation cho ô nhập liệu, nếu chỉ render khi có lỗi (`{fieldState.invalid && <FieldError ... />}`) hoặc khi `<FieldError>` trả về `null` lúc không có lỗi, giao diện sẽ xuất hiện hiện tượng **co giãn / giật (Layout Shift)** do chiều cao của ô nhập liệu thay đổi đột ngột.

### 2. Xử lý chuẩn trong `field.tsx`

Trong `field.tsx`, `<FieldError>` được cấu hình để luôn render thẻ `div` với `min-h-[20px]`, giữ sẵn chiều cao tối thiểu 1 dòng thông báo lỗi ngay cả khi không có lỗi:

```tsx
function FieldError({ className, children, errors, ...props }: ...) {
  // ... logic lọc lỗi

  return (
    <div
      role={content ? 'alert' : undefined}
      data-slot='field-error'
      className={cn('min-h-[20px] text-sm font-normal text-destructive', className)}
      {...props}
    >
      {content}
    </div>
  )
}
```

### 3. Cách sử dụng tại các Form Component (như `login-form.tsx`)

Khi viết Form, chỉ cần gọi trực tiếp `<FieldError errors={[fieldState.error]} />` mà **không cần** bọc điều kiện `fieldState.invalid &&`:

```tsx
<Controller
  name='email'
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor='email'>Email</FieldLabel>
      <Input {...field} aria-invalid={fieldState.invalid} id='email' type='email' />
      <FieldError errors={[fieldState.error]} />
    </Field>
  )}
/>
```
