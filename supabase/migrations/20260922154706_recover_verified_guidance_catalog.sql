-- Recover manufacturer-linked guidance that was already verified in the legacy
-- device_conditions catalog but was not visible through the rights-safe
-- device_labeling_conditions API. Records without a current manufacturer source
-- remain fail-closed and are removed from the searchable active catalog until
-- they can be verified.

with source_candidates as (
  select distinct on (coalesce(dls.source_url, ds.source_url))
    d.manufacturer_id,
    coalesce(dls.source_title, ds.title, 'Current manufacturer MRI labeling') as title,
    coalesce(dls.source_url, ds.source_url) as source_url,
    coalesce(dls.source_version, ds.source_identifier) as document_version,
    coalesce(dls.verified_at, ds.verified_at) as verified_at,
    coalesce(dls.notes, ds.notes) as notes
  from public.devices d
  join public.device_conditions dc
    on dc.device_id = d.id
   and dc.active = true
   and dc.source_authority = 'manufacturer'
   and dc.verified_at is not null
  left join lateral (
    select x.*
    from public.device_labeling_sources x
    where x.device_id = d.id
      and x.current_for_model = true
      and x.source_url is not null
    order by x.source_priority asc nulls last, x.verified_at desc nulls last
    limit 1
  ) dls on true
  left join lateral (
    select x.*
    from public.device_sources x
    where x.device_id = d.id
      and x.current = true
      and x.source_authority = 'manufacturer'
      and x.source_url is not null
    order by x.verified_at desc nulls last
    limit 1
  ) ds on true
  where d.active = true
    and coalesce(dls.source_url, ds.source_url) is not null
    and not exists (
      select 1
      from public.device_labeling_conditions existing
      where existing.device_id = d.id
        and existing.verified = true
    )
  order by coalesce(dls.source_url, ds.source_url),
           coalesce(dls.verified_at, ds.verified_at) desc nulls last
)
insert into public.labeling_sources (
  manufacturer_id,
  title,
  source_url,
  document_type,
  document_version,
  verification_status,
  verified_at,
  notes
)
select
  candidate.manufacturer_id,
  candidate.title,
  candidate.source_url,
  'manufacturer_mri_labeling',
  candidate.document_version,
  'verified',
  candidate.verified_at,
  candidate.notes
from source_candidates candidate
where not exists (
  select 1
  from public.labeling_sources existing
  where existing.source_url = candidate.source_url
);

