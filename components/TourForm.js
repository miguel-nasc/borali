import ApiForm from './ApiForm';
import { Field, Check } from './Field';

// Formulário de passeio do guia: criar (sem `tour`) ou editar (com `tour`).
export default function TourForm({ tour }) {
  return (
    <ApiForm
      endpoint={tour ? `/api/tours/${tour.id}` : '/api/tours'}
      method={tour ? 'PATCH' : 'POST'}
      redirectTo="/guia"
      submitLabel={tour ? 'Salvar alterações' : 'Cadastrar passeio'}
    >
      <Field label="Título do passeio" name="title" required defaultValue={tour?.title} placeholder="Ex.: Trilha das falésias ao pôr do sol" />
      <Field label="Local de encontro / destino" name="location" required defaultValue={tour?.location} />
      <div className="row-2">
        <Field label="Data e hora" name="starts_at" type="datetime-local" required defaultValue={tour?.starts_at} />
        <Field label="Duração (minutos)" name="duration_minutes" type="number" required min={15} max={1440} step={15} defaultValue={tour?.duration_minutes ?? 120} />
      </div>
      <div className="row-2">
        <Field
          label="Preço por pessoa (R$)"
          name="price"
          type="number"
          required
          min={0}
          step="0.01"
          defaultValue={tour ? (tour.price_cents / 100).toFixed(2) : '0.00'}
          hint="Use 0 para passeio gratuito."
        />
        <Field label="Vagas" name="capacity" type="number" required min={1} max={500} defaultValue={tour?.capacity ?? 10} />
      </div>
      <Field label="Descrição" name="description" type="textarea" rows={6} defaultValue={tour?.description} placeholder="O que está incluso, nível de dificuldade, o que levar..." />
      <Check label="Passeio aberto para reservas" name="is_open" defaultChecked={tour ? tour.is_open : true} />
    </ApiForm>
  );
}
