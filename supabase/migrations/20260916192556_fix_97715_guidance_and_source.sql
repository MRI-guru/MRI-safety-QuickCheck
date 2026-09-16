-- Replace the retired Medtronic web route for Intellis 97715 with the
-- current U.S. MRI manual returned by Medtronic's MRI Resource Library.
do $migration$
declare
  v_device_id uuid;
begin
  select d.id
    into v_device_id
  from public.devices d
  join public.manufacturers m on m.id = d.manufacturer_id
  where m.name = 'Medtronic'
    and d.manufacturer_model_number = '97715'
  limit 1;

  if v_device_id is null then
    raise exception 'Medtronic model 97715 was not found';
  end if;

  update public.device_sources
  set title = 'Medtronic MRI guidelines for neurostimulation systems for chronic pain',
      source_url = 'https://www.medtronic.com/content/dam/emanuals/neuro/M939858A_a_028_view.pdf',
      source_identifier = 'M939858A_a_028',
      notes = 'Current U.S. MRI manual returned by the Medtronic MRI Resource Library for model 97715. Exact complete-system verification remains required.',
      verified_at = '2026-09-16T00:00:00Z'
  where device_id = v_device_id
    and current = true
    and source_authority = 'manufacturer';

  update public.device_labeling_sources
  set source_url = 'https://www.medtronic.com/content/dam/emanuals/neuro/M939858A_a_028_view.pdf',
      source_title = 'Medtronic MRI guidelines for neurostimulation systems for chronic pain',
      source_version = 'M939858A_a_028',
      notes = 'Current U.S. MRI manual returned by the Medtronic MRI Resource Library for model 97715. Exact complete-system verification remains required.',
      verified_at = '2026-09-16T00:00:00Z',
      retrieved_at = '2026-09-16T00:00:00Z'
  where device_id = v_device_id
    and current_for_model = true;

  update public.documents
  set title = 'Medtronic MRI guidelines for neurostimulation systems for chronic pain',
      version = 'M939858A_a_028',
      source_url = 'https://www.medtronic.com/content/dam/emanuals/neuro/M939858A_a_028_view.pdf',
      updated_at = '2026-09-16T00:00:00Z',
      verified_at = '2026-09-16T00:00:00Z',
      retrieved_at = '2026-09-16T00:00:00Z',
      verification_notes = 'Current U.S. MRI manual returned by the Medtronic MRI Resource Library for model 97715. Exact complete-system verification remains required.'
  where id in (
    select dls.document_id
    from public.device_labeling_sources dls
    where dls.device_id = v_device_id
      and dls.document_id is not null
  );
end;
$migration$;