with recoverable as (
  select
    d.id as device_id,
    d.mr_status as device_mr_status,
    dc.id as legacy_condition_id,
    dc.field_strength,
    dc.spatial_gradient,
    dc.sar_limit,
    dc.b1_rms_limit,
    dc.gradient_limit,
    dc.coil_requirements,
    dc.positioning,
    dc.programming,
    dc.monitoring,
    dc.scan_region,
    dc.other_conditions,
    dc.status_notes,
    dc.labeling_basis,
    dc.allowed_field_strengths_t,
    dc.max_spatial_gradient_t_m,
    dc.compatibility_status,
    coalesce(dls.source_url, ds.source_url) as source_url,
    dls.retrieved_at,
    doc.effective_date
  from public.devices d
  join public.device_conditions dc
    on dc.device_id = d.id
   and dc.active = true
   and dc.source_authority = 'manufacturer'
   and dc.verified_at is not null
  left join public.documents doc on doc.id = dc.source_document_id
  left join lateral (
    select x.*
    from public.device_labeling_sources x
    where x.device_id = d.id
      and x.current_for_model = true
      and x.source_url is not null
    order by x.source_priority asc nulls last, x.verified_at desc nulls last
    limit 1
  ) dls on true
  left join lateral (
    select x.*
    from public.device_sources x
    where x.device_id = d.id
      and x.current = true
      and x.source_authority = 'manufacturer'
      and x.source_url is not null
    order by x.verified_at desc nulls last
    limit 1
  ) ds on true
  where d.active = true
    and coalesce(dls.source_url, ds.source_url) is not null
    and not exists (
      select 1
      from public.device_labeling_conditions existing
      where existing.device_id = d.id
        and existing.verified = true
    )
), expanded as (
  select recoverable.*, strength.field_strength_t
  from recoverable
  left join lateral unnest(
    case
      when cardinality(recoverable.allowed_field_strengths_t) > 0
        then recoverable.allowed_field_strengths_t
      else array[null::numeric]
    end
  ) as strength(field_strength_t) on true
), rows_to_insert as (
  select
    expanded.*,
    (
      select source.id
      from public.labeling_sources source
      where source.source_url = expanded.source_url
      order by (source.verification_status = 'verified') desc,
               source.verified_at desc nulls last,
               source.created_at desc
      limit 1
    ) as labeling_source_id
  from expanded
)
insert into public.device_labeling_conditions (
  device_id,
  source_id,
  mr_status,
  field_strength_min_t,
  field_strength_max_t,
  max_spatial_gradient_g_cm,
  coil_requirements,
  scan_region,
  positioning_requirements,
  programming_requirements,
  monitoring_requirements,
  other_conditions,
  effective_from,
  verified
)
select
  row.device_id,
  row.labeling_source_id,
  case
    when row.compatibility_status in ('safe', 'conditional', 'unsafe')
      then row.compatibility_status
    when row.device_mr_status in ('safe', 'conditional', 'unsafe', 'unknown')
      then row.device_mr_status
    else 'unknown'
  end,
  row.field_strength_t,
  row.field_strength_t,
  case
    when row.max_spatial_gradient_t_m is not null
      then row.max_spatial_gradient_t_m * 100
    else null
  end,
  nullif(btrim(row.coil_requirements), ''),
  nullif(btrim(row.scan_region), ''),
  nullif(btrim(row.positioning), ''),
  nullif(btrim(row.programming), ''),
  nullif(btrim(row.monitoring), ''),
  nullif(concat_ws(E'\n\n',
    case when nullif(btrim(row.field_strength), '') is not null then 'Field-strength guidance: ' || btrim(row.field_strength) end,
    case when nullif(btrim(row.spatial_gradient), '') is not null then 'Spatial-gradient guidance: ' || btrim(row.spatial_gradient) end,
    case when nullif(btrim(row.sar_limit), '') is not null then 'SAR guidance: ' || btrim(row.sar_limit) end,
    case when nullif(btrim(row.b1_rms_limit), '') is not null then 'B1+rms guidance: ' || btrim(row.b1_rms_limit) end,
    case when nullif(btrim(row.gradient_limit), '') is not null then 'Gradient guidance: ' || btrim(row.gradient_limit) end,
    case when nullif(btrim(row.other_conditions), '') is not null then btrim(row.other_conditions) end,
    case when nullif(btrim(row.status_notes), '') is not null then btrim(row.status_notes) end,
    case when nullif(btrim(row.labeling_basis), '') is not null then 'Labeling basis: ' || btrim(row.labeling_basis) end
  ), ''),
  row.effective_date,
  true
from rows_to_insert row
where row.labeling_source_id is not null;

update public.devices d
set active = false,
    updated_at = now(),
    verification_notes = concat_ws(
      E'\n',
      nullif(btrim(d.verification_notes), ''),
      'Hidden from QuickCheck on 2026-09-22: no current manufacturer source and no verified structured MRI conditions. Re-enable only after source-backed review.'
    )
where d.active = true
  and d.labeling_status in ('review_required', 'needs_review')
  and not exists (
    select 1
    from public.device_labeling_conditions condition
    where condition.device_id = d.id
      and condition.verified = true
  )
  and not exists (
    select 1
    from public.device_conditions legacy
    where legacy.device_id = d.id
      and legacy.active = true
      and legacy.source_authority = 'manufacturer'
      and legacy.verified_at is not null
  );

do $verification$
declare
  v_active_without_guidance integer;
begin
  select count(*)
    into v_active_without_guidance
  from public.devices d
  where d.active = true
    and not exists (
      select 1
      from public.device_labeling_conditions condition
      where condition.device_id = d.id
        and condition.verified = true
    );

  if v_active_without_guidance <> 0 then
    raise exception 'Catalog recovery incomplete: % active devices still lack verified guidance', v_active_without_guidance;
  end if;
end;
$verification$;
