-- A searchable device must have at least one current, verified manufacturer
-- condition. Hide records whose only structured conditions have expired so the
-- app cannot return an empty or stale guidance card.

update public.devices d
set active = false,
    updated_at = now(),
    verification_notes = concat_ws(
      E'\n',
      nullif(btrim(d.verification_notes), ''),
      'Hidden from QuickCheck on 2026-09-22: all verified structured MRI conditions are expired or their source is not currently verified. Re-enable only after source-backed review.'
    )
where d.active = true
  and not exists (
    select 1
    from public.device_labeling_conditions condition
    join public.labeling_sources source on source.id = condition.source_id
    where condition.device_id = d.id
      and condition.verified = true
      and source.verification_status = 'verified'
      and (condition.effective_to is null or condition.effective_to >= current_date)
  );

do $verification$
declare
  v_active_without_current_guidance integer;
begin
  select count(*)
    into v_active_without_current_guidance
  from public.devices d
  where d.active = true
    and not exists (
      select 1
      from public.device_labeling_conditions condition
      join public.labeling_sources source on source.id = condition.source_id
      where condition.device_id = d.id
        and condition.verified = true
        and source.verification_status = 'verified'
        and (condition.effective_to is null or condition.effective_to >= current_date)
    );

  if v_active_without_current_guidance <> 0 then
    raise exception 'Catalog contains % active devices without current verified guidance',
      v_active_without_current_guidance;
  end if;
end;
$verification$;
