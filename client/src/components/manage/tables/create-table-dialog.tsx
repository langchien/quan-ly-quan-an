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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TableStatus } from '@/constants/type'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useCreateTableMutation } from '@/queries/use-table'
import { CreateTableBody, type CreateTableBodyType } from '@/schemaValidations/table.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { TABLE_STATUS_OPTIONS } from './table-table-toolbar'

interface CreateTableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTableDialog({ open, onOpenChange }: CreateTableDialogProps) {
  const createTableMutation = useCreateTableMutation()

  const form = useForm<CreateTableBodyType>({
    resolver: zodResolver(CreateTableBody) as any,
    defaultValues: {
      number: 0,
      capacity: 2,
      status: TableStatus.Available,
    },
  })

  const errors = form.formState.errors

  async function onSubmit(values: CreateTableBodyType) {
    try {
      const res = await createTableMutation.mutateAsync(values)
      toast.success(res.data.message || 'Tạo bàn thành công')
      handleOpenChange(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      form.reset()
    }
    onOpenChange(value)
  }

  const isPending = createTableMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-[450px]'>
        <DialogHeader>
          <DialogTitle>Thêm bàn ăn</DialogTitle>
          <DialogDescription>Tạo bàn ăn mới và hệ thống sẽ tự động sinh mã QR.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <FieldGroup>
            {/* Số bàn */}
            <Field data-invalid={!!errors.number}>
              <FieldLabel htmlFor='create-table-number'>Số bàn</FieldLabel>
              <Input
                id='create-table-number'
                type='number'
                placeholder='Nhập số bàn (VD: 1)'
                {...form.register('number')}
                aria-invalid={!!errors.number}
              />
              <FieldError errors={[errors.number]} />
            </Field>

            {/* Sức chứa */}
            <Field data-invalid={!!errors.capacity}>
              <FieldLabel htmlFor='create-table-capacity'>Sức chứa (người)</FieldLabel>
              <Input
                id='create-table-capacity'
                type='number'
                placeholder='Nhập sức chứa (VD: 4)'
                {...form.register('capacity')}
                aria-invalid={!!errors.capacity}
              />
              <FieldError errors={[errors.capacity]} />
            </Field>

            {/* Trạng thái */}
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor='create-table-status'>Trạng thái</FieldLabel>
              <Select
                value={form.watch('status')}
                onValueChange={value => form.setValue('status', value as any)}
              >
                <SelectTrigger id='create-table-status'>
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
          </FieldGroup>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => handleOpenChange(false)}>
              Hủy
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Đang tạo...
                </>
              ) : (
                'Thêm bàn'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
