import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ControlVitales from '@/components/user/ControlVitales';
import { FormUsuario } from '@/data/types';

function Harness() {
  const methods = useForm<FormUsuario>({ defaultValues: { controlSignos: [] } as any });
  const {
    control,
    formState: { errors },
  } = methods;
  return (
    <FormProvider {...methods}>
      <ControlVitales control={control} errors={errors} />
    </FormProvider>
  );
}

describe('ControlVitales', () => {
  it('shows the empty state when there are no controles', () => {
    render(<Harness />);
    expect(screen.getByText('Sin controles registrados')).toBeTruthy();
  });

  it('adds a new control with the current time and zeroed vitals', () => {
    render(<Harness />);
    fireEvent.press(screen.getByText('+ Nuevo control'));
    expect(screen.queryByText('Sin controles registrados')).toBeNull();
    expect(screen.getByText(/Control 1 —/)).toBeTruthy();
  });

  it('computes PAM as round((pad*2 + pas) / 3) as PAS/PAD change', () => {
    render(<Harness />);
    fireEvent.press(screen.getByText('+ Nuevo control'));

    fireEvent.changeText(screen.getByPlaceholderText('120'), '120');
    fireEvent.changeText(screen.getAllByPlaceholderText('80')[0], '90'); // PAD (FC comparte el mismo placeholder)
    // PAM = round((90*2 + 120) / 3) = round(300/3) = 100
    expect(screen.getByText('100')).toBeTruthy();
  });

  it('paginates between multiple controles', () => {
    render(<Harness />);
    fireEvent.press(screen.getByText('+ Nuevo control'));
    fireEvent.press(screen.getByText('+ Nuevo control'));

    expect(screen.getByText('T2 de 2')).toBeTruthy();

    fireEvent.press(screen.getByText('← Anterior'));
    expect(screen.getByText('T1 de 2')).toBeTruthy();

    fireEvent.press(screen.getByText('Siguiente →'));
    expect(screen.getByText('T2 de 2')).toBeTruthy();
  });
});
