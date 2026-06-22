import React from 'react';
import { useForm } from 'react-hook-form';
import { render, screen, fireEvent } from '@testing-library/react-native';
import InsumosForm from '@/components/user/InsumosForm';
import { FormUsuario } from '@/data/types';

jest.mock('@/context/InventoryContext', () => ({ useInventario: jest.fn() }));
jest.mock('@/context/DespachosContext', () => ({ useDespachos: jest.fn() }));
jest.mock('@expo/vector-icons', () => ({ MaterialIcons: () => null }));

import { useInventario } from '@/context/InventoryContext';
import { useDespachos } from '@/context/DespachosContext';

const mockUseInventario = useInventario as jest.Mock;
const mockUseDespachos = useDespachos as jest.Mock;

const insumos = [
  {
    id: '1',
    nombre: 'Paracetamol',
    categoria: 'Analgésicos',
    cantidad: 500,
    unidadMedida: 'mg',
    ambulanciaPatente: 'AMB-001',
    ambulanciaId: 1,
    stock: 10,
  },
  {
    id: '2',
    nombre: 'Suero fisiológico',
    categoria: 'Soluciones IV',
    cantidad: 500,
    unidadMedida: 'ml',
    ambulanciaPatente: 'AMB-001',
    ambulanciaId: 1,
    stock: 6,
  },
  {
    id: '3',
    nombre: 'Paracetamol (otra ambulancia)',
    categoria: 'Analgésicos',
    cantidad: 500,
    unidadMedida: 'mg',
    ambulanciaPatente: 'AMB-002',
    ambulanciaId: 2,
    stock: 4,
  },
];

function Harness() {
  const {
    control,
    formState: { errors },
  } = useForm<FormUsuario>({
    defaultValues: { insumosUtilizados: [] } as any,
  });
  return <InsumosForm control={control} errors={errors} />;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseInventario.mockReturnValue({ insumos, recargar: jest.fn(), loading: false });
  mockUseDespachos.mockReturnValue({ despachoActivo: { ambulancia: { id: '1' } } });
});

describe('InsumosForm', () => {
  it('filters by name, scoped to the active despacho ambulancia', () => {
    render(<Harness />);
    fireEvent.changeText(
      screen.getByPlaceholderText('Escriba el nombre del insumo...'),
      'paracetamol',
    );
    expect(screen.getByText('Paracetamol')).toBeTruthy();
    expect(screen.queryByText('Paracetamol (otra ambulancia)')).toBeNull();
  });

  it('shows no results message when nothing matches', () => {
    render(<Harness />);
    fireEvent.changeText(
      screen.getByPlaceholderText('Escriba el nombre del insumo...'),
      'inexistente',
    );
    expect(screen.getByText(/Sin resultados/)).toBeTruthy();
  });

  it('adds an insumo with default dosis 1 and prevents duplicates', () => {
    render(<Harness />);
    const busqueda = screen.getByPlaceholderText('Escriba el nombre del insumo...');

    fireEvent.changeText(busqueda, 'paracetamol');
    fireEvent.press(screen.getAllByText('Paracetamol')[0]);
    expect(screen.getAllByDisplayValue('1')).toHaveLength(1); // un solo DosisInput agregado

    fireEvent.changeText(busqueda, 'paracetamol');
    fireEvent.press(screen.getAllByText('Paracetamol')[0]);
    expect(screen.getAllByDisplayValue('1')).toHaveLength(1); // dedupe: sigue habiendo solo uno
  });

  describe('DosisInput', () => {
    it('strips non-numeric characters as they are typed', () => {
      render(<Harness />);
      fireEvent.changeText(
        screen.getByPlaceholderText('Escriba el nombre del insumo...'),
        'paracetamol',
      );
      fireEvent.press(screen.getByText('Paracetamol'));

      const dosisInput = screen.getByDisplayValue('1');
      fireEvent.changeText(dosisInput, '5x');
      expect(screen.getByDisplayValue('5')).toBeTruthy();
    });

    it('resets to 1 on blur when left empty or below 1', () => {
      render(<Harness />);
      fireEvent.changeText(
        screen.getByPlaceholderText('Escriba el nombre del insumo...'),
        'paracetamol',
      );
      fireEvent.press(screen.getByText('Paracetamol'));

      const dosisInput = screen.getByDisplayValue('1');
      fireEvent.changeText(dosisInput, '');
      fireEvent(dosisInput, 'blur');
      expect(screen.getByDisplayValue('1')).toBeTruthy();
    });
  });
});
