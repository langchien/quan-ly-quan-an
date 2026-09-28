import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useUpdateTableMutation } from '@/queries/use-table'
import { UpdateTableBody, type UpdateTableBodyType, type TableSchema } from '@app/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { TABLE_STATUS_OPTIONS } from './table-table-toolbar'

interface EditTableDialogProps {
  table: z.infer<typeof TableSchema> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTableDialog({ table, open, onOpenChange }: EditTableDialogProps) {
  const updateTableMutation = useUpdateTableMutation()

  const form = useForm<UpdateTableBodyType>({
    resolver: zodResolver(UpdateTableBody) as any,
    defaultValues: {
      capacity: 2,
      status: 'Available',
      changeToken: false,
    },
  })

  useEffect(() => {
    if (table) {
      form.reset({
        capacity: table.capacity,
        status: table.status,
        changeToken: false,
      })
    }
  }, [table, form])

  const errors = form.formState.errors

  async function onSubmit(values: UpdateTableBodyType) {
    if (!table) return
    try {
      const res = await updateTableMutation.mutateAsync({
        number: table.number,
        body: values,
      })
      toast.success(res.data.message || 'Cập nhật bàn thành công')
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  const isPending = updateTableMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[450px]'>
        <DialogHeader>
          <DialogTitle>Cập nhật bàn ăn</DialogTitle>
          <DialogDescription>Chỉnh sửa thông tin của bàn số {table?.number}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <FieldGroup>
            {/* Số bàn (Read Only) */}
            <Field>
              <FieldLabel>Số bàn</FieldLabel>
              <Input type='number' value={table?.number || ''} disabled className='bg-muted' />
            </Field>

            {/* Sức chứa */}
            <Field data-invalid={!!errors.capacity}>
              <FieldLabel htmlFor='edit-table-capacity'>Sức chứa (người)</FieldLabel>
              <Input
                id='edit-table-capacity'
                type='number'
                placeholder='Nhập sức chứa (VD: 4)'
                {...form.register('capacity')}
                aria-invalid={!!errors.capacity}
              />
              <FieldError errors={[errors.capacity]} />
            </Field>

            {/* Trạng thái */}
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor='edit-table-status'>Trạng thái</FieldLabel>
              <Select
                value={form.watch('status')}
                onValueChange={value => form.setValue('status', value as any)}
              >
                <SelectTrigger id='edit-table-status'>
                  <SelectValue placeholder='Chọn trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  {TABLE_STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.status]} />
            </Field>

            {/* Đổi QR Code */}
            <div className='flex items-center space-x-2 pt-2'>
              <Switch
                id='change-token'
                checked={form.watch('changeToken')}
                onCheckedChange={checked => form.setValue('changeToken', checked)}
              />
              <Label
                htmlFor='change-token'
                className='flex-1 cursor-pointer font-normal text-muted-foreground'
              >
                Đổi mã QR Code (tạo token mới cho bàn này)
              </Label>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
