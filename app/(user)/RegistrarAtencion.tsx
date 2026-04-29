import FormPaciente from '@/components/user/FormPaciente';
import { useForm } from 'react-hook-form';
import { FormUsuario } from '../../../shared/types/types';
import DEFAULT_VALUES from '@/constants/defaultValues';
import { ScrollView } from 'react-native';
import ControlVitales from '@/components/user/ControlVitales';

const RegistrarAtencion = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormUsuario>({
    defaultValues: DEFAULT_VALUES,
  });
  return (
    <>
      <ScrollView>
        <FormPaciente control={control} errors={errors} />
        <ControlVitales control={control} errors={errors} />
      </ScrollView>
    </>
  );
};

export default RegistrarAtencion;
