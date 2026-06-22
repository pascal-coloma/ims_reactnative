import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { render, screen, fireEvent } from '@testing-library/react-native';
import FormPaciente from '@/components/user/FormPaciente';
import { FormUsuario } from '@/data/types';

jest.mock('@/context/DespachosContext', () => ({ useDespachos: jest.fn() }));
jest.mock('@expo/vector-icons', () => ({ MaterialIcons: () => null }));

import { useDespachos } from '@/context/DespachosContext';
const mockUseDespachos = useDespachos as jest.Mock;

function Harness() {
  const methods = useForm<FormUsuario>({
    defaultValues: {
      primerNombre: '',
      apellidoPaterno: '',
      rut: '',
      direccionOrigen: '',
      direccionDestino: '',
      fechaNacimiento: '',
    } as any,
  });
  const {
    control,
    formState: { errors },
    watch,
  } = methods;
  return (
    <FormProvider {...methods}>
      <FormPaciente control={control} errors={errors} />
      <>{watch('direccionDestino')}</>
    </FormProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FormPaciente (user)', () => {
  it('leaves fields editable and empty when the despacho has no paciente', () => {
    mockUseDespachos.mockReturnValue({
      despachoActivo: { direccionOrigen: 'Calle 1', direccionDestino: 'Hospital X' },
    });
    render(<Harness />);
    expect(screen.queryByText('Datos cargados desde el despacho activo')).toBeNull();
    expect(screen.getByPlaceholderText('Ingrese primer nombre').props.value).toBe('');
    expect(screen.getByPlaceholderText('Ingrese primer nombre').props.editable).toBe(true);
  });

  it('prefills and disables fields when the despacho already has a paciente', () => {
    mockUseDespachos.mockReturnValue({
      despachoActivo: {
        direccionOrigen: 'Calle 1',
        direccionDestino: 'Hospital X',
        paciente: { nombre_completo: 'Juan Pérez', rut: '11111111-1' },
      },
    });
    render(<Harness />);
    expect(screen.getByText('Datos cargados desde el despacho activo')).toBeTruthy();
    expect(screen.getByPlaceholderText('Ingrese primer nombre').props.value).toBe('Juan');
    expect(screen.getByPlaceholderText('Ingrese primer nombre').props.editable).toBe(false);
    expect(screen.getByPlaceholderText('Ingrese apellido paterno').props.value).toBe('Pérez');
    expect(screen.getByPlaceholderText('12.345.678-9').props.value).toBe('11111111-1');
    expect(screen.getByPlaceholderText('Ingrese dirección de origen').props.value).toBe('Calle 1');
  });

  it('always disables direccionDestino and syncs it from the despacho activo', () => {
    mockUseDespachos.mockReturnValue({
      despachoActivo: { direccionOrigen: 'Calle 1', direccionDestino: 'Hospital X' },
    });
    render(<Harness />);
    const destino = screen.getByPlaceholderText('Ingrese dirección de destino');
    expect(destino.props.editable).toBe(false);
    expect(destino.props.value).toBe('Hospital X');
  });

  it('formats the rut as the user types when there is no paciente preloaded', () => {
    mockUseDespachos.mockReturnValue({
      despachoActivo: { direccionOrigen: '', direccionDestino: '' },
    });
    render(<Harness />);
    const rutInput = screen.getByPlaceholderText('12.345.678-9');
    fireEvent.changeText(rutInput, '123456789');
    expect(screen.getByPlaceholderText('12.345.678-9').props.value).toBe('12.345.678-9');
  });
});
