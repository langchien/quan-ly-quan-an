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
import { TableStatus } from '@app/shared'
import { handleErrorApi } from '@/lib/handleErrorApi'
import { useCreateTableMutation } from '@/queries/use-table'
import { CreateTableBody, type CreateTableBodyType } from '@app/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useStatusLabel } from '@/lib/status-label'

interface CreateTableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTableDialog({ open, onOpenChange }: CreateTableDialogProps) {
  const { t } = useTranslation(['manage', 'common'])
  const { tableStatusOptions } = useStatusLabel()
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
      toast.success(res.data.message || t('tables.createDialog.success'))
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
          <DialogTitle>{t('tables.createDialog.title')}</DialogTitle>
          <DialogDescription>{t('tables.createDialog.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <FieldGroup>
            {/* Số bàn */}
            <Field data-invalid={!!errors.number}>
              <FieldLabel htmlFor='create-table-number'>{t('tables.createDialog.numberLabel')}</FieldLabel>
              <Input
                id='create-table-number'
                type='number'
                placeholder={t('tables.createDialog.numberPlaceholder')}
                {...form.register('number')}
                aria-invalid={!!errors.number}
              />
              <FieldError errors={[errors.number]} />
            </Field>

            {/* Sức chứa */}
            <Field data-invalid={!!errors.capacity}>
              <FieldLabel htmlFor='create-table-capacity'>{t('tables.createDialog.capacityLabel')}</FieldLabel>
              <Input
                id='create-table-capacity'
                type='number'
                placeholder={t('tables.createDialog.capacityPlaceholder')}
                {...form.register('capacity')}
                aria-invalid={!!errors.capacity}
              />
              <FieldError errors={[errors.capacity]} />
            </Field>

            {/* Trạng thái */}
            <Field data-invalid={!!errors.status}>
              <FieldLabel htmlFor='create-table-status'>{t('tables.createDialog.statusLabel')}</FieldLabel>
              <Select
                value={form.watch('status')}
                onValueChange={value => form.setValue('status', value as any)}
              >
                <SelectTrigger id='create-table-status'>
                  <SelectValue placeholder={t('tables.toolbar.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  {tableStatusOptions.map(option => (
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
              {t('common:actions.cancel')}
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  {t('tables.createDialog.submitting')}
                </>
              ) : (
                t('tables.createDialog.submit')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

