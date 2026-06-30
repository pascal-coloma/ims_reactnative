import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ControlVitales from '@/components/user/ControlVitales';
import { FormUsuario } from '@/data/types';

let trigger: any;

function Harness() {
  const methods = useForm<FormUsuario>({ defaultValues: { controlSignos: [] } as any });
  const {
    control,
    formState: { errors },
  } = methods;
  trigger = methods.trigger;
  return (
    <FormProvider {...methods}>
      <ControlVitales control={control} errors={errors} />
    </FormProvider>
  );
}

describe('gcs repro', () => {
  it('clears max error after correcting value', async () => {
    render(<Harness />);
    fireEvent.press(screen.getByText('+ Nuevo control'));
    const gcsInput = screen.getByPlaceholderText('15');
    fireEvent.changeText(gcsInput, '20');
    await act(async () => {
      await trigger();
    });
    console.log('after 20, validated:', screen.queryByText('Máximo 15'));
    fireEvent.changeText(gcsInput, '12');
    await act(async () => {});
    console.log('after 12, no re-trigger:', screen.queryByText('Máximo 15'));
  });
});
